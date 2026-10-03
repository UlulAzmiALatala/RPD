import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

export default function IndexTutupBuku({ authUser }) {
    const [tahun, setTahun] = useState(new Date().getFullYear());
    const [cutOffs, setCutOffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingBulan, setProcessingBulan] = useState(null);

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
        isExiting: false,
    });
    const toastTimeout = useRef(null);
    const exitTimeout = useRef(null);

    const namaBulan = [
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

    const showToast = (message, type = "success") => {
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        if (exitTimeout.current) clearTimeout(exitTimeout.current);
        setToast({ show: true, message, type, isExiting: false });
        exitTimeout.current = setTimeout(
            () => setToast((prev) => ({ ...prev, isExiting: true })),
            3500,
        );
        toastTimeout.current = setTimeout(
            () => setToast({ show: false }),
            4000,
        );
    };

    const fetchCutOffs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/cut-offs?tahun=${tahun}`);
            setCutOffs(response.data.data);
        } catch (err) {
            showToast("Gagal memuat data Tutup Buku.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCutOffs();
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

    // Kalkulasi Status Global untuk UI Pintar
    const totalTerkunci = cutOffs.filter((c) => c.is_closed).length;

    return (
        <MainLayout authUser={authUser}>
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                @keyframes slideOutRight { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(120%) scale(0.9); opacity: 0; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }
            `}</style>

            <div className="space-y-8 font-sans text-slate-600 relative overflow-hidden min-h-screen pb-10">
                {/* TOAST NOTIFICATION PREMIUM */}
                {toast.show && (
                    <div
                        className={`fixed top-8 right-8 z-[100] flex items-center p-4 min-w-[340px] rounded-2xl border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl ${toast.isExiting ? "toast-exit" : "toast-enter"} ${toast.type === "success" ? "bg-[#0A192F]/95 border-emerald-500/30" : "bg-[#0A192F]/95 border-rose-500/30"}`}
                    >
                        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                            <div
                                className={`absolute -top-10 -right-10 w-32 h-32 opacity-20 blur-2xl rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
                            ></div>
                        </div>
                        <div
                            className={`relative flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border ${toast.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}
                        >
                            {toast.type === "success" ? (
                                <CheckCircle className="w-6 h-6" />
                            ) : (
                                <XCircle className="w-6 h-6" />
                            )}
                        </div>
                        <div className="ml-4 relative">
                            <h4
                                className={`text-[10px] font-black tracking-widest uppercase ${toast.type === "success" ? "text-emerald-400" : "text-rose-400"}`}
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

                {/* HEADER SECTION - ENTERPRISE GRADE */}
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 overflow-hidden">
                    {/* Background Orbs */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] border border-slate-700 hidden md:flex">
                            <ShieldCheck
                                size={32}
                                className="text-indigo-400"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                                Penguncian Periode
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-1.5 flex items-center gap-2">
                                <ShieldAlert
                                    size={16}
                                    className="text-amber-500"
                                />
                                Modul otoritas Admin untuk memvalidasi &
                                mengunci laporan.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                        <div className="flex flex-col items-end hidden md:flex mr-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Status Tahunan
                            </span>
                            <span className="text-sm font-bold text-slate-700">
                                <span
                                    className={
                                        totalTerkunci === 12
                                            ? "text-emerald-600"
                                            : "text-indigo-600"
                                    }
                                >
                                    {totalTerkunci}
                                </span>{" "}
                                / 12 Terkunci
                            </span>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Calendar size={20} />
                            </div>
                            <select
                                value={tahun}
                                onChange={(e) =>
                                    setTahun(parseInt(e.target.value))
                                }
                                className="bg-transparent border-none text-slate-800 font-extrabold text-lg focus:ring-0 py-1.5 pr-10 cursor-pointer w-full md:w-auto outline-none"
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
                        </div>
                    </div>
                </div>

                {/* GRID 12 BULAN */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-3xl bg-white/50 border border-slate-100 shadow-sm animate-pulse flex flex-col gap-4"
                            >
                                <div className="flex justify-between">
                                    <div className="space-y-2 w-1/2">
                                        <div className="h-3 bg-slate-200 rounded-full w-20"></div>
                                        <div className="h-6 bg-slate-200 rounded-full w-full"></div>
                                    </div>
                                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                                </div>
                                <div className="h-10 bg-slate-100 rounded-xl mt-2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
                        {cutOffs.map((item) => {
                            const isLocked = item.is_closed;
                            return (
                                <div
                                    key={item.bulan}
                                    className={`relative p-6 rounded-3xl border transition-all duration-500 overflow-hidden group ${
                                        isLocked
                                            ? "bg-gradient-to-b from-white to-rose-50/30 border-rose-200/60 shadow-[0_8px_20px_rgba(225,29,72,0.05)]"
                                            : "bg-white border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                                    }`}
                                >
                                    {/* Ambient Orb Inside Card */}
                                    <div
                                        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-opacity duration-500 ${isLocked ? "bg-rose-500/10 opacity-100" : "bg-emerald-500/10 opacity-0 group-hover:opacity-100"}`}
                                    ></div>

                                    <div className="flex justify-between items-start mb-5 relative z-10">
                                        <div>
                                            <div
                                                className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isLocked ? "text-rose-400" : "text-slate-400"}`}
                                            >
                                                Bulan ke-{item.bulan}
                                            </div>
                                            <h3
                                                className={`text-2xl font-black tracking-tight ${isLocked ? "text-slate-900" : "text-slate-800"}`}
                                            >
                                                {namaBulan[item.bulan - 1]}
                                            </h3>
                                        </div>
                                        <div
                                            className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-inner transition-all duration-500 ${
                                                isLocked
                                                    ? "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] rotate-0"
                                                    : "bg-slate-100 text-emerald-500 group-hover:bg-emerald-50 group-hover:scale-110 -rotate-12"
                                            }`}
                                        >
                                            {isLocked ? (
                                                <Lock
                                                    size={22}
                                                    strokeWidth={2.5}
                                                />
                                            ) : (
                                                <Unlock
                                                    size={22}
                                                    strokeWidth={2.5}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Indikator Status Text */}
                                    <div className="mb-5 relative z-10">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                                                isLocked
                                                    ? "bg-rose-100 text-rose-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                            }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${isLocked ? "bg-rose-500" : "bg-emerald-500"} animate-pulse`}
                                            ></span>
                                            {isLocked ? "TERKUNCI" : "TERBUKA"}
                                        </span>
                                    </div>

                                    <div className="relative z-10">
                                        <button
                                            onClick={() =>
                                                handleToggle(
                                                    item.bulan,
                                                    item.is_closed,
                                                )
                                            }
                                            disabled={
                                                processingBulan === item.bulan
                                            }
                                            className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden relative ${
                                                processingBulan === item.bulan
                                                    ? "bg-slate-100 text-slate-400 cursor-wait"
                                                    : isLocked
                                                      ? "bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                                                      : "bg-slate-900 text-white hover:bg-indigo-600 shadow-md hover:shadow-indigo-500/30"
                                            }`}
                                        >
                                            {processingBulan === item.bulan ? (
                                                <Loader2
                                                    size={18}
                                                    className="animate-spin"
                                                />
                                            ) : isLocked ? (
                                                <>
                                                    <Unlock size={18} />
                                                    <span>
                                                        Buka Kunci Akses
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={18} />
                                                    <span>
                                                        Kunci Periode Ini
                                                    </span>
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
