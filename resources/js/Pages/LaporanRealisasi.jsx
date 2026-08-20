import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../Layouts/MainLayout";

export default function LaporanRealisasi() {
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [satkerId, setSatkerId] = useState("");
    const [satkers, setSatkers] = useState([]);

    const [laporanData, setLaporanData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Fetch daftar Satker untuk dropdown filter
    useEffect(() => {
        axios
            .get(`/api/dashboard-data?tahun=${tahun}`)
            .then((response) => {
                setSatkers(response.data.data);
            })
            .catch((error) => console.error("Gagal memuat list satker", error));
    }, [tahun]);

    // Fetch data laporan ketika tombol ditekan
    const fetchLaporan = (e) => {
        e.preventDefault();

        if (!satkerId) {
            setErrorMsg("Silakan pilih Satuan Kerja terlebih dahulu.");
            return;
        }

        setLoading(true);
        setErrorMsg("");
        setLaporanData(null);

        axios
            .get(
                `/api/laporan/realisasi-satker?tahun=${tahun}&satker_id=${satkerId}`,
            )
            .then((response) => {
                setLaporanData(response.data.data);
            })
            .catch((error) => {
                setErrorMsg(
                    error.response?.data?.message ||
                        "Terjadi kesalahan saat memuat laporan.",
                );
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const namaBulan = (bulan) => {
        const nama = [
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
        return nama[bulan];
    };

    const formatRp = (angka) => {
        return new Intl.NumberFormat("id-ID").format(angka);
    };

    return (
        <MainLayout tahun={tahun}>
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* --- FILTER SECTION --- */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400">
                    <h2 className="text-xl font-bold text-[#0A192F] mb-4">
                        Laporan Realisasi Anggaran per Satuan Kerja
                    </h2>

                    <form
                        onSubmit={fetchLaporan}
                        className="flex flex-col md:flex-row gap-4 items-end"
                    >
                        <div className="flex-1">
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

                        <div className="flex-2 w-full md:w-1/2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Satuan Kerja
                            </label>
                            <select
                                value={satkerId}
                                onChange={(e) => setSatkerId(e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 border focus:ring-2 focus:ring-[#0A192F]"
                            >
                                <option value="">
                                    -- Semua Satker (Pilih Salah Satu) --
                                </option>
                                {satkers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.kode_satker} - {s.nama_satker}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2.5 rounded-md font-bold transition-colors shadow-sm ${
                                loading
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-yellow-400 text-[#0A192F] hover:bg-yellow-500"
                            }`}
                        >
                            {loading ? "Memuat..." : "Tampilkan Data"}
                        </button>
                    </form>

                    {errorMsg && (
                        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md border border-red-200">
                            {errorMsg}
                        </div>
                    )}
                </div>

                {/* --- TABEL LAPORAN SECTION --- */}
                {laporanData && (
                    <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-[#0A192F]">
                                    Tabel Rincian RPD vs Realisasi
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Satker:{" "}
                                    <span className="font-semibold">
                                        {laporanData.satker.nama_satker}
                                    </span>{" "}
                                    | Tahun: {laporanData.tahun}
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

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm border">
                                <thead>
                                    {/* Header Row 1 - Grouping */}
                                    <tr>
                                        <th
                                            rowSpan="2"
                                            className="px-3 py-3 bg-[#0A192F] text-white text-left font-semibold border-r border-gray-600"
                                        >
                                            Bulan
                                        </th>
                                        <th
                                            colSpan="4"
                                            className="px-3 py-2 bg-blue-900 text-white text-center font-semibold border-r border-gray-600"
                                        >
                                            Rencana Penarikan Dana (RPD)
                                        </th>
                                        <th
                                            colSpan="4"
                                            className="px-3 py-2 bg-green-800 text-white text-center font-semibold border-r border-gray-600"
                                        >
                                            Realisasi Anggaran
                                        </th>
                                        <th
                                            colSpan="2"
                                            className="px-3 py-2 bg-yellow-600 text-white text-center font-semibold"
                                        >
                                            Kinerja & Deviasi
                                        </th>
                                    </tr>
                                    {/* Header Row 2 - Sub Columns */}
                                    <tr>
                                        {/* RPD Columns */}
                                        <th className="px-3 py-2 bg-blue-800 text-white font-medium text-right border-t border-blue-700">
                                            Gaji
                                        </th>
                                        <th className="px-3 py-2 bg-blue-800 text-white font-medium text-right border-t border-blue-700">
                                            Barang
                                        </th>
                                        <th className="px-3 py-2 bg-blue-800 text-white font-medium text-right border-t border-blue-700">
                                            Modal
                                        </th>
                                        <th className="px-3 py-2 bg-blue-700 text-white font-bold text-right border-t border-blue-600 border-r border-gray-600">
                                            Total RPD
                                        </th>

                                        {/* Realisasi Columns */}
                                        <th className="px-3 py-2 bg-green-700 text-white font-medium text-right border-t border-green-600">
                                            Gaji
                                        </th>
                                        <th className="px-3 py-2 bg-green-700 text-white font-medium text-right border-t border-green-600">
                                            Barang
                                        </th>
                                        <th className="px-3 py-2 bg-green-700 text-white font-medium text-right border-t border-green-600">
                                            Modal
                                        </th>
                                        <th className="px-3 py-2 bg-green-600 text-white font-bold text-right border-t border-green-500 border-r border-gray-600">
                                            Total Realisasi
                                        </th>

                                        {/* Deviasi & IKPA */}
                                        <th className="px-3 py-2 bg-yellow-500 text-white font-bold text-right border-t border-yellow-400">
                                            Deviasi (Rp)
                                        </th>
                                        <th className="px-3 py-2 bg-yellow-500 text-white font-bold text-center border-t border-yellow-400">
                                            IKPA %
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {laporanData.laporan_bulanan.map((row) => (
                                        <tr
                                            key={row.bulan}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-3 py-3 font-medium text-gray-900 border-r border-gray-200">
                                                {namaBulan(row.bulan)}
                                            </td>

                                            {/* RPD Data */}
                                            <td className="px-3 py-3 text-right text-gray-700 bg-blue-50/30">
                                                {formatRp(row.rpd_gaji)}
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-700 bg-blue-50/30">
                                                {formatRp(row.rpd_barang)}
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-700 bg-blue-50/30">
                                                {formatRp(row.rpd_modal)}
                                            </td>
                                            <td className="px-3 py-3 text-right font-bold text-[#0A192F] bg-blue-50 border-r border-gray-200">
                                                {formatRp(row.rpd_total)}
                                            </td>

                                            {/* Realisasi Data */}
                                            <td className="px-3 py-3 text-right text-gray-700 bg-green-50/30">
                                                {formatRp(row.realisasi_gaji)}
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-700 bg-green-50/30">
                                                {formatRp(row.realisasi_barang)}
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-700 bg-green-50/30">
                                                {formatRp(row.realisasi_modal)}
                                            </td>
                                            <td className="px-3 py-3 text-right font-bold text-green-700 bg-green-50 border-r border-gray-200">
                                                {formatRp(row.realisasi_total)}
                                            </td>

                                            {/* Deviasi & IKPA */}
                                            <td className="px-3 py-3 text-right font-semibold text-red-600">
                                                {formatRp(row.deviasi)}
                                            </td>
                                            <td
                                                className={`px-3 py-3 text-center font-bold ${
                                                    row.ikpa >= 90
                                                        ? "text-green-600"
                                                        : row.ikpa >= 75
                                                          ? "text-yellow-600"
                                                          : "text-red-600"
                                                }`}
                                            >
                                                {row.ikpa}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {/* Optional Footer untuk Total Setahun */}
                                <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-400">
                                    <tr>
                                        <td className="px-3 py-3 text-right border-r border-gray-300">
                                            TOTAL
                                        </td>
                                        <td
                                            colSpan="3"
                                            className="bg-blue-50/50"
                                        ></td>
                                        <td className="px-3 py-3 text-right text-[#0A192F] bg-blue-100 border-r border-gray-300">
                                            {formatRp(
                                                laporanData.laporan_bulanan.reduce(
                                                    (sum, item) =>
                                                        sum + item.rpd_total,
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td
                                            colSpan="3"
                                            className="bg-green-50/50"
                                        ></td>
                                        <td className="px-3 py-3 text-right text-green-800 bg-green-100 border-r border-gray-300">
                                            {formatRp(
                                                laporanData.laporan_bulanan.reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        item.realisasi_total,
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-right text-red-700 bg-yellow-50">
                                            {formatRp(
                                                laporanData.summary
                                                    .total_deviasi,
                                            )}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
