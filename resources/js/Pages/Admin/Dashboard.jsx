import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Wallet,
    CalendarRange,
    Receipt,
    Award,
    Building2,
    TrendingUp,
    Trophy,
    AlertTriangle,
    Activity,
    Clock,
    Search,
    Info,
    X,
    FileText,
    Target,
    CheckCircle2,
    XCircle,
    Star,
    Sparkles,
    Medal,
    Crown,
    Zap,
    ChevronDown,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function Dashboard({ authUser }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());

    // --- STATE FILTER ---
    const [selectedSatkerId, setSelectedSatkerId] = useState("");
    const currentMonth = new Date().getMonth() + 1;
    const initialTW =
        currentMonth <= 3
            ? "I"
            : currentMonth <= 6
              ? "II"
              : currentMonth <= 9
                ? "III"
                : "IV";
    const [selectedTW, setSelectedTW] = useState(initialTW);
    const [daftarSatker, setDaftarSatker] = useState([]);

    // --- STATE INSIGHT POPUP ---
    const [showInsightPopup, setShowInsightPopup] = useState(false);

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

    useEffect(() => {
        setLoading(true);
        const queryParams = new URLSearchParams({ tahun, tw: selectedTW });
        if (selectedSatkerId) queryParams.append("satker_id", selectedSatkerId);

        axios
            .get(`/api/dashboard-data?${queryParams.toString()}`)
            .then((response) => {
                setDashboardData(response.data.data);
                setLoading(false);
                // Munculkan popup hanya jika ada data baru
                setShowInsightPopup(true);
            })
            .catch((error) => {
                console.error("Gagal memuat data dashboard:", error);
                setLoading(false);
            });
    }, [tahun, selectedSatkerId, selectedTW]);

    const formatSingkat = (angka) => {
        if (!angka || angka === 0) return "Rp 0";
        if (angka >= 1000000000000)
            return (
                "Rp " +
                (angka / 1000000000000).toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                }) +
                " T"
            );
        if (angka >= 1000000000)
            return (
                "Rp " +
                (angka / 1000000000).toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                }) +
                " M"
            );
        return (
            "Rp " +
            (angka / 1000000).toLocaleString("id-ID", {
                maximumFractionDigits: 2,
            }) +
            " Jt"
        );
    };

    const formatDecimal = (value) => {
        if (typeof value === "number")
            return new Intl.NumberFormat("id-ID", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
        return value || "0,00";
    };

    const formatTimeSingkat = (dateString) => {
        if (!dateString) return "";
        return (
            new Date(dateString).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            }) + " WITA"
        );
    };

    const getNamaSatkerTerpilih = () => {
        if (!selectedSatkerId) return "Agregat Nasional Kanwil";
        const satker = daftarSatker.find(
            (s) => s.id.toString() === selectedSatkerId,
        );
        return satker ? satker.nama_satker : "Satker";
    };

    const handleDownloadPdf = () => {
        const queryParams = new URLSearchParams({ tahun, tw: selectedTW });
        if (selectedSatkerId) queryParams.append("satker_id", selectedSatkerId);
        window.open(
            `/api/dashboard-data/pdf?${queryParams.toString()}`,
            "_blank",
        );
    };

    const generateInsight = () => {
        if (!dashboardData) return null;
        const poin = dashboardData.analisis_tw.poin.total_poin;
        const serap = dashboardData.summary.persentase_realisasi;

        if (dashboardData.summary.total_anggaran === 0) {
            return {
                type: "warning",
                title: "Belum Ada Pagu Anggaran",
                text: `Sistem mendeteksi bahwa ${getNamaSatkerTerpilih()} belum memiliki Pagu Anggaran pada Tahun ${tahun}. Nilai IKPA dan Poin SIRA secara otomatis dikunci di angka 0 hingga pagu didistribusikan.`,
                glow: "shadow-[0_0_60px_rgba(245,158,11,0.4)]",
                border: "border-amber-500/50",
            };
        }

        if (poin >= 45) {
            return {
                type: "success",
                title: "Kinerja Eksekusi Brilian!",
                text: `Sistem mendeteksi performa anggaran ${getNamaSatkerTerpilih()} sangat memuaskan di TW ${selectedTW}. Dengan Poin SIRA mencapai ${formatDecimal(poin)}/55, serapan menyentuh ${serap}%, dan IKPA ${dashboardData.summary.ikpa}, Anda berada di jalur juara!`,
                glow: "shadow-[0_0_60px_rgba(16,185,129,0.4)]",
                border: "border-emerald-500/50",
            };
        } else if (poin >= 35) {
            return {
                type: "warning",
                title: "Potensi Kehilangan Poin",
                text: `Kinerja ${getNamaSatkerTerpilih()} cukup stabil (SIRA: ${formatDecimal(poin)}/55), namun sistem mendeteksi adanya deviasi atau keterlambatan output yang menghambat nilai maksimal. Segera sinkronkan RPD dan tagihan Anda!`,
                glow: "shadow-[0_0_60px_rgba(245,158,11,0.4)]",
                border: "border-amber-500/50",
            };
        } else {
            return {
                type: "danger",
                title: "Zona Kritis Anggaran!",
                text: `WARNING! Nilai SIRA ${getNamaSatkerTerpilih()} anjlok di angka ${formatDecimal(poin)}/55. Deviasi Halaman III DIPA, minimnya Serapan (${serap}%), atau tertundanya Capaian RO menjadi penyebab utama. Segera lakukan konsolidasi!`,
                glow: "shadow-[0_0_60px_rgba(225,29,72,0.4)]",
                border: "border-rose-500/50",
            };
        }
    };

    const insight = generateInsight();

    const getPodiumStyle = (idx) => {
        if (idx === 0)
            return {
                bg: "bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#996515]",
                text: "text-white",
                shadow: "shadow-[0_10px_20px_rgba(253,185,49,0.4)]",
                icon: <Crown size={22} className="drop-shadow-md" />,
                border: "border-yellow-300/50",
            };
        if (idx === 1)
            return {
                bg: "bg-gradient-to-br from-[#E2E2E2] via-[#C9D6FF] to-[#838996]",
                text: "text-slate-800",
                shadow: "shadow-[0_10px_20px_rgba(201,214,255,0.4)]",
                icon: (
                    <Medal
                        size={22}
                        className="drop-shadow-sm text-slate-700"
                    />
                ),
                border: "border-slate-300/50",
            };
        if (idx === 2)
            return {
                bg: "bg-gradient-to-br from-[#FFA17F] via-[#CD7F32] to-[#8B4513]",
                text: "text-white",
                shadow: "shadow-[0_10px_20px_rgba(205,127,50,0.4)]",
                icon: <Medal size={22} className="drop-shadow-md" />,
                border: "border-orange-400/50",
            };
        return {
            bg: "bg-slate-100",
            text: "text-slate-600",
            shadow: "",
            icon: null,
            border: "border-transparent",
        };
    };

    return (
        <>
            <div className="space-y-8 text-slate-700 font-sans relative pb-12 min-h-screen">
                {/* --- AMBIENT BACKGROUND GLOW --- */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10"></div>
                <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

                {/* --- HEADER DASHBOARD --- */}
                <div className="relative flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white/60 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                    <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-5 mb-3">
                            <div className="p-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] border border-indigo-400/30">
                                <Activity size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 tracking-tight leading-tight">
                                    SIRA Command Center
                                </h2>
                                <p className="text-sm font-semibold text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Monitoring Terpusat:{" "}
                                    <span className="font-black text-indigo-600 tracking-wide uppercase">
                                        {getNamaSatkerTerpilih()}
                                    </span>
                                    {dashboardData?.last_synced && (
                                        <span className="ml-2 pl-2 border-l border-slate-300 text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Clock size={12} /> Updated:{" "}
                                            {dashboardData.last_synced}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full xl:w-auto items-end relative z-10">
                        <button
                            onClick={handleDownloadPdf}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 text-white hover:bg-indigo-600 shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_25px_rgba(79,70,229,0.35)] rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 hover:-translate-y-1 group"
                        >
                            <FileText
                                size={18}
                                className="group-hover:scale-110 transition-transform"
                            />{" "}
                            Cetak Laporan
                        </button>
                    </div>
                </div>

                {/* --- FILTER BAR PREMIUM --- */}
                <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-sm border border-white flex flex-col lg:flex-row gap-5 items-center justify-between relative z-10">
                    <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 text-xs font-bold w-full lg:w-auto shadow-inner">
                        {["I", "II", "III", "IV"].map((tw) => (
                            <button
                                key={tw}
                                onClick={() => setSelectedTW(tw)}
                                className={`flex-1 lg:flex-none px-6 py-3 rounded-xl transition-all duration-300 ${
                                    selectedTW === tw
                                        ? "bg-white text-indigo-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-105 border border-slate-100"
                                        : "text-slate-500 hover:bg-slate-200/50"
                                }`}
                            >
                                Triwulan {tw}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        {authUser?.role === "admin" && (
                            <div className="relative w-full sm:w-72">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Building2
                                        size={18}
                                        className="text-indigo-500"
                                    />
                                </div>
                                <select
                                    value={selectedSatkerId}
                                    onChange={(e) =>
                                        setSelectedSatkerId(e.target.value)
                                    }
                                    className="w-full pl-12 pr-10 py-3.5 text-sm border-slate-200/80 rounded-2xl bg-white shadow-sm hover:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer font-bold text-slate-700 transition-all appearance-none"
                                >
                                    <option value="">
                                        -- Agregat Nasional (Semua) --
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
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <ChevronDown
                                        size={16}
                                        className="text-slate-400"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="relative w-full sm:w-40">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <CalendarRange
                                    size={18}
                                    className="text-indigo-500"
                                />
                            </div>
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full pl-12 pr-10 py-3.5 text-sm border-slate-200/80 rounded-2xl bg-white shadow-sm hover:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer font-black text-slate-800 transition-all appearance-none"
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
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <ChevronDown
                                    size={16}
                                    className="text-slate-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-80 gap-6 bg-white/40 rounded-[3rem] border border-white backdrop-blur-md">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                            <Activity
                                className="absolute inset-0 m-auto text-indigo-500 animate-pulse"
                                size={24}
                            />
                        </div>
                        <p className="text-indigo-900 font-black text-sm tracking-[0.2em] uppercase animate-pulse">
                            Menganalisis Algoritma 55 Poin...
                        </p>
                    </div>
                ) : (
                    dashboardData && (
                        <>
                            {/* --- HOLOGRAPHIC AI INSIGHT POP-UP (FIXED W-SCREEN H-SCREEN) --- */}
                            {showInsightPopup && insight && (
                                <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-hidden">
                                    <div
                                        className={`bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg relative animate-in zoom-in-95 duration-500 border ${insight.border} ${insight.glow} overflow-hidden text-center`}
                                    >
                                        <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
                                            <Sparkles
                                                size={250}
                                                className="text-white"
                                            />
                                        </div>
                                        <button
                                            onClick={() =>
                                                setShowInsightPopup(false)
                                            }
                                            className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-rose-500/80 p-2.5 rounded-2xl transition-all z-20"
                                        >
                                            <X size={20} strokeWidth={2.5} />
                                        </button>

                                        <div className="flex flex-col items-center relative z-10">
                                            <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                                <Sparkles
                                                    size={14}
                                                    className="animate-pulse"
                                                />{" "}
                                                SIRA Analytics Engine
                                            </div>

                                            <div
                                                className={`relative w-28 h-28 rounded-full flex items-center justify-center mb-6 border-4 border-slate-800 ${insight.type === "success" ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_0_40px_rgba(16,185,129,0.5)]" : insight.type === "warning" ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_0_40px_rgba(245,158,11,0.5)]" : "bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-[0_0_40px_rgba(225,29,72,0.5)]"}`}
                                            >
                                                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white"></div>
                                                {insight.type === "success" ? (
                                                    <Trophy
                                                        size={48}
                                                        strokeWidth={2}
                                                    />
                                                ) : insight.type ===
                                                  "warning" ? (
                                                    <AlertTriangle
                                                        size={48}
                                                        strokeWidth={2}
                                                    />
                                                ) : (
                                                    <Zap
                                                        size={48}
                                                        strokeWidth={2}
                                                    />
                                                )}
                                            </div>

                                            <h3
                                                className={`text-3xl font-black mb-4 tracking-tight ${insight.type === "success" ? "text-emerald-400" : insight.type === "warning" ? "text-amber-400" : "text-rose-400"}`}
                                            >
                                                {insight.title}
                                            </h3>

                                            <p className="text-slate-300 font-medium leading-relaxed text-sm bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                                {insight.text}
                                            </p>

                                            <button
                                                onClick={() =>
                                                    setShowInsightPopup(false)
                                                }
                                                className={`mt-8 px-8 py-4 w-full font-black text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 ${insight.type === "success" ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:-translate-y-1" : insight.type === "warning" ? "bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:-translate-y-1" : "bg-rose-500 hover:bg-rose-400 text-white shadow-[0_10px_20px_rgba(225,29,72,0.3)] hover:-translate-y-1"}`}
                                            >
                                                Tutup Analisis
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- 1. SUPER SUMMARY CARDS --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 relative z-10">
                                {/* 🔥 SUPER CARD: TOTAL POIN SIRA 🔥 */}
                                <div className="xl:col-span-2 bg-gradient-to-br from-slate-900 via-[#0B1120] to-slate-900 p-8 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-center relative overflow-hidden group border border-slate-800">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-yellow-500/20 transition-colors duration-700"></div>
                                    <div className="absolute -top-12 -right-12 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110">
                                        <Star
                                            size={220}
                                            className="fill-yellow-500 text-yellow-500"
                                        />
                                    </div>

                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-24 h-24 rounded-[1.8rem] bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(245,158,11,0.4)] border border-yellow-200/50 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                                            <Star
                                                size={44}
                                                className="drop-shadow-lg fill-white"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                                Skor SIRA Final
                                            </p>
                                            <div className="flex items-baseline gap-2">
                                                <h3
                                                    className={`text-6xl font-black tracking-tight ${dashboardData.summary.total_anggaran === 0 ? "text-slate-600" : "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 drop-shadow-[0_0_15px_rgba(253,230,138,0.3)]"}`}
                                                >
                                                    {formatDecimal(
                                                        dashboardData
                                                            .analisis_tw.poin
                                                            .total_poin,
                                                    )}
                                                </h3>
                                                <span className="text-xl font-bold text-slate-600">
                                                    / 55
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD: PAGU */}
                                <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm p-7 border border-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-center group relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                        <Wallet size={100} />
                                    </div>
                                    <div className="flex items-center gap-4 mb-3 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-inner">
                                            <Wallet
                                                size={22}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                            Pagu
                                            <br />
                                            Anggaran
                                        </h3>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800 truncate relative z-10">
                                        {formatSingkat(
                                            dashboardData.summary
                                                .total_anggaran,
                                        )}
                                    </h2>
                                </div>

                                {/* CARD: REALISASI */}
                                <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm p-7 border border-white hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-center group relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-emerald-500">
                                        <Receipt size={100} />
                                    </div>
                                    <div className="flex items-center gap-4 mb-3 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                                            <Receipt
                                                size={22}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                            Aktual
                                            <br />
                                            Realisasi
                                        </h3>
                                    </div>
                                    <h2
                                        className={`text-2xl font-black truncate relative z-10 ${dashboardData.summary.total_anggaran === 0 ? "text-slate-400" : "text-emerald-700"}`}
                                    >
                                        {formatSingkat(
                                            dashboardData.summary
                                                .total_realisasi_setahun,
                                        )}
                                    </h2>
                                    <div className="mt-2 relative z-10">
                                        <span
                                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg shadow-[0_2px_10px_rgba(16,185,129,0.3)] ${dashboardData.summary.total_anggaran === 0 ? "bg-slate-300 text-slate-600 shadow-none" : "bg-emerald-500 text-white"}`}
                                        >
                                            SERAPAN:{" "}
                                            {
                                                dashboardData.summary
                                                    .persentase_realisasi
                                            }
                                            %
                                        </span>
                                    </div>
                                </div>

                                {/* CARD: IKPA */}
                                <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm p-7 border border-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-center group relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-blue-500">
                                        <Award size={100} />
                                    </div>
                                    <div className="flex items-center gap-4 mb-3 relative z-10">
                                        <div
                                            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-inner ${dashboardData.summary.total_anggaran === 0 ? "bg-slate-100 border-slate-200 text-slate-400" : dashboardData.summary.ikpa >= 95 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : dashboardData.summary.ikpa >= 85 ? "bg-amber-50 border-amber-100 text-amber-500" : "bg-rose-50 border-rose-100 text-rose-500"}`}
                                        >
                                            <Award
                                                size={22}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                            Nilai
                                            <br />
                                            IKPA
                                        </h3>
                                    </div>
                                    <h2
                                        className={`text-4xl font-black relative z-10 tracking-tight ${dashboardData.summary.total_anggaran === 0 ? "text-slate-400" : dashboardData.summary.ikpa >= 95 ? "text-emerald-600" : dashboardData.summary.ikpa >= 85 ? "text-amber-500" : "text-rose-600"}`}
                                    >
                                        {formatDecimal(
                                            dashboardData.summary.ikpa,
                                        )}
                                    </h2>
                                </div>

                                {/* CARD: RO */}
                                <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm p-7 border border-white hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-center group relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-purple-500">
                                        <Target size={100} />
                                    </div>
                                    <div className="flex items-center gap-4 mb-3 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                                            <Target
                                                size={22}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                            Capaian
                                            <br />
                                            Output (RO)
                                        </h3>
                                    </div>
                                    <h2
                                        className={`text-4xl font-black truncate relative z-10 tracking-tight ${dashboardData.summary.total_anggaran === 0 ? "text-slate-400" : "text-purple-600"}`}
                                    >
                                        {formatDecimal(
                                            dashboardData.analisis_tw.poin
                                                .nilai_ro,
                                        )}
                                        <span
                                            className={`text-base ml-1 ${dashboardData.summary.total_anggaran === 0 ? "text-slate-300" : "text-purple-300"}`}
                                        >
                                            %
                                        </span>
                                    </h2>
                                </div>
                            </div>

                            {/* --- 2. TARGET KEMENKEU (NEON PROGRESS BARS) --- */}
                            {dashboardData.analisis_tw && (
                                <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm p-8 md:p-10 border border-white mt-8 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-400/5 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl text-indigo-600 border border-indigo-100 shadow-inner">
                                                <Target
                                                    size={28}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                                    Bedah Indikator SMART (TW{" "}
                                                    {selectedTW})
                                                </h3>
                                                <p className="text-sm text-slate-500 font-medium mt-1">
                                                    Transparansi parameter
                                                    Penyerapan (20%), IKPA
                                                    (10%), & RO (25%).
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
                                        {["51", "52", "53"].map((kode) => {
                                            const an =
                                                dashboardData.analisis_tw[kode];
                                            const isLulus =
                                                an.status === "Tercapai";
                                            const isNA = an.status === "N/A";
                                            const namaBelanja =
                                                kode === "51"
                                                    ? "Belanja Pegawai"
                                                    : kode === "52"
                                                      ? "Belanja Barang"
                                                      : "Belanja Modal";
                                            return (
                                                <div
                                                    key={kode}
                                                    className={`p-6 flex flex-col justify-between rounded-[2rem] border transition-all duration-300 group ${isNA ? "bg-slate-50/50 border-slate-200" : isLulus ? "bg-emerald-50/30 border-emerald-200 hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)] hover:-translate-y-1" : "bg-rose-50/30 border-rose-200 hover:shadow-[0_10px_30px_rgba(225,29,72,0.1)] hover:-translate-y-1"}`}
                                                >
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <span
                                                                className={`text-[10px] font-black px-3 py-1.5 rounded-lg tracking-widest border ${isNA ? "bg-slate-100 text-slate-500 border-slate-200" : isLulus ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}`}
                                                            >
                                                                KODE {kode}
                                                            </span>
                                                            <h4
                                                                className={`font-black text-lg mt-3 tracking-tight ${isNA ? "text-slate-400" : "text-slate-800"}`}
                                                            >
                                                                {namaBelanja}
                                                            </h4>
                                                        </div>
                                                        {isNA ? (
                                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-300">
                                                                -
                                                            </div>
                                                        ) : isLulus ? (
                                                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner">
                                                                <CheckCircle2
                                                                    className="text-emerald-500"
                                                                    size={24}
                                                                    strokeWidth={
                                                                        2.5
                                                                    }
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shadow-inner">
                                                                <XCircle
                                                                    className="text-rose-500"
                                                                    size={24}
                                                                    strokeWidth={
                                                                        2.5
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isNA ? (
                                                        <div className="mt-8 text-xs font-black text-slate-400 tracking-widest text-center py-3 bg-slate-100/50 rounded-xl border border-slate-200 border-dashed">
                                                            TIDAK ADA PAGU
                                                        </div>
                                                    ) : (
                                                        <div className="mt-auto">
                                                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                                                                <span className="text-slate-400">
                                                                    Target:{" "}
                                                                    {
                                                                        an.target_persen
                                                                    }
                                                                    %
                                                                </span>
                                                                <span
                                                                    className={
                                                                        isLulus
                                                                            ? "text-emerald-600"
                                                                            : "text-rose-600"
                                                                    }
                                                                >
                                                                    Aktual:{" "}
                                                                    {
                                                                        an.realisasi_persen
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden relative shadow-inner">
                                                                <div
                                                                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${isLulus ? "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-gradient-to-r from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.8)]"}`}
                                                                    style={{
                                                                        width: `${Math.min(an.realisasi_persen, 100)}%`,
                                                                    }}
                                                                ></div>
                                                                <div
                                                                    className="absolute top-0 bottom-0 w-1 bg-slate-900 z-10 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                                                                    style={{
                                                                        left: `${an.target_persen}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* 🔥 BOX KALKULATOR SIRA (NEON THEME) 🔥 */}
                                    <div className="bg-[#0B1120] rounded-[2rem] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] border border-slate-800 text-white relative overflow-hidden z-10">
                                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                            {/* SKOR PENYERAPAN */}
                                            <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-700/80 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300">
                                                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <Target size={16} /> Skor
                                                    Penyerapan
                                                </div>
                                                <div className="flex items-end gap-3">
                                                    <span
                                                        className={`text-4xl font-black tracking-tight ${dashboardData.summary.total_anggaran === 0 ? "text-slate-600" : "text-white"}`}
                                                    >
                                                        {formatDecimal(
                                                            dashboardData
                                                                .analisis_tw
                                                                .poin
                                                                .nilai_penyerapan,
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                                                        x 20% ={" "}
                                                        <span
                                                            className={`px-2.5 py-1 rounded-lg border ${dashboardData.summary.total_anggaran === 0 ? "bg-slate-800 text-slate-500 border-slate-700" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`}
                                                        >
                                                            {formatDecimal(
                                                                dashboardData
                                                                    .analisis_tw
                                                                    .poin
                                                                    .tertimbang_penyerapan,
                                                            )}{" "}
                                                            pts
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* SKOR HAL III */}
                                            <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-700/80 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300">
                                                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <Award size={16} /> Skor
                                                    Hal. III DIPA
                                                </div>
                                                <div className="flex items-end gap-3">
                                                    <span
                                                        className={`text-4xl font-black tracking-tight ${dashboardData.summary.total_anggaran === 0 ? "text-slate-600" : "text-white"}`}
                                                    >
                                                        {formatDecimal(
                                                            dashboardData
                                                                .analisis_tw
                                                                .poin
                                                                .ikpa_hal_iii,
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                                                        x 10% ={" "}
                                                        <span
                                                            className={`px-2.5 py-1 rounded-lg border ${dashboardData.summary.total_anggaran === 0 ? "bg-slate-800 text-slate-500 border-slate-700" : "text-blue-400 bg-blue-500/10 border-blue-500/20"}`}
                                                        >
                                                            {formatDecimal(
                                                                dashboardData
                                                                    .analisis_tw
                                                                    .poin
                                                                    .tertimbang_hal_iii,
                                                            )}{" "}
                                                            pts
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* SKOR RO */}
                                            <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-700/80 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300">
                                                <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <FileText size={16} /> Skor
                                                    Output RO
                                                </div>
                                                <div className="flex items-end gap-3">
                                                    <span
                                                        className={`text-4xl font-black tracking-tight ${dashboardData.summary.total_anggaran === 0 ? "text-slate-600" : "text-white"}`}
                                                    >
                                                        {formatDecimal(
                                                            dashboardData
                                                                .analisis_tw
                                                                .poin.nilai_ro,
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                                                        x 25% ={" "}
                                                        <span
                                                            className={`px-2.5 py-1 rounded-lg border ${dashboardData.summary.total_anggaran === 0 ? "bg-slate-800 text-slate-500 border-slate-700" : "text-purple-400 bg-purple-500/10 border-purple-500/20"}`}
                                                        >
                                                            {formatDecimal(
                                                                dashboardData
                                                                    .analisis_tw
                                                                    .poin
                                                                    .tertimbang_ro,
                                                            )}{" "}
                                                            pts
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- 3. GRAFIK & KLASEMEN --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                                {/* GRAFIK */}
                                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm p-8 border border-white relative overflow-hidden z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3.5 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner">
                                            <TrendingUp
                                                size={24}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                                Grafik Serapan Anggaran
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium mt-1">
                                                {dashboardData.is_global
                                                    ? `Komparasi Agregat Pagu vs Aktual per Satker`
                                                    : `Distribusi Belanja Berdasarkan Jenis Pengeluaran`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={dashboardData.grafik}
                                                margin={{
                                                    top: 10,
                                                    right: 10,
                                                    left: 10,
                                                    bottom: 10,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    stroke="#e2e8f0"
                                                />
                                                <XAxis
                                                    dataKey={
                                                        dashboardData.is_global
                                                            ? "nama_satker"
                                                            : "name"
                                                    }
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{
                                                        fill: "#64748b",
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                    }}
                                                    dy={15}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    width={55}
                                                    tick={{
                                                        fill: "#64748b",
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                    }}
                                                    tickFormatter={(val) =>
                                                        val >= 1000000
                                                            ? `${(val / 1000000).toFixed(1)} T`
                                                            : val >= 1000
                                                              ? `${(val / 1000).toFixed(1)} M`
                                                              : `${val} Jt`
                                                    }
                                                />
                                                <Tooltip
                                                    cursor={{
                                                        fill: "rgba(241,245,249,0.5)",
                                                    }}
                                                    contentStyle={{
                                                        borderRadius: "20px",
                                                        border: "1px solid #e2e8f0",
                                                        boxShadow:
                                                            "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                                                        fontWeight: "bold",
                                                        fontSize: "13px",
                                                        padding: "16px",
                                                        backgroundColor:
                                                            "rgba(255,255,255,0.95)",
                                                        backdropFilter:
                                                            "blur(8px)",
                                                    }}
                                                    formatter={(val, name) => [
                                                        `Rp ${val >= 1000000 ? (val / 1000000).toFixed(2) + " Triliun" : val >= 1000 ? (val / 1000).toFixed(2) + " Miliar" : val + " Juta"}`,
                                                        name,
                                                    ]}
                                                />
                                                <Legend
                                                    wrapperStyle={{
                                                        paddingTop: "30px",
                                                        fontSize: "13px",
                                                        fontWeight: "bold",
                                                        color: "#334155",
                                                    }}
                                                    iconType="circle"
                                                />
                                                {dashboardData.is_global ? (
                                                    <>
                                                        <Bar
                                                            dataKey="Target_RPD"
                                                            name="Pagu DIPA"
                                                            fill="#818cf8"
                                                            radius={[
                                                                8, 8, 0, 0,
                                                            ]}
                                                            maxBarSize={45}
                                                        />
                                                        <Bar
                                                            dataKey="Aktual_Realisasi"
                                                            name="Aktual Realisasi"
                                                            fill="#10b981"
                                                            radius={[
                                                                8, 8, 0, 0,
                                                            ]}
                                                            maxBarSize={45}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <Bar
                                                            dataKey="Target_RPD"
                                                            name="Pagu DIPA"
                                                            fill="#818cf8"
                                                            radius={[
                                                                8, 8, 0, 0,
                                                            ]}
                                                            maxBarSize={35}
                                                        />
                                                        <Bar
                                                            dataKey="Belanja_Gaji"
                                                            name="Pegawai (51)"
                                                            fill="#3b82f6"
                                                            radius={[
                                                                8, 8, 0, 0,
                                                            ]}
                                                            maxBarSize={35}
                                                        />
                                                        <Bar
                                                            dataKey="Belanja_Barang"
                                                            name="Barang (52)"
                                                            fill="#10b981"
                                                            radius={[
                                                                8, 8, 0, 0,
                                                            ]}
                                                            maxBarSize={35}
                                                        />
                                                        <Bar
                                                            dataKey="Belanja_Modal"
                                                            name="Modal (53)"
                                                            fill="#8b5cf6"
                                                            radius={[
                                                                8, 8, 0, 0,
                                                            ]}
                                                            maxBarSize={35}
                                                        />
                                                    </>
                                                )}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* KLASEMEN (LEADERBOARD) - ADMIN ONLY */}
                                {authUser?.role === "admin" &&
                                !selectedSatkerId &&
                                dashboardData.leaderboard ? (
                                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm p-8 border border-white flex flex-col h-full relative z-10 overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-emerald-500 to-rose-500"></div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3.5 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl text-amber-600 shadow-inner">
                                                <Trophy
                                                    size={24}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                                    Top Podium
                                                </h3>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                    Klasemen TW {selectedTW}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 max-h-[400px]">
                                            {dashboardData.leaderboard.top.map(
                                                (satker, idx) => {
                                                    const podium =
                                                        getPodiumStyle(idx);
                                                    return (
                                                        <div
                                                            key={satker.id}
                                                            className={`p-4 rounded-[1.5rem] transition-all flex items-center gap-4 ${idx <= 2 ? `bg-white ${podium.border} border-2${podium.shadow} scale-[1.02]` : "bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-sm"}`}
                                                        >
                                                            <div
                                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${podium.bg} ${podium.text} shadow-inner`}
                                                            >
                                                                {podium.icon
                                                                    ? podium.icon
                                                                    : `#${idx + 1}`}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-extrabold text-slate-900 truncate">
                                                                    {
                                                                        satker.nama_satker
                                                                    }
                                                                </h4>
                                                                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">
                                                                    {
                                                                        satker.kode_satker
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div
                                                                    className={`text-sm font-black px-3 py-1.5 rounded-xl ${satker.poin_sira >= 45 ? "text-emerald-700 bg-emerald-100" : satker.poin_sira >= 35 ? "text-amber-700 bg-amber-100" : "text-rose-700 bg-rose-100"}`}
                                                                >
                                                                    {formatDecimal(
                                                                        satker.poin_sira,
                                                                    )}{" "}
                                                                    <span className="text-[10px] opacity-70">
                                                                        Pts
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-900 rounded-[2.5rem] shadow-xl p-8 border border-slate-800 text-slate-300 relative overflow-hidden flex flex-col z-10">
                                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(16,185,129,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30">
                                                    <Clock
                                                        size={24}
                                                        strokeWidth={2.5}
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-white tracking-tight">
                                                        Live Terminal
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
                                                        CCTV SIRA Sistem
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-400 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute"></span>
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 relative"></span>{" "}
                                                REC
                                            </div>
                                        </div>
                                        <div className="space-y-6 relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[350px]">
                                            {dashboardData.cctv_mini?.length >
                                            0 ? (
                                                dashboardData.cctv_mini.map(
                                                    (log) => (
                                                        <div
                                                            key={log.id}
                                                            className="group border-l-2 border-slate-700 pl-5 py-1 hover:border-emerald-400 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 mb-2">
                                                                <Clock
                                                                    size={12}
                                                                />{" "}
                                                                {formatTimeSingkat(
                                                                    log.created_at,
                                                                )}
                                                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 ml-2 border border-slate-700">
                                                                    {log.action}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs font-medium text-slate-300 leading-relaxed line-clamp-2 group-hover:text-emerald-50 transition-colors">
                                                                <span className="font-bold text-emerald-400">
                                                                    [
                                                                    {log.user
                                                                        ?.name ||
                                                                        "System"}
                                                                    ]
                                                                </span>{" "}
                                                                {
                                                                    log.description
                                                                }
                                                            </div>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <div className="text-center py-12 text-xs font-mono font-bold text-slate-600">
                                                    _ waiting for inputs ...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )
                )}
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-in { animation: fade-in 0.5s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.6); }
            `}</style>
        </>
    );
}
