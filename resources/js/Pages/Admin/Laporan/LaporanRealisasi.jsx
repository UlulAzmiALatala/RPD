import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import MainLayout from "../../../Layouts/MainLayout";
import {
    Building2,
    FileSpreadsheet,
    FileText,
    AlertTriangle,
    Award,
    TrendingUp,
    TrendingDown,
    Target,
    Filter,
} from "lucide-react";

export default function LaporanRealisasi() {
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [satkerId, setSatkerId] = useState("");
    const [satkers, setSatkers] = useState([]);

    // 🔥 FITUR BARU: PILIHAN JENIS LAPORAN DINAMIS
    const [jenisLaporan, setJenisLaporan] = useState("rpd_vs_realisasi");

    const [laporanData, setLaporanData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        axios
            .get(`/api/dashboard-data?tahun=${tahun}`)
            .then((response) => setSatkers(response.data.data.tabel_satker))
            .catch((error) => console.error("Gagal memuat list satker", error));
    }, [tahun]);

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
                    error.response?.data?.message || "Terjadi kesalahan.",
                ),
            )
            .finally(() => setLoading(false));
    };

    const formatRp = (angka) => {
        if (typeof angka !== "number") return angka;
        return new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: 0,
        }).format(angka);
    };

    const formatNumber = (value) => {
        if (typeof value === "number") return value.toFixed(2);
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

    const summary = useMemo(() => {
        if (!laporanData) return null;

        let totRencana = 0;
        let totRealisasi = 0;
        let totDeviasi = 0;
        let finalIkpa = "-";

        laporanData.laporan_bulanan.forEach((row) => {
            totRencana +=
                (row.rencana.b51 || 0) +
                (row.rencana.b52 || 0) +
                (row.rencana.b53 || 0);
            totRealisasi +=
                (row.realisasi.b51 || 0) +
                (row.realisasi.b52 || 0) +
                (row.realisasi.b53 || 0);
            totDeviasi +=
                (row.deviasi.b51 || 0) +
                (row.deviasi.b52 || 0) +
                (row.deviasi.b53 || 0);
        });

        for (let i = 11; i >= 0; i--) {
            if (typeof laporanData.laporan_bulanan[i]?.ikpa === "number") {
                finalIkpa = laporanData.laporan_bulanan[i].ikpa;
                break;
            }
        }

        return { totRencana, totRealisasi, totDeviasi, finalIkpa };
    }, [laporanData]);

    // =========================================================================
    // FITUR EXPORT EXCEL DINAMIS
    // =========================================================================
    const handleExportExcel = () => {
        if (!laporanData) return;

        let aoa = [];
        if (jenisLaporan === "murni_realisasi") {
            aoa = [
                ["TABEL REALISASI ANGGARAN"],
                [
                    `Satuan Kerja: ${laporanData.satker.nama_satker} (${laporanData.satker.kode_satker})`,
                ],
                [
                    `Tahun Anggaran: ${tahun}`,
                    `Total Pagu: Rp ${formatRp(laporanData.pagu_total)}`,
                ],
                [],
                [
                    "Bulan",
                    "Realisasi Gaji (51)",
                    "Realisasi Barang (52)",
                    "Realisasi Modal (53)",
                    "Total Realisasi",
                    "Serapan Total (%)",
                ],
            ];

            laporanData.laporan_bulanan.forEach((row) => {
                const totRealBulan =
                    (row.realisasi.b51 || 0) +
                    (row.realisasi.b52 || 0) +
                    (row.realisasi.b53 || 0);
                const persenSerap =
                    laporanData.pagu_total > 0
                        ? totRealBulan / laporanData.pagu_total
                        : 0;

                aoa.push([
                    namaBulan[row.bulan],
                    row.realisasi.b51,
                    row.realisasi.b52,
                    row.realisasi.b53,
                    totRealBulan,
                    persenSerap,
                ]);
            });
        } else {
            aoa = [
                ["LAPORAN RINCIAN REALISASI DAN IKPA"],
                [
                    `Satuan Kerja: ${laporanData.satker.nama_satker} (${laporanData.satker.kode_satker})`,
                ],
                [
                    `Tahun Anggaran: ${tahun}`,
                    `Total Pagu: Rp ${formatRp(laporanData.pagu_total)}`,
                ],
                [],
                [
                    "Bulan",
                    "Rencana 51",
                    "Rencana 52",
                    "Rencana 53",
                    "Realisasi 51",
                    "% Dev 51",
                    "Realisasi 52",
                    "% Dev 52",
                    "Realisasi 53",
                    "% Dev 53",
                    "Deviasi Nom 51",
                    "Deviasi Nom 52",
                    "Deviasi Nom 53",
                    "% Proporsi Pagu",
                    "Deviasi Tertimbang",
                    "Rata-rata Kumulatif",
                    "Nilai IKPA",
                ],
            ];

            laporanData.laporan_bulanan.forEach((row) => {
                const totalRpdBulanIni =
                    (row.rencana.b51 || 0) +
                    (row.rencana.b52 || 0) +
                    (row.rencana.b53 || 0);
                const proporsiPagu =
                    laporanData.pagu_total > 0 && totalRpdBulanIni > 0
                        ? totalRpdBulanIni / laporanData.pagu_total
                        : 0;

                aoa.push([
                    namaBulan[row.bulan],
                    row.rencana.b51,
                    row.rencana.b52,
                    row.rencana.b53,
                    row.realisasi.b51,
                    typeof row.persen_deviasi.b51 === "number"
                        ? row.persen_deviasi.b51 / 100
                        : row.persen_deviasi.b51,
                    row.realisasi.b52,
                    typeof row.persen_deviasi.b52 === "number"
                        ? row.persen_deviasi.b52 / 100
                        : row.persen_deviasi.b52,
                    row.realisasi.b53,
                    typeof row.persen_deviasi.b53 === "number"
                        ? row.persen_deviasi.b53 / 100
                        : row.persen_deviasi.b53,
                    row.deviasi.b51,
                    row.deviasi.b52,
                    row.deviasi.b53,
                    proporsiPagu,
                    typeof row.persen_seluruh === "number"
                        ? row.persen_seluruh / 100
                        : row.persen_seluruh,
                    typeof row.rata_kumulatif === "number"
                        ? row.rata_kumulatif / 100
                        : row.rata_kumulatif,
                    row.ikpa,
                ]);
            });
        }

        const worksheet = XLSX.utils.aoa_to_sheet(aoa);

        // Formatting Percentage for Excel
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let R = 5; R <= range.e.r; ++R) {
            if (jenisLaporan === "murni_realisasi") {
                const cell_ref = XLSX.utils.encode_cell({ c: 5, r: R });
                if (
                    worksheet[cell_ref] &&
                    typeof worksheet[cell_ref].v === "number"
                ) {
                    worksheet[cell_ref].z = "0.00%";
                }
            } else {
                [5, 7, 9, 13, 14, 15].forEach((C) => {
                    const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
                    if (
                        worksheet[cell_ref] &&
                        typeof worksheet[cell_ref].v === "number"
                    ) {
                        worksheet[cell_ref].z = "0.00%";
                    }
                });
            }
        }

        // Adjust column width
        const wscols =
            jenisLaporan === "murni_realisasi"
                ? [
                      { wch: 15 },
                      { wch: 20 },
                      { wch: 20 },
                      { wch: 20 },
                      { wch: 20 },
                      { wch: 15 },
                  ]
                : Array(17).fill({ wch: 14 });
        wscols[0] = { wch: 12 };
        worksheet["!cols"] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            `IKPA_${laporanData.satker.kode_satker}`,
        );
        XLSX.writeFile(
            workbook,
            `Detail_${jenisLaporan}_${laporanData.satker.kode_satker}_${tahun}.xlsx`,
        );
    };

    // =========================================================================
    // 🔥 FITUR EXPORT PDF MENGGUNAKAN BLADE (KEMENKEU STYLE)
    // =========================================================================
    const handleExportPdf = () => {
        if (!satkerId) return;
        // Kita buang jsPDF dan panggil API Backend seperti LaporanBulanan
        window.open(
            `/api/laporan/realisasi-satker/pdf?tahun=${tahun}&satker_id=${satkerId}`,
            "_blank",
        );
    };

    return (
        <MainLayout tahun={tahun}>
            <div className="space-y-6 font-sans text-slate-600 relative overflow-hidden pb-10">
                {/* --- HEADER & FILTER SECTION (FUTURISTIK) --- */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40">
                    <div className="flex-1 min-w-[300px]">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                <Building2 size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                                Rapor Kinerja Satker
                            </h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 ml-[76px]">
                            Analisis mendalam Indikator Kinerja Pelaksanaan
                            Anggaran (Halaman III DIPA).
                        </p>
                    </div>

                    <form
                        onSubmit={fetchLaporan}
                        className="w-full xl:w-auto flex flex-wrap gap-4 items-end"
                    >
                        {/* PILIH JENIS LAPORAN DINAMIS */}
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
                        <div className="flex-1 min-w-[240px]">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Satuan Kerja
                            </label>
                            <select
                                value={satkerId}
                                onChange={(e) => setSatkerId(e.target.value)}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/20 cursor-pointer transition-all"
                            >
                                <option value="">-- Pilih Satker --</option>
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
                            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black transition-all duration-300 shadow-lg ${loading ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-indigo-500/30 hover:-translate-y-0.5"}`}
                        >
                            {loading ? "Menyinkronkan..." : "Tampilkan Data"}
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

                {/* --- SUMMARY CARDS (FUTURISTIK) --- */}
                {laporanData && summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-[fadeIn_0.5s_ease-out]">
                        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-5 hover:shadow-lg transition-shadow">
                            <div
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${typeof summary.finalIkpa !== "number" ? "bg-slate-50 text-slate-500" : summary.finalIkpa >= 95 ? "bg-emerald-50 text-emerald-500" : summary.finalIkpa >= 85 ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"}`}
                            >
                                <Award size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Nilai IKPA Akhir
                                </p>
                                <h3
                                    className={`text-3xl font-black mt-1 ${typeof summary.finalIkpa !== "number" ? "text-slate-500" : summary.finalIkpa >= 95 ? "text-emerald-600" : summary.finalIkpa >= 85 ? "text-amber-500" : "text-rose-600"}`}
                                >
                                    {formatNumber(summary.finalIkpa)}
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-5 hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-inner">
                                <Target size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Total RPD
                                </p>
                                <h3 className="text-xl font-black text-slate-800 mt-1">
                                    {formatRp(summary.totRencana)}
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-5 hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                                <TrendingUp size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Total Realisasi
                                </p>
                                <h3 className="text-xl font-black text-slate-800 mt-1">
                                    {formatRp(summary.totRealisasi)}
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-5 hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner">
                                <TrendingDown size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Total Deviasi
                                </p>
                                <h3 className="text-xl font-black text-rose-600 mt-1">
                                    {formatRp(summary.totDeviasi)}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TABEL DETAIL --- */}
                {laporanData && (
                    <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden animate-[fadeIn_0.5s_ease-out]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 md:px-8 border-b border-slate-100 bg-slate-50/30">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">
                                    {jenisLaporan === "murni_realisasi"
                                        ? "Rincian Murni Realisasi"
                                        : "Rincian RPD vs Realisasi (IKPA)"}
                                </h3>
                                <p className="text-xs font-bold text-slate-500 mt-1.5">
                                    Satker:{" "}
                                    <span className="text-indigo-600">
                                        {laporanData.satker.nama_satker}
                                    </span>{" "}
                                    <span className="mx-2 text-slate-300">
                                        |
                                    </span>{" "}
                                    Pagu:{" "}
                                    <span className="text-emerald-600">
                                        Rp {formatRp(laporanData.pagu_total)}
                                    </span>
                                </p>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={handleExportPdf}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-gradient-to-r hover:from-rose-500 hover:to-red-500 hover:text-white border border-rose-200 hover:border-transparent rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-rose-200 group"
                                >
                                    <FileText
                                        size={16}
                                        className="group-hover:-translate-y-0.5 transition-transform"
                                    />{" "}
                                    Unduh PDF
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 hover:border-emerald-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-emerald-200 group"
                                >
                                    <FileSpreadsheet
                                        size={16}
                                        className="group-hover:scale-110 transition-transform"
                                    />{" "}
                                    Excel
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar pb-4">
                            <table className="min-w-full divide-y divide-slate-200 text-xs">
                                {jenisLaporan === "murni_realisasi" ? (
                                    <>
                                        <thead className="bg-[#0A192F] text-white text-center font-semibold shadow-md">
                                            <tr>
                                                <th className="px-5 py-5 border-r border-slate-600 align-middle w-24">
                                                    Bulan
                                                </th>
                                                <th className="px-5 py-5 border-r border-slate-600 bg-emerald-900/50">
                                                    Gaji (51)
                                                </th>
                                                <th className="px-5 py-5 border-r border-slate-600 bg-emerald-900/50">
                                                    Barang (52)
                                                </th>
                                                <th className="px-5 py-5 border-r border-slate-600 bg-emerald-900/50">
                                                    Modal (53)
                                                </th>
                                                <th className="px-5 py-5 bg-indigo-900/50 font-black text-indigo-200">
                                                    TOTAL REALISASI
                                                </th>
                                                <th className="px-5 py-5 bg-emerald-900/40 border-l border-slate-700">
                                                    % Serap
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100/80 text-slate-700">
                                            {laporanData.laporan_bulanan.map(
                                                (row) => {
                                                    const totRealBulan =
                                                        (row.realisasi.b51 ||
                                                            0) +
                                                        (row.realisasi.b52 ||
                                                            0) +
                                                        (row.realisasi.b53 ||
                                                            0);
                                                    const persenSerap =
                                                        laporanData.pagu_total >
                                                        0
                                                            ? (totRealBulan /
                                                                  laporanData.pagu_total) *
                                                              100
                                                            : 0;
                                                    return (
                                                        <tr
                                                            key={row.bulan}
                                                            className="hover:bg-indigo-50/40 text-right transition-colors font-mono group"
                                                        >
                                                            <td className="px-5 py-4 border-r border-slate-100 text-center font-sans font-bold text-slate-900 bg-slate-50/50">
                                                                {namaBulan[
                                                                    row.bulan
                                                                ]
                                                                    .substring(
                                                                        0,
                                                                        3,
                                                                    )
                                                                    .toUpperCase()}
                                                            </td>
                                                            <td className="px-5 py-4 border-r border-slate-100 font-medium text-emerald-700">
                                                                {formatRp(
                                                                    row
                                                                        .realisasi
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 border-r border-slate-100 font-medium text-emerald-700">
                                                                {formatRp(
                                                                    row
                                                                        .realisasi
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 border-r border-slate-100 font-medium text-emerald-700">
                                                                {formatRp(
                                                                    row
                                                                        .realisasi
                                                                        .b53,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 font-black text-indigo-700 bg-indigo-50/30">
                                                                {formatRp(
                                                                    totRealBulan,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 text-center bg-emerald-50/10 border-l border-slate-100">
                                                                <span
                                                                    className={`px-3 py-1 inline-flex text-xs font-black rounded-lg border shadow-sm ${persenSerap >= 50 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}`}
                                                                >
                                                                    {formatNumber(
                                                                        persenSerap,
                                                                    )}
                                                                    %
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </>
                                ) : (
                                    <>
                                        <thead className="bg-[#0A192F] text-white text-center font-semibold shadow-md">
                                            <tr>
                                                <th
                                                    rowSpan="2"
                                                    className="px-3 py-3 border-r border-slate-600 align-middle w-24"
                                                >
                                                    Bulan
                                                </th>
                                                <th
                                                    colSpan="3"
                                                    className="px-2 py-2 border-r border-slate-600 bg-blue-900/50"
                                                >
                                                    Rencana Penarikan
                                                </th>
                                                <th
                                                    colSpan="6"
                                                    className="px-2 py-2 border-r border-slate-600 bg-emerald-900/70"
                                                >
                                                    Penyerapan & % Deviasi
                                                </th>
                                                <th
                                                    colSpan="3"
                                                    className="px-2 py-2 border-r border-slate-600 bg-rose-900/50"
                                                >
                                                    Deviasi Nominal (Rp)
                                                </th>
                                                <th
                                                    rowSpan="2"
                                                    className="px-2 py-3 border-r border-slate-600 bg-amber-900/50 align-middle"
                                                >
                                                    % Proporsi
                                                    <br />
                                                    Pagu
                                                </th>
                                                <th
                                                    rowSpan="2"
                                                    className="px-2 py-3 border-r border-slate-600 bg-indigo-900/50 align-middle"
                                                >
                                                    Deviasi
                                                    <br />
                                                    Tertimbang
                                                </th>
                                                <th
                                                    rowSpan="2"
                                                    className="px-2 py-3 border-r border-slate-600 bg-indigo-900/50 align-middle"
                                                >
                                                    Rata-rata
                                                    <br />
                                                    Kumulatif
                                                </th>
                                                <th
                                                    rowSpan="2"
                                                    className="px-2 py-3 bg-purple-900/50 align-middle font-black tracking-widest text-yellow-300 w-24"
                                                >
                                                    NILAI IKPA
                                                </th>
                                            </tr>
                                            <tr className="bg-slate-800 text-slate-300 text-[10px] tracking-wider">
                                                <th className="px-3 py-2 border-r border-slate-600">
                                                    51
                                                </th>
                                                <th className="px-3 py-2 border-r border-slate-600">
                                                    52
                                                </th>
                                                <th className="px-3 py-2 border-r border-slate-600">
                                                    53
                                                </th>
                                                <th className="px-3 py-2 border-r border-slate-600">
                                                    51
                                                </th>
                                                <th className="px-3 py-2 border-r border-slate-600 text-amber-300">
                                                    % Dev
                                                </th>
                                                <th className="px-3 py-2 border-r border-slate-600">
                                                    52
                                                </th>
                                                <th className="px-3 py-2 border-r border-slate-600 text-amber-300">
                                                    % Dev
                                                </th>
                                                <th className="px-3 py-2 border-r border-slate-600">
                                                    53
                                                </th>
                                                <th className="px-3 py-2 border-r border-slate-600 text-amber-300">
                                                    % Dev
                                                </th>
                                                <th className="px-3 py-2 border-r border-slate-600">
                                                    51
                                                </th>
                                                <th className="px-3 py-2 border-r border-slate-600">
                                                    52
                                                </th>
                                                <th className="px-3 py-2 border-r border-slate-600">
                                                    53
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100/80 text-slate-700">
                                            {laporanData.laporan_bulanan.map(
                                                (row) => {
                                                    let ikpaColor =
                                                        "bg-slate-100 text-slate-600 border-slate-200";
                                                    if (
                                                        typeof row.ikpa ===
                                                        "number"
                                                    ) {
                                                        if (row.ikpa >= 95)
                                                            ikpaColor =
                                                                "bg-emerald-100 text-emerald-700 border-emerald-200";
                                                        else if (row.ikpa >= 85)
                                                            ikpaColor =
                                                                "bg-amber-100 text-amber-700 border-amber-200";
                                                        else
                                                            ikpaColor =
                                                                "bg-rose-100 text-rose-700 border-rose-200";
                                                    }

                                                    const totalRpdBulanIni =
                                                        (row.rencana.b51 || 0) +
                                                        (row.rencana.b52 || 0) +
                                                        (row.rencana.b53 || 0);
                                                    const proporsiPagu =
                                                        laporanData.pagu_total >
                                                            0 &&
                                                        totalRpdBulanIni > 0
                                                            ? formatNumber(
                                                                  (totalRpdBulanIni /
                                                                      laporanData.pagu_total) *
                                                                      100,
                                                              )
                                                            : "-";

                                                    return (
                                                        <tr
                                                            key={row.bulan}
                                                            className="hover:bg-indigo-50/40 text-right transition-colors font-mono group"
                                                        >
                                                            <td className="px-3 py-3 border-r border-slate-100 text-center font-sans font-bold text-slate-900 bg-slate-50/50">
                                                                {namaBulan[
                                                                    row.bulan
                                                                ]
                                                                    .substring(
                                                                        0,
                                                                        3,
                                                                    )
                                                                    .toUpperCase()}
                                                            </td>

                                                            {/* Rencana */}
                                                            <td className="px-3 py-3 border-r border-slate-100 text-slate-500">
                                                                {formatRp(
                                                                    row.rencana
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 border-r border-slate-100 text-slate-500">
                                                                {formatRp(
                                                                    row.rencana
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 border-r border-slate-100 text-slate-500">
                                                                {formatRp(
                                                                    row.rencana
                                                                        .b53,
                                                                )}
                                                            </td>

                                                            {/* Penyerapan 51 & % Dev */}
                                                            <td className="px-3 py-3 border-r border-slate-100 font-medium text-emerald-700 bg-emerald-50/20">
                                                                {formatRp(
                                                                    row
                                                                        .realisasi
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 border-r border-slate-100 text-amber-600 bg-amber-50/20">
                                                                {formatNumber(
                                                                    row
                                                                        .persen_deviasi
                                                                        .b51,
                                                                )}
                                                            </td>

                                                            {/* Penyerapan 52 & % Dev */}
                                                            <td className="px-3 py-3 border-r border-slate-100 font-medium text-emerald-700 bg-emerald-50/20">
                                                                {formatRp(
                                                                    row
                                                                        .realisasi
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 border-r border-slate-100 text-amber-600 bg-amber-50/20">
                                                                {formatNumber(
                                                                    row
                                                                        .persen_deviasi
                                                                        .b52,
                                                                )}
                                                            </td>

                                                            {/* Penyerapan 53 & % Dev */}
                                                            <td className="px-3 py-3 border-r border-slate-100 font-medium text-emerald-700 bg-emerald-50/20">
                                                                {formatRp(
                                                                    row
                                                                        .realisasi
                                                                        .b53,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 border-r border-slate-100 text-amber-600 bg-amber-50/20">
                                                                {formatNumber(
                                                                    row
                                                                        .persen_deviasi
                                                                        .b53,
                                                                )}
                                                            </td>

                                                            {/* Deviasi Nominal */}
                                                            <td className="px-3 py-3 border-r border-slate-100 text-rose-600 bg-rose-50/20">
                                                                {formatRp(
                                                                    row.deviasi
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 border-r border-slate-100 text-rose-600 bg-rose-50/20">
                                                                {formatRp(
                                                                    row.deviasi
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 border-r border-slate-100 text-rose-600 bg-rose-50/20">
                                                                {formatRp(
                                                                    row.deviasi
                                                                        .b53,
                                                                )}
                                                            </td>

                                                            {/* Proporsi Pagu */}
                                                            <td className="px-3 py-3 border-r border-slate-100 font-bold text-amber-700 bg-amber-50/30">
                                                                {proporsiPagu}
                                                            </td>

                                                            {/* Deviasi Tertimbang */}
                                                            <td className="px-3 py-3 border-r border-slate-100 font-bold text-indigo-700 bg-indigo-50/20">
                                                                {formatNumber(
                                                                    row.persen_seluruh,
                                                                )}
                                                            </td>

                                                            {/* Rata-rata Kumulatif */}
                                                            <td className="px-3 py-3 border-r border-slate-100 font-bold text-indigo-700 bg-indigo-50/20">
                                                                {formatNumber(
                                                                    row.rata_kumulatif,
                                                                )}
                                                            </td>

                                                            {/* IKPA */}
                                                            <td className="px-3 py-3 text-center align-middle bg-purple-50/30">
                                                                <span
                                                                    className={`px-2.5 py-1.5 inline-flex text-sm font-black rounded-lg border shadow-sm ${ikpaColor} font-sans`}
                                                                >
                                                                    {formatNumber(
                                                                        row.ikpa,
                                                                    )}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </>
                                )}
                            </table>
                        </div>
                    </div>
                )}
                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                    .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                `}</style>
            </div>
        </MainLayout>
    );
}
