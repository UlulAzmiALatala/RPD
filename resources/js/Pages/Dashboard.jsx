import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../Layouts/MainLayout";
// Import komponen dari Recharts
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

export default function Dashboard() {
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

    // Helper untuk memformat angka menjadi format Milyar (M) atau Triliun
    const formatSingkat = (angka) => {
        if (!angka || angka === 0) return "Rp 0";
        if (angka >= 1000000000000) {
            return (
                "Rp " +
                (angka / 1000000000000).toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                }) +
                " T"
            );
        }
        return (
            "Rp " +
            (angka / 1000000000).toLocaleString("id-ID", {
                maximumFractionDigits: 2,
            }) +
            " M"
        );
    };

    const formatRp = (angka) => {
        return new Intl.NumberFormat("id-ID").format(angka);
    };

    return (
        <MainLayout tahun={tahun}>
            <div className="space-y-6 max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-500 font-medium text-lg animate-pulse">
                            Memuat data analitik...
                        </p>
                    </div>
                ) : (
                    dashboardData && (
                        <>
                            {/* --- 1. SUMMARY CARDS --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Card 1: Total Anggaran */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Total Anggaran
                                        </h3>
                                        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            💰
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-[#0A192F]">
                                            {formatSingkat(
                                                dashboardData.summary
                                                    .total_anggaran,
                                            )}
                                        </h2>
                                        <p className="text-sm text-green-600 font-medium mt-1">
                                            ↑ TA {tahun}
                                        </p>
                                    </div>
                                </div>

                                {/* Card 2: RPD Bulan Ini */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            RPD Bulan Ini
                                        </h3>
                                        <span className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                            📅
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-[#0A192F]">
                                            {formatSingkat(
                                                dashboardData.summary
                                                    .rpd_bulan_ini,
                                            )}
                                        </h2>
                                        <p className="text-sm text-gray-500 font-medium mt-1">
                                            Target Penarikan
                                        </p>
                                    </div>
                                </div>

                                {/* Card 3: Realisasi Bulan Ini */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Realisasi Bulan Ini
                                        </h3>
                                        <span className="p-2 bg-green-50 text-green-600 rounded-lg">
                                            📈
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-[#0A192F]">
                                            {formatSingkat(
                                                dashboardData.summary
                                                    .realisasi_bulan_ini,
                                            )}
                                        </h2>
                                        <p className="text-sm text-green-600 font-medium mt-1">
                                            Aktual Terserap
                                        </p>
                                    </div>
                                </div>

                                {/* Card 4: IKPA Rata-rata */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            IKPA Rata-rata
                                        </h3>
                                        <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                            ⭐
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-[#0A192F]">
                                            {dashboardData.summary.ikpa}%
                                        </h2>
                                        {/* Progress Bar Mini */}
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className={`h-2 rounded-full ${dashboardData.summary.ikpa >= 90 ? "bg-green-500" : dashboardData.summary.ikpa >= 75 ? "bg-yellow-400" : "bg-red-500"}`}
                                                style={{
                                                    width: `${dashboardData.summary.ikpa}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 font-medium">
                                            Kinerja Pelaksanaan Anggaran
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* --- 2. BAR CHART (GRAFIK) --- */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-[#0A192F] mb-1">
                                    Rencana Penarikan Dana (RPD) vs. Realisasi —
                                    Tren Bulanan
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Tahun Anggaran {tahun} (Milyar Rupiah)
                                </p>

                                <div className="h-80 w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={dashboardData.grafik}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#E5E7EB"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: "#6B7280",
                                                    fontSize: 12,
                                                }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: "#6B7280",
                                                    fontSize: 12,
                                                }}
                                                dx={-10}
                                                tickFormatter={(value) =>
                                                    `Rp ${value}M`
                                                }
                                            />
                                            <Tooltip
                                                cursor={{ fill: "#F3F4F6" }}
                                                contentStyle={{
                                                    borderRadius: "8px",
                                                    border: "none",
                                                    boxShadow:
                                                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                }}
                                                formatter={(value) => [
                                                    `Rp ${value} Milyar`,
                                                ]}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    paddingTop: "20px",
                                                }}
                                                iconType="circle"
                                            />
                                            <Bar
                                                dataKey="RPD"
                                                fill="#0A192F"
                                                radius={[4, 4, 0, 0]}
                                                maxBarSize={40}
                                            />
                                            <Bar
                                                dataKey="Realisasi"
                                                fill="#FBBF24"
                                                radius={[4, 4, 0, 0]}
                                                maxBarSize={40}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* --- 3. TABEL REKAP SATKER --- */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-[#0A192F]">
                                        Rekapitulasi Pagu Anggaran per Satker
                                    </h3>
                                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                        Lihat Semua
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Kode Satker
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Nama Satker
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Total Pagu Anggaran
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {dashboardData.tabel_satker.map(
                                                (satker) => {
                                                    const totalPagu =
                                                        satker.anggarans.reduce(
                                                            (acc, curr) => {
                                                                return (
                                                                    acc +
                                                                    Number(
                                                                        curr.belanja_gaji,
                                                                    ) +
                                                                    Number(
                                                                        curr.belanja_barang,
                                                                    ) +
                                                                    Number(
                                                                        curr.belanja_modal,
                                                                    )
                                                                );
                                                            },
                                                            0,
                                                        );

                                                    return (
                                                        <tr
                                                            key={satker.id}
                                                            className="hover:bg-gray-50 transition-colors"
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                                {
                                                                    satker.kode_satker
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {
                                                                    satker.nama_satker
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0A192F] text-right">
                                                                Rp{" "}
                                                                {formatRp(
                                                                    totalPagu,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )
                )}
            </div>
        </MainLayout>
    );
}
