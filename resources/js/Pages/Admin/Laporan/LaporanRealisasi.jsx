import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../../../Layouts/MainLayout";

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
                // Pastikan merujuk ke tabel_satker agar tidak error map()
                setSatkers(response.data.data.tabel_satker);
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

    const formatRp = (angka) => {
        return new Intl.NumberFormat("id-ID").format(angka);
    };

    return (
        <MainLayout tahun={tahun}>
            <div className="space-y-6 max-w-full mx-auto">
                {/* --- FILTER SECTION --- */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400">
                    <h2 className="text-xl font-bold text-[#0A192F] mb-4">
                        Detail Indikator Halaman 3 DIPA (Realisasi Anggaran)
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
                                    Tabel Rincian RPD vs Realisasi (Format DJPb)
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
                            <table className="min-w-full divide-y divide-gray-200 text-xs border border-gray-400">
                                <thead className="bg-gray-100 text-[#0A192F] text-center font-bold">
                                    <tr>
                                        <th
                                            rowSpan="2"
                                            className="px-2 py-3 border border-gray-300 align-middle"
                                        >
                                            Periode
                                        </th>
                                        <th
                                            colSpan="3"
                                            className="px-2 py-2 border border-gray-300"
                                        >
                                            Rencana Penarikan
                                        </th>
                                        <th
                                            colSpan="3"
                                            className="px-2 py-2 border border-gray-300 bg-green-50"
                                        >
                                            Penyerapan
                                        </th>
                                        <th
                                            colSpan="3"
                                            className="px-2 py-2 border border-gray-300 bg-red-50"
                                        >
                                            Deviasi
                                        </th>
                                        <th
                                            colSpan="3"
                                            className="px-2 py-2 border border-gray-300 bg-yellow-50"
                                        >
                                            % Deviasi
                                        </th>
                                        <th
                                            rowSpan="2"
                                            className="px-2 py-3 border border-gray-300 bg-blue-50 align-middle"
                                        >
                                            % Deviasi Seluruh J.Bel
                                        </th>
                                        <th
                                            rowSpan="2"
                                            className="px-2 py-3 border border-gray-300 bg-blue-50 align-middle"
                                        >
                                            % Rata-Rata Deviasi Kumulatif
                                        </th>
                                        <th
                                            rowSpan="2"
                                            className="px-2 py-3 border border-gray-300 bg-purple-50 align-middle"
                                        >
                                            Nilai IKPA
                                        </th>
                                    </tr>
                                    <tr>
                                        {/* Rencana 51, 52, 53 */}
                                        <th className="px-2 py-1 border border-gray-300">
                                            51
                                        </th>
                                        <th className="px-2 py-1 border border-gray-300">
                                            52
                                        </th>
                                        <th className="px-2 py-1 border border-gray-300">
                                            53
                                        </th>
                                        {/* Penyerapan 51, 52, 53 */}
                                        <th className="px-2 py-1 border border-gray-300 bg-green-50">
                                            51
                                        </th>
                                        <th className="px-2 py-1 border border-gray-300 bg-green-50">
                                            52
                                        </th>
                                        <th className="px-2 py-1 border border-gray-300 bg-green-50">
                                            53
                                        </th>
                                        {/* Deviasi 51, 52, 53 */}
                                        <th className="px-2 py-1 border border-gray-300 bg-red-50">
                                            51
                                        </th>
                                        <th className="px-2 py-1 border border-gray-300 bg-red-50">
                                            52
                                        </th>
                                        <th className="px-2 py-1 border border-gray-300 bg-red-50">
                                            53
                                        </th>
                                        {/* % Deviasi 51, 52, 53 */}
                                        <th className="px-2 py-1 border border-gray-300 bg-yellow-50">
                                            51
                                        </th>
                                        <th className="px-2 py-1 border border-gray-300 bg-yellow-50">
                                            52
                                        </th>
                                        <th className="px-2 py-1 border border-gray-300 bg-yellow-50">
                                            53
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {laporanData.laporan_bulanan.map((row) => (
                                        <tr
                                            key={row.bulan}
                                            className="hover:bg-gray-50 text-right"
                                        >
                                            <td className="px-2 py-2 border border-gray-200 text-center font-medium text-gray-900">
                                                {row.bulan
                                                    .toString()
                                                    .padStart(2, "0")}
                                            </td>

                                            {/* Rencana */}
                                            <td className="px-2 py-2 border border-gray-200">
                                                {formatRp(row.rencana.b51)}
                                            </td>
                                            <td className="px-2 py-2 border border-gray-200">
                                                {formatRp(row.rencana.b52)}
                                            </td>
                                            <td className="px-2 py-2 border border-gray-200">
                                                {formatRp(row.rencana.b53)}
                                            </td>

                                            {/* Penyerapan */}
                                            <td className="px-2 py-2 border border-gray-200 bg-green-50/20">
                                                {formatRp(row.realisasi.b51)}
                                            </td>
                                            <td className="px-2 py-2 border border-gray-200 bg-green-50/20">
                                                {formatRp(row.realisasi.b52)}
                                            </td>
                                            <td className="px-2 py-2 border border-gray-200 bg-green-50/20">
                                                {formatRp(row.realisasi.b53)}
                                            </td>

                                            {/* Deviasi Nominal */}
                                            <td className="px-2 py-2 border border-gray-200 bg-red-50/20 text-red-700">
                                                {formatRp(row.deviasi.b51)}
                                            </td>
                                            <td className="px-2 py-2 border border-gray-200 bg-red-50/20 text-red-700">
                                                {formatRp(row.deviasi.b52)}
                                            </td>
                                            <td className="px-2 py-2 border border-gray-200 bg-red-50/20 text-red-700">
                                                {formatRp(row.deviasi.b53)}
                                            </td>

                                            {/* % Deviasi */}
                                            <td className="px-2 py-2 border border-gray-200 bg-yellow-50/30">
                                                {row.persen_deviasi.b51.toFixed(
                                                    2,
                                                )}
                                            </td>
                                            <td className="px-2 py-2 border border-gray-200 bg-yellow-50/30">
                                                {row.persen_deviasi.b52.toFixed(
                                                    2,
                                                )}
                                            </td>
                                            <td className="px-2 py-2 border border-gray-200 bg-yellow-50/30">
                                                {row.persen_deviasi.b53.toFixed(
                                                    2,
                                                )}
                                            </td>

                                            {/* Kumulatif & IKPA */}
                                            <td className="px-2 py-2 border border-gray-200 bg-blue-50/30 font-semibold">
                                                {row.persen_seluruh.toFixed(2)}
                                            </td>
                                            <td className="px-2 py-2 border border-gray-200 bg-blue-50/30 font-semibold">
                                                {row.rata_kumulatif.toFixed(2)}
                                            </td>
                                            <td
                                                className={`px-2 py-2 border border-gray-200 font-bold ${row.ikpa >= 90 ? "text-green-700 bg-purple-50/40" : "text-red-600 bg-purple-50/40"}`}
                                            >
                                                {row.ikpa.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
