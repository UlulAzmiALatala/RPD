import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import MainLayout from "../../../Layouts/MainLayout";
import {
    Lock,
    Unlock,
    ShieldCheck,
    Calendar,
    CheckCircle,
    XCircle,
    Loader2,
    ShieldAlert,
    ChevronDown,
    LockKeyhole,
    UnlockKeyhole,
} from "lucide-react";

const NAMA_BULAN = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

const getTwLabel = (bulan) => {
    if (bulan <= 3) return "I";
    if (bulan <= 6) return "II";
    if (bulan <= 9) return "III";
    return "IV";
};

export default function IndexTutupBuku({ authUser }) {
    const [tahun, setTahun] = useState(new Date().getFullYear());
    const [cutOffs, setCutOffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingBulan, setProcessingBulan] = useState(null);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [selectedTW, setSelectedTW] = useState("ALL");

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
        isExiting: false,
    });
    const toastTimeout = useRef(null);
    const exitTimeout = useRef(null);

    const showToast = (message, type = "success") => {
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        if (exitTimeout.current) clearTimeout(exitTimeout.current);
        setToast({ show: true, message, type, isExiting: false });
        exitTimeout.current = setTimeout(
            () => setToast((prev) => ({ ...prev, isExiting: true })),
            3500,
        );
        toastTimeout.current = setTimeout(
            () =>
                setToast({
                    show: false,
                    message: "",
                    type: "success",
                    isExiting: false,
                }),
            4000,
        );
    };

    const fetchCutOffs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/cut-offs?tahun=${tahun}`);
            setCutOffs(response.data.data || []);
        } catch (err) {
            showToast("Gagal memuat data Tutup Buku.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCutOffs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tahun]);

    const handleToggle = async (bulan, currentStatus) => {
        setProcessingBulan(bulan);
        try {
            const response = await axios.post("/api/cut-offs/toggle", {
                tahun: tahun,
                bulan: bulan,
                is_closed: !currentStatus,
            });

            showToast(response.data.message, "success");

            setCutOffs((prev) =>
                prev.map((item) =>
                    item.bulan === bulan
                        ? { ...item, is_closed: !currentStatus }
                        : item,
                ),
            );
        } catch (err) {
            showToast(
                err.response?.data?.message || "Terjadi kesalahan sistem.",
                "error",
            );
        } finally {
            setProcessingBulan(null);
        }
    };

    const filteredCutOffs = useMemo(() => {
        if (selectedTW === "ALL") return cutOffs;
        return cutOffs.filter((item) => getTwLabel(item.bulan) === selectedTW);
    }, [cutOffs, selectedTW]);

    // Aksi cepat kunci/buka seluruh bulan yang sedang ditampilkan (1 TW atau Setahun)
    const handleBulkToggle = async (targetLockStatus) => {
        const targets = filteredCutOffs.filter(
            (item) => Boolean(item.is_closed) !== targetLockStatus,
        );
        if (targets.length === 0) {
            showToast(
                targetLockStatus
                    ? "Seluruh periode pada tampilan ini sudah terkunci."
                    : "Seluruh periode pada tampilan ini sudah terbuka.",
                "success",
            );
            return;
        }

        setIsBulkProcessing(true);
        try {
            for (const item of targets) {
                await axios.post("/api/cut-offs/toggle", {
                    tahun,
                    bulan: item.bulan,
                    is_closed: targetLockStatus,
                });
            }

            const targetMonths = targets.map((t) => t.bulan);
            setCutOffs((prev) =>
                prev.map((item) =>
                    targetMonths.includes(item.bulan)
                        ? { ...item, is_closed: targetLockStatus }
                        : item,
                ),
            );

            const scopeLabel =
                selectedTW === "ALL"
                    ? `Tahun ${tahun}`
                    : `TW ${selectedTW} (${tahun})`;
            showToast(
                targetLockStatus
                    ? `${targets.length} periode pada ${scopeLabel} berhasil dikunci!`
                    : `${targets.length} periode pada ${scopeLabel} berhasil dibuka kembali!`,
                "success",
            );
        } catch (err) {
            showToast(
                err.response?.data?.message ||
                    "Sebagian periode gagal diperbarui.",
                "error",
            );
            fetchCutOffs();
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const totalTerkunci = cutOffs.filter((c) => c.is_closed).length;
    const totalTerbuka = Math.max(0, cutOffs.length - totalTerkunci);
    const persenTerkunci =
        cutOffs.length > 0
            ? Math.round((totalTerkunci / cutOffs.length) * 100)
            : 0;

    return (
        <MainLayout authUser={authUser} tahun={tahun.toString()}>
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                @keyframes slideOutRight { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(120%) scale(0.9); opacity: 0; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
                .glass-card { background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
            `}</style>

            <div className="space-y-6 font-sans text-slate-600 relative min-h-screen pb-10">
                <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none -z-10"></div>

                {/* TOAST NOTIFICATION */}
                {toast.show && (
                    <div
                        className={`fixed top-8 right-8 z-[100] flex items-center p-4 min-w-[320px] max-w-md rounded-2xl border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl ${
                            toast.isExiting ? "toast-exit" : "toast-enter"
                        } ${
                            toast.type === "success"
                                ? "bg-[#0A192F]/95 border-emerald-500/30"
                                : "bg-[#0A192F]/95 border-rose-500/30"
                        }`}
                    >
                        <div
                            className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border ${
                                toast.type === "success"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                        >
                            {toast.type === "success" ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                        </div>
                        <div className="ml-3.5 min-w-0">
                            <h4
                                className={`text-[10px] font-black tracking-widest uppercase ${
                                    toast.type === "success"
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                }`}
                            >
                                {toast.type === "success"
                                    ? "Operasi Berhasil"
                                    : "Operasi Gagal"}
                            </h4>
                            <p className="text-sm font-semibold text-slate-200 mt-0.5 leading-snug">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* 1. HERO COMMAND BAR */}
                <div className="glass-card p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 relative z-10 space-y-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="p-3.5 bg-gradient-to-br from-slate-900 via-[#0B1120] to-rose-950 text-rose-400 rounded-2xl shadow-[0_10px_24px_rgba(15,23,42,0.3)] border border-rose-500/30 shrink-0">
                                <ShieldCheck size={26} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                                        Periode &amp; Cut-Off
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black uppercase tracking-widest">
                                        Otoritas Admin
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                                    <ShieldAlert
                                        size={14}
                                        className="text-amber-500 shrink-0"
                                    />
                                    Kunci periode tutup buku untuk menjaga
                                    integritas laporan dan Indeks Kedisiplinan
                                    Satker.
                                </p>
                            </div>
                        </div>

                        {/* Tahun Selector */}
                        <div className="relative shrink-0 w-full sm:w-44">
                            <Calendar
                                size={15}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none"
                            />
                            <select
                                value={tahun}
                                onChange={(e) =>
                                    setTahun(parseInt(e.target.value, 10))
                                }
                                className="w-full pl-10 pr-9 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-800 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 cursor-pointer appearance-none"
                            >
                                {[...Array(5)].map((_, i) => {
                                    const yr = new Date().getFullYear() - 2 + i;
                                    return (
                                        <option key={yr} value={yr}>
                                            T.A {yr}
                                        </option>
                                    );
                                })}
                            </select>
                            <ChevronDown
                                size={15}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                        </div>
                    </div>

                    <div className="h-px w-full bg-slate-200/70"></div>

                    {/* BARIS FILTER TRIWULAN & AKSI MASSAL */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
                        <div className="inline-flex flex-wrap bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 text-xs font-bold shadow-inner gap-1">
                            {["ALL", "I", "II", "III", "IV"].map((tw) => (
                                <button
                                    key={tw}
                                    type="button"
                                    onClick={() => setSelectedTW(tw)}
                                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                                        selectedTW === tw
                                            ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {tw === "ALL"
                                        ? "Setahun (12 Bln)"
                                        : `TW ${tw}`}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                disabled={isBulkProcessing || loading}
                                onClick={() => handleBulkToggle(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {isBulkProcessing ? (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <LockKeyhole size={14} />
                                )}
                                Kunci{" "}
                                {selectedTW === "ALL"
                                    ? "Semua"
                                    : `TW ${selectedTW}`}
                            </button>
                            <button
                                type="button"
                                disabled={isBulkProcessing || loading}
                                onClick={() => handleBulkToggle(false)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <UnlockKeyhole size={14} />
                                Buka{" "}
                                {selectedTW === "ALL"
                                    ? "Semua"
                                    : `TW ${selectedTW}`}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. 3 KARTU RINGKASAN STATUS TAHUNAN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                Periode Terkunci
                            </p>
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Lock size={17} strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tabular-nums">
                            {totalTerkunci}{" "}
                            <span className="text-xs font-bold text-slate-400">
                                / 12 Bulan
                            </span>
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            Operator Satker tidak dapat mengubah data
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                Periode Terbuka
                            </p>
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Unlock size={17} strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-emerald-700 tabular-nums">
                            {totalTerbuka}{" "}
                            <span className="text-xs font-bold text-slate-400">
                                / 12 Bulan
                            </span>
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            Aktif menerima input RPD &amp; Realisasi
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Progres Tutup Buku {tahun}
                            </p>
                            <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-amber-400 tabular-nums">
                                {persenTerkunci}%
                            </span>
                        </div>
                        <div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-500 transition-all duration-700"
                                    style={{ width: `${persenTerkunci}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] font-semibold text-slate-400 mt-2">
                                Bulan terkunci otomatis dihitung sebagai bulan
                                wajib lapor
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. GRID KARTU BULAN */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-[2rem] bg-white/60 border border-white shadow-sm animate-pulse flex flex-col gap-4"
                            >
                                <div className="flex justify-between">
                                    <div className="space-y-2 w-1/2">
                                        <div className="h-3 bg-slate-200 rounded-full w-20"></div>
                                        <div className="h-6 bg-slate-200 rounded-full w-full"></div>
                                    </div>
                                    <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
                                </div>
                                <div className="h-10 bg-slate-100 rounded-xl mt-2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
                        {filteredCutOffs.map((item) => {
                            const isLocked = Boolean(item.is_closed);
                            const tw = getTwLabel(item.bulan);
                            const isBusy =
                                processingBulan === item.bulan ||
                                isBulkProcessing;

                            return (
                                <div
                                    key={item.bulan}
                                    className={`relative p-6 rounded-[2rem] border transition-all duration-300 overflow-hidden group ${
                                        isLocked
                                            ? "bg-gradient-to-b from-white to-rose-50/40 border-rose-200/80 shadow-[0_8px_22px_rgba(225,29,72,0.06)]"
                                            : "bg-white/95 border-white shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                                    }`}
                                >
                                    <div
                                        className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none ${
                                            isLocked
                                                ? "bg-rose-500/15 opacity-100"
                                                : "bg-emerald-500/15 opacity-0 group-hover:opacity-100"
                                        }`}
                                    ></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                                                    TW {tw}
                                                </span>
                                                <span
                                                    className={`text-[10px] font-black uppercase tracking-widest ${
                                                        isLocked
                                                            ? "text-rose-500"
                                                            : "text-slate-400"
                                                    }`}
                                                >
                                                    Bln {item.bulan}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black tracking-tight text-slate-900">
                                                {NAMA_BULAN[item.bulan - 1]}
                                            </h3>
                                        </div>

                                        <div
                                            className={`flex items-center justify-center w-11 h-11 rounded-2xl shadow-inner transition-all duration-300 ${
                                                isLocked
                                                    ? "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-[0_6px_16px_rgba(225,29,72,0.35)]"
                                                    : "bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105"
                                            }`}
                                        >
                                            {isLocked ? (
                                                <Lock
                                                    size={20}
                                                    strokeWidth={2.5}
                                                />
                                            ) : (
                                                <Unlock
                                                    size={20}
                                                    strokeWidth={2.5}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-5 relative z-10">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                                isLocked
                                                    ? "bg-rose-100 text-rose-700 border-rose-200"
                                                    : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                            }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    isLocked
                                                        ? "bg-rose-500"
                                                        : "bg-emerald-500 animate-pulse"
                                                }`}
                                            ></span>
                                            {isLocked ? "Terkunci" : "Terbuka"}
                                        </span>
                                    </div>

                                    <div className="relative z-10">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggle(
                                                    item.bulan,
                                                    isLocked,
                                                )
                                            }
                                            disabled={isBusy}
                                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                                isBusy
                                                    ? "bg-slate-100 text-slate-400 cursor-wait"
                                                    : isLocked
                                                      ? "bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                                                      : "bg-slate-900 text-white hover:bg-indigo-600 shadow-md hover:shadow-indigo-500/25"
                                            }`}
                                        >
                                            {processingBulan === item.bulan ? (
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : isLocked ? (
                                                <>
                                                    <Unlock size={15} />
                                                    <span>Buka Kunci</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={15} />
                                                    <span>Kunci Periode</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
