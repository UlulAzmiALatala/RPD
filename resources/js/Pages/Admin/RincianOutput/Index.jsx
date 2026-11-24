import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import MainLayout from "../../../Layouts/MainLayout";
import {
    Target,
    Activity,
    PlusCircle,
    Search,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Box,
    Trash2,
    FileEdit,
    CheckCircle,
    RefreshCcw,
    FileText,
    ShieldAlert,
    Wallet,
    ChevronDown,
    Calendar,
    Building2,
    Layers,
} from "lucide-react";

import AddRoModal from "./Modals/AddRoModal";
import ProgressModal from "./Modals/ProgressModal";
import DeleteModal from "./Modals/DeleteModal";

export default function RincianOutputIndex() {
    const [authUser, setAuthUser] = useState(null);
    const [roData, setRoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [daftarSatker, setDaftarSatker] = useState([]);
    const [selectedSatkerId, setSelectedSatkerId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [selectedRo, setSelectedRo] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(
            () => setToast({ show: false, message: "", type: "" }),
            4000,
        );
    };

    useEffect(() => {
        axios
            .get("/api/user")
            .then((res) => setAuthUser(res.data))
            .catch((err) => console.error("User belum login", err));
    }, []);

    useEffect(() => {
        if (authUser?.role === "admin") {
            axios
                .get("/api/users")
                .then((res) => {
                    if (res.data.satkers) setDaftarSatker(res.data.satkers);
                })
                .catch((err) => console.error("Gagal memuat list satker", err));
        }
    }, [authUser]);

    const fetchData = () => {
        setLoading(true);
        const queryParams = new URLSearchParams({ tahun });
        if (selectedSatkerId) queryParams.append("satker_id", selectedSatkerId);

        axios
            .get(`/api/rincian-output?${queryParams.toString()}`)
            .then((response) => {
                setRoData(response.data.data || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Gagal memuat data RO:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (!authUser) return;
        if (authUser.role !== "admin" || selectedSatkerId) {
            fetchData();
        } else {
            setRoData([]);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tahun, selectedSatkerId, authUser]);

    const confirmDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        axios
            .delete(`/api/rincian-output/${itemToDelete.id}`)
            .then((res) => {
                showToast(res.data.message, "success");
                fetchData();
                setShowDeleteModal(false);
                setItemToDelete(null);
            })
            .catch((err) => {
                showToast("Gagal menghapus data.", "error");
                console.error(err);
            })
            .finally(() => setIsDeleting(false));
    };

    const formatSingkat = (angka) => {
        if (!angka || angka === 0) return "Rp 0";
        if (angka >= 1000000000000)
            return `Rp ${(angka / 1000000000000).toFixed(2)} T`;
        if (angka >= 1000000000)
            return `Rp ${(angka / 1000000000).toFixed(2)} M`;
        return `Rp ${(angka / 1000000).toFixed(2)} Jt`;
    };

    const formatCurrencyFull = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount || 0);

    // Kalkulasi KPI Ringkasan RO
    const metrics = useMemo(() => {
        const totalRo = roData.length;
        const selesaiCount = roData.filter(
            (r) => r.status_kinerja === "Selesai 100%",
        ).length;
        const anomaliCount = roData.filter(
            (r) => r.status_kinerja === "Anomali Fisik",
        ).length;
        const wajarCount = totalRo - selesaiCount - anomaliCount;

        const avgFisik =
            totalRo > 0
                ? roData.reduce(
                      (sum, r) =>
                          sum + Math.min(Number(r.persen_volume || 0), 100),
                      0,
                  ) / totalRo
                : 0;

        const kontribusiPoin = (avgFisik * 25) / 100;

        const totalPaguRo = roData.reduce(
            (sum, r) => sum + Number(r.pagu_anggaran || 0),
            0,
        );
        const totalSerapanRo = roData.reduce(
            (sum, r) => sum + Number(r.realisasi_anggaran_kumulatif || 0),
            0,
        );
        const persenSerapanRo =
            totalPaguRo > 0 ? (totalSerapanRo / totalPaguRo) * 100 : 0;

        return {
            totalRo,
            selesaiCount,
            anomaliCount,
            wajarCount,
            avgFisik,
            kontribusiPoin,
            totalPaguRo,
            totalSerapanRo,
            persenSerapanRo,
        };
    }, [roData]);

    const filteredData = useMemo(() => {
        return roData.filter((ro) => {
            const matchSearch =
                ro.nama_ro.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ro.kode_ro.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchSearch) return false;
            if (statusFilter === "ALL") return true;
            if (statusFilter === "ANOMALI")
                return ro.status_kinerja === "Anomali Fisik";
            if (statusFilter === "SELESAI")
                return ro.status_kinerja === "Selesai 100%";
            if (statusFilter === "WAJAR")
                return (
                    ro.status_kinerja !== "Anomali Fisik" &&
                    ro.status_kinerja !== "Selesai 100%"
                );
            return true;
        });
    }, [roData, searchQuery, statusFilter]);

    const effectiveSatkerId = selectedSatkerId || roData[0]?.satker_id || "";

    const handleDownloadPdfRo = () => {
        if (!effectiveSatkerId) return;
        window.open(
            `/api/laporan/rincian-output/pdf?tahun=${tahun}&satker_id=${effectiveSatkerId}`,
            "_blank",
        );
    };

    return (
        <MainLayout authUser={authUser} tahun={tahun}>
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
            `}</style>

            <div className="space-y-6 font-sans text-slate-700 relative min-h-screen pb-10">
                <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none -z-10"></div>

                {/* TOAST */}
                {toast.show && (
                    <div
                        className={`fixed top-8 right-8 z-[100] flex items-center p-4 min-w-[320px] max-w-md rounded-2xl border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl toast-enter ${
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
                                <AlertTriangle className="w-5 h-5" />
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
                                    ? "System Success"
                                    : "System Error"}
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
                            <div className="p-3.5 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white rounded-2xl shadow-[0_10px_24px_rgba(124,58,237,0.3)] shrink-0">
                                <Target size={26} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                                        Target &amp; Capaian Output (RO)
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-black uppercase tracking-widest">
                                        Bobot 25% SIRA
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                                    Pantau progres volume fisik, sinkronisasi
                                    serapan Ledger, dan deteksi dini anomali
                                    fisik.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            {effectiveSatkerId && roData.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleDownloadPdfRo}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white font-bold text-xs sm:text-sm rounded-2xl border border-purple-200 shadow-sm transition-all duration-200 whitespace-nowrap cursor-pointer hover:-translate-y-0.5"
                                >
                                    <FileText size={16} strokeWidth={2.5} />
                                    <span>Cetak PDF RO</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-[0_8px_18px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap cursor-pointer"
                            >
                                <PlusCircle size={17} strokeWidth={2.5} />
                                <span>Setup Target RO</span>
                            </button>
                        </div>
                    </div>

                    <div className="h-px w-full bg-slate-200/70"></div>

                    {/* BARIS FILTER TERINTEGRASI */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
                        {/* Filter Status Pills */}
                        <div className="inline-flex flex-wrap bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 text-xs font-bold shadow-inner gap-1">
                            {[
                                {
                                    key: "ALL",
                                    label: "Semua",
                                    count: metrics.totalRo,
                                },
                                {
                                    key: "ANOMALI",
                                    label: "Anomali Fisik",
                                    count: metrics.anomaliCount,
                                    danger: true,
                                },
                                {
                                    key: "WAJAR",
                                    label: "Berjalan",
                                    count: metrics.wajarCount,
                                },
                                {
                                    key: "SELESAI",
                                    label: "Selesai 100%",
                                    count: metrics.selesaiCount,
                                },
                            ].map((pill) => (
                                <button
                                    key={pill.key}
                                    type="button"
                                    onClick={() => setStatusFilter(pill.key)}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                                        statusFilter === pill.key
                                            ? pill.danger
                                                ? "bg-amber-500 text-white shadow-sm"
                                                : "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    <span>{pill.label}</span>
                                    <span
                                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                                            statusFilter === pill.key
                                                ? pill.danger
                                                    ? "bg-white/20 text-white"
                                                    : "bg-indigo-100 text-indigo-700"
                                                : pill.danger && pill.count > 0
                                                  ? "bg-amber-100 text-amber-700"
                                                  : "bg-slate-200/80 text-slate-600"
                                        }`}
                                    >
                                        {pill.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search + Satker + Tahun */}
                        <div className="flex flex-col sm:flex-row gap-2.5 w-full xl:w-auto">
                            <div className="relative flex-1 sm:w-56">
                                <Search
                                    size={14}
                                    className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Cari Kode atau Nama RO..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-semibold text-slate-700 outline-none shadow-sm placeholder:font-normal"
                                />
                            </div>

                            {authUser?.role === "admin" && (
                                <div className="relative flex-1 sm:w-64">
                                    <Building2
                                        size={14}
                                        className="text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    />
                                    <select
                                        value={selectedSatkerId}
                                        onChange={(e) => {
                                            setSelectedSatkerId(e.target.value);
                                            setStatusFilter("ALL");
                                        }}
                                        className="w-full pl-9 pr-8 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 cursor-pointer font-bold text-indigo-700 outline-none shadow-sm appearance-none truncate"
                                    >
                                        <option value="">
                                            -- Pilih Satuan Kerja --
                                        </option>
                                        {daftarSatker.map((satker) => (
                                            <option
                                                key={satker.id}
                                                value={satker.id}
                                            >
                                                {satker.kode_satker} -{" "}
                                                {satker.nama_satker}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={14}
                                        className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    />
                                </div>
                            )}

                            <div className="relative sm:w-32 shrink-0">
                                <Calendar
                                    size={14}
                                    className="text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                                <select
                                    value={tahun}
                                    onChange={(e) => setTahun(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 cursor-pointer font-black text-slate-700 outline-none shadow-sm appearance-none"
                                >
                                    {[...Array(5)].map((_, i) => {
                                        const yr =
                                            new Date().getFullYear() - 2 + i;
                                        return (
                                            <option key={yr} value={yr}>
                                                T.A {yr}
                                            </option>
                                        );
                                    })}
                                </select>
                                <ChevronDown
                                    size={14}
                                    className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. 4 KARTU KPI RINGKASAN RO (MUNCUL SAAT ADA DATA) */}
                {!loading && roData.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Total Target RO
                                </p>
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <Layers size={18} strokeWidth={2.2} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tabular-nums">
                                    {metrics.totalRo}{" "}
                                    <span className="text-xs font-bold text-slate-400">
                                        Output
                                    </span>
                                </h3>
                                <p className="text-[10px] font-bold text-emerald-600 mt-1">
                                    {metrics.selesaiCount} Selesai 100% •{" "}
                                    {metrics.wajarCount} Berjalan
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Rata-Rata Fisik RO
                                </p>
                                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                    <Target size={18} strokeWidth={2.2} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-purple-700 tabular-nums">
                                    {metrics.avgFisik.toFixed(2)}%
                                </h3>
                                <p className="text-[10px] font-bold text-purple-500 mt-1">
                                    Kontribusi SIRA:{" "}
                                    {metrics.kontribusiPoin.toFixed(2)} / 25 Pts
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-3 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Serapan Ledger RO
                                </p>
                                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                                    <Wallet size={18} strokeWidth={2.2} />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3
                                    title={formatCurrencyFull(
                                        metrics.totalSerapanRo,
                                    )}
                                    className="text-xl font-black text-slate-900 tabular-nums truncate"
                                >
                                    {formatSingkat(metrics.totalSerapanRo)}
                                </h3>
                                <p className="text-[10px] font-bold text-sky-600 mt-1 truncate">
                                    {metrics.persenSerapanRo.toFixed(1)}% dari
                                    Pagu {formatSingkat(metrics.totalPaguRo)}
                                </p>
                            </div>
                        </div>

                        <div
                            onClick={() =>
                                metrics.anomaliCount > 0 &&
                                setStatusFilter(
                                    statusFilter === "ANOMALI"
                                        ? "ALL"
                                        : "ANOMALI",
                                )
                            }
                            className={`bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border transition-all flex flex-col justify-between gap-3 ${
                                metrics.anomaliCount > 0
                                    ? "border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.15)] cursor-pointer hover:-translate-y-0.5"
                                    : "border-white shadow-sm"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <p
                                    className={`text-[10px] font-black uppercase tracking-widest ${
                                        metrics.anomaliCount > 0
                                            ? "text-amber-600"
                                            : "text-slate-400"
                                    }`}
                                >
                                    Deteksi Anomali Fisik
                                </p>
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        metrics.anomaliCount > 0
                                            ? "bg-amber-100 text-amber-600"
                                            : "bg-emerald-50 text-emerald-600"
                                    }`}
                                >
                                    {metrics.anomaliCount > 0 ? (
                                        <ShieldAlert
                                            size={18}
                                            strokeWidth={2.2}
                                        />
                                    ) : (
                                        <CheckCircle2
                                            size={18}
                                            strokeWidth={2.2}
                                        />
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3
                                    className={`text-2xl font-black tabular-nums ${
                                        metrics.anomaliCount > 0
                                            ? "text-amber-600"
                                            : "text-emerald-600"
                                    }`}
                                >
                                    {metrics.anomaliCount}{" "}
                                    <span className="text-xs font-bold opacity-75">
                                        RO
                                    </span>
                                </h3>
                                <p className="text-[10px] font-semibold text-slate-400 mt-1">
                                    {metrics.anomaliCount > 0
                                        ? "Klik untuk filter RO dengan fisik tertinggal >15%"
                                        : "Semua RO sinkron (fisik & keuangan selaras)"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. KONTEN UTAMA (GRID KARTU RO) */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-5 bg-white/70 rounded-[2.5rem] border border-white backdrop-blur-xl shadow-sm relative z-10">
                        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-md"></div>
                        <p className="text-slate-500 font-black text-xs tracking-widest uppercase animate-pulse">
                            Menyinkronkan Data Rincian Output...
                        </p>
                    </div>
                ) : authUser?.role === "admin" && !selectedSatkerId ? (
                    <div className="bg-white/85 backdrop-blur-xl rounded-[2.5rem] border border-white p-14 text-center shadow-sm relative z-10">
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-400 rounded-[2rem] flex items-center justify-center mx-auto mb-5 shadow-inner border border-indigo-100">
                            <Box size={44} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                            Pilih Satuan Kerja
                        </h3>
                        <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                            Sebagai Admin Pusat, silakan pilih Satker pada menu
                            filter di atas untuk memantau Target RO, progres
                            fisik, dan deteksi anomali mereka secara spesifik.
                        </p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="bg-white/85 backdrop-blur-xl rounded-[2.5rem] border border-white p-14 text-center shadow-sm relative z-10">
                        <div className="w-24 h-24 bg-slate-50 text-slate-400 rounded-[2rem] flex items-center justify-center mx-auto mb-5 shadow-inner border border-slate-100">
                            <AlertTriangle size={44} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                            {roData.length > 0
                                ? "Tidak Ada RO Sesuai Filter"
                                : "Belum Ada Target RO"}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                            {roData.length > 0
                                ? "Ubah kata kunci pencarian atau pilih tab filter 'Semua' untuk menampilkan seluruh Target RO."
                                : `Satker ini belum melakukan setup Target Rincian Output (RO) untuk tahun anggaran ${tahun}.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                        {filteredData.map((ro) => {
                            const isAnomali =
                                ro.status_kinerja === "Anomali Fisik";
                            const isSelesai =
                                ro.status_kinerja === "Selesai 100%";
                            const gapPersen = Math.max(
                                0,
                                Number(ro.persen_anggaran || 0) -
                                    Number(ro.persen_volume || 0),
                            );

                            return (
                                <div
                                    key={ro.id}
                                    className={`bg-white/90 backdrop-blur-xl rounded-[2.25rem] p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1 ${
                                        isAnomali
                                            ? "border-amber-300/90 hover:shadow-[0_15px_40px_rgba(245,158,11,0.14)]"
                                            : "border-white hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)]"
                                    }`}
                                >
                                    <div>
                                        {/* BARIS BADGE & AKSI */}
                                        <div className="flex justify-between items-start gap-3 mb-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200/80">
                                                    {ro.kode_ro}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl border flex items-center gap-1.5 ${
                                                        isSelesai
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : isAnomali
                                                              ? "bg-amber-100 text-amber-800 border-amber-300"
                                                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                    }`}
                                                >
                                                    {isSelesai ? (
                                                        <CheckCircle2
                                                            size={13}
                                                        />
                                                    ) : isAnomali ? (
                                                        <AlertTriangle
                                                            size={13}
                                                        />
                                                    ) : (
                                                        <Activity size={13} />
                                                    )}
                                                    {ro.status_kinerja}
                                                </span>
                                            </div>
                                            <div className="flex gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedRo(ro);
                                                        setShowProgressModal(
                                                            true,
                                                        );
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-[11px] font-black border border-indigo-200 cursor-pointer"
                                                    title="Update Capaian Volume Fisik"
                                                >
                                                    <FileEdit
                                                        size={14}
                                                        strokeWidth={2.5}
                                                    />
                                                    <span className="hidden sm:inline">
                                                        Update Fisik
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setItemToDelete(ro);
                                                        setShowDeleteModal(
                                                            true,
                                                        );
                                                    }}
                                                    className="p-2 bg-white text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm border border-rose-100 cursor-pointer"
                                                    title="Hapus RO"
                                                >
                                                    <Trash2
                                                        size={15}
                                                        strokeWidth={2.5}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* JUDUL RO */}
                                        <h3
                                            className="text-lg sm:text-xl font-black text-slate-900 mb-4 leading-snug line-clamp-2"
                                            title={ro.nama_ro}
                                        >
                                            {ro.nama_ro}
                                        </h3>

                                        {/* BANNER PERINGATAN DINI ANOMALI FISIK */}
                                        {isAnomali && (
                                            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-start gap-3">
                                                <ShieldAlert
                                                    size={18}
                                                    className="text-amber-600 shrink-0 mt-0.5"
                                                />
                                                <div className="text-xs leading-relaxed">
                                                    <p className="font-black text-amber-900 uppercase tracking-wider text-[10px]">
                                                        Peringatan Dini: Fisik
                                                        Tertinggal{" "}
                                                        {gapPersen.toFixed(1)}%
                                                    </p>
                                                    <p className="text-amber-800/90 font-medium mt-0.5">
                                                        Serapan keuangan (
                                                        {ro.persen_anggaran}%)
                                                        jauh mendahului laporan
                                                        fisik (
                                                        {ro.persen_volume}
                                                        %). Segera mutakhirkan
                                                        capaian volume fisik
                                                        bulanan.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* TARGET & PAGU */}
                                        <div className="grid grid-cols-2 gap-4 mb-5">
                                            <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/70">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                    <Target
                                                        size={12}
                                                        className="text-indigo-400"
                                                    />{" "}
                                                    Target Volume
                                                </p>
                                                <p className="text-xl font-black text-slate-800 tracking-tight tabular-nums">
                                                    {ro.target_volume}{" "}
                                                    <span className="text-xs font-bold text-slate-500">
                                                        {ro.satuan}
                                                    </span>
                                                </p>
                                            </div>
                                            <div
                                                className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/70 cursor-help min-w-0"
                                                title={formatCurrencyFull(
                                                    ro.pagu_anggaran,
                                                )}
                                            >
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                    <Box
                                                        size={12}
                                                        className="text-sky-400"
                                                    />{" "}
                                                    Pagu Anggaran
                                                </p>
                                                <p className="text-xl font-black text-slate-800 tracking-tight tabular-nums truncate">
                                                    {formatSingkat(
                                                        ro.pagu_anggaran,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DARK PROGRESS CONSOLE */}
                                    <div className="space-y-5 bg-[#0A192F] p-5 sm:p-6 rounded-[1.75rem] shadow-inner border border-slate-800 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                                        {/* PROGRESS VOLUME FISIK */}
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-end mb-2 gap-2">
                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <TrendingUp size={13} />{" "}
                                                    Progress Fisik
                                                </span>
                                                <span className="text-sm font-black text-white tracking-tight tabular-nums">
                                                    {
                                                        ro.realisasi_volume_kumulatif
                                                    }{" "}
                                                    / {ro.target_volume}{" "}
                                                    <span className="text-[10px] font-bold text-emerald-300 ml-1">
                                                        ({ro.persen_volume}%)
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-800/80 rounded-full h-2.5 border border-slate-700 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${
                                                        isAnomali
                                                            ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                                            : "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                    }`}
                                                    style={{
                                                        width: `${Math.min(ro.persen_volume, 100)}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* PROGRESS KEUANGAN (AUTO SYNC LEDGER) */}
                                        <div className="relative z-10 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                                            <div className="flex justify-between items-center mb-2.5">
                                                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <RefreshCcw
                                                        size={11}
                                                        className="animate-spin text-sky-400"
                                                        style={{
                                                            animationDuration:
                                                                "4s",
                                                        }}
                                                    />{" "}
                                                    Serapan Anggaran
                                                </span>
                                                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700">
                                                    Live Sync Ledger
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end mb-2 gap-2">
                                                <span
                                                    className="text-sm font-black text-white tracking-tight tabular-nums cursor-help truncate"
                                                    title={formatCurrencyFull(
                                                        ro.realisasi_anggaran_kumulatif,
                                                    )}
                                                >
                                                    {formatSingkat(
                                                        ro.realisasi_anggaran_kumulatif,
                                                    )}{" "}
                                                    <span className="text-[10px] font-bold text-slate-400 ml-1">
                                                        dari{" "}
                                                        {formatSingkat(
                                                            ro.pagu_anggaran,
                                                        )}
                                                    </span>
                                                </span>
                                                <span className="text-[10px] font-black text-sky-400 tracking-wider shrink-0 tabular-nums">
                                                    ({ro.persen_anggaran}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-800/80 rounded-full h-2.5 border border-slate-700 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-all duration-700"
                                                    style={{
                                                        width: `${Math.min(ro.persen_anggaran, 100)}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* MODALS */}
                {showAddModal && (
                    <AddRoModal
                        onClose={() => setShowAddModal(false)}
                        onSuccess={(msg) => {
                            setShowAddModal(false);
                            showToast(msg, "success");
                            fetchData();
                        }}
                        satkerId={selectedSatkerId || ""}
                        tahun={tahun}
                        authUser={authUser}
                        daftarSatker={daftarSatker}
                    />
                )}
                {showProgressModal && selectedRo && (
                    <ProgressModal
                        ro={selectedRo}
                        onClose={() => {
                            setShowProgressModal(false);
                            setSelectedRo(null);
                        }}
                        onSuccess={(msg) => {
                            setShowProgressModal(false);
                            setSelectedRo(null);
                            showToast(msg, "success");
                            fetchData();
                        }}
                    />
                )}
                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setItemToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    isDeleting={isDeleting}
                    itemName={itemToDelete?.nama_ro}
                />
            </div>
        </MainLayout>
    );
}
