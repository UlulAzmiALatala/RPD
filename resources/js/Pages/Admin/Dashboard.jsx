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
    PieChart,
    Info,
    X,
    PlusCircle,
    FileText,
    Target,
    CheckCircle2,
    XCircle,
    Star,
    Sparkles,
    Medal,
    Crown,
    Zap,
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
        return value;
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
        const kesehatan = dashboardData.summary.status_kesehatan;
        const poin = dashboardData.analisis_tw.poin.total_poin;
        const serap = dashboardData.summary.persentase_realisasi;

        if (poin >= 45) {
            return {
                type: "success",
                title: "Kinerja Eksekusi Brilian!",
                text: `Sistem mendeteksi performa anggaran ${getNamaSatkerTerpilih()} sangat memuaskan di TW ${selectedTW}. Dengan Poin SIRA mencapai ${formatDecimal(poin)}/55, serapan menyentuh ${serap}%, dan IKPA ${dashboardData.summary.ikpa}, Anda berada di jalur juara!`,
            };
        } else if (poin >= 35) {
            return {
                type: "warning",
                title: "Potensi Kehilangan Poin",
                text: `Kinerja ${getNamaSatkerTerpilih()} cukup stabil (SIRA: ${formatDecimal(poin)}/55), namun sistem mendeteksi adanya deviasi atau keterlambatan output yang menghambat nilai maksimal. Segera sinkronkan RPD dan tagihan Anda!`,
            };
        } else {
            return {
                type: "danger",
                title: "Zona Kritis Anggaran!",
                text: `WARNING! Nilai SIRA ${getNamaSatkerTerpilih()} anjlok di angka ${formatDecimal(poin)}/55. Deviasi Halaman III DIPA, minimnya Serapan (${serap}%), atau tertundanya Capaian RO menjadi penyebab utama. Segera lakukan konsolidasi!`,
            };
        }
    };

    const insight = generateInsight();

    // Custom Podium Colors
    const getPodiumStyle = (idx) => {
        if (idx === 0)
            return {
                bg: "bg-gradient-to-br from-yellow-300 to-amber-500",
                text: "text-white",
                shadow: "shadow-lg shadow-yellow-500/40",
                icon: <Crown size={20} />,
            };
        if (idx === 1)
            return {
                bg: "bg-gradient-to-br from-slate-300 to-slate-400",
                text: "text-white",
                shadow: "shadow-lg shadow-slate-400/40",
                icon: <Medal size={20} />,
            };
        if (idx === 2)
            return {
                bg: "bg-gradient-to-br from-orange-400 to-amber-700",
                text: "text-white",
                shadow: "shadow-lg shadow-orange-500/40",
                icon: <Medal size={20} />,
            };
        return {
            bg: "bg-slate-100",
            text: "text-slate-600",
            shadow: "",
            icon: null,
        };
    };

    return (
        <>
            <div className="space-y-6 text-slate-600 font-sans relative pb-10">
                {/* --- HEADER DASHBOARD --- */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                <Activity size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight leading-tight">
                                Executive Dashboard
                            </h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 ml-[76px]">
                            Monitoring Performa:{" "}
                            <span className="font-bold text-indigo-600">
                                {getNamaSatkerTerpilih()}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full lg:w-auto items-end">
                        <button
                            onClick={handleDownloadPdf}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:shadow-lg hover:shadow-slate-500/30 rounded-2xl text-sm font-black uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <FileText size={18} /> Cetak Executive Summary
                        </button>
                    </div>
                </div>

                {/* --- FILTER BAR --- */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs font-bold w-full md:w-auto">
                        {["I", "II", "III", "IV"].map((tw) => (
                            <button
                                key={tw}
                                onClick={() => setSelectedTW(tw)}
                                className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg transition-all duration-300 ${selectedTW === tw ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:bg-slate-200"}`}
                            >
                                TW {tw}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        {authUser?.role === "admin" && (
                            <div className="relative w-full sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search
                                        size={16}
                                        className="text-slate-400"
                                    />
                                </div>
                                <select
                                    value={selectedSatkerId}
                                    onChange={(e) =>
                                        setSelectedSatkerId(e.target.value)
                                    }
                                    className="w-full pl-11 pr-10 py-3 text-sm border-slate-200 rounded-xl bg-slate-50 shadow-inner focus:ring-2 focus:ring-indigo-500 cursor-pointer font-bold text-indigo-700"
                                >
                                    <option value="">
                                        -- Semua Satker (Nasional) --
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
                            </div>
                        )}
                        <div className="relative w-full sm:w-36">
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full pl-5 pr-10 py-3 text-sm border-slate-200 rounded-xl bg-slate-50 shadow-inner focus:ring-2 focus:ring-indigo-500 cursor-pointer font-black text-slate-700"
                            >
                                {[...Array(5)].map((_, i) => {
                                    const yr = new Date().getFullYear() - 2 + i;
                                    return (
                                        <option key={yr} value={yr}>
                                            Tahun {yr}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- QUICK ACTIONS BAR --- */}
                <div className="flex flex-wrap gap-3 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center px-3">
                        Aksi Cepat:
                    </span>
                    <a
                        href="/dashboard/input-transaksi"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                        <PlusCircle size={16} /> Input RPD
                    </a>
                    <a
                        href="/dashboard/input-transaksi"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        <Receipt size={16} /> Input Realisasi
                    </a>
                    {authUser?.role === "admin" && (
                        <a
                            href="/dashboard/laporan-bulanan"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                            <FileText size={16} /> Rapor Satker
                        </a>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4 bg-white/50 rounded-3xl border border-slate-100 backdrop-blur-sm">
                        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black text-xs tracking-widest uppercase animate-pulse">
                            Menghitung Poin SIRA...
                        </p>
                    </div>
                ) : (
                    dashboardData && (
                        <>
                            {/* --- AI INSIGHT POP-UP MODAL (FIXED OVERLAY) --- */}
                            {showInsightPopup && insight && (
                                <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden">
                                    <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative animate-in zoom-in-95 duration-300 border border-slate-100 overflow-hidden">
                                        <div className="absolute -right-10 -top-10 opacity-5">
                                            <Sparkles size={200} />
                                        </div>
                                        <button
                                            onClick={() =>
                                                setShowInsightPopup(false)
                                            }
                                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all z-10"
                                        >
                                            <X size={20} />
                                        </button>
                                        <div className="flex flex-col items-center text-center mt-2 relative z-10">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                                                <Sparkles
                                                    size={12}
                                                    className="animate-pulse"
                                                />{" "}
                                                SIRA AI Assistant
                                            </div>
                                            <div
                                                className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 shadow-lg border-4 border-white ${insight.type === "success" ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30" : insight.type === "warning" ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/30" : "bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-rose-500/30"}`}
                                            >
                                                {insight.type === "success" ? (
                                                    <Trophy size={40} />
                                                ) : insight.type ===
                                                  "warning" ? (
                                                    <AlertTriangle size={40} />
                                                ) : (
                                                    <Zap size={40} />
                                                )}
                                            </div>
                                            <h3
                                                className={`text-2xl font-black mb-3 ${insight.type === "success" ? "text-emerald-700" : insight.type === "warning" ? "text-amber-700" : "text-rose-700"}`}
                                            >
                                                {insight.title}
                                            </h3>
                                            <p className="text-slate-500 font-medium leading-relaxed text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                {insight.text}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    setShowInsightPopup(false)
                                                }
                                                className="mt-8 px-8 py-3.5 bg-slate-900 text-white font-black rounded-xl w-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-500/30"
                                            >
                                                Lanjutkan ke Dashboard
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- 1. SUPER SUMMARY CARDS (6 COLUMNS NOW) --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5">
                                {/* 🔥 SUPER CARD: TOTAL POIN SIRA (SPAN 2) 🔥 */}
                                <div className="xl:col-span-2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black p-6 rounded-[2rem] shadow-xl flex items-center justify-between relative overflow-hidden group border border-slate-700">
                                    <div className="absolute -top-10 -right-10 p-6 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                                        <Star
                                            size={180}
                                            className="fill-yellow-400"
                                        />
                                    </div>
                                    <div className="flex items-center gap-5 z-10">
                                        <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-yellow-400 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <Star
                                                size={40}
                                                className="drop-shadow-lg fill-white"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                                                TOTAL POIN SIRA
                                            </p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400 drop-shadow-md">
                                                    {formatDecimal(
                                                        dashboardData
                                                            .analisis_tw.poin
                                                            .total_poin,
                                                    )}
                                                </h3>
                                                <span className="text-lg font-bold text-slate-500">
                                                    / 55 Pts
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                                            <Wallet size={20} />
                                        </div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                            Pagu
                                            <br />
                                            Anggaran
                                        </h3>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800 truncate">
                                        {formatSingkat(
                                            dashboardData.summary
                                                .total_anggaran,
                                        )}
                                    </h2>
                                </div>

                                <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                            <Receipt size={20} />
                                        </div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                            Aktual
                                            <br />
                                            Realisasi
                                        </h3>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800 truncate">
                                        {formatSingkat(
                                            dashboardData.summary
                                                .total_realisasi_setahun,
                                        )}
                                    </h2>
                                    <div className="mt-1">
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                                            SERAPAN:{" "}
                                            {
                                                dashboardData.summary
                                                    .persentase_realisasi
                                            }
                                            %
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${dashboardData.summary.ikpa >= 95 ? "bg-emerald-50 text-emerald-500" : dashboardData.summary.ikpa >= 85 ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"}`}
                                        >
                                            <Award size={20} />
                                        </div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                            Nilai IKPA
                                            <br />
                                            (Hal III)
                                        </h3>
                                    </div>
                                    <h2
                                        className={`text-3xl font-black ${dashboardData.summary.ikpa >= 95 ? "text-emerald-600" : dashboardData.summary.ikpa >= 85 ? "text-amber-500" : "text-rose-600"}`}
                                    >
                                        {dashboardData.summary.ikpa}
                                    </h2>
                                </div>

                                {/* 🔥 KARTU BARU: CAPAIAN OUTPUT RO 🔥 */}
                                <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                                            <Target size={20} />
                                        </div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                            Capaian
                                            <br />
                                            Output RO
                                        </h3>
                                    </div>
                                    <h2 className="text-3xl font-black text-purple-600 truncate">
                                        {formatDecimal(
                                            dashboardData.analisis_tw.poin
                                                .nilai_ro,
                                        )}
                                        <span className="text-sm text-purple-300 ml-1">
                                            %
                                        </span>
                                    </h2>
                                </div>
                            </div>

                            {/* --- 2. EVALUASI TARGET KEMENKEU (DESAIN DIPERTEGAS) --- */}
                            {dashboardData.analisis_tw && (
                                <div className="bg-white rounded-[2rem] shadow-sm p-6 md:p-8 border border-slate-100 mt-6 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
                                            <Target size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">
                                                Bedah Kalkulasi SIRA (TW{" "}
                                                {selectedTW})
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium mt-1">
                                                Transparansi perhitungan Poin
                                                Maksimal (55 Pts) dari
                                                Penyerapan Anggaran (20%), IKPA
                                                (10%), dan Output RO (25%).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
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
                                                    className={`p-5 flex flex-col justify-between rounded-3xl border transition-all ${isNA ? "bg-slate-50/80 border-slate-200" : isLulus ? "bg-emerald-50/50 border-emerald-100 hover:shadow-md hover:shadow-emerald-100" : "bg-rose-50/50 border-rose-100 hover:shadow-md hover:shadow-rose-100"}`}
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <span
                                                                className={`text-[10px] font-black px-2.5 py-1 rounded-md ${isNA ? "bg-slate-200 text-slate-600" : isLulus ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"}`}
                                                            >
                                                                KODE {kode}
                                                            </span>
                                                            <h4
                                                                className={`font-bold mt-2 ${isNA ? "text-slate-400" : "text-slate-800"}`}
                                                            >
                                                                {namaBelanja}
                                                            </h4>
                                                        </div>
                                                        {isNA ? (
                                                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-400">
                                                                -
                                                            </div>
                                                        ) : isLulus ? (
                                                            <CheckCircle2
                                                                className="text-emerald-500 drop-shadow-sm"
                                                                size={28}
                                                            />
                                                        ) : (
                                                            <XCircle
                                                                className="text-rose-500 drop-shadow-sm"
                                                                size={28}
                                                            />
                                                        )}
                                                    </div>

                                                    {isNA ? (
                                                        <div className="mt-6 text-xs font-bold text-slate-400 text-center py-2 bg-slate-100/50 rounded-xl">
                                                            TIDAK ADA PAGU
                                                        </div>
                                                    ) : (
                                                        <div className="mt-auto">
                                                            <div className="space-y-2 mt-4 bg-white/60 p-3 rounded-xl">
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="text-slate-500 font-bold">
                                                                        Target
                                                                        Kemenkeu:
                                                                    </span>
                                                                    <span className="font-black text-slate-700">
                                                                        {
                                                                            an.target_persen
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="text-slate-500 font-bold">
                                                                        Realisasi
                                                                        Aktual:
                                                                    </span>
                                                                    <span
                                                                        className={`font-black ${isLulus ? "text-emerald-600" : "text-rose-600"}`}
                                                                    >
                                                                        {
                                                                            an.realisasi_persen
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-slate-200/60 rounded-full h-2 mt-4 overflow-hidden relative shadow-inner">
                                                                <div
                                                                    className={`absolute top-0 left-0 h-2 rounded-full ${isLulus ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-rose-400 to-rose-500"}`}
                                                                    style={{
                                                                        width: `${Math.min(an.realisasi_persen, 100)}%`,
                                                                    }}
                                                                ></div>
                                                                <div
                                                                    className="absolute top-0 bottom-0 w-1 bg-slate-800 z-10 rounded-full"
                                                                    style={{
                                                                        left: `${an.target_persen}%`,
                                                                    }}
                                                                    title={`Garis Target ${an.target_persen}%`}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* 🔥 BOX KALKULATOR SIRA 🔥 */}
                                    <div className="bg-[#0f172a] rounded-[1.5rem] p-6 shadow-2xl shadow-indigo-900/10 border border-slate-700 text-white relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
                                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors">
                                                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Target size={14} /> Skor
                                                    Penyerapan
                                                </div>
                                                <div className="flex items-end gap-3">
                                                    <span className="text-3xl font-black text-white">
                                                        {formatDecimal(
                                                            dashboardData
                                                                .analisis_tw
                                                                .poin
                                                                .nilai_penyerapan,
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-slate-400 font-bold mb-1">
                                                        x 20% ={" "}
                                                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg ml-1 border border-emerald-500/20">
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
                                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors">
                                                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Award size={14} /> Skor
                                                    Hal. III DIPA
                                                </div>
                                                <div className="flex items-end gap-3">
                                                    <span className="text-3xl font-black text-white">
                                                        {formatDecimal(
                                                            dashboardData
                                                                .analisis_tw
                                                                .poin
                                                                .ikpa_hal_iii,
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-slate-400 font-bold mb-1">
                                                        x 10% ={" "}
                                                        <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg ml-1 border border-blue-500/20">
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
                                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-colors">
                                                <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <FileText size={14} /> Skor
                                                    Output RO
                                                </div>
                                                <div className="flex items-end gap-3">
                                                    <span className="text-3xl font-black text-white">
                                                        {formatDecimal(
                                                            dashboardData
                                                                .analisis_tw
                                                                .poin.nilai_ro,
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-slate-400 font-bold mb-1">
                                                        x 25% ={" "}
                                                        <span className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg ml-1 border border-purple-500/20">
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

                            {/* --- 3. GRAFIK DINAMIS --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                                <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm p-6 md:p-8 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-600">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">
                                                Grafik Penyerapan Anggaran
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium mt-1">
                                                {dashboardData.is_global
                                                    ? `Perbandingan Kinerja Antar Satker (s.d TW ${selectedTW})`
                                                    : `Tren Rincian Belanja Bulanan (TW ${selectedTW})`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={dashboardData.grafik}
                                                margin={{
                                                    top: 5,
                                                    right: 10,
                                                    left: 10,
                                                    bottom: 5,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    stroke="#f1f5f9"
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
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                    }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    width={50}
                                                    tick={{
                                                        fill: "#64748b",
                                                        fontSize: 11,
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
                                                    cursor={{ fill: "#f8fafc" }}
                                                    contentStyle={{
                                                        borderRadius: "16px",
                                                        border: "none",
                                                        boxShadow:
                                                            "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                                        fontWeight: "bold",
                                                        fontSize: "12px",
                                                        padding: "12px 16px",
                                                    }}
                                                    formatter={(val, name) => [
                                                        `Rp ${val >= 1000000 ? (val / 1000000).toFixed(2) + " Triliun" : val >= 1000 ? (val / 1000).toFixed(2) + " Miliar" : val + " Juta"}`,
                                                        name,
                                                    ]}
                                                />
                                                <Legend
                                                    wrapperStyle={{
                                                        paddingTop: "24px",
                                                        fontSize: "12px",
                                                        fontWeight: "bold",
                                                        color: "#475569",
                                                    }}
                                                    iconType="circle"
                                                />
                                                {dashboardData.is_global ? (
                                                    <>
                                                        <Bar
                                                            dataKey="Target_RPD"
                                                            name="Target RPD"
                                                            fill="#6366f1"
                                                            radius={[
                                                                6, 6, 0, 0,
                                                            ]}
                                                            maxBarSize={40}
                                                        />
                                                        <Bar
                                                            dataKey="Aktual_Realisasi"
                                                            name="Aktual Realisasi"
                                                            fill="#10b981"
                                                            radius={[
                                                                6, 6, 0, 0,
                                                            ]}
                                                            maxBarSize={40}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <Bar
                                                            dataKey="Target_RPD"
                                                            name="Target RPD"
                                                            fill="#6366f1"
                                                            radius={[
                                                                6, 6, 0, 0,
                                                            ]}
                                                            maxBarSize={30}
                                                        />
                                                        <Bar
                                                            dataKey="Belanja_Gaji"
                                                            name="Belanja Pegawai (51)"
                                                            fill="#3b82f6"
                                                            radius={[
                                                                6, 6, 0, 0,
                                                            ]}
                                                            maxBarSize={30}
                                                        />
                                                        <Bar
                                                            dataKey="Belanja_Barang"
                                                            name="Belanja Barang (52)"
                                                            fill="#10b981"
                                                            radius={[
                                                                6, 6, 0, 0,
                                                            ]}
                                                            maxBarSize={30}
                                                        />
                                                        <Bar
                                                            dataKey="Belanja_Modal"
                                                            name="Belanja Modal (53)"
                                                            fill="#8b5cf6"
                                                            radius={[
                                                                6, 6, 0, 0,
                                                            ]}
                                                            maxBarSize={30}
                                                        />
                                                    </>
                                                )}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* --- 4. LEADERBOARD & CCTV LOGS (ADMIN ONLY) --- */}
                                <div className="bg-white rounded-[2rem] shadow-sm p-6 md:p-8 border border-slate-100 flex flex-col h-full overflow-hidden relative">
                                    {!selectedSatkerId ? (
                                        <>
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-emerald-500 to-rose-500"></div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl text-amber-600 shadow-inner">
                                                    <Trophy
                                                        size={24}
                                                        className="fill-yellow-500/50"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900">
                                                        Klasemen Satker
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-medium mt-1">
                                                        Ranking Total Poin SIRA
                                                        TW {selectedTW}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 max-h-[350px]">
                                                {dashboardData.tabel_satker.map(
                                                    (satker, idx) => {
                                                        const podium =
                                                            getPodiumStyle(idx);
                                                        return (
                                                            <div
                                                                key={satker.id}
                                                                className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${idx <= 2 ? `bg-white border-yellow-100 shadow-sm hover:shadow-md ${podium.shadow}` : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"}`}
                                                            >
                                                                <div
                                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${podium.bg} ${podium.text} shadow-inner`}
                                                                >
                                                                    {podium.icon
                                                                        ? podium.icon
                                                                        : `#${idx + 1}`}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-sm font-bold text-slate-900 truncate">
                                                                        {
                                                                            satker.nama_satker
                                                                        }
                                                                    </h4>
                                                                    <p className="text-[10px] font-black text-slate-400 tracking-widest mt-0.5 uppercase">
                                                                        {
                                                                            satker.kode_satker
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div
                                                                        className={`text-sm font-black px-2.5 py-1 rounded-lg ${satker.poin_sira >= 45 ? "text-emerald-700 bg-emerald-100" : satker.poin_sira >= 35 ? "text-amber-700 bg-amber-100" : "text-rose-700 bg-rose-100 animate-pulse"}`}
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
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                                    <PieChart size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900">
                                                        Rincian Belanja
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-medium mt-1">
                                                        Berdasarkan jenis
                                                        pengeluaran
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center gap-4">
                                                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">
                                                        51 - Belanja Pegawai
                                                    </h4>
                                                    <p className="text-2xl font-black text-emerald-900">
                                                        {formatSingkat(
                                                            dashboardData
                                                                .rincian_belanja
                                                                ?.gaji || 0,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5">
                                                        52 - Belanja Barang
                                                    </h4>
                                                    <p className="text-2xl font-black text-blue-900">
                                                        {formatSingkat(
                                                            dashboardData
                                                                .rincian_belanja
                                                                ?.barang || 0,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100">
                                                    <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1.5">
                                                        53 - Belanja Modal
                                                    </h4>
                                                    <p className="text-2xl font-black text-purple-900">
                                                        {formatSingkat(
                                                            dashboardData
                                                                .rincian_belanja
                                                                ?.modal || 0,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* --- 5. BOTTOM 3 & CCTV LOGS (ADMIN ONLY) --- */}
                            {authUser?.role === "admin" &&
                                !selectedSatkerId &&
                                dashboardData.leaderboard && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 animate-in slide-in-from-bottom-4">
                                        <div className="lg:col-span-2 bg-gradient-to-br from-rose-50 to-white rounded-[2rem] shadow-sm p-6 md:p-8 border border-rose-100 relative overflow-hidden">
                                            <div className="absolute -right-6 -top-6 text-rose-500/10">
                                                <AlertTriangle size={120} />
                                            </div>
                                            <div className="flex items-center gap-3 mb-8 relative z-10">
                                                <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
                                                    <AlertTriangle size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-rose-950">
                                                        Zona Kritis (Atensi
                                                        Khusus)
                                                    </h3>
                                                    <p className="text-xs text-rose-600/80 font-medium mt-1">
                                                        3 Satker dengan Total
                                                        Poin SIRA Terendah
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                                                {dashboardData.leaderboard.bottom.map(
                                                    (satker) => (
                                                        <div
                                                            key={`bottom-${satker.id}`}
                                                            className="flex flex-col gap-3 p-5 bg-white/80 backdrop-blur rounded-2xl border border-rose-200 shadow-[0_4px_15px_rgb(225,29,72,0.05)] hover:border-rose-400 transition-colors"
                                                        >
                                                            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xl shadow-inner">
                                                                !
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">
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
                                                            <div className="mt-auto pt-3 border-t border-rose-100">
                                                                <div className="text-xl font-black text-rose-600">
                                                                    {formatDecimal(
                                                                        satker.poin_sira,
                                                                    )}{" "}
                                                                    <span className="text-[10px] text-rose-600/50 uppercase tracking-widest">
                                                                        Poin
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-[#0f172a] rounded-[2rem] shadow-xl p-6 md:p-8 border border-slate-800 text-slate-300 relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4ade80_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>
                                            <div className="flex items-center justify-between mb-8 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                                                        <Clock size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-white">
                                                            Live Audit Log
                                                        </h3>
                                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
                                                            Aktivitas Terkini
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                                                    REC
                                                </div>
                                            </div>

                                            <div className="space-y-5 relative z-10">
                                                {dashboardData.cctv_mini
                                                    ?.length > 0 ? (
                                                    dashboardData.cctv_mini.map(
                                                        (log) => (
                                                            <div
                                                                key={log.id}
                                                                className="group border-l-2 border-slate-700 pl-4 py-1 hover:border-emerald-500 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 mb-1.5">
                                                                    <Clock
                                                                        size={
                                                                            12
                                                                        }
                                                                    />{" "}
                                                                    {formatTimeSingkat(
                                                                        log.created_at,
                                                                    )}
                                                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 ml-1">
                                                                        {
                                                                            log.action
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs font-medium text-slate-300 leading-relaxed line-clamp-2 group-hover:text-white transition-colors">
                                                                    <span className="font-bold text-emerald-400">
                                                                        {log
                                                                            .user
                                                                            ?.name ||
                                                                            "Sistem"}
                                                                    </span>
                                                                    :{" "}
                                                                    {
                                                                        log.description
                                                                    }
                                                                </div>
                                                            </div>
                                                        ),
                                                    )
                                                ) : (
                                                    <div className="text-center py-12 text-xs font-mono font-bold text-slate-600">
                                                        No recent activity
                                                        detected.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </>
                    )
                )}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </>
    );
}
