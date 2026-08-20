import "./bootstrap";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";

export default function Dashboard() {
    const [satkers, setSatkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tahun, setTahun] = useState("2025");

    useEffect(() => {
        // Menembak endpoint API yang sudah kita buat di web.php
        axios
            .get(`/api/dashboard-data?tahun=${tahun}`)
            .then((response) => {
                setSatkers(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Gagal memuat data dashboard:", error);
                setLoading(false);
            });
    }, [tahun]);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar Navy Pengayoman */}
            <aside className="w-64 bg-[#0A192F] text-white flex flex-col">
                <div className="p-5 text-lg font-bold border-b border-gray-800 text-yellow-400">
                    RPD KEMENKUM
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a
                        href="#"
                        className="block px-4 py-2 rounded bg-yellow-400 text-[#0A192F] font-semibold"
                    >
                        Dashboard
                    </a>
                    <a
                        href="#"
                        className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300"
                    >
                        Input Transaksi
                    </a>
                    <a
                        href="#"
                        className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300"
                    >
                        Laporan Bulanan
                    </a>
                    <a
                        href="#"
                        className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300"
                    >
                        Laporan Realisasi
                    </a>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-[#0A192F]">
                        Dashboard Pengelolaan Anggaran & RPD
                    </h1>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                            Tahun Anggaran: {tahun}
                        </span>
                    </div>
                </header>

                <main className="p-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-[#0A192F] mb-4">
                            Rekapitulasi Anggaran Satker
                        </h3>

                        {loading ? (
                            <p className="text-gray-500">
                                Memuat data dari database...
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Kode Satker
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Nama Satker
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Total Pagu Anggaran
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {satkers.map((satker) => {
                                            // Menghitung total dari relasi anggaran
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
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {satker.kode_satker}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {satker.nama_satker}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0A192F]">
                                                        Rp{" "}
                                                        {totalPagu.toLocaleString(
                                                            "id-ID",
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

const rootElement = document.getElementById("app");
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Dashboard />);
}
