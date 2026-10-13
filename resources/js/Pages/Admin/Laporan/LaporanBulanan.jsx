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
    Trophy,
    Medal,
    Crown,
    Loader2,
} from "lucide-react";

export default function LaporanBulanan() {
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [bulan, setBulan] = useState((new Date().getMonth() + 1).toString());
    const [jenisLaporan, setJenisLaporan] = useState("rpd_vs_realisasi");

    const [laporanData, setLaporanData] = useState([]);
    const [twAktif, setTwAktif] = useState("");
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
                setTwAktif(response.data.tw_aktif);
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

    const formatDecimal = (value) => {
        if (typeof value === "number") {
            return new Intl.NumberFormat("id-ID", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
        }
        return value;
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
                ["REKAPITULASI POIN IKPA DAN EVALUASI LINTAS SATKER"],
                [
                    `Kumulatif s.d. Bulan: ${namaBulan[bulan]} ${tahun} (TW ${twAktif})`,
                ],
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
                    "Status Kemenkeu 51",
                    "Status Kemenkeu 52",
                    "Status Kemenkeu 53",
                    "NILAI IKPA (Hal III DIPA)",
                    "NILAI CAPAIAN RO (Maks 100)",
                    "TOTAL POIN SIRA (Maks 55)",
                ],
            ];
            laporanData.forEach((row, index) => {
                const eval51 =
                    row.evaluasi_tw["51"].status === "N/A"
                        ? "N/A"
                        : row.evaluasi_tw["51"].status.toUpperCase();
                const eval52 =
                    row.evaluasi_tw["52"].status === "N/A"
                        ? "N/A"
                        : row.evaluasi_tw["52"].status.toUpperCase();
                const eval53 =
                    row.evaluasi_tw["53"].status === "N/A"
                        ? "N/A"
                        : row.evaluasi_tw["53"].status.toUpperCase();

                aoa.push([
                    index + 1,
                    row.satker.kode_satker,
                    row.satker.nama_satker,
                    Number(row.pagu_efektif),
                    Number(row.total_rpd),
                    Number(row.total_realisasi),
                    Number(row.total_deviasi),
                    Number(row.deviasi_tertimbang_kumulatif) / 100,
                    eval51,
                    eval52,
                    eval53,
                    Number(row.nilai_ikpa),
                    Number(row.evaluasi_tw?.poin?.nilai_ro || 0),
                    Number(row.evaluasi_tw?.poin?.total_poin || 0),
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
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
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
            `Laporan_Nasional_SIRA_${jenisLaporan}_${namaBulan[bulan]}_${tahun}.xlsx`,
        );
    };

    const handleDownloadPdf = (satkerId) => {
        window.open(
            `/api/laporan/realisasi-satker/pdf?tahun=${tahun}&satker_id=${satkerId}`,
            "_blank",
        );
    };

    const handleExportPdfNasional = () => {
        window.open(
            `/api/laporan/bulanan/pdf?tahun=${tahun}&bulan=${bulan}`,
            "_blank",
        );
    };

    return (
        <MainLayout tahun={tahun}>
            <div className="space-y-6 font-sans text-slate-700 relative overflow-hidden min-h-screen pb-10">
                {/* --- AMBIENT BACKGROUND GLOW --- */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10"></div>
                <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

                {/* --- HEADER & FILTER SECTION (GLASSMORPHISM) --- */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white/70 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                    <div className="flex-1 min-w-[300px] relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] border border-indigo-400/30">
                                <CalendarSearch size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 tracking-tight leading-tight">
                                    Leaderboard Nasional
                                </h2>
                                <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
                                    Klasemen Poin SIRA (55 Pts) dan Pantauan
                                    Kinerja Seluruh Satuan Kerja.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={fetchLaporan}
                        className="w-full xl:w-auto flex flex-wrap gap-4 items-end relative z-10"
                    >
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                <Filter size={14} className="text-indigo-400" />{" "}
                                Jenis Laporan
                            </label>
                            <select
                                value={jenisLaporan}
                                onChange={(e) =>
                                    setJenisLaporan(e.target.value)
                                }
                                className="w-full bg-white/90 backdrop-blur border border-slate-200/80 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/20 cursor-pointer transition-all outline-none"
                            >
                                <option value="rpd_vs_realisasi">
                                    📊 Poin SIRA (IKPA + RO)
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
                                className="w-full bg-white/90 backdrop-blur border border-slate-200/80 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                        </div>

                        <div className="w-48">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Kumulatif s.d. Bulan
                            </label>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="w-full bg-white/90 backdrop-blur border border-slate-200/80 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/20 cursor-pointer transition-all outline-none"
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
                            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${loading ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 outline-none"}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />{" "}
                                    Mencari...
                                </>
                            ) : (
                                "Tampilkan"
                            )}
                        </button>
                    </form>
                </div>

                {errorMsg && (
                    <div className="p-5 bg-rose-50/90 backdrop-blur text-rose-700 border border-rose-200 rounded-[1.5rem] text-sm flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 relative z-10">
                        <div className="p-2 bg-rose-100 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <p className="font-bold">{errorMsg}</p>
                    </div>
                )}

                {/* --- TABEL LEADERBOARD PREMIUM --- */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10 mt-6">
                    {/* Panel Kendali Export */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 p-6 md:p-8 border-b border-slate-100/60 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 text-emerald-600 rounded-2xl">
                                <TrendingUp size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    Rekapitulasi s.d.{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                                        {namaBulan[bulan]} {tahun}
                                    </span>
                                </h3>
                                {twAktif && (
                                    <div className="inline-block mt-2 px-3 py-1 bg-blue-100/80 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-200">
                                        Posisi TW {twAktif}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 w-full md:w-auto bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                            <button
                                onClick={handleExportPdfNasional}
                                disabled={laporanData.length === 0 || loading}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 outline-none disabled:opacity-50"
                            >
                                <FileText size={16} /> PDF Nasional
                            </button>
                            <button
                                onClick={handleExportExcel}
                                disabled={laporanData.length === 0 || loading}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 outline-none disabled:opacity-50"
                            >
                                <FileSpreadsheet size={16} /> Excel
                            </button>
                        </div>
                    </div>

                    {/* STICKY DATA GRID */}
                    <div className="overflow-x-auto custom-scrollbar max-h-[700px] relative">
                        <table className="min-w-full divide-y divide-slate-200 text-[11px] border-collapse relative">
                            <thead className="bg-[#0A192F] text-slate-300 text-[10px] uppercase font-black tracking-widest text-center shadow-md sticky top-0 z-30">
                                {jenisLaporan === "murni_realisasi" ? (
                                    <tr>
                                        <th className="px-5 py-5 text-left border-r border-slate-700">
                                            Satuan Kerja
                                        </th>
                                        <th className="px-5 py-5 text-right border-r border-slate-700">
                                            Pagu Efektif
                                        </th>
                                        <th className="px-5 py-5 text-right border-r border-slate-700 bg-emerald-900/30">
                                            Realisasi 51
                                        </th>
                                        <th className="px-5 py-5 text-right border-r border-slate-700 bg-emerald-900/30">
                                            Realisasi 52
                                        </th>
                                        <th className="px-5 py-5 text-right border-r border-slate-700 bg-emerald-900/30">
                                            Realisasi 53
                                        </th>
                                        <th className="px-5 py-5 text-right bg-emerald-900/60 border-l border-slate-700 text-white">
                                            Total Realisasi
                                        </th>
                                        <th className="px-5 py-5 bg-emerald-900/60 border-x border-slate-700 text-white">
                                            % Serap
                                        </th>
                                        <th className="px-5 py-5">Aksi</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th
                                            className="px-5 py-5 text-left align-middle border-r border-slate-700 bg-slate-900 sticky left-0 z-40"
                                            rowSpan="2"
                                        >
                                            Satuan Kerja
                                        </th>
                                        <th
                                            className="px-5 py-5 text-right border-r border-slate-700 align-middle"
                                            rowSpan="2"
                                        >
                                            Pagu Efektif
                                        </th>
                                        <th
                                            className="px-5 py-5 text-right text-indigo-300 bg-indigo-900/50 align-middle border-r border-slate-700"
                                            rowSpan="2"
                                        >
                                            Total RPD
                                        </th>
                                        <th
                                            className="px-5 py-5 text-right text-emerald-300 bg-emerald-900/50 align-middle border-r border-slate-700"
                                            rowSpan="2"
                                        >
                                            Total Realisasi
                                        </th>
                                        <th
                                            className="px-5 py-5 text-right text-rose-300 bg-rose-900/50 border-r border-slate-700 align-middle leading-tight"
                                            rowSpan="2"
                                        >
                                            Selisih
                                            <br />
                                            Nominal
                                        </th>
                                        <th
                                            className="px-5 py-5 text-center align-middle border-r border-slate-700 bg-slate-800 leading-tight"
                                            rowSpan="2"
                                        >
                                            Deviasi
                                            <br />
                                            Tertimbang
                                        </th>

                                        {/* GABUNGAN HEADER KEMENKEU */}
                                        <th
                                            className="px-5 py-3 border-r border-slate-700 bg-blue-900/50"
                                            colSpan="3"
                                        >
                                            Status Penyerapan Nasional (TW{" "}
                                            {twAktif})
                                        </th>

                                        <th
                                            className="px-5 py-5 bg-slate-800 text-slate-300 border-r border-slate-700 align-middle leading-tight"
                                            rowSpan="2"
                                        >
                                            Nilai IKPA
                                            <div className="text-[8px] text-slate-400 mt-1 font-bold">
                                                Hal. III DIPA
                                            </div>
                                        </th>
                                        <th
                                            className="px-5 py-5 bg-purple-900/50 text-purple-300 border-r border-slate-700 align-middle leading-tight"
                                            rowSpan="2"
                                        >
                                            Capaian RO
                                            <div className="text-[8px] text-purple-400/50 mt-1 font-bold">
                                                Maks 100
                                            </div>
                                        </th>
                                        <th
                                            className="px-5 py-5 bg-yellow-500/20 text-yellow-400 border-r border-slate-700 align-middle leading-tight"
                                            rowSpan="2"
                                        >
                                            TOTAL POIN
                                            <div className="text-[8px] text-yellow-500/50 mt-1 font-bold">
                                                SIRA (Maks 55)
                                            </div>
                                        </th>
                                        <th
                                            className="px-5 py-5 align-middle"
                                            rowSpan="2"
                                        >
                                            Cetak
                                            <br />
                                            Rapor
                                        </th>
                                    </tr>
                                )}
                                {jenisLaporan !== "murni_realisasi" && (
                                    <tr className="bg-slate-800 text-[9px] uppercase tracking-widest text-blue-300">
                                        <th className="px-4 py-2 border-r border-slate-700 font-bold">
                                            Pegawai (51)
                                        </th>
                                        <th className="px-4 py-2 border-r border-slate-700 font-bold">
                                            Barang (52)
                                        </th>
                                        <th className="px-4 py-2 border-r border-slate-700 font-bold">
                                            Modal (53)
                                        </th>
                                    </tr>
                                )}
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="14"
                                            className="px-6 py-24 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4 shadow-md"></div>
                                            <p className="text-sm font-black text-slate-400 tracking-widest uppercase animate-pulse">
                                                Menyusun Leaderboard...
                                            </p>
                                        </td>
                                    </tr>
                                ) : laporanData.length > 0 ? (
                                    laporanData.map((row, index) => {
                                        // 🔥 STYLING MEDALI & GLOWING LEADERBOARD 🔥
                                        let medalStyle =
                                            "bg-slate-100 text-slate-500 border-slate-200";
                                        let iconMedal = (
                                            <span className="font-mono text-sm">
                                                {index + 1}
                                            </span>
                                        );
                                        let pointStyle = "text-rose-600";
                                        let rowGlow = "";

                                        if (index === 0) {
                                            medalStyle =
                                                "bg-gradient-to-br from-yellow-300 to-amber-500 text-white border-yellow-400 shadow-[0_0_15px_rgba(252,211,77,0.8)]";
                                            iconMedal = (
                                                <Crown
                                                    size={18}
                                                    strokeWidth={2.5}
                                                />
                                            );
                                            pointStyle =
                                                "text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 scale-110 drop-shadow-md";
                                            rowGlow =
                                                "bg-gradient-to-r from-yellow-50/50 to-transparent";
                                        } else if (index === 1) {
                                            medalStyle =
                                                "bg-gradient-to-br from-slate-300 to-slate-400 text-white border-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.6)]";
                                            iconMedal = (
                                                <Medal
                                                    size={18}
                                                    strokeWidth={2.5}
                                                />
                                            );
                                            pointStyle =
                                                "text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-700 scale-105";
                                            rowGlow = "bg-slate-50/50";
                                        } else if (index === 2) {
                                            medalStyle =
                                                "bg-gradient-to-br from-orange-300 to-amber-600 text-white border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]";
                                            iconMedal = (
                                                <Medal
                                                    size={18}
                                                    strokeWidth={2.5}
                                                />
                                            );
                                            pointStyle =
                                                "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-700 scale-105";
                                            rowGlow = "bg-orange-50/20";
                                        } else if (
                                            row.evaluasi_tw?.poin?.total_poin >=
                                            48
                                        ) {
                                            pointStyle = "text-emerald-600";
                                        } else if (
                                            row.evaluasi_tw?.poin?.total_poin >=
                                            35
                                        ) {
                                            pointStyle = "text-amber-500";
                                        }

                                        return (
                                            <tr
                                                key={row.satker.id}
                                                className={`hover:bg-indigo-50/60 transition-colors group whitespace-nowrap ${rowGlow}`}
                                            >
                                                <td className="px-5 py-4 flex items-center gap-4 border-r border-slate-100 bg-white sticky left-0 z-20 group-hover:bg-indigo-50/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                    <div
                                                        className={`w-10 h-10 flex items-center justify-center rounded-[1rem] font-black border ${medalStyle}`}
                                                    >
                                                        {iconMedal}
                                                    </div>
                                                    <div>
                                                        <div
                                                            className={`text-sm ${index <= 2 ? "font-black text-slate-900" : "font-bold text-slate-700"}`}
                                                        >
                                                            {
                                                                row.satker
                                                                    .nama_satker
                                                            }
                                                        </div>
                                                        <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-0.5">
                                                            {
                                                                row.satker
                                                                    .kode_satker
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right font-black text-slate-600 border-r border-slate-100 bg-slate-50/30 text-[13px]">
                                                    Rp{" "}
                                                    {formatRp(row.pagu_efektif)}
                                                </td>

                                                {jenisLaporan ===
                                                "murni_realisasi" ? (
                                                    <>
                                                        <td className="px-5 py-4 text-right font-bold text-slate-500 border-r border-slate-100">
                                                            {formatRp(
                                                                row.realisasi_gaji,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-right font-bold text-slate-500 border-r border-slate-100">
                                                            {formatRp(
                                                                row.realisasi_barang,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-right font-bold text-slate-500 border-r border-slate-100">
                                                            {formatRp(
                                                                row.realisasi_modal,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-right font-black text-emerald-700 bg-emerald-50/30 border-r border-slate-100 text-[13px]">
                                                            {formatRp(
                                                                row.total_realisasi,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-center bg-emerald-50/10 border-r border-slate-100">
                                                            <span
                                                                className={`px-3 py-1.5 inline-flex text-[11px] font-black rounded-lg border shadow-sm ${row.persentase_penyerapan >= 50 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}`}
                                                            >
                                                                {formatDecimal(
                                                                    row.persentase_penyerapan,
                                                                )}
                                                                %
                                                            </span>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-5 py-4 text-right font-bold text-indigo-700 bg-indigo-50/40 border-r border-slate-100">
                                                            {formatRp(
                                                                row.total_rpd,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-right font-bold text-emerald-700 bg-emerald-50/40 border-r border-slate-100">
                                                            {formatRp(
                                                                row.total_realisasi,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-right font-bold text-rose-600 bg-rose-50/40 border-r border-slate-100">
                                                            {formatRp(
                                                                row.total_deviasi,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-center font-bold text-slate-700 border-r border-slate-100 bg-slate-50/50">
                                                            {formatDecimal(
                                                                row.deviasi_tertimbang_kumulatif,
                                                            )}{" "}
                                                            %
                                                        </td>

                                                        {/* KOLOM KELULUSAN TARGET TW KEMENKEU */}
                                                        {["51", "52", "53"].map(
                                                            (kode) => {
                                                                const stat =
                                                                    row
                                                                        .evaluasi_tw[
                                                                        kode
                                                                    ].status;
                                                                return (
                                                                    <td
                                                                        key={
                                                                            kode
                                                                        }
                                                                        className="px-3 py-4 text-center border-r border-slate-100"
                                                                    >
                                                                        {stat ===
                                                                        "N/A" ? (
                                                                            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                                                                N/A
                                                                            </span>
                                                                        ) : stat ===
                                                                              "Lulus" ||
                                                                          stat ===
                                                                              "Tercapai" ? (
                                                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-md border border-emerald-200">
                                                                                LULUS
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-3 py-1 rounded-md border border-rose-200">
                                                                                GAGAL
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            },
                                                        )}

                                                        <td className="px-5 py-4 text-center bg-slate-50/80 border-r border-slate-100 font-black text-slate-700 text-sm">
                                                            {formatDecimal(
                                                                row.nilai_ikpa,
                                                            )}
                                                        </td>

                                                        {/* SUPER KOLOM: CAPAIAN OUTPUT RO */}
                                                        <td className="px-5 py-4 text-center bg-purple-50/30 border-r border-slate-100 font-black text-purple-700 text-sm">
                                                            {formatDecimal(
                                                                row.evaluasi_tw
                                                                    ?.poin
                                                                    ?.nilai_ro ||
                                                                    0,
                                                            )}
                                                        </td>

                                                        {/* SUPER KOLOM: TOTAL POIN SIRA */}
                                                        <td className="px-5 py-4 text-center bg-amber-50/20 border-r border-slate-100">
                                                            <span
                                                                className={`text-xl font-black ${pointStyle}`}
                                                            >
                                                                {formatDecimal(
                                                                    row
                                                                        .evaluasi_tw
                                                                        ?.poin
                                                                        ?.total_poin ||
                                                                        0,
                                                                )}
                                                            </span>
                                                        </td>
                                                    </>
                                                )}

                                                <td className="px-5 py-4 text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleDownloadPdf(
                                                                row.satker.id,
                                                            )
                                                        }
                                                        className="inline-flex items-center justify-center p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-300 border border-rose-100 hover:border-transparent outline-none group/btn shadow-sm"
                                                        title="Cetak Rapor Eksekutif Satker"
                                                    >
                                                        <DownloadCloud
                                                            size={18}
                                                            className="group-hover/btn:-translate-y-0.5 transition-transform"
                                                            strokeWidth={2.5}
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="14"
                                            className="px-6 py-24 text-center"
                                        >
                                            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                <AlertTriangle size={32} />
                                            </div>
                                            <p className="text-base font-black text-slate-500">
                                                Data Belum Tersedia
                                            </p>
                                            <p className="text-sm font-medium text-slate-400 mt-1">
                                                Belum ada aktivitas anggaran di
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
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scrollbar::-webkit-scrollbar { height: 10px; width: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #f8fafc; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </MainLayout>
    );
}
