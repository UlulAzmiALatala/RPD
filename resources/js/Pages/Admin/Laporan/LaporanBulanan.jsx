import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../../../Layouts/MainLayout"; // Sesuaikan jumlah '../' sesuai letak MainLayout

export default function LaporanBulanan() {
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const currentMonth = new Date().getMonth() + 1;
    const [bulan, setBulan] = useState(currentMonth.toString());

    const [laporanData, setLaporanData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchLaporan = (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        axios
            .get(`/api/laporan/bulanan?tahun=${tahun}&bulan=${bulan}`)
            .then((response) => {
                setLaporanData(response.data.data);
            })
            .catch((error) => {
                setErrorMsg("Terjadi kesalahan saat memuat laporan bulanan.");
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Auto load saat pertama kali dibuka
    useEffect(() => {
        fetchLaporan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatRp = (angka) => {
        return new Intl.NumberFormat("id-ID").format(angka);
    };

    const namaBulan = [
        "",
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

    return (
        <MainLayout tahun={tahun}>
            <div className="space-y-6 max-w-full mx-auto">
                {/* --- HEADER & FILTER SECTION --- */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                    <h2 className="text-2xl font-bold text-[#0A192F] mb-1">
                        Laporan Bulanan Lintas Satker
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Rekapitulasi performa RPD vs Realisasi seluruh satuan
                        kerja pada bulan tertentu.
                    </p>

                    <form
                        onSubmit={fetchLaporan}
                        className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-md border border-gray-200"
                    >
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tahun Anggaran
                            </label>
                            <input
                                type="number"
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 border focus:ring-2 focus:ring-[#0A192F]"
                            />
                        </div>

                        <div className="flex-1 w-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Bulan
                            </label>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 border focus:ring-2 focus:ring-[#0A192F]"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {namaBulan[i + 1]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-2.5 rounded-md font-bold transition-colors shadow-sm w-full md:w-auto ${
                                loading
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            {loading ? "Memuat..." : "Filter Laporan"}
                        </button>
                    </form>

                    {errorMsg && (
                        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md border border-red-200">
                            {errorMsg}
                        </div>
                    )}
                </div>

                {/* --- TABEL REKAPITULASI --- */}
                <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#0A192F]">
                                Rekap Penyerapan Anggaran
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                Periode:{" "}
                                <span className="text-blue-600">
                                    {namaBulan[bulan]} {tahun}
                                </span>
                            </p>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            Unduh (XLSX)
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-300">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-[#0A192F] text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                                        Satuan Kerja
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold uppercase tracking-wider">
                                        Pagu Efektif
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold uppercase tracking-wider text-yellow-300">
                                        Total RPD
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold uppercase tracking-wider text-green-300">
                                        Total Realisasi
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold uppercase tracking-wider text-red-300">
                                        Deviasi
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold uppercase tracking-wider">
                                        % Serap
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {laporanData.length > 0 ? (
                                    laporanData.map((row) => (
                                        <tr
                                            key={row.satker.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4 font-bold text-gray-900">
                                                {row.satker.kode_satker} -{" "}
                                                {row.satker.nama_satker}
                                            </td>
                                            <td className="px-4 py-4 text-right font-medium text-gray-700">
                                                Rp {formatRp(row.pagu_efektif)}
                                            </td>
                                            <td className="px-4 py-4 text-right font-medium text-gray-700 bg-yellow-50/30">
                                                Rp {formatRp(row.total_rpd)}
                                            </td>
                                            <td className="px-4 py-4 text-right font-medium text-gray-700 bg-green-50/30">
                                                Rp{" "}
                                                {formatRp(row.total_realisasi)}
                                            </td>

                                            {/* Deviasi Merah jika minus (kurang serap), Biru jika positif (over serap) */}
                                            <td
                                                className={`px-4 py-4 text-right font-bold ${row.deviasi < 0 ? "text-red-600 bg-red-50/30" : "text-blue-600 bg-blue-50/30"}`}
                                            >
                                                Rp {formatRp(row.deviasi)}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                                        row.persentase_penyerapan >=
                                                        8.33
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {row.persentase_penyerapan}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-4 py-8 text-center text-gray-500 bg-gray-50"
                                        >
                                            {loading
                                                ? "Memuat data..."
                                                : "Tidak ada data laporan untuk bulan ini."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
