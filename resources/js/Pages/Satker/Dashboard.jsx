import React, { useEffect, useState } from "react";
import axios from "axios";
import { Wallet, Activity, Target, TrendingUp } from "lucide-react";
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
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                    Dashboard Satuan Kerja
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Selamat datang,{" "}
                    <span className="font-bold text-indigo-600">
                        {authUser?.name || "Operator"}
                    </span>
                    . Berikut adalah ringkasan performa anggaran Anda di Tahun{" "}
                    {tahun}.
                </p>
            </div>

            {dashboardData && (
                <>
                    {/* CARD WIDGETS KHUSUS SATKER */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Wallet className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Total Pagu DIPA
                                </p>
                                <h3 className="text-xl font-black text-slate-800 mt-1">
                                    {formatSingkat(
                                        dashboardData.summary.total_anggaran,
                                    )}
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Target className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Total RPD Setahun
                                </p>
                                <h3 className="text-xl font-black text-slate-800 mt-1">
                                    {formatSingkat(
                                        dashboardData.summary.total_rpd_setahun,
                                    )}
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                                <Activity className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Realisasi Terserap
                                </p>
                                <h3 className="text-xl font-black text-slate-800 mt-1">
                                    {formatSingkat(
                                        dashboardData.summary
                                            .total_realisasi_setahun,
                                    )}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* KONTEN GRAFIK SATKER */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900">
                                    Grafik Penyerapan Anggaran Satker
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Perbandingan RPD vs Realisasi (Dalam Milyar
                                    Rupiah)
                                </p>
                            </div>
                        </div>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
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
                                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                                        tickFormatter={(value) => `${value}M`}
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
                </>
            )}
        </>
    );
}
