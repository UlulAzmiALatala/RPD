import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import MainLayout from "../../../Layouts/MainLayout";
import {
    CalendarSearch,
    AlertTriangle,
    FileSpreadsheet,
    FileText,
    Filter,
    DownloadCloud,
    TrendingUp,
} from "lucide-react";

export default function LaporanBulanan() {
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const currentMonth = new Date().getMonth() + 1;
    const [bulan, setBulan] = useState(currentMonth.toString());
    const [jenisLaporan, setJenisLaporan] = useState("rpd_vs_realisasi");

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
        }).format(angka || 0);
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

    const handleExportExcel = () => {
        if (laporanData.length === 0) {
            alert("Tidak ada data untuk di-export!");
            return;
        }

        let aoa = [];
        if (jenisLaporan === "murni_realisasi") {
            aoa = [
                ["REKAPITULASI REALISASI ANGGARAN LINTAS SATKER"],
                [`Kumulatif s.d. Bulan: ${namaBulan[bulan]} ${tahun}`],
                [],
                [
                    "No",
                    "Kode Satker",
                    "Nama Satuan Kerja",
                    "Pagu Efektif (Rp)",
                    "Realisasi Gaji (51)",
                    "Realisasi Barang (52)",
                    "Realisasi Modal (53)",
                    "Total Realisasi (Rp)",
                    "Serapan Total (%)",
                ],
            ];
            laporanData.forEach((row, index) => {
                aoa.push([
                    index + 1,
                    row.satker.kode_satker,
                    row.satker.nama_satker,
                    Number(row.pagu_efektif),
                    Number(row.realisasi_gaji),
                    Number(row.realisasi_barang),
                    Number(row.realisasi_modal),
                    Number(row.total_realisasi),
                    Number(row.persentase_penyerapan) / 100,
                ]);
            });
        } else {
            aoa = [
                ["REKAPITULASI RPD, REALISASI, DAN IKPA LINTAS SATKER"],
                [`Kumulatif s.d. Bulan: ${namaBulan[bulan]} ${tahun}`],
                [],
                [
                    "No",
                    "Kode Satker",
                    "Nama Satuan Kerja",
                    "Pagu Efektif (Rp)",
                    "Total RPD (Rp)",
                    "Total Realisasi (Rp)",
                    "Total Deviasi Nominal (Rp)",
                    "Deviasi Tertimbang (%)",
                    "NILAI IKPA",
                ],
            ];
            laporanData.forEach((row, index) => {
                aoa.push([
                    index + 1,
                    row.satker.kode_satker,
                    row.satker.nama_satker,
                    Number(row.pagu_efektif),
                    Number(row.total_rpd),
                    Number(row.total_realisasi),
                    Number(row.total_deviasi),
                    Number(row.deviasi_tertimbang_kumulatif) / 100,
                    Number(row.nilai_ikpa),
                ]);
            });
        }

        const worksheet = XLSX.utils.aoa_to_sheet(aoa);
        const wscols = [
            { wch: 5 },
            { wch: 15 },
            { wch: 40 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
        ];
        worksheet["!cols"] = wscols;

        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let R = 4; R <= range.e.r; ++R) {
            const colIndex = jenisLaporan === "murni_realisasi" ? 8 : 7;
            const cell_ref = XLSX.utils.encode_cell({ c: colIndex, r: R });
            if (
                worksheet[cell_ref] &&
                typeof worksheet[cell_ref].v === "number"
            ) {
                worksheet[cell_ref].z = "0.00%";
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            `Rekap_${namaBulan[bulan]}`,
        );
        XLSX.writeFile(
            workbook,
            `Laporan_Global_SIRA_${jenisLaporan}_${namaBulan[bulan]}_${tahun}.xlsx`,
        );
    };

    const handleDownloadPdf = (satkerId) => {
        window.open(
            `/api/laporan/realisasi-satker/pdf?tahun=${tahun}&satker_id=${satkerId}`,
            "_blank",
        );
    };

    return (
        <MainLayout tahun={tahun}>
            <div className="space-y-6 font-sans text-slate-600 relative overflow-hidden pb-10">
                {/* --- HEADER & FILTER SECTION --- */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40">
                    <div className="flex-1 min-w-[300px]">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                <CalendarSearch size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                                Laporan Lintas Satker
                            </h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 ml-[76px]">
                            Monitoring performa RPD, Realisasi, dan Deviasi IKPA
                            Global.
                        </p>
                    </div>

                    <form
                        onSubmit={fetchLaporan}
                        className="w-full xl:w-auto flex flex-wrap gap-4 items-end"
                    >
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
                                <Filter size={14} className="text-indigo-400" />{" "}
                                Jenis Laporan
                            </label>
                            <select
                                value={jenisLaporan}
                                onChange={(e) =>
                                    setJenisLaporan(e.target.value)
                                }
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-indigo-700 shadow-sm focus:ring-4 focus:ring-indigo-500/20 cursor-pointer transition-all"
                            >
                                <option value="rpd_vs_realisasi">
                                    📊 RPD vs Realisasi (IKPA)
                                </option>
                                <option value="murni_realisasi">
                                    💰 Murni Realisasi Saja
                                </option>
                            </select>
                        </div>

                        <div className="w-28">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Tahun
                            </label>
                            <input
                                type="number"
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>

                        <div className="w-48">
                            <label className="block text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 ml-1">
                                Kumulatif s.d. Bulan
                            </label>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/20 cursor-pointer transition-all"
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
                            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black transition-all duration-300 shadow-lg ${loading ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-indigo-500/30 hover:-translate-y-0.5"}`}
                        >
                            {loading ? "Mencari..." : "Tampilkan"}
                        </button>
                    </form>
                </div>

                {errorMsg && (
                    <div className="p-5 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl text-sm flex items-center gap-4 shadow-sm animate-[fadeIn_0.3s_ease-out]">
                        <div className="p-2 bg-rose-100 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <p className="font-bold">{errorMsg}</p>
                    </div>
                )}

                {/* --- TABEL REKAPITULASI (SUPER FLAT & CLEAN) --- */}
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden animate-[fadeIn_0.5s_ease-out]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 md:px-8 border-b border-slate-100 bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">
                                    Data Kumulatif s.d.{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">
                                        {namaBulan[bulan]} {tahun}
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={handleExportExcel}
                                disabled={laporanData.length === 0}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 hover:border-emerald-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 disabled:opacity-50 group shadow-sm"
                            >
                                <FileSpreadsheet
                                    size={16}
                                    className="group-hover:scale-110 transition-transform"
                                />{" "}
                                Unduh Excel
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="sticky top-0 z-10 bg-slate-900 text-slate-300 text-[10px] uppercase font-black tracking-widest text-center border-b border-slate-700 shadow-md">
                                {jenisLaporan === "murni_realisasi" ? (
                                    <tr>
                                        <th className="px-5 py-5 rounded-tl-xl text-left">
                                            Satuan Kerja
                                        </th>
                                        <th className="px-5 py-5 text-right border-x border-slate-700">
                                            Pagu Efektif
                                        </th>
                                        <th className="px-5 py-5 text-right">
                                            Realisasi 51
                                        </th>
                                        <th className="px-5 py-5 text-right">
                                            Realisasi 52
                                        </th>
                                        <th className="px-5 py-5 text-right">
                                            Realisasi 53
                                        </th>
                                        <th className="px-5 py-5 text-right bg-emerald-900/40 border-l border-slate-700">
                                            Total Realisasi
                                        </th>
                                        <th className="px-5 py-5 bg-emerald-900/40 border-x border-slate-700">
                                            % Serap
                                        </th>
                                        <th className="px-5 py-5 rounded-tr-xl">
                                            Aksi
                                        </th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="px-5 py-5 rounded-tl-xl text-left">
                                            Satuan Kerja
                                        </th>
                                        <th className="px-5 py-5 text-right border-x border-slate-700">
                                            Pagu Efektif
                                        </th>
                                        <th className="px-5 py-5 text-right text-indigo-300 bg-indigo-900/30">
                                            Total RPD
                                        </th>
                                        <th className="px-5 py-5 text-right text-emerald-300 bg-emerald-900/30">
                                            Total Realisasi
                                        </th>
                                        <th className="px-5 py-5 text-right text-rose-300 bg-rose-900/30 border-r border-slate-700">
                                            Selisih Nominal
                                        </th>
                                        <th className="px-5 py-5 text-right">
                                            Deviasi
                                            <br />
                                            Tertimbang
                                        </th>
                                        <th className="px-5 py-5 bg-yellow-500/20 text-yellow-400 border-x border-slate-700">
                                            Nilai IKPA
                                        </th>
                                        <th className="px-5 py-5 rounded-tr-xl">
                                            Aksi
                                        </th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-slate-100/80">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-6 py-20 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                                        </td>
                                    </tr>
                                ) : laporanData.length > 0 ? (
                                    laporanData.map((row) => (
                                        <tr
                                            key={row.satker.id}
                                            className="hover:bg-indigo-50/40 transition-colors group"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-800">
                                                    {row.satker.nama_satker}
                                                </div>
                                                <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-0.5">
                                                    {row.satker.kode_satker}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right font-extrabold text-slate-600 border-x border-slate-100 bg-slate-50/20">
                                                Rp {formatRp(row.pagu_efektif)}
                                            </td>

                                            {jenisLaporan ===
                                            "murni_realisasi" ? (
                                                <>
                                                    <td className="px-5 py-4 text-right font-medium text-slate-500">
                                                        {formatRp(
                                                            row.realisasi_gaji,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-medium text-slate-500">
                                                        {formatRp(
                                                            row.realisasi_barang,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-medium text-slate-500">
                                                        {formatRp(
                                                            row.realisasi_modal,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-black text-emerald-700 bg-emerald-50/30 border-l border-slate-100">
                                                        {formatRp(
                                                            row.total_realisasi,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-center bg-emerald-50/10 border-x border-slate-100">
                                                        <span
                                                            className={`px-3 py-1 inline-flex text-xs font-black rounded-lg border shadow-sm ${row.persentase_penyerapan >= 50 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}`}
                                                        >
                                                            {
                                                                row.persentase_penyerapan
                                                            }
                                                            %
                                                        </span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-5 py-4 text-right font-semibold text-indigo-700 bg-indigo-50/40">
                                                        {formatRp(
                                                            row.total_rpd,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-semibold text-emerald-700 bg-emerald-50/40">
                                                        {formatRp(
                                                            row.total_realisasi,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-bold text-rose-600 bg-rose-50/40 border-r border-slate-100">
                                                        {formatRp(
                                                            row.total_deviasi,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-bold text-slate-700">
                                                        {
                                                            row.deviasi_tertimbang_kumulatif
                                                        }
                                                        %
                                                    </td>
                                                    <td className="px-5 py-4 text-center bg-amber-50/30 border-x border-slate-100">
                                                        <span
                                                            className={`text-lg font-black drop-shadow-sm ${row.nilai_ikpa >= 90 ? "text-emerald-600" : row.nilai_ikpa >= 70 ? "text-amber-500" : "text-rose-600"}`}
                                                        >
                                                            {row.nilai_ikpa}
                                                        </span>
                                                    </td>
                                                </>
                                            )}

                                            <td className="px-5 py-4 text-center bg-slate-50/30">
                                                <button
                                                    onClick={() =>
                                                        handleDownloadPdf(
                                                            row.satker.id,
                                                        )
                                                    }
                                                    className="inline-flex items-center justify-center p-2.5 bg-rose-50 text-rose-600 hover:bg-gradient-to-r hover:from-rose-500 hover:to-red-500 hover:text-white rounded-xl transition-all duration-300 border border-rose-200 hover:border-transparent hover:shadow-lg group/btn"
                                                    title="Cetak PDF Detail Satker"
                                                >
                                                    <DownloadCloud
                                                        size={18}
                                                        className="group-hover/btn:-translate-y-0.5 transition-transform"
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-6 py-20 text-center text-slate-400 font-bold"
                                        >
                                            Data Belum Tersedia
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </MainLayout>
    );
}
