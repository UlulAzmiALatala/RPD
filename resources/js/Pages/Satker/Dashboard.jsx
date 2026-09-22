import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Wallet,
    Activity,
    Target,
    TrendingUp,
    PlusCircle,
    Receipt,
    PieChart,
    CalendarRange,
    Award,
    Star,
    CheckCircle2,
    XCircle,
    Info,
    X,
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

export default function DashboardSatker({ authUser }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [selectedTW, setSelectedTW] = useState("ALL");

    // --- STATE INSIGHT POPUP ---
    const [showInsightPopup, setShowInsightPopup] = useState(false);

    useEffect(() => {
        setLoading(true);
        const queryParams = new URLSearchParams({
            tahun,
            tw: selectedTW === "ALL" ? "" : selectedTW,
        });

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
    }, [tahun, selectedTW]);

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
        if (typeof value === "number") {
            return new Intl.NumberFormat("id-ID", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
        }
        return value;
    };

    const generateInsight = () => {
        if (!dashboardData) return null;
        const twText = `Triwulan ${dashboardData.tw_aktif}`;
        const kesehatan = dashboardData.summary.status_kesehatan;
        const poin = dashboardData.analisis_tw?.poin?.total_poin || 0;

        if (kesehatan === "Sangat Baik" || kesehatan === "Baik") {
            return {
                type: "success",
                title: "Kinerja Satker Optimal!",
                text: `Luar biasa! Kinerja pelaksanaan anggaran Anda meraih Poin SIRA sebesar ${formatDecimal(poin)}/30 (IKPA: ${dashboardData.summary.ikpa}) pada ${twText}. Pertahankan ritme penyerapan ini!`,
            };
        } else {
            return {
                type: "warning",
                title: "Perlu Atensi Khusus",
                text: `Perhatian: Nilai Poin SIRA Anda saat ini (${formatDecimal(poin)}/30) berada di zona "${kesehatan}". Segera evaluasi realisasi belanja dan sesuaikan dengan Halaman III DIPA untuk mengejar target ${twText}.`,
            };
        }
    };

    const insight = generateInsight();

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold text-sm animate-pulse">
                    Menyiapkan Ruang Kerja Satker...
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6 relative pb-10">
                {/* --- AI INSIGHT POP-UP MODAL --- */}
                {showInsightPopup && insight && (
                    <div className="fixed top-0 left-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 w-screen h-screen m-0">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-in zoom-in-95 duration-300">
                            <button
                                onClick={() => setShowInsightPopup(false)}
                                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex flex-col items-center text-center mt-2">
                                <div
                                    className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner ${insight.type === "success" ? "bg-emerald-100 text-emerald-500" : "bg-amber-100 text-amber-500"}`}
                                >
                                    <Info size={40} />
                                </div>
                                <h3
                                    className={`text-2xl font-black mb-3 ${insight.type === "success" ? "text-emerald-700" : "text-amber-700"}`}
                                >
                                    {insight.title}
                                </h3>
                                <p className="text-slate-500 font-medium leading-relaxed text-sm">
                                    {insight.text}
                                </p>
                                <button
                                    onClick={() => setShowInsightPopup(false)}
                                    className="mt-8 px-8 py-3.5 bg-slate-900 text-white font-black rounded-xl w-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-500/30"
                                >
                                    Masuk ke Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- HEADER & FILTER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                            Dashboard Satuan Kerja
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Selamat datang,{" "}
                            <span className="font-bold text-indigo-600">
                                {authUser?.name || "Operator"}
                            </span>
                            . Berikut adalah ringkasan performa anggaran Anda.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 text-xs font-bold">
                            {["ALL", "I", "II", "III", "IV"].map((tw) => (
                                <button
                                    key={tw}
                                    onClick={() => setSelectedTW(tw)}
                                    className={`px-3 py-2 rounded-lg transition-all ${selectedTW === tw ? "bg-gray-800 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
                                >
                                    {tw === "ALL" ? "Setahun" : `TW ${tw}`}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="block w-full pl-4 pr-10 py-2.5 text-sm border-gray-200 rounded-xl bg-white shadow-sm font-bold text-slate-700 cursor-pointer"
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
                <div className="flex flex-wrap gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center px-2">
                        Aksi Cepat:
                    </span>
                    <a
                        href="/dashboard/input-transaksi"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                        <PlusCircle size={16} /> Input RPD Baru
                    </a>
                    <a
                        href="/dashboard/input-transaksi"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        <Receipt size={16} /> Input Realisasi
                    </a>
                </div>

                {dashboardData && (
                    <>
                        {/* --- 1. SUMMARY CARDS (WITH POIN SIRA) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
                            {/* 🔥 SUPER CARD: TOTAL POIN SIRA 🔥 */}
                            <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-[2rem] shadow-xl flex items-center justify-between relative overflow-hidden group border border-slate-800">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Star size={120} />
                                </div>
                                <div className="flex items-center gap-5 z-10">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-500/20 text-yellow-400 flex items-center justify-center border border-indigo-500/30 backdrop-blur-sm shadow-inner">
                                        <Star
                                            size={40}
                                            className="drop-shadow-lg fill-yellow-400"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-indigo-200 uppercase tracking-widest">
                                            TOTAL POIN SIRA
                                        </p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <h3 className="text-5xl font-black text-white drop-shadow-md">
                                                {formatDecimal(
                                                    dashboardData.analisis_tw
                                                        ?.poin?.total_poin || 0,
                                                )}
                                            </h3>
                                            <span className="text-lg font-bold text-indigo-300">
                                                / 30 Pts
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-slate-100 hover:shadow-lg transition-all group flex flex-col justify-center">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Wallet size={24} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                        Pagu
                                        <br />
                                        Anggaran
                                    </h3>
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 truncate">
                                    {formatSingkat(
                                        dashboardData.summary.total_anggaran,
                                    )}
                                </h2>
                            </div>

                            <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-slate-100 hover:shadow-lg transition-all group flex flex-col justify-center">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Receipt size={24} />
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

                            <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-slate-100 hover:shadow-lg transition-all group flex flex-col justify-center relative overflow-hidden">
                                <div className="flex items-center gap-4 mb-3 relative z-10">
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${dashboardData.summary.ikpa >= 95 ? "bg-emerald-50 text-emerald-500" : dashboardData.summary.ikpa >= 85 ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"}`}
                                    >
                                        <Award size={24} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                        Nilai IKPA
                                        <br />
                                        (Hal III)
                                    </h3>
                                </div>
                                <h2
                                    className={`text-3xl font-black relative z-10 ${dashboardData.summary.ikpa >= 95 ? "text-emerald-600" : dashboardData.summary.ikpa >= 85 ? "text-amber-500" : "text-rose-600"}`}
                                >
                                    {dashboardData.summary.ikpa}
                                </h2>
                            </div>
                        </div>

                        {/* --- 2. ANALISIS TARGET TW KEMENKEU & POIN --- */}
                        {dashboardData.analisis_tw && (
                            <div className="bg-white rounded-[2rem] shadow-sm p-6 md:p-8 border border-slate-100 mt-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                        <Target size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">
                                            Evaluasi Target Kemenkeu & Poin SIRA
                                            (TW {dashboardData.tw_aktif})
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium mt-1">
                                            Status kepatuhan minimal penyerapan
                                            anggaran dan kalkulasi Nilai
                                            Tertimbang.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                                    {["51", "52", "53"].map((kode) => {
                                        const an =
                                            dashboardData.analisis_tw[kode];
                                        if (!an) return null;

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
                                                className={`p-5 flex flex-col justify-between rounded-3xl border ${isNA ? "bg-slate-50/80 border-slate-200" : isLulus ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"}`}
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
                                                            className="text-emerald-500"
                                                            size={28}
                                                        />
                                                    ) : (
                                                        <XCircle
                                                            className="text-rose-500"
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
                                                        <div className="space-y-2 mt-4">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-slate-500 font-medium">
                                                                    Target
                                                                    Minimal TW:
                                                                </span>
                                                                <span className="font-bold text-slate-700">
                                                                    {
                                                                        an.target_persen
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-slate-500 font-medium">
                                                                    Realisasi
                                                                    Saat Ini:
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
                                                        <div className="w-full bg-slate-200/60 rounded-full h-1.5 mt-4 overflow-hidden relative">
                                                            <div
                                                                className={`absolute top-0 left-0 h-1.5 rounded-full ${isLulus ? "bg-emerald-500" : "bg-rose-500"}`}
                                                                style={{
                                                                    width: `${Math.min(an.realisasi_persen, 100)}%`,
                                                                }}
                                                            ></div>
                                                            <div
                                                                className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10"
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

                                {/* RUMUS POIN TERTIMBANG SIRA (BOX HITAM) */}
                                <div className="bg-[#0A192F] rounded-[1.5rem] p-6 shadow-inner border border-slate-700 text-white">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                Skor Penyerapan (Bobot 20%)
                                            </div>
                                            <div className="flex items-end gap-3">
                                                <span className="text-3xl font-black text-emerald-400 leading-none">
                                                    {formatDecimal(
                                                        dashboardData
                                                            .analisis_tw.poin
                                                            ?.nilai_penyerapan ||
                                                            0,
                                                    )}
                                                </span>
                                                <span className="text-sm text-slate-400 font-bold mb-1">
                                                    x 20% ={" "}
                                                    <span className="text-white bg-emerald-500/20 px-2 py-1 rounded-lg ml-1">
                                                        {formatDecimal(
                                                            dashboardData
                                                                .analisis_tw
                                                                .poin
                                                                ?.tertimbang_penyerapan ||
                                                                0,
                                                        )}{" "}
                                                        pts
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="border-t md:border-t-0 md:border-l border-slate-700/50 pt-5 md:pt-0 md:pl-6">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                Skor Hal. III DIPA (Bobot 10%)
                                            </div>
                                            <div className="flex items-end gap-3">
                                                <span className="text-3xl font-black text-blue-400 leading-none">
                                                    {formatDecimal(
                                                        dashboardData
                                                            .analisis_tw.poin
                                                            ?.ikpa_hal_iii || 0,
                                                    )}
                                                </span>
                                                <span className="text-sm text-slate-400 font-bold mb-1">
                                                    x 10% ={" "}
                                                    <span className="text-white bg-blue-500/20 px-2 py-1 rounded-lg ml-1">
                                                        {formatDecimal(
                                                            dashboardData
                                                                .analisis_tw
                                                                .poin
                                                                ?.tertimbang_hal_iii ||
                                                                0,
                                                        )}{" "}
                                                        pts
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="border-t md:border-t-0 md:border-l border-slate-700/50 pt-5 md:pt-0 md:pl-6 flex flex-col justify-center">
                                            <div className="text-xs font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                <Star
                                                    size={18}
                                                    className="fill-yellow-500 text-yellow-500"
                                                />{" "}
                                                TOTAL POIN SIRA TW{" "}
                                                {dashboardData.tw_aktif}
                                            </div>
                                            <div className="text-4xl font-black text-yellow-400 leading-none">
                                                {formatDecimal(
                                                    dashboardData.analisis_tw
                                                        .poin?.total_poin || 0,
                                                )}{" "}
                                                <span className="text-lg text-yellow-700">
                                                    / 30 Pts
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 w-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-600">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">
                                            Grafik Performa Satker
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium mt-1">
                                            Perbandingan RPD vs Realisasi (Dalam
                                            Milyar Rupiah)
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
                                                left: -20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#f3f4f6"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: "#9ca3af",
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: "#9ca3af",
                                                    fontSize: 12,
                                                }}
                                                tickFormatter={(value) =>
                                                    `${value}M`
                                                }
                                            />
                                            <Tooltip
                                                cursor={{ fill: "#f8fafc" }}
                                                contentStyle={{
                                                    borderRadius: "12px",
                                                    border: "1px solid #f1f5f9",
                                                    boxShadow:
                                                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                    fontWeight: "bold",
                                                    fontSize: "12px",
                                                    padding: "12px 16px",
                                                }}
                                                formatter={(value) => [
                                                    `Rp ${value} Milyar`,
                                                ]}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    paddingTop: "20px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    color: "#475569",
                                                }}
                                                iconType="circle"
                                            />
                                            <Bar
                                                dataKey="RPD"
                                                name="Target RPD"
                                                fill="#4f46e5"
                                                radius={[4, 4, 0, 0]}
                                                maxBarSize={40}
                                            />
                                            <Bar
                                                dataKey="Realisasi"
                                                name="Aktual Realisasi"
                                                fill="#0ea5e9"
                                                radius={[4, 4, 0, 0]}
                                                maxBarSize={40}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                        <PieChart size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">
                                            Rincian Belanja
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium mt-1">
                                            Berdasarkan komponen pengeluaran
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-around gap-4">
                                    <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">
                                            51 - Belanja Pegawai
                                        </h4>
                                        <p className="text-2xl font-black text-emerald-900">
                                            {formatSingkat(
                                                dashboardData.rincian_belanja
                                                    ?.gaji || 0,
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
                                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5">
                                            52 - Belanja Barang
                                        </h4>
                                        <p className="text-2xl font-black text-blue-900">
                                            {formatSingkat(
                                                dashboardData.rincian_belanja
                                                    ?.barang || 0,
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-5 bg-purple-50 rounded-3xl border border-purple-100">
                                        <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1.5">
                                            53 - Belanja Modal
                                        </h4>
                                        <p className="text-2xl font-black text-purple-900">
                                            {formatSingkat(
                                                dashboardData.rincian_belanja
                                                    ?.modal || 0,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </>
    );
}
