import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // <-- Import Library Excel
import MainLayout from "../../../Layouts/MainLayout";
import {
    CalendarSearch,
    Download,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    FileSpreadsheet,
} from "lucide-react";

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

    useEffect(() => {
        fetchLaporan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatRp = (angka) => {
        return new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: 0,
        }).format(angka);
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

    // =========================================================================
    // FITUR DEWA: EXPORT KE EXCEL (XLSX)
    // =========================================================================
    const handleExportExcel = () => {
        if (laporanData.length === 0) {
            alert("Tidak ada data untuk di-export!");
            return;
        }

        // 1. Siapkan kerangka data untuk Excel
        const excelData = laporanData.map((row, index) => ({
            No: index + 1,
            "Kode Satker": row.satker.kode_satker,
            "Nama Satuan Kerja": row.satker.nama_satker,
            "Pagu Efektif (Rp)": Number(row.pagu_efektif),
            "Total RPD (Rp)": Number(row.total_rpd),
            "Total Realisasi (Rp)": Number(row.total_realisasi),
            "Deviasi (Rp)": Number(row.deviasi),
            "Serapan (%)": Number(row.persentase_penyerapan),
            Keterangan:
                row.deviasi < 0
                    ? "Kurang Serap"
                    : row.deviasi > 0
                      ? "Over Serap"
                      : "Sesuai Target",
        }));

        // 2. Buat Worksheet dari Data JSON
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // 3. Atur lebar kolom biar rapi
        const wscols = [
            { wch: 5 }, // No
            { wch: 15 }, // Kode
            { wch: 40 }, // Nama Satker
            { wch: 20 }, // Pagu
            { wch: 20 }, // RPD
            { wch: 20 }, // Realisasi
            { wch: 20 }, // Deviasi
            { wch: 15 }, // Serapan
            { wch: 20 }, // Keterangan
        ];
        worksheet["!cols"] = wscols;

        // 4. Buat Workbook dan masukkan Worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            `Laporan_${namaBulan[bulan]}_${tahun}`,
        );

        // 5. Download File!
        XLSX.writeFile(
            workbook,
            `Rekap_Kemenkumham_${namaBulan[bulan]}_${tahun}.xlsx`,
        );
    };

    return (
        <MainLayout tahun={tahun}>
            <div className="space-y-6 font-sans text-gray-600 relative overflow-hidden">
                {/* --- HEADER & FILTER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <CalendarSearch size={24} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Laporan Lintas Satker
                            </h2>
                        </div>
                        <p className="text-sm text-gray-500 ml-11">
                            Pantau performa RPD vs Realisasi seluruh satuan
                            kerja.
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
                                className="w-full sm:w-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                                Bulan
                            </label>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="w-full sm:w-48 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {namaBulan[i + 1]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold transition-all shadow-md ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
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

                {/* --- TABEL REKAPITULASI --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 border-b border-gray-100 bg-slate-50/50">
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900">
                                Rekapitulasi Bulan{" "}
                                <span className="text-blue-600">
                                    {namaBulan[bulan]} {tahun}
                                </span>
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Deviasi negatif (merah) menandakan realisasi di
                                bawah target RPD.
                            </p>
                        </div>
                        <button
                            onClick={handleExportExcel}
                            disabled={laporanData.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 hover:border-emerald-500 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <FileSpreadsheet
                                size={18}
                                className="group-hover:animate-bounce"
                            />
                            Unduh Excel
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#0A192F] text-gray-300 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-lg">
                                        Satuan Kerja
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        Pagu Efektif
                                    </th>
                                    <th className="px-6 py-4 text-right text-indigo-300">
                                        Target RPD
                                    </th>
                                    <th className="px-6 py-4 text-right text-emerald-300">
                                        Realisasi
                                    </th>
                                    <th className="px-6 py-4 text-right text-rose-300">
                                        Deviasi (Selisih)
                                    </th>
                                    <th className="px-6 py-4 text-center rounded-tr-lg">
                                        % Serap
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                            <p className="mt-2 text-sm text-gray-400">
                                                Menghitung laporan bulanan...
                                            </p>
                                        </td>
                                    </tr>
                                ) : laporanData.length > 0 ? (
                                    laporanData.map((row) => (
                                        <tr
                                            key={row.satker.id}
                                            className="hover:bg-blue-50/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">
                                                    {row.satker.nama_satker}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {row.satker.kode_satker}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-600">
                                                Rp {formatRp(row.pagu_efektif)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-indigo-700 bg-indigo-50/30">
                                                Rp {formatRp(row.total_rpd)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-extrabold text-emerald-700 bg-emerald-50/30">
                                                Rp{" "}
                                                {formatRp(row.total_realisasi)}
                                            </td>

                                            <td
                                                className={`px-6 py-4 text-right font-bold flex justify-end items-center gap-2 ${row.deviasi < 0 ? "text-rose-600 bg-rose-50/30" : row.deviasi > 0 ? "text-blue-600 bg-blue-50/30" : "text-gray-500"}`}
                                            >
                                                {row.deviasi < 0 ? (
                                                    <TrendingDown size={16} />
                                                ) : row.deviasi > 0 ? (
                                                    <TrendingUp size={16} />
                                                ) : null}
                                                Rp{" "}
                                                {formatRp(
                                                    Math.abs(row.deviasi),
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-xs font-extrabold rounded-md border ${
                                                        row.persentase_penyerapan >=
                                                        100
                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                            : row.persentase_penyerapan >=
                                                                50
                                                              ? "bg-blue-100 text-blue-700 border-blue-200"
                                                              : "bg-rose-100 text-rose-700 border-rose-200"
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
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CalendarSearch className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-medium">
                                                Tidak ada data transaksi di
                                                bulan ini.
                                            </p>
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
