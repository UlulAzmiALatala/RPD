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
    CalendarRange,
    CheckCircle2,
    XCircle,
    Star,
} from "lucide-react";

export default function LaporanRealisasi() {
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [satkerId, setSatkerId] = useState("");
    const [satkers, setSatkers] = useState([]);

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

        // Ambil Poin SIRA dari Triwulan Terakhir yang dievaluasi
        let totalPoinSira = "-";
        if (laporanData.evaluasi_tw) {
            totalPoinSira = laporanData.evaluasi_tw["IV"].poin.total_poin;
        }

        return {
            totRencana,
            totRealisasi,
            totDeviasi,
            finalIkpa,
            totalPoinSira,
        };
    }, [laporanData]);

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
                        ? (totRealBulan / laporanData.pagu_total) * 100
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
                    "Penyerapan 51",
                    "% Dev 51",
                    "Penyerapan 52",
                    "% Dev 52",
                    "Penyerapan 53",
                    "% Dev 53",
                    "Deviasi Nom 51",
                    "Deviasi Nom 52",
                    "Deviasi Nom 53",
                    "% Proporsi 51",
                    "% Proporsi 52",
                    "% Proporsi 53",
                    "% Dev Tertimbang 51",
                    "% Dev Tertimbang 52",
                    "% Dev Tertimbang 53",
                    "% Total Deviasi",
                    "Rata-rata Kumulatif",
                    "Nilai IKPA (Hal III)",
                ],
            ];

            laporanData.laporan_bulanan.forEach((row) => {
                aoa.push([
                    namaBulan[row.bulan],
                    row.rencana.b51,
                    row.rencana.b52,
                    row.rencana.b53,
                    row.realisasi.b51,
                    row.persen_deviasi.b51,
                    row.realisasi.b52,
                    row.persen_deviasi.b52,
                    row.realisasi.b53,
                    row.persen_deviasi.b53,
                    row.deviasi.b51,
                    row.deviasi.b52,
                    row.deviasi.b53,
                    row.proporsi_pagu.b51,
                    row.proporsi_pagu.b52,
                    row.proporsi_pagu.b53,
                    row.deviasi_tertimbang.b51,
                    row.deviasi_tertimbang.b52,
                    row.deviasi_tertimbang.b53,
                    row.persen_seluruh,
                    row.rata_kumulatif,
                    row.ikpa,
                ]);
            });

            // 🔥 APPEND EVALUASI TW & POIN KE EXCEL 🔥
            if (laporanData.evaluasi_tw) {
                aoa.push([]);
                aoa.push([]);
                aoa.push([
                    "EVALUASI TARGET PENYERAPAN KEMENKEU & POIN SIRA (PER TRIWULAN)",
                ]);
                aoa.push([
                    "Triwulan",
                    "Jenis Belanja",
                    "Realisasi Kumulatif (Rp)",
                    "Target Minimal (%)",
                    "Aktual Penyerapan (%)",
                    "Status",
                    "",
                    "Nilai Penyerapan (Maks 100)",
                    "Poin Penyerapan (Bobot 20%)",
                    "Nilai IKPA Hal III (Maks 100)",
                    "Poin Hal III (Bobot 10%)",
                    "TOTAL POIN SIRA (Maks 30)",
                ]);

                ["I", "II", "III", "IV"].forEach((tw) => {
                    const poin = laporanData.evaluasi_tw[tw].poin;
                    let firstRow = true;

                    ["51", "52", "53"].forEach((kode) => {
                        const item = laporanData.evaluasi_tw[tw][kode];
                        const namaBelanja =
                            kode === "51"
                                ? "Belanja Pegawai (51)"
                                : kode === "52"
                                  ? "Belanja Barang (52)"
                                  : "Belanja Modal (53)";

                        let rowData = [
                            `TW ${tw}`,
                            namaBelanja,
                            item.status === "N/A" ? "-" : item.nominal,
                            item.status === "N/A" ? "-" : item.target_persen,
                            item.status === "N/A" ? "-" : item.realisasi_persen,
                            item.status === "N/A"
                                ? "TIDAK ADA PAGU"
                                : item.status,
                            "", // Spacer
                        ];

                        if (firstRow) {
                            rowData.push(
                                poin.nilai_penyerapan,
                                poin.tertimbang_penyerapan,
                                poin.ikpa_hal_iii,
                                poin.tertimbang_hal_iii,
                                poin.total_poin,
                            );
                            firstRow = false;
                        }

                        aoa.push(rowData);
                    });
                });
            }
        }

        const worksheet = XLSX.utils.aoa_to_sheet(aoa);
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

    const handleExportPdf = () => {
        if (!satkerId) return;
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
                                <Building2 size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                                Rapor Kinerja Satker
                            </h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 ml-[76px]">
                            Analisis mendalam Indikator Kinerja Pelaksanaan
                            Anggaran (Halaman III DIPA & Penyerapan).
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

                {/* --- SUMMARY CARDS --- */}
                {laporanData && summary && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-[fadeIn_0.5s_ease-out]">
                        {/* 🔥 SUPER CARD: TOTAL POIN SIRA 🔥 */}
                        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-[2rem] shadow-xl flex items-center gap-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Star size={100} />
                            </div>
                            <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-500/20 text-yellow-400 flex items-center justify-center border border-indigo-500/30 backdrop-blur-sm z-10">
                                <Star size={40} className="drop-shadow-lg" />
                            </div>
                            <div className="z-10">
                                <p className="text-xs font-black text-indigo-200 uppercase tracking-widest">
                                    Total Poin SIRA Satker
                                </p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-5xl font-black text-white drop-shadow-md">
                                        {formatDecimal(summary.totalPoinSira)}
                                    </h3>
                                    <span className="text-lg font-bold text-indigo-300">
                                        / 30 Pts
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-5 hover:shadow-lg transition-shadow">
                            <div
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${typeof summary.finalIkpa !== "number" ? "bg-slate-50 text-slate-500" : summary.finalIkpa >= 95 ? "bg-emerald-50 text-emerald-500" : summary.finalIkpa >= 85 ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"}`}
                            >
                                <Award size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Nilai Hal. III DIPA
                                </p>
                                <h3
                                    className={`text-3xl font-black mt-1 ${typeof summary.finalIkpa !== "number" ? "text-slate-500" : summary.finalIkpa >= 95 ? "text-emerald-600" : summary.finalIkpa >= 85 ? "text-amber-500" : "text-rose-600"}`}
                                >
                                    {formatDecimal(summary.finalIkpa)}
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
                                        : "Detail Indikator Halaman 3 DIPA (IKPA)"}
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
                            <table className="min-w-full divide-y divide-slate-200 text-[10px]">
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
                                                                    {formatDecimal(
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
                                        {/* 🔥 SUPER TABEL IKPA KEMENKEU (% DEVIASI BERGANDENGAN DENGAN PENYERAPAN) 🔥 */}
                                        <thead className="bg-[#0A192F] text-white text-center font-semibold shadow-md">
                                            <tr>
                                                <th
                                                    rowSpan="2"
                                                    className="px-2 py-2 border-r border-slate-600 align-middle w-12"
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
                                                    className="px-2 py-2 border-r border-slate-600 bg-emerald-900/50"
                                                >
                                                    Penyerapan
                                                </th>
                                                <th
                                                    colSpan="3"
                                                    className="px-2 py-2 border-r border-slate-600 bg-rose-900/50"
                                                >
                                                    Deviasi Nominal
                                                </th>
                                                <th
                                                    colSpan="3"
                                                    className="px-2 py-2 border-r border-slate-600 bg-amber-900/50"
                                                >
                                                    % Proporsi Pagu
                                                </th>
                                                <th
                                                    colSpan="3"
                                                    className="px-2 py-2 border-r border-slate-600 bg-indigo-900/50"
                                                >
                                                    % Deviasi Tertimbang
                                                </th>
                                                <th
                                                    rowSpan="2"
                                                    className="px-2 py-2 border-r border-slate-600 align-middle bg-slate-800"
                                                >
                                                    % Deviasi
                                                    <br />
                                                    Seluruh
                                                </th>
                                                <th
                                                    rowSpan="2"
                                                    className="px-2 py-2 border-r border-slate-600 align-middle bg-slate-800"
                                                >
                                                    % Rata-Rata
                                                    <br />
                                                    Kumulatif
                                                </th>
                                                <th
                                                    rowSpan="2"
                                                    className="px-2 py-2 align-middle text-yellow-300 font-black tracking-widest bg-slate-900"
                                                >
                                                    NILAI
                                                    <br />
                                                    IKPA
                                                </th>
                                            </tr>
                                            <tr className="bg-slate-800 text-slate-300 text-[9px] tracking-wider uppercase">
                                                {/* Rencana */}
                                                <th className="px-2 py-1.5 border-r border-slate-600">
                                                    51
                                                </th>
                                                <th className="px-2 py-1.5 border-r border-slate-600">
                                                    52
                                                </th>
                                                <th className="px-2 py-1.5 border-r border-slate-600">
                                                    53
                                                </th>

                                                {/* Penyerapan & % Deviasi Bergandengan */}
                                                <th className="px-2 py-1.5 border-slate-600">
                                                    51
                                                </th>
                                                <th className="px-2 py-1.5 border-r border-slate-600 text-amber-300">
                                                    % Dev
                                                </th>
                                                <th className="px-2 py-1.5 border-slate-600">
                                                    52
                                                </th>
                                                <th className="px-2 py-1.5 border-r border-slate-600 text-amber-300">
                                                    % Dev
                                                </th>
                                                <th className="px-2 py-1.5 border-slate-600">
                                                    53
                                                </th>
                                                <th className="px-2 py-1.5 border-r border-slate-600 text-amber-300">
                                                    % Dev
                                                </th>

                                                {/* Deviasi Nominal */}
                                                <th className="px-2 py-1.5 border-r border-slate-600">
                                                    51
                                                </th>
                                                <th className="px-2 py-1.5 border-r border-slate-600">
                                                    52
                                                </th>
                                                <th className="px-2 py-1.5 border-r border-slate-600">
                                                    53
                                                </th>

                                                {/* % Proporsi Pagu */}
                                                <th className="px-2 py-1.5 border-r border-slate-600">
                                                    51
                                                </th>
                                                <th className="px-2 py-1.5 border-r border-slate-600">
                                                    52
                                                </th>
                                                <th className="px-2 py-1.5 border-r border-slate-600">
                                                    53
                                                </th>

                                                {/* % Dev Tertimbang */}
                                                <th className="px-2 py-1.5 border-r border-slate-600">
                                                    51
                                                </th>
                                                <th className="px-2 py-1.5 border-r border-slate-600">
                                                    52
                                                </th>
                                                <th className="px-2 py-1.5 border-r border-slate-600">
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

                                                    return (
                                                        <tr
                                                            key={row.bulan}
                                                            className="hover:bg-indigo-50/40 text-right transition-colors font-mono group whitespace-nowrap"
                                                        >
                                                            <td className="px-2 py-2.5 border-r border-slate-100 text-center font-sans font-bold text-slate-900 bg-slate-50/50">
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
                                                            <td className="px-2 py-2.5 border-r border-slate-100 text-slate-500">
                                                                {formatRp(
                                                                    row.rencana
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 text-slate-500">
                                                                {formatRp(
                                                                    row.rencana
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 text-slate-500">
                                                                {formatRp(
                                                                    row.rencana
                                                                        .b53,
                                                                )}
                                                            </td>

                                                            {/* Penyerapan 51 & % Dev 51 */}
                                                            <td className="px-2 py-2.5 text-emerald-600 bg-emerald-50/20">
                                                                {formatRp(
                                                                    row
                                                                        .realisasi
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 font-bold text-amber-600 bg-amber-50/10">
                                                                {formatDecimal(
                                                                    row
                                                                        .persen_deviasi
                                                                        .b51,
                                                                )}
                                                            </td>

                                                            {/* Penyerapan 52 & % Dev 52 */}
                                                            <td className="px-2 py-2.5 text-emerald-600 bg-emerald-50/20">
                                                                {formatRp(
                                                                    row
                                                                        .realisasi
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 font-bold text-amber-600 bg-amber-50/10">
                                                                {formatDecimal(
                                                                    row
                                                                        .persen_deviasi
                                                                        .b52,
                                                                )}
                                                            </td>

                                                            {/* Penyerapan 53 & % Dev 53 */}
                                                            <td className="px-2 py-2.5 text-emerald-600 bg-emerald-50/20">
                                                                {formatRp(
                                                                    row
                                                                        .realisasi
                                                                        .b53,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 font-bold text-amber-600 bg-amber-50/10">
                                                                {formatDecimal(
                                                                    row
                                                                        .persen_deviasi
                                                                        .b53,
                                                                )}
                                                            </td>

                                                            {/* Deviasi Nominal */}
                                                            <td className="px-2 py-2.5 border-r border-slate-100 text-rose-500">
                                                                {formatRp(
                                                                    row.deviasi
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 text-rose-500">
                                                                {formatRp(
                                                                    row.deviasi
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 text-rose-500">
                                                                {formatRp(
                                                                    row.deviasi
                                                                        .b53,
                                                                )}
                                                            </td>

                                                            {/* % Proporsi Pagu */}
                                                            <td className="px-2 py-2.5 border-r border-slate-100 text-indigo-500">
                                                                {formatDecimal(
                                                                    row
                                                                        .proporsi_pagu
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 text-indigo-500">
                                                                {formatDecimal(
                                                                    row
                                                                        .proporsi_pagu
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 text-indigo-500">
                                                                {formatDecimal(
                                                                    row
                                                                        .proporsi_pagu
                                                                        .b53,
                                                                )}
                                                            </td>

                                                            {/* % Dev Tertimbang */}
                                                            <td className="px-2 py-2.5 border-r border-slate-100 font-bold text-purple-600">
                                                                {formatDecimal(
                                                                    row
                                                                        .deviasi_tertimbang
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 font-bold text-purple-600">
                                                                {formatDecimal(
                                                                    row
                                                                        .deviasi_tertimbang
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 font-bold text-purple-600">
                                                                {formatDecimal(
                                                                    row
                                                                        .deviasi_tertimbang
                                                                        .b53,
                                                                )}
                                                            </td>

                                                            {/* % Deviasi Seluruh & Rata Rata */}
                                                            <td className="px-2 py-2.5 border-r border-slate-100 font-bold text-slate-700 bg-slate-50/50">
                                                                {formatDecimal(
                                                                    row.persen_seluruh,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2.5 border-r border-slate-100 font-bold text-indigo-700 bg-indigo-50/20">
                                                                {formatDecimal(
                                                                    row.rata_kumulatif,
                                                                )}
                                                            </td>

                                                            {/* Nilai IKPA */}
                                                            <td className="px-2 py-2.5 text-center align-middle bg-slate-50">
                                                                <span
                                                                    className={`px-2 py-1 inline-flex text-[10px] font-black rounded border shadow-sm ${ikpaColor} font-sans`}
                                                                >
                                                                    {formatDecimal(
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

                {/* 🔥 NEW: EVALUASI PENYERAPAN KEMENKEU & POIN (PER TRIWULAN) 🔥 */}
                {laporanData?.evaluasi_tw && (
                    <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden animate-[fadeIn_0.5s_ease-out] mt-6">
                        <div className="p-6 md:px-8 border-b border-slate-100 bg-blue-50/30 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 text-blue-600 rounded-2xl">
                                <Target size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">
                                    Evaluasi Target Penyerapan & Nilai
                                    Tertimbang (Bobot SIRA)
                                </h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">
                                    Kalkulasi otomatis sumbangsih poin IKPA Hal
                                    III (Bobot 10%) dan Penyerapan Anggaran
                                    (Bobot 20%) terhadap skor akhir Satker.
                                </p>
                            </div>
                        </div>
                        <div className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {["I", "II", "III", "IV"].map((tw) => {
                                const evalTw = laporanData.evaluasi_tw[tw];
                                if (!evalTw) return null;
                                const p = evalTw.poin;
                                return (
                                    <div
                                        key={tw}
                                        className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col"
                                    >
                                        <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                            <CalendarRange
                                                className="text-indigo-500"
                                                size={20}
                                            />
                                            TRIWULAN {tw}
                                        </h4>
                                        <div className="space-y-3 mb-6">
                                            {["51", "52", "53"].map((kode) => {
                                                const item = evalTw[kode];
                                                const isLulus =
                                                    item.status === "Tercapai";
                                                const isNA =
                                                    item.status === "N/A";
                                                const nama =
                                                    kode === "51"
                                                        ? "Pegawai"
                                                        : kode === "52"
                                                          ? "Barang"
                                                          : "Modal";

                                                return (
                                                    <div
                                                        key={kode}
                                                        className={`flex items-center justify-between p-3 rounded-xl border ${isNA ? "bg-slate-100 border-slate-200" : isLulus ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                                                                {isNA ? (
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                                ) : isLulus ? (
                                                                    <CheckCircle2
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="text-emerald-500"
                                                                    />
                                                                ) : (
                                                                    <XCircle
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="text-rose-500"
                                                                    />
                                                                )}
                                                                Belanja {nama} (
                                                                {kode})
                                                            </span>
                                                            {!isNA && (
                                                                <span className="text-xs font-bold text-slate-700 mt-0.5">
                                                                    Rp{" "}
                                                                    {formatRp(
                                                                        item.nominal,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isNA ? (
                                                            <span className="text-xs font-black text-slate-400 px-3 py-1 bg-slate-200 rounded-lg">
                                                                TIDAK ADA PAGU
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-4 text-right">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black uppercase text-slate-500">
                                                                        Target
                                                                    </span>
                                                                    <span className="text-xs font-bold text-slate-700">
                                                                        {
                                                                            item.target_persen
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black uppercase text-slate-500">
                                                                        Aktual
                                                                    </span>
                                                                    <span
                                                                        className={`text-xs font-black ${isLulus ? "text-emerald-600" : "text-rose-600"}`}
                                                                    >
                                                                        {
                                                                            item.realisasi_persen
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                                <div
                                                                    className={`px-2.5 py-1 text-[10px] font-black rounded-lg ${isLulus ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"}`}
                                                                >
                                                                    {isLulus
                                                                        ? "LULUS"
                                                                        : "GAGAL"}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* RUMUS POIN TERTIMBANG SIRA */}
                                        <div className="mt-auto bg-[#0A192F] rounded-xl p-4 shadow-inner border border-slate-700">
                                            <div className="grid grid-cols-2 gap-4 mb-3 border-b border-slate-700/50 pb-3">
                                                <div>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                        Skor Penyerapan (Bobot
                                                        20%)
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-xl font-black text-emerald-400">
                                                            {formatDecimal(
                                                                p.nilai_penyerapan,
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-bold mb-1">
                                                            x 20% ={" "}
                                                            <span className="text-white bg-emerald-500/20 px-1.5 py-0.5 rounded text-sm">
                                                                {formatDecimal(
                                                                    p.tertimbang_penyerapan,
                                                                )}{" "}
                                                                pts
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                        Skor Hal. III DIPA
                                                        (Bobot 10%)
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-xl font-black text-blue-400">
                                                            {formatDecimal(
                                                                p.ikpa_hal_iii,
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-bold mb-1">
                                                            x 10% ={" "}
                                                            <span className="text-white bg-blue-500/20 px-1.5 py-0.5 rounded text-sm">
                                                                {formatDecimal(
                                                                    p.tertimbang_hal_iii,
                                                                )}{" "}
                                                                pts
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Star
                                                        size={14}
                                                        className="fill-yellow-500 text-yellow-500"
                                                    />{" "}
                                                    TOTAL POIN SIRA TW {tw}
                                                </span>
                                                <span className="text-2xl font-black text-yellow-400">
                                                    {formatDecimal(
                                                        p.total_poin,
                                                    )}{" "}
                                                    <span className="text-xs text-yellow-700">
                                                        / 30 Pts
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                    .custom-scrollbar::-webkit-scrollbar { height: 10px; width: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                `}</style>
            </div>
        </MainLayout>
    );
}
