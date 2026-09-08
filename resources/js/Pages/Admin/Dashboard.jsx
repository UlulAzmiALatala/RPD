import React, { useEffect, useState } from "react";
import axios from "axios";
// HAPUS import MainLayout dari sini karena sudah dipanggil di DashboardIndex
import {
    Wallet,
    CalendarRange,
    Receipt,
    Award,
    Building2,
    TrendingUp,
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

    useEffect(() => {
        setLoading(true);
        axios
            .get(`/api/dashboard-data?tahun=${tahun}`)
            .then((response) => {
                setDashboardData(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Gagal memuat data dashboard:", error);
                setLoading(false);
            });
    }, [tahun]);

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

    const formatRp = (angka) => new Intl.NumberFormat("id-ID").format(angka);
    const currentMonthName = new Date().toLocaleString("id-ID", {
        month: "long",
    });

    return (
        /* GANTI <MainLayout> DENGAN FRAGMENT KOSONG AGAR TIDAK DOBEL */
        <>
            <div className="space-y-6 text-gray-600 font-sans">
                {/* --- HEADER DASHBOARD --- */}
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Executive Dashboard
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Ringkasan performa pelaksanaan anggaran Kanwil TA{" "}
                            {tahun}.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-bold text-sm animate-pulse">
                            Menyiapkan Analitik...
                        </p>
                    </div>
                ) : (
                    dashboardData && (
                        <>
                            {/* --- 1. SUMMARY CARDS --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Card 1: Total Anggaran */}
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

                                {/* Card 2: RPD Bulan Ini */}
                                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                            <CalendarRange size={24} />
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">
                                            {currentMonthName}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            Target RPD
                                        </h3>
                                        <h2 className="text-2xl font-black text-gray-900">
                                            {formatSingkat(
                                                dashboardData.summary
                                                    .rpd_bulan_ini,
                                            )}
                                        </h2>
                                    </div>
                                </div>

                                {/* Card 3: Realisasi Bulan Ini */}
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
                                                    .realisasi_bulan_ini,
                                            )}
                                        </h2>
                                    </div>
                                </div>

                                {/* Card 4: IKPA Rata-rata */}
                                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${dashboardData.summary.ikpa >= 95 ? "bg-emerald-50 text-emerald-500" : dashboardData.summary.ikpa >= 85 ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"}`}
                                        >
                                            <Award size={24} />
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                            Global
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

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                                {/* --- 2. BAR CHART (GRAFIK) --- */}
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

                                {/* --- 3. TABEL REKAP SATKER MINI --- */}
                                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-extrabold text-gray-900">
                                                Serapan per Satker
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Persentase realisasi anggaran
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
                                                            Realisasi: Rp{" "}
                                                            {formatSingkat(
                                                                satker.total_realisasi,
                                                            ).replace(
                                                                "Rp ",
                                                                "",
                                                            )}
                                                        </span>
                                                        <span>
                                                            Pagu: Rp{" "}
                                                            {formatSingkat(
                                                                satker.total_pagu,
                                                            ).replace(
                                                                "Rp ",
                                                                "",
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
                                </div>
                            </div>
                        </>
                    )
                )}
            </div>
        </>
    );
}
