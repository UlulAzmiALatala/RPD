import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Pastikan sudah npm install xlsx
import MainLayout from "../../../Layouts/MainLayout";
import {
    Building2,
    FileSpreadsheet,
    AlertTriangle,
    Award,
    TrendingUp,
    TrendingDown,
    Target,
} from "lucide-react";

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
            .then((response) => setSatkers(response.data.data.tabel_satker))
            .catch((error) => console.error("Gagal memuat list satker", error));
    }, [tahun]);

    // Fetch data laporan
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
            .then((response) => setLaporanData(response.data.data))
            .catch((error) =>
                setErrorMsg(
                    error.response?.data?.message ||
                        "Terjadi kesalahan saat memuat laporan.",
                ),
            )
            .finally(() => setLoading(false));
    };

    const formatRp = (angka) =>
        new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(
            angka,
        );
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

    // =========================================================================
    // PERHITUNGAN SMART CARDS SUMMARY
    // =========================================================================
    const summary = useMemo(() => {
        if (!laporanData) return null;

        let totRencana = 0;
        let totRealisasi = 0;
        let totDeviasi = 0;

        laporanData.laporan_bulanan.forEach((row) => {
            totRencana += row.rencana.b51 + row.rencana.b52 + row.rencana.b53;
            totRealisasi +=
                row.realisasi.b51 + row.realisasi.b52 + row.realisasi.b53;
            totDeviasi += row.deviasi.b51 + row.deviasi.b52 + row.deviasi.b53;
        });

        // Ambil Nilai IKPA berdasarkan bulan saat ini
        const currentMonthIndex = new Date().getMonth();
        const currentIkpa =
            laporanData.laporan_bulanan[currentMonthIndex]?.ikpa || 0;

        return { totRencana, totRealisasi, totDeviasi, currentIkpa };
    }, [laporanData]);

    // =========================================================================
    // FITUR DEWA: EXPORT KE EXCEL (XLSX)
    // =========================================================================
    const handleExportExcel = () => {
        if (!laporanData) return;

        const excelData = laporanData.laporan_bulanan.map((row) => ({
            Bulan: namaBulan[row.bulan],
            "Rencana 51 (Gaji)": row.rencana.b51,
            "Rencana 52 (Barang)": row.rencana.b52,
            "Rencana 53 (Modal)": row.rencana.b53,
            "Realisasi 51 (Gaji)": row.realisasi.b51,
            "Realisasi 52 (Barang)": row.realisasi.b52,
            "Realisasi 53 (Modal)": row.realisasi.b53,
            "Deviasi 51 (Rp)": row.deviasi.b51,
            "Deviasi 52 (Rp)": row.deviasi.b52,
            "Deviasi 53 (Rp)": row.deviasi.b53,
            "% Deviasi 51": row.persen_deviasi.b51,
            "% Deviasi 52": row.persen_deviasi.b52,
            "% Deviasi 53": row.persen_deviasi.b53,
            "% Deviasi Total": row.persen_seluruh,
            "% Rata-Rata Kumulatif": row.rata_kumulatif,
            "Nilai IKPA": row.ikpa,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const wscols = [
            { wch: 12 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 12 },
            { wch: 18 },
            { wch: 10 },
        ];
        worksheet["!cols"] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            `IKPA_${laporanData.satker.kode_satker}`,
        );

        XLSX.writeFile(
            workbook,
            `Detail_IKPA_${laporanData.satker.kode_satker}_${tahun}.xlsx`,
        );
    };

    return (
        <MainLayout tahun={tahun}>
            <div className="space-y-6 font-sans text-gray-600 relative overflow-hidden">
                {/* --- HEADER & FILTER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Building2 size={24} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Rapor IKPA per Satker
                            </h2>
                        </div>
                        <p className="text-sm text-gray-500 ml-11">
                            Detail Indikator Kinerja Pelaksanaan Anggaran
                            (Halaman III DIPA).
                        </p>
                    </div>

                    <form
                        onSubmit={fetchLaporan}
                        className="w-full md:w-auto flex flex-col sm:flex-row gap-3"
                    >
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                                Tahun
                            </label>
                            <input
                                type="number"
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full sm:w-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                                Satuan Kerja
                            </label>
                            <select
                                value={satkerId}
                                onChange={(e) => setSatkerId(e.target.value)}
                                className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">-- Pilih Satker --</option>
                                {satkers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.kode_satker} - {s.nama_satker}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold transition-all shadow-md ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                            >
                                {loading ? "Memuat..." : "Tampilkan"}
                            </button>
                        </div>
                    </form>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-start gap-3 shadow-sm">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
                        <p className="pt-0.5 font-medium">{errorMsg}</p>
                    </div>
                )}

                {/* --- SMART CARDS SUMMARY (Muncul Jika Data Ada) --- */}
                {laporanData && summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-[fadeIn_0.5s_ease-out]">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${summary.currentIkpa >= 95 ? "bg-emerald-50 text-emerald-500" : summary.currentIkpa >= 85 ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"}`}
                            >
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Nilai IKPA Saat Ini
                                </p>
                                <h3
                                    className={`text-xl font-extrabold mt-0.5 ${summary.currentIkpa >= 95 ? "text-emerald-600" : summary.currentIkpa >= 85 ? "text-amber-600" : "text-rose-600"}`}
                                >
                                    {summary.currentIkpa.toFixed(2)}
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                <Target size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Total Rencana (RPD)
                                </p>
                                <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
                                    {formatRp(summary.totRencana)}
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Total Realisasi
                                </p>
                                <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
                                    {formatRp(summary.totRealisasi)}
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                <TrendingDown size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Total Deviasi (Rp)
                                </p>
                                <h3 className="text-lg font-extrabold text-rose-600 mt-0.5">
                                    {formatRp(summary.totDeviasi)}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TABEL LAPORAN SECTION --- */}
                {laporanData && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-[fadeIn_0.5s_ease-out]">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-slate-50/50">
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900">
                                    Rincian RPD vs Realisasi
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Satker:{" "}
                                    <span className="font-bold text-indigo-600">
                                        {laporanData.satker.nama_satker}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 hover:border-emerald-500 rounded-xl text-sm font-bold transition-all group"
                            >
                                <FileSpreadsheet
                                    size={18}
                                    className="group-hover:animate-bounce"
                                />
                                Unduh Excel
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-[#0A192F] text-white text-center font-semibold">
                                    <tr>
                                        <th
                                            rowSpan="2"
                                            className="px-3 py-3 border-r border-gray-600 align-middle w-24"
                                        >
                                            Bulan
                                        </th>
                                        <th
                                            colSpan="3"
                                            className="px-2 py-2 border-r border-gray-600 bg-blue-900/50"
                                        >
                                            Rencana Penarikan
                                        </th>
                                        <th
                                            colSpan="3"
                                            className="px-2 py-2 border-r border-gray-600 bg-emerald-900/50"
                                        >
                                            Penyerapan
                                        </th>
                                        <th
                                            colSpan="3"
                                            className="px-2 py-2 border-r border-gray-600 bg-rose-900/50"
                                        >
                                            Deviasi (Rp)
                                        </th>
                                        <th
                                            colSpan="3"
                                            className="px-2 py-2 border-r border-gray-600 bg-amber-900/50"
                                        >
                                            % Deviasi
                                        </th>
                                        <th
                                            rowSpan="2"
                                            className="px-2 py-3 border-r border-gray-600 bg-indigo-900/50 align-middle"
                                        >
                                            % Deviasi Total
                                        </th>
                                        <th
                                            rowSpan="2"
                                            className="px-2 py-3 border-r border-gray-600 bg-indigo-900/50 align-middle"
                                        >
                                            Rata-rata Kumulatif
                                        </th>
                                        <th
                                            rowSpan="2"
                                            className="px-2 py-3 bg-purple-900/50 align-middle font-extrabold tracking-widest text-yellow-300 w-24"
                                        >
                                            NILAI IKPA
                                        </th>
                                    </tr>
                                    <tr className="bg-gray-800 text-gray-300 text-[10px] tracking-wider">
                                        {/* Rencana */}
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            51
                                        </th>
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            52
                                        </th>
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            53
                                        </th>
                                        {/* Penyerapan */}
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            51
                                        </th>
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            52
                                        </th>
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            53
                                        </th>
                                        {/* Deviasi Nominal */}
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            51
                                        </th>
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            52
                                        </th>
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            53
                                        </th>
                                        {/* Deviasi Persen */}
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            51
                                        </th>
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            52
                                        </th>
                                        <th className="px-2 py-1.5 border-r border-gray-600">
                                            53
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
                                    {laporanData.laporan_bulanan.map((row) => {
                                        // Mewarnai Nilai IKPA
                                        let ikpaColor =
                                            "bg-rose-100 text-rose-700 border-rose-200";
                                        if (row.ikpa >= 95)
                                            ikpaColor =
                                                "bg-emerald-100 text-emerald-700 border-emerald-200";
                                        else if (row.ikpa >= 85)
                                            ikpaColor =
                                                "bg-amber-100 text-amber-700 border-amber-200";

                                        return (
                                            <tr
                                                key={row.bulan}
                                                className="hover:bg-indigo-50/30 text-right transition-colors font-mono"
                                            >
                                                <td className="px-3 py-2.5 border-r border-gray-100 text-center font-sans font-bold text-gray-900 bg-gray-50/50">
                                                    {namaBulan[row.bulan]
                                                        .substring(0, 3)
                                                        .toUpperCase()}
                                                </td>

                                                {/* Rencana */}
                                                <td className="px-2 py-2 border-r border-gray-100 text-gray-500">
                                                    {formatRp(row.rencana.b51)}
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-100 text-gray-500">
                                                    {formatRp(row.rencana.b52)}
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-100 text-gray-500">
                                                    {formatRp(row.rencana.b53)}
                                                </td>

                                                {/* Penyerapan */}
                                                <td className="px-2 py-2 border-r border-gray-100 font-medium text-emerald-700 bg-emerald-50/20">
                                                    {formatRp(
                                                        row.realisasi.b51,
                                                    )}
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-100 font-medium text-emerald-700 bg-emerald-50/20">
                                                    {formatRp(
                                                        row.realisasi.b52,
                                                    )}
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-100 font-medium text-emerald-700 bg-emerald-50/20">
                                                    {formatRp(
                                                        row.realisasi.b53,
                                                    )}
                                                </td>

                                                {/* Deviasi Nominal */}
                                                <td className="px-2 py-2 border-r border-gray-100 text-rose-600 bg-rose-50/20">
                                                    {formatRp(row.deviasi.b51)}
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-100 text-rose-600 bg-rose-50/20">
                                                    {formatRp(row.deviasi.b52)}
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-100 text-rose-600 bg-rose-50/20">
                                                    {formatRp(row.deviasi.b53)}
                                                </td>

                                                {/* % Deviasi */}
                                                <td className="px-2 py-2 border-r border-gray-100 text-amber-700 bg-amber-50/20">
                                                    {row.persen_deviasi.b51.toFixed(
                                                        2,
                                                    )}
                                                    %
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-100 text-amber-700 bg-amber-50/20">
                                                    {row.persen_deviasi.b52.toFixed(
                                                        2,
                                                    )}
                                                    %
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-100 text-amber-700 bg-amber-50/20">
                                                    {row.persen_deviasi.b53.toFixed(
                                                        2,
                                                    )}
                                                    %
                                                </td>

                                                {/* Kumulatif */}
                                                <td className="px-2 py-2 border-r border-gray-100 font-bold text-indigo-700 bg-indigo-50/20">
                                                    {row.persen_seluruh.toFixed(
                                                        2,
                                                    )}
                                                    %
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-100 font-bold text-indigo-700 bg-indigo-50/20">
                                                    {row.rata_kumulatif.toFixed(
                                                        2,
                                                    )}
                                                    %
                                                </td>

                                                {/* Nilai IKPA */}
                                                <td className="px-2 py-2 text-center align-middle bg-purple-50/30">
                                                    <span
                                                        className={`px-2.5 py-1 inline-flex text-xs font-extrabold rounded-md border ${ikpaColor} font-sans`}
                                                    >
                                                        {row.ikpa.toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            </div>
        </MainLayout>
    );
}
