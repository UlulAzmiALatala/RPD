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
    const [selectedTW, setSelectedTW] = useState("ALL");
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
        const queryParams = new URLSearchParams({
            tahun,
            tw: selectedTW === "ALL" ? "" : selectedTW,
        });
        if (selectedSatkerId) {
            queryParams.append("satker_id", selectedSatkerId);
        }

        axios
            .get(`/api/dashboard-data?${queryParams.toString()}`)
            .then((response) => {
                setDashboardData(response.data.data);
                setLoading(false);
                // Munculkan Pop-up otomatis setiap data berhasil di-load
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
        return (
            "Rp " +
            (angka / 1000000000).toLocaleString("id-ID", {
                maximumFractionDigits: 2,
            }) +
            " M"
        );
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

    const formatTimeSingkat = (dateString) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        return (
            d.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            }) + " WITA"
        );
    };

    const getNamaSatkerTerpilih = () => {
        if (!selectedSatkerId) return "Global Kanwil Kemenkum";
        const satker = daftarSatker.find(
            (s) => s.id.toString() === selectedSatkerId,
        );
        return satker ? satker.nama_satker : "Satker Tertentu";
    };

    let currentTargetTW = 100;
    if (selectedTW === "I") currentTargetTW = 20;
    else if (selectedTW === "II") currentTargetTW = 50;
    else if (selectedTW === "III") currentTargetTW = 75;

    const generateInsight = () => {
        if (!dashboardData) return null;

        const persen = dashboardData.summary.persentase_realisasi || 0;
        const twText =
            selectedTW === "ALL" ? "Setahun" : `Triwulan ${selectedTW}`;

        if (persen >= currentTargetTW) {
            return {
                type: "success",
                title: "Target Terpenuhi!",
                text: `Luar Biasa! Penyerapan anggaran ${getNamaSatkerTerpilih()} (${persen}%) telah mencapai target Kemenkeu untuk periode ${twText} (${currentTargetTW}%).`,
            };
        } else {
            return {
                type: "warning",
                title: "Perlu Atensi",
                text: `Perhatian: Penyerapan anggaran ${getNamaSatkerTerpilih()} baru mencapai ${persen}%. Masih di bawah target Kemenkeu untuk periode ${twText} (${currentTargetTW}%).`,
            };
        }
    };

    const insight = generateInsight();

    return (
        <>
            <div className="space-y-6 text-gray-600 font-sans relative">
                {/* --- HEADER DASHBOARD DENGAN FILTER --- */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-2">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Executive Dashboard
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Performa Anggaran:{" "}
                            <span className="font-bold text-indigo-600">
                                {getNamaSatkerTerpilih()}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 text-xs font-bold">
                            {["ALL", "I", "II", "III", "IV"].map((tw) => (
                                <button
                                    key={tw}
                                    onClick={() => setSelectedTW(tw)}
                                    className={`px-4 py-2 rounded-lg transition-all ${selectedTW === tw ? "bg-gray-800 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
                                >
                                    {tw === "ALL" ? "Setahun" : `TW ${tw}`}
                                </button>
                            ))}
                        </div>

                        {authUser?.role === "admin" && (
                            <div className="relative flex-1 sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                                    className="block w-full pl-10 pr-10 py-2.5 text-sm border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 cursor-pointer text-slate-700 font-medium"
                                >
                                    <option value="">
                                        Semua Satker (Global)
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

                        <div className="relative">
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="block w-full pl-4 pr-10 py-2.5 text-sm border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 cursor-pointer text-slate-700 font-bold"
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
                <div className="flex flex-wrap gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center px-2">
                        Aksi Cepat:
                    </span>
                    <a
                        href="/dashboard/input-transaksi"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                        <PlusCircle size={16} /> Input RPD
                    </a>
                    <a
                        href="/dashboard/input-transaksi"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        <Receipt size={16} /> Input Realisasi
                    </a>
                    {authUser?.role === "admin" && (
                        <a
                            href="/dashboard/laporan-bulanan"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                            <FileText size={16} /> Lihat Laporan Lintas Satker
                        </a>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4 bg-white rounded-3xl border border-gray-100">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-bold text-sm animate-pulse">
                            Menyiapkan Analitik Eksekutif...
                        </p>
                    </div>
                ) : (
                    dashboardData && (
                        <>
                            {/* --- AI INSIGHT POP-UP MODAL --- */}
                            {showInsightPopup && insight && (
                                // 🔥 PERBAIKAN: Tambahkan !w-screen !h-[100vh] untuk memaksa full layar
                                <div className="fixed top-0 left-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 !w-screen !h-[100vh] m-0 overflow-hidden">
                                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-in zoom-in-95 duration-200 border-t-4 border-t-indigo-500">
                                        <button
                                            onClick={() =>
                                                setShowInsightPopup(false)
                                            }
                                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                        <div className="flex flex-col items-center text-center mt-2">
                                            <div
                                                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner ${insight.type === "success" ? "bg-emerald-100 text-emerald-500" : "bg-amber-100 text-amber-500"}`}
                                            >
                                                <Info size={32} />
                                            </div>
                                            <h3
                                                className={`text-xl font-black mb-2 ${insight.type === "success" ? "text-emerald-700" : "text-amber-700"}`}
                                            >
                                                {insight.title}
                                            </h3>
                                            <p className="text-gray-600 font-medium leading-relaxed">
                                                {insight.text}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    setShowInsightPopup(false)
                                                }
                                                className="mt-6 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl w-full hover:bg-gray-800 transition-colors shadow-md"
                                            >
                                                Tutup
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- 1. SUMMARY CARDS --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                            <Wallet size={24} />
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                            TA {tahun}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            Total Pagu Anggaran
                                        </h3>
                                        <h2 className="text-2xl font-black text-gray-900">
                                            {formatSingkat(
                                                dashboardData.summary
                                                    .total_anggaran,
                                            )}
                                        </h2>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                            <CalendarRange size={24} />
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">
                                            {selectedTW === "ALL"
                                                ? "Setahun"
                                                : `TW ${selectedTW}`}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            Target RPD (Kumulatif)
                                        </h3>
                                        <h2 className="text-2xl font-black text-gray-900">
                                            {formatSingkat(
                                                dashboardData.summary
                                                    .total_rpd_setahun,
                                            )}
                                        </h2>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                            <Receipt size={24} />
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                                            Aktual
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            Realisasi Terserap
                                        </h3>
                                        <h2 className="text-2xl font-black text-gray-900">
                                            {formatSingkat(
                                                dashboardData.summary
                                                    .total_realisasi_setahun,
                                            )}
                                        </h2>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${dashboardData.summary.ikpa >= 95 ? "bg-emerald-50 text-emerald-500" : dashboardData.summary.ikpa >= 85 ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"}`}
                                        >
                                            <Award size={24} />
                                        </div>
                                        <span
                                            className={`text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${dashboardData.summary.ikpa >= 95 ? "bg-emerald-100 text-emerald-700" : dashboardData.summary.ikpa >= 85 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}
                                        >
                                            {
                                                dashboardData.summary
                                                    .status_kesehatan
                                            }
                                        </span>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-end mb-1">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                Nilai IKPA Rata-Rata
                                            </h3>
                                            <h2
                                                className={`text-2xl font-black ${dashboardData.summary.ikpa >= 95 ? "text-emerald-600" : dashboardData.summary.ikpa >= 85 ? "text-amber-600" : "text-rose-600"}`}
                                            >
                                                {dashboardData.summary.ikpa}
                                            </h2>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                            <div
                                                className={`h-1.5 rounded-full ${dashboardData.summary.ikpa >= 95 ? "bg-emerald-500" : dashboardData.summary.ikpa >= 85 ? "bg-amber-500" : "bg-rose-500"}`}
                                                style={{
                                                    width: `${dashboardData.summary.ikpa}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- 2. GRAFIK --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-extrabold text-gray-900">
                                                Grafik Penyerapan Anggaran
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Tren RPD vs Realisasi (Dalam
                                                Milyar Rupiah)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-72 w-full">
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
                                                    }}
                                                    iconType="circle"
                                                />
                                                <Bar
                                                    dataKey="RPD"
                                                    name="Target RPD"
                                                    fill="#4f46e5"
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={30}
                                                />
                                                <Bar
                                                    dataKey="Realisasi"
                                                    name="Aktual Realisasi"
                                                    fill="#10b981"
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={30}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* --- CARD CERDAS (BERUBAH SESUAI FILTER SATKER) --- */}
                                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col h-full overflow-hidden">
                                    {!selectedSatkerId ? (
                                        // 🟢 TAMPILAN GLOBAL: LEADERBOARD SERAPAN
                                        <>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-extrabold text-gray-900">
                                                        Serapan per Satker
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Persentase realisasi
                                                        anggaran
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 max-h-72">
                                                {dashboardData.tabel_satker.map(
                                                    (satker) => (
                                                        <div
                                                            key={satker.id}
                                                            className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-gray-900">
                                                                        {
                                                                            satker.nama_satker
                                                                        }
                                                                    </h4>
                                                                    <p className="text-xs text-gray-500">
                                                                        {
                                                                            satker.kode_satker
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                                                    {
                                                                        satker.persen_serap
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                                                <span>
                                                                    Realisasi:{" "}
                                                                    {formatSingkat(
                                                                        satker.total_realisasi,
                                                                    )}
                                                                </span>
                                                                <span>
                                                                    Pagu:{" "}
                                                                    {formatSingkat(
                                                                        satker.total_pagu,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-emerald-500 h-1.5 rounded-full"
                                                                    style={{
                                                                        width: `${Math.min(satker.persen_serap, 100)}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        // 🔵 TAMPILAN SPESIFIK SATKER: RINCIAN JENIS BELANJA
                                        <>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                    <PieChart size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-extrabold text-gray-900">
                                                        Rincian Belanja
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Berdasarkan jenis
                                                        pengeluaran
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center gap-5">
                                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">
                                                        51 - Belanja Pegawai
                                                    </h4>
                                                    <p className="text-xl font-black text-emerald-900">
                                                        {formatSingkat(
                                                            dashboardData
                                                                .rincian_belanja
                                                                ?.gaji || 0,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">
                                                        52 - Belanja Barang
                                                    </h4>
                                                    <p className="text-xl font-black text-blue-900">
                                                        {formatSingkat(
                                                            dashboardData
                                                                .rincian_belanja
                                                                ?.barang || 0,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                                    <h4 className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-1">
                                                        53 - Belanja Modal
                                                    </h4>
                                                    <p className="text-xl font-black text-purple-900">
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

                            {/* =======================================================
                                3. FITUR EKSKLUSIF ADMIN (LEADERBOARD & CCTV)
                            ======================================================= */}
                            {authUser?.role === "admin" &&
                                !selectedSatkerId &&
                                dashboardData.leaderboard && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 animate-in slide-in-from-bottom-4">
                                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-sm p-6 border border-emerald-100 relative overflow-hidden">
                                                <div className="absolute -right-4 -top-4 text-emerald-500/10">
                                                    <Trophy size={100} />
                                                </div>
                                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                                        <Trophy size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-extrabold text-emerald-950">
                                                            Top 3 Satker
                                                        </h3>
                                                        <p className="text-xs text-emerald-600/80 mt-0.5">
                                                            Penyerapan Anggaran
                                                            Tertinggi
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 relative z-10">
                                                    {dashboardData.leaderboard.top.map(
                                                        (satker, idx) => (
                                                            <div
                                                                key={`top-${satker.id}`}
                                                                className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur rounded-xl border border-emerald-50 shadow-sm"
                                                            >
                                                                <div
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-600"}`}
                                                                >
                                                                    #{idx + 1}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-sm font-bold text-gray-900 truncate">
                                                                        {
                                                                            satker.nama_satker
                                                                        }
                                                                    </h4>
                                                                    <p className="text-[10px] text-gray-500">
                                                                        {
                                                                            satker.kode_satker
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm font-black text-emerald-600">
                                                                        {
                                                                            satker.persen_serap
                                                                        }
                                                                        %
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                    {dashboardData.leaderboard
                                                        .top.length === 0 && (
                                                        <div className="text-center py-4 text-xs text-emerald-600">
                                                            Belum ada data
                                                            tersedia.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl shadow-sm p-6 border border-rose-100 relative overflow-hidden">
                                                <div className="absolute -right-4 -top-4 text-rose-500/10">
                                                    <AlertTriangle size={100} />
                                                </div>
                                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                                    <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                                                        <AlertTriangle
                                                            size={20}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-extrabold text-rose-950">
                                                            Atensi Khusus
                                                        </h3>
                                                        <p className="text-xs text-rose-600/80 mt-0.5">
                                                            Penyerapan Anggaran
                                                            Terendah
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 relative z-10">
                                                    {dashboardData.leaderboard.bottom.map(
                                                        (satker) => (
                                                            <div
                                                                key={`bottom-${satker.id}`}
                                                                className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur rounded-xl border border-rose-50 shadow-sm"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-sm">
                                                                    !
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-sm font-bold text-gray-900 truncate">
                                                                        {
                                                                            satker.nama_satker
                                                                        }
                                                                    </h4>
                                                                    <p className="text-[10px] text-gray-500">
                                                                        {
                                                                            satker.kode_satker
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm font-black text-rose-600">
                                                                        {
                                                                            satker.persen_serap
                                                                        }
                                                                        %
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                    {dashboardData.leaderboard
                                                        .bottom.length ===
                                                        0 && (
                                                        <div className="text-center py-4 text-xs text-rose-600">
                                                            Belum ada data
                                                            tersedia.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-800 text-slate-300 relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                            <div className="flex items-center justify-between mb-6 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                                        <Activity size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-extrabold text-white">
                                                            Live Audit Log
                                                        </h3>
                                                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">
                                                            Aktivitas Terkini
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-bold text-emerald-400 uppercase">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                                                    Rec
                                                </div>
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                {dashboardData.cctv_mini
                                                    ?.length > 0 ? (
                                                    dashboardData.cctv_mini.map(
                                                        (log) => (
                                                            <div
                                                                key={log.id}
                                                                className="group border-l-2 border-slate-700 pl-3 py-1 hover:border-emerald-500 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mb-1">
                                                                    <Clock
                                                                        size={
                                                                            10
                                                                        }
                                                                    />{" "}
                                                                    {formatTimeSingkat(
                                                                        log.created_at,
                                                                    )}
                                                                    <span className="px-1.5 rounded bg-slate-800 text-slate-400">
                                                                        {
                                                                            log.action
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs font-medium text-slate-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                                                                    <span className="font-bold text-emerald-400">
                                                                        {log
                                                                            .user
                                                                            ?.name ||
                                                                            "Sistem"}
                                                                        :{" "}
                                                                    </span>
                                                                    {
                                                                        log.description
                                                                    }
                                                                </div>
                                                            </div>
                                                        ),
                                                    )
                                                ) : (
                                                    <div className="text-center py-10 text-xs font-mono text-slate-600">
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
        </>
    );
}
