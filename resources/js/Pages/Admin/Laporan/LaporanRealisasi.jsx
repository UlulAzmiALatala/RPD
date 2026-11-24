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
    Loader2,
    TrendingUp,
    Target,
    Filter,
    CalendarRange,
    Calendar,
    CheckCircle2,
    XCircle,
    Star,
    Wallet,
    Info,
    Download,
    Activity,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    Layers,
    FileClock,
    ClipboardCheck,
    BarChart3,
} from "lucide-react";

export default function LaporanRealisasi() {
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [satkerId, setSatkerId] = useState("");
    const [satkers, setSatkers] = useState([]);

    const [jenisLaporan, setJenisLaporan] = useState("rpd_vs_realisasi");

    const [laporanData, setLaporanData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [expandedRows, setExpandedRows] = useState([]);

    const toggleRow = (bulan) => {
        setExpandedRows((prev) =>
            prev.includes(bulan)
                ? prev.filter((b) => b !== bulan)
                : [...prev, bulan],
        );
    };

    useEffect(() => {
        axios
            .get(`/api/dashboard-data?tahun=${tahun}`)
            .then((response) => {
                const list = response.data?.data?.tabel_satker || [];
                setSatkers(list);
                if (list.length === 1 && !satkerId) {
                    setSatkerId(String(list[0].id));
                }
            })
            .catch((error) => console.error("Gagal memuat list satker", error));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tahun]);

    const fetchLaporan = (e) => {
        if (e) e.preventDefault();
        if (!satkerId) {
            setErrorMsg("Silakan pilih Satuan Kerja terlebih dahulu.");
            return;
        }

        setLoading(true);
        setErrorMsg("");
        setLaporanData(null);
        setExpandedRows([]);

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

    const formatCurrencyFull = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount || 0);

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

        let totalPoinSira = "-";
        if (laporanData.evaluasi_tw)
            totalPoinSira = laporanData.evaluasi_tw["IV"].poin.total_poin;

        const persenSerap =
            laporanData.pagu_efektif > 0
                ? (totRealisasi / laporanData.pagu_efektif) * 100
                : 0;

        return {
            totRencana,
            totRealisasi,
            totDeviasi,
            finalIkpa,
            totalPoinSira,
            persenSerap,
        };
    }, [laporanData]);

    const getGrade = (poin) => {
        if (poin === "-" || poin === null || poin === undefined)
            return {
                letter: "?",
                color: "text-slate-400",
                bg: "bg-slate-500/20",
                label: "Belum Ada Data",
                border: "border-slate-700",
            };
        const p = parseFloat(poin);
        if (p >= 58)
            return {
                letter: "A",
                color: "text-emerald-400",
                bg: "bg-emerald-500/20",
                label: "Sangat Baik",
                border: "border-emerald-500/40",
            };
        if (p >= 48)
            return {
                letter: "B",
                color: "text-blue-400",
                bg: "bg-blue-500/20",
                label: "Baik",
                border: "border-blue-500/40",
            };
        if (p >= 36)
            return {
                letter: "C",
                color: "text-amber-400",
                bg: "bg-amber-500/20",
                label: "Cukup",
                border: "border-amber-500/40",
            };
        return {
            letter: "D",
            color: "text-rose-400",
            bg: "bg-rose-500/20",
            label: "Kurang",
            border: "border-rose-500/40",
        };
    };

    const grade = getGrade(summary?.totalPoinSira);

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
                    `Total Pagu Efektif: Rp ${formatRp(laporanData.pagu_efektif)}`,
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
                    laporanData.pagu_efektif > 0
                        ? (totRealBulan / laporanData.pagu_efektif) * 100
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
                ["LAPORAN RINCIAN REALISASI, IKPA 65 POIN & TATA KELOLA"],
                [
                    `Satuan Kerja: ${laporanData.satker.nama_satker} (${laporanData.satker.kode_satker})`,
                ],
                [
                    `Tahun Anggaran: ${tahun}`,
                    `Pagu Kotor (Utk Evaluasi Kemenkeu): Rp ${formatRp(laporanData.pagu_total)}`,
                    `Pagu Efektif (Utk Penyerapan Murni): Rp ${formatRp(laporanData.pagu_efektif)}`,
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

            if (laporanData.evaluasi_tw) {
                aoa.push(
                    [],
                    [],
                    [
                        "EVALUASI TARGET PENYERAPAN KEMENKEU & POIN SIRA 65 POIN (PER TRIWULAN)",
                    ],
                    [
                        "Triwulan",
                        "Jenis Belanja",
                        "Realisasi Kumulatif (Rp)",
                        "Target Minimal Kemenkeu (%)",
                        "Target Nominal Kemenkeu (Rp)",
                        "Aktual Penyerapan (%)",
                        "Status",
                        "",
                        "Nilai Penyerapan (Maks 100)",
                        "Poin Penyerapan (20%)",
                        "Nilai Hal III (Maks 100)",
                        "Poin Hal III (10%)",
                        "Nilai Capaian RO (Maks 100)",
                        "Poin Capaian RO (25%)",
                        "Nilai Revisi DIPA (Maks 100)",
                        "Poin Revisi DIPA (10%)",
                        "TOTAL POIN SIRA (Maks 65)",
                    ],
                );

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
                            item.status === "N/A" ? "-" : item.target_nominal,
                            item.status === "N/A" ? "-" : item.realisasi_persen,
                            item.status === "N/A"
                                ? "TIDAK ADA PAGU"
                                : item.status,
                            "",
                        ];

                        if (firstRow) {
                            rowData.push(
                                poin.nilai_penyerapan,
                                poin.tertimbang_penyerapan,
                                poin.ikpa_hal_iii,
                                poin.tertimbang_hal_iii,
                                poin.nilai_ro,
                                poin.tertimbang_ro,
                                poin.nilai_revisi_dipa || 0,
                                poin.tertimbang_revisi_dipa || 0,
                                poin.total_poin,
                            );
                            firstRow = false;
                        }
                        aoa.push(rowData);
                    });
                });
            }
        }

        const hasDetails = laporanData.laporan_bulanan.some(
            (r) => r.realisasi_details && r.realisasi_details.length > 0,
        );
        if (hasDetails) {
            aoa.push(
                [],
                [],
                [
                    "LAMPIRAN KETERLACAKAN TRANSAKSI AKTUAL & ALOKASI RINCIAN OUTPUT (RO)",
                ],
            );
            aoa.push([
                "Bulan",
                "Jenis Belanja",
                "Uraian Transaksi Pengeluaran",
                "Kode RO",
                "Nama Rincian Output (RO)",
                "Nominal Aktual (Rp)",
            ]);

            laporanData.laporan_bulanan.forEach((row) => {
                if (row.realisasi_details && row.realisasi_details.length > 0) {
                    row.realisasi_details.forEach((det) => {
                        const jns =
                            det.jenis_belanja === "gaji"
                                ? "51 - Pegawai"
                                : det.jenis_belanja === "barang"
                                  ? "52 - Barang"
                                  : "53 - Modal";
                        const kodeRo = det.rincian_output
                            ? det.rincian_output.kode_ro
                            : "-";
                        const namaRo = det.rincian_output
                            ? det.rincian_output.nama_ro
                            : "Tanpa Rincian Output (Belanja Umum)";
                        aoa.push([
                            namaBulan[row.bulan],
                            jns,
                            det.uraian,
                            kodeRo,
                            namaRo,
                            Number(det.nominal),
                        ]);
                    });
                }
            });
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
            `Detail_65Pts_${jenisLaporan}_${laporanData.satker.kode_satker}_${tahun}.xlsx`,
        );
    };

    const handleExportPdf = () => {
        if (!satkerId) return;
        window.open(
            `/api/laporan/realisasi-satker/pdf?tahun=${tahun}&satker_id=${satkerId}`,
            "_blank",
        );
    };

    const renderDetailDrawer = (row, colSpanCount) => (
        <tr className="bg-slate-50/90 border-b border-slate-200">
            <td
                colSpan={colSpanCount}
                className="p-5 text-left font-sans whitespace-normal"
            >
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-inner p-5 max-w-5xl">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Layers size={16} className="text-indigo-600" />
                            Keterlacakan Transaksi &amp; Alokasi Rincian Output
                            (RO) — Bulan {namaBulan[row.bulan]}
                        </h4>
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                            {row.realisasi_details?.length || 0} Item Transaksi
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                        {row.realisasi_details &&
                        row.realisasi_details.length > 0 ? (
                            row.realisasi_details.map((detail, idx) => (
                                <div
                                    key={detail.id || idx}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors gap-3"
                                >
                                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-[11px] text-slate-600 border border-slate-200 shrink-0">
                                            {detail.jenis_belanja === "gaji"
                                                ? "51"
                                                : detail.jenis_belanja ===
                                                    "barang"
                                                  ? "52"
                                                  : "53"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 leading-snug">
                                                {detail.uraian}
                                            </p>
                                            {detail.rincian_output ? (
                                                <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-md text-[10px] font-black">
                                                    <Target
                                                        size={11}
                                                        className="text-indigo-600 shrink-0"
                                                    />
                                                    <span>
                                                        RO: [
                                                        {
                                                            detail
                                                                .rincian_output
                                                                .kode_ro
                                                        }
                                                        ]{" "}
                                                        {
                                                            detail
                                                                .rincian_output
                                                                .nama_ro
                                                        }
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center mt-1.5 px-2.5 py-0.5 bg-slate-200/70 text-slate-500 rounded-md text-[10px] font-bold">
                                                    Tanpa Rincian Output
                                                    (Belanja Umum)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right w-full sm:w-auto pl-14 sm:pl-0 shrink-0">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                                            Nominal Aktual
                                        </p>
                                        <p className="text-sm font-black text-emerald-700 font-mono tabular-nums">
                                            {formatCurrencyFull(detail.nominal)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-slate-400 text-xs font-bold">
                                Belum ada rincian transaksi keuangan yang
                                tercatat pada bulan {namaBulan[row.bulan]}.
                            </div>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );

    const tk = laporanData?.tata_kelola;

    return (
        <MainLayout tahun={tahun}>
            <style>{`
                .glass-card { background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
                .custom-scrollbar::-webkit-scrollbar { height: 10px; width: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #f8fafc; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

            <div className="space-y-6 font-sans text-slate-700 relative min-h-screen pb-12">
                <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10"></div>

                {/* =====================================================================
                    1. HERO COMMAND BAR (2 BARIS TERSTRUKTUR — ANTI TUMPANG TINDIH)
                ===================================================================== */}
                <div className="glass-card p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 relative z-10 space-y-5">
                    {/* BARIS 1: JUDUL + TOMBOL EKSPOR CEPAT (JIKA DATA SUDAH DIMUAT) */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl shadow-[0_10px_24px_rgba(79,70,229,0.3)] shrink-0">
                                <Building2 size={26} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                                        Rapor Kinerja Satker
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase tracking-widest">
                                        Skala 65 Poin
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                                    Analisis komprehensif Hal. III DIPA (10%),
                                    Penyerapan (20%), Output RO (25%), &amp;
                                    Revisi DIPA (10%).
                                </p>
                            </div>
                        </div>

                        {laporanData && (
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() =>
                                        window.open(
                                            `/api/laporan/rincian-output/pdf?tahun=${tahun}&satker_id=${satkerId}`,
                                            "_blank",
                                        )
                                    }
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    <FileText size={14} /> PDF R.O.
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExportPdf}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    <Download size={14} /> PDF IKPA
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExportExcel}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                                >
                                    <FileSpreadsheet size={14} /> Excel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="h-px w-full bg-slate-200/70"></div>

                    {/* BARIS 2: FORM FILTER GRID 12 KOLOM (SEJAJAR 1 BARIS RAPI) */}
                    <form
                        onSubmit={fetchLaporan}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end"
                    >
                        <div className="lg:col-span-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                Jenis Laporan
                            </label>
                            <div className="relative">
                                <Filter
                                    size={14}
                                    className="text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                                <select
                                    value={jenisLaporan}
                                    onChange={(e) =>
                                        setJenisLaporan(e.target.value)
                                    }
                                    className="w-full pl-9 pr-9 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 cursor-pointer outline-none appearance-none truncate"
                                >
                                    <option value="rpd_vs_realisasi">
                                        RPD vs Realisasi (Matriks IKPA)
                                    </option>
                                    <option value="murni_realisasi">
                                        Murni Realisasi Belanja Saja
                                    </option>
                                </select>
                                <ChevronDown
                                    size={15}
                                    className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                Tahun Anggaran
                            </label>
                            <div className="relative">
                                <Calendar
                                    size={14}
                                    className="text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                                <select
                                    value={tahun}
                                    onChange={(e) => setTahun(e.target.value)}
                                    className="w-full pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-black text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 cursor-pointer outline-none appearance-none"
                                >
                                    {[...Array(5)].map((_, i) => {
                                        const yr =
                                            new Date().getFullYear() - 2 + i;
                                        return (
                                            <option key={yr} value={yr}>
                                                T.A {yr}
                                            </option>
                                        );
                                    })}
                                </select>
                                <ChevronDown
                                    size={15}
                                    className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                Satuan Kerja
                            </label>
                            <div className="relative">
                                <Building2
                                    size={14}
                                    className="text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                                <select
                                    value={satkerId}
                                    onChange={(e) =>
                                        setSatkerId(e.target.value)
                                    }
                                    className="w-full pl-9 pr-9 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 cursor-pointer outline-none appearance-none truncate"
                                >
                                    <option value="">
                                        -- Pilih Satuan Kerja --
                                    </option>
                                    {satkers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.kode_satker} - {s.nama_satker}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={15}
                                    className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                                    loading
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                        : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-0.5"
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />{" "}
                                        Memuat...
                                    </>
                                ) : (
                                    <>
                                        <Activity size={16} /> Tampilkan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ERROR BANNER */}
                {errorMsg && (
                    <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-sm flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-rose-100 rounded-xl shrink-0">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <p className="font-bold">{errorMsg}</p>
                    </div>
                )}

                {/* EMPTY STATE SEBELUM SATKER DIPILIH */}
                {!laporanData && !loading && (
                    <div className="glass-card rounded-[2.25rem] border border-white/80 p-14 text-center shadow-sm">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-[1.75rem] flex items-center justify-center mx-auto mb-5 border border-indigo-100 shadow-inner">
                            <BarChart3 size={38} strokeWidth={1.7} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                            Pilih Satuan Kerja &amp; Tampilkan Rapor
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto mt-2 leading-relaxed">
                            Pilih jenis laporan, tahun anggaran, dan Satuan
                            Kerja pada panel filter di atas lalu klik{" "}
                            <strong className="text-indigo-600">
                                Tampilkan
                            </strong>{" "}
                            untuk membedah matriks IKPA 12 bulan, keterlacakan
                            RO, Revisi DIPA, dan Indeks Tata Kelola.
                        </p>
                    </div>
                )}

                {/* LOADING STATE */}
                {loading && (
                    <div className="glass-card rounded-[2.25rem] border border-white/80 p-16 flex flex-col items-center justify-center gap-4 shadow-sm">
                        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
                            Menghitung Matriks 65 Poin &amp; Keterlacakan RO...
                        </p>
                    </div>
                )}

                {/* =====================================================================
                    2. 4 KARTU KPI SUMMARY (STACKED EXECUTIVE — ANTI GEPENG)
                ===================================================================== */}
                {laporanData && summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
                        {/* KARTU 1: DARK GRADE & POIN SIRA */}
                        <div
                            className={`bg-[#0B1120] p-5 rounded-[1.75rem] shadow-lg flex flex-col justify-between gap-3 relative overflow-hidden border ${grade.border}`}
                        >
                            <div
                                className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none ${grade.bg}`}
                            ></div>
                            <div className="flex items-center justify-between gap-2 relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Skor SIRA Final
                                </p>
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border ${grade.bg} ${grade.border} ${grade.color}`}
                                >
                                    {grade.letter}
                                </div>
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-1.5">
                                    <h3
                                        className={`text-3xl font-black tracking-tight tabular-nums ${grade.color}`}
                                    >
                                        {formatDecimal(summary.totalPoinSira)}
                                    </h3>
                                    <span className="text-sm font-bold text-slate-500">
                                        / 65
                                    </span>
                                </div>
                                <p
                                    className={`text-[10px] font-black uppercase tracking-wider mt-1.5 inline-flex items-center gap-1 ${grade.color}`}
                                >
                                    <ShieldCheck size={12} /> Grade:{" "}
                                    {grade.label}
                                </p>
                            </div>
                        </div>

                        {/* KARTU 2: TOTAL PAGU EFEKTIF */}
                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-3 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                    Total Pagu Efektif
                                </p>
                                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                    <Wallet size={18} strokeWidth={2.2} />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3
                                    title={formatCurrencyFull(
                                        laporanData.pagu_efektif,
                                    )}
                                    className="text-lg 2xl:text-xl font-black text-slate-900 tracking-tight tabular-nums truncate"
                                >
                                    {formatCurrencyFull(
                                        laporanData.pagu_efektif,
                                    )}
                                </h3>
                                <p className="text-[10px] font-semibold text-slate-400 mt-1 truncate">
                                    Pagu Kotor: Rp{" "}
                                    {formatRp(laporanData.pagu_total)}
                                </p>
                            </div>
                        </div>

                        {/* KARTU 3: TOTAL AKTUAL REALISASI */}
                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-3 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                    Total Aktual Realisasi
                                </p>
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <TrendingUp size={18} strokeWidth={2.2} />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3
                                    title={formatCurrencyFull(
                                        summary.totRealisasi,
                                    )}
                                    className="text-lg 2xl:text-xl font-black text-emerald-700 tracking-tight tabular-nums truncate"
                                >
                                    {formatCurrencyFull(summary.totRealisasi)}
                                </h3>
                                <p className="text-[10px] font-bold text-emerald-600 mt-1">
                                    Serapan Efektif:{" "}
                                    {formatDecimal(summary.persenSerap)}%
                                </p>
                            </div>
                        </div>

                        {/* KARTU 4: NILAI HAL. III DIPA */}
                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-3 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                    Nilai IKPA Hal. III DIPA
                                </p>
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        typeof summary.finalIkpa !== "number"
                                            ? "bg-slate-100 text-slate-400"
                                            : summary.finalIkpa >= 95
                                              ? "bg-emerald-50 text-emerald-600"
                                              : summary.finalIkpa >= 85
                                                ? "bg-amber-50 text-amber-600"
                                                : "bg-rose-50 text-rose-600"
                                    }`}
                                >
                                    <Award size={18} strokeWidth={2.2} />
                                </div>
                            </div>
                            <div>
                                <h3
                                    className={`text-3xl font-black tracking-tight tabular-nums ${
                                        typeof summary.finalIkpa !== "number"
                                            ? "text-slate-400"
                                            : summary.finalIkpa >= 95
                                              ? "text-emerald-600"
                                              : summary.finalIkpa >= 85
                                                ? "text-amber-500"
                                                : "text-rose-600"
                                    }`}
                                >
                                    {formatDecimal(summary.finalIkpa)}
                                </h3>
                                <p className="text-[10px] font-semibold text-slate-400 mt-1">
                                    Kontribusi bobot 10% pada Poin SIRA
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STRIP INDEKS TATA KELOLA & REVISI DIPA SATKER */}
                {laporanData && tk && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl shrink-0">
                                    <FileClock size={20} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                        Revisi DIPA (10%)
                                    </p>
                                    <p className="text-xs font-bold text-slate-600 mt-0.5 truncate">
                                        {laporanData.evaluasi_tw?.IV?.poin
                                            ?.frekuensi_revisi_tetap || 0}
                                        x Pagu Tetap •{" "}
                                        {laporanData.evaluasi_tw?.IV?.poin
                                            ?.status_revisi || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-xl font-black text-amber-600 tabular-nums">
                                    {formatDecimal(
                                        laporanData.evaluasi_tw?.IV?.poin
                                            ?.nilai_revisi_dipa || 0,
                                    )}
                                </div>
                                <div className="text-[10px] font-bold text-amber-500">
                                    {formatDecimal(
                                        laporanData.evaluasi_tw?.IV?.poin
                                            ?.tertimbang_revisi_dipa || 0,
                                    )}{" "}
                                    / 10 Pts
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl shrink-0">
                                    <Layers size={20} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                        Sinkronisasi RO
                                    </p>
                                    <p className="text-xs font-bold text-slate-600 mt-0.5 truncate">
                                        {tk.kesehatan_ro.ro_sehat}/
                                        {tk.kesehatan_ro.total_ro} Sinkron •{" "}
                                        {tk.kesehatan_ro.ro_anomali} Anomali
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-xl font-black text-purple-700 tabular-nums">
                                    {formatDecimal(tk.kesehatan_ro.skor)}%
                                </div>
                                <div className="text-[10px] font-bold text-purple-500">
                                    {tk.kesehatan_ro.status}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 bg-teal-100 text-teal-600 rounded-xl shrink-0">
                                    <ClipboardCheck
                                        size={20}
                                        strokeWidth={2.5}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                        Kedisiplinan Lapor
                                    </p>
                                    <p className="text-xs font-bold text-slate-600 mt-0.5 truncate">
                                        Lengkap{" "}
                                        {formatDecimal(
                                            tk.kedisiplinan.persen_kelengkapan,
                                        )}
                                        % • {tk.kedisiplinan.total_ditolak}{" "}
                                        Ditolak
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-xl font-black text-teal-700 tabular-nums">
                                    {formatDecimal(tk.kedisiplinan.skor)}
                                </div>
                                <div className="text-[10px] font-bold text-teal-600">
                                    {tk.kedisiplinan.status}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* =====================================================================
                    3. TABEL BULANAN (GRID ANALISIS 12 BULAN + LACI RO)
                ===================================================================== */}
                {laporanData && (
                    <div className="glass-card rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden relative z-10">
                        <div className="p-5 sm:px-6 border-b border-slate-100 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                    {jenisLaporan === "murni_realisasi"
                                        ? "Rincian Murni Realisasi & Kaitan Output (RO)"
                                        : "Grid Analisis Indikator Halaman III DIPA & Keterlacakan RO"}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                        Satker:{" "}
                                        <span className="text-indigo-600 font-black">
                                            {laporanData.satker.nama_satker}
                                        </span>
                                    </span>
                                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 inline-flex items-center gap-1">
                                        <Layers size={12} /> Klik baris Bulan
                                        untuk melihat Rincian Transaksi &amp;
                                        Kode RO
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar max-h-[600px] relative">
                            <table className="min-w-full divide-y divide-slate-200 text-[11px] border-collapse relative">
                                {jenisLaporan === "murni_realisasi" ? (
                                    <>
                                        <thead className="bg-[#0A192F] text-white text-center font-bold sticky top-0 z-20 shadow-md">
                                            <tr>
                                                <th className="px-4 py-4 w-10 border-r border-slate-700">
                                                    Detail
                                                </th>
                                                <th className="px-5 py-4 border-r border-slate-700 tracking-wider uppercase text-[10px]">
                                                    Bulan
                                                </th>
                                                <th className="px-5 py-4 border-r border-slate-700 bg-emerald-900/50 tracking-wider uppercase text-[10px]">
                                                    Gaji (51)
                                                </th>
                                                <th className="px-5 py-4 border-r border-slate-700 bg-emerald-900/50 tracking-wider uppercase text-[10px]">
                                                    Barang (52)
                                                </th>
                                                <th className="px-5 py-4 border-r border-slate-700 bg-emerald-900/50 tracking-wider uppercase text-[10px]">
                                                    Modal (53)
                                                </th>
                                                <th className="px-5 py-4 bg-indigo-900/50 font-black text-indigo-200 tracking-wider uppercase text-[10px]">
                                                    TOTAL REALISASI
                                                </th>
                                                <th className="px-5 py-4 bg-emerald-900/40 border-l border-slate-700 tracking-wider uppercase text-[10px]">
                                                    % Serap
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100 text-slate-700">
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
                                                        laporanData.pagu_efektif >
                                                        0
                                                            ? (totRealBulan /
                                                                  laporanData.pagu_efektif) *
                                                              100
                                                            : 0;
                                                    const isExpanded =
                                                        expandedRows.includes(
                                                            row.bulan,
                                                        );
                                                    const detailCount =
                                                        row.realisasi_details
                                                            ?.length || 0;
                                                    return (
                                                        <React.Fragment
                                                            key={row.bulan}
                                                        >
                                                            <tr
                                                                className={`hover:bg-slate-50 text-right transition-colors font-mono group whitespace-nowrap ${
                                                                    isExpanded
                                                                        ? "bg-indigo-50/40"
                                                                        : ""
                                                                }`}
                                                            >
                                                                <td className="px-4 py-3.5 text-center border-r border-slate-100 bg-slate-50/50">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            toggleRow(
                                                                                row.bulan,
                                                                            )
                                                                        }
                                                                        className={`p-1.5 rounded-lg border shadow-sm transition-all cursor-pointer ${
                                                                            detailCount >
                                                                            0
                                                                                ? "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                                                                                : "bg-white border-slate-200 text-slate-400 hover:text-indigo-600"
                                                                        }`}
                                                                        title="Lihat Rincian RO"
                                                                    >
                                                                        {isExpanded ? (
                                                                            <ChevronUp
                                                                                size={
                                                                                    15
                                                                                }
                                                                                strokeWidth={
                                                                                    3
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <ChevronDown
                                                                                size={
                                                                                    15
                                                                                }
                                                                                strokeWidth={
                                                                                    3
                                                                                }
                                                                            />
                                                                        )}
                                                                    </button>
                                                                </td>
                                                                <td
                                                                    onClick={() =>
                                                                        toggleRow(
                                                                            row.bulan,
                                                                        )
                                                                    }
                                                                    className="px-5 py-3.5 border-r border-slate-100 text-center font-sans font-black text-slate-900 bg-slate-50/50 cursor-pointer"
                                                                >
                                                                    <span>
                                                                        {namaBulan[
                                                                            row
                                                                                .bulan
                                                                        ].toUpperCase()}
                                                                    </span>
                                                                    {detailCount >
                                                                        0 && (
                                                                        <span className="ml-2 px-1.5 py-0.5 text-[9px] font-black bg-indigo-100 text-indigo-700 rounded-md">
                                                                            {
                                                                                detailCount
                                                                            }{" "}
                                                                            RO
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-3.5 border-r border-slate-100 font-bold text-slate-600 tabular-nums">
                                                                    {formatRp(
                                                                        row
                                                                            .realisasi
                                                                            .b51,
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-3.5 border-r border-slate-100 font-bold text-slate-600 tabular-nums">
                                                                    {formatRp(
                                                                        row
                                                                            .realisasi
                                                                            .b52,
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-3.5 border-r border-slate-100 font-bold text-slate-600 tabular-nums">
                                                                    {formatRp(
                                                                        row
                                                                            .realisasi
                                                                            .b53,
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-3.5 font-black text-indigo-700 bg-indigo-50/30 tabular-nums">
                                                                    {formatRp(
                                                                        totRealBulan,
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-3.5 text-center bg-emerald-50/10 border-l border-slate-100">
                                                                    <span
                                                                        className={`px-2.5 py-1 inline-flex text-xs font-black rounded-lg border ${
                                                                            persenSerap >=
                                                                            50
                                                                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                                : "bg-rose-100 text-rose-700 border-rose-200"
                                                                        }`}
                                                                    >
                                                                        {formatDecimal(
                                                                            persenSerap,
                                                                        )}
                                                                        %
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            {isExpanded &&
                                                                renderDetailDrawer(
                                                                    row,
                                                                    7,
                                                                )}
                                                        </React.Fragment>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </>
                                ) : (
                                    <>
                                        <thead className="bg-[#0A192F] text-white text-center font-bold sticky top-0 z-20 shadow-md">
                                            <tr className="uppercase tracking-widest text-[9px]">
                                                <th
                                                    rowSpan="2"
                                                    className="px-3 py-3 border-r border-slate-700 align-middle bg-slate-900 sticky left-0 z-30"
                                                >
                                                    Bulan &amp; RO
                                                </th>
                                                <th
                                                    colSpan="3"
                                                    className="px-3 py-3 border-r border-slate-700 bg-blue-900/60"
                                                >
                                                    Rencana Penarikan (RPD)
                                                </th>
                                                <th
                                                    colSpan="6"
                                                    className="px-3 py-3 border-r border-slate-700 bg-emerald-900/60"
                                                >
                                                    Aktual Penyerapan
                                                </th>
                                                <th
                                                    colSpan="3"
                                                    className="px-3 py-3 border-r border-slate-700 bg-rose-900/60"
                                                >
                                                    Deviasi Nominal
                                                </th>
                                                <th
                                                    colSpan="3"
                                                    className="px-3 py-3 border-r border-slate-700 bg-amber-900/60"
                                                >
                                                    % Proporsi Pagu
                                                </th>
                                                <th
                                                    colSpan="3"
                                                    className="px-3 py-3 border-r border-slate-700 bg-indigo-900/60"
                                                >
                                                    % Dev Tertimbang
                                                </th>
                                                <th
                                                    rowSpan="2"
                                                    className="px-3 py-3 border-r border-slate-700 align-middle bg-slate-800 leading-tight"
                                                >
                                                    % Total
                                                    <br />
                                                    Deviasi
                                                </th>
                                                <th
                                                    rowSpan="2"
                                                    className="px-3 py-3 border-r border-slate-700 align-middle bg-slate-800 leading-tight"
                                                >
                                                    Rata-Rata
                                                    <br />
                                                    Kumulatif
                                                </th>
                                                <th
                                                    rowSpan="2"
                                                    className="px-4 py-3 align-middle text-yellow-300 font-black tracking-widest bg-slate-900"
                                                >
                                                    IKPA
                                                    <br />
                                                    (HAL III)
                                                </th>
                                            </tr>
                                            <tr className="bg-slate-800 text-slate-300 text-[9px] tracking-wider uppercase">
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    51
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    52
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    53
                                                </th>
                                                <th className="px-2 py-2 border-slate-700 font-bold">
                                                    51
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 text-amber-300 font-black">
                                                    % Dev
                                                </th>
                                                <th className="px-2 py-2 border-slate-700 font-bold">
                                                    52
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 text-amber-300 font-black">
                                                    % Dev
                                                </th>
                                                <th className="px-2 py-2 border-slate-700 font-bold">
                                                    53
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 text-amber-300 font-black">
                                                    % Dev
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    51
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    52
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    53
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    51
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    52
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    53
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    51
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    52
                                                </th>
                                                <th className="px-2 py-2 border-r border-slate-700 font-bold">
                                                    53
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100 text-slate-700">
                                            {laporanData.laporan_bulanan.map(
                                                (row) => {
                                                    let ikpaColor =
                                                        "bg-slate-100 text-slate-500 border-slate-200";
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
                                                    const isExpanded =
                                                        expandedRows.includes(
                                                            row.bulan,
                                                        );
                                                    const detailCount =
                                                        row.realisasi_details
                                                            ?.length || 0;

                                                    return (
                                                        <React.Fragment
                                                            key={row.bulan}
                                                        >
                                                            <tr
                                                                className={`hover:bg-slate-50/80 text-right transition-colors font-mono group whitespace-nowrap ${
                                                                    isExpanded
                                                                        ? "bg-indigo-50/40"
                                                                        : ""
                                                                }`}
                                                            >
                                                                <td
                                                                    onClick={() =>
                                                                        toggleRow(
                                                                            row.bulan,
                                                                        )
                                                                    }
                                                                    className="px-3 py-3 border-r border-slate-100 text-left font-sans font-black text-slate-800 bg-slate-50 sticky left-0 z-10 group-hover:bg-indigo-50/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] cursor-pointer select-none"
                                                                    title="Klik untuk melihat Rincian Transaksi & Kode RO"
                                                                >
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span className="flex items-center gap-1.5">
                                                                            <span
                                                                                className={`p-1 rounded-md border transition-colors ${
                                                                                    detailCount >
                                                                                    0
                                                                                        ? "bg-indigo-100 border-indigo-200 text-indigo-700"
                                                                                        : "bg-white border-slate-200 text-slate-400"
                                                                                }`}
                                                                            >
                                                                                {isExpanded ? (
                                                                                    <ChevronUp
                                                                                        size={
                                                                                            12
                                                                                        }
                                                                                        strokeWidth={
                                                                                            3
                                                                                        }
                                                                                    />
                                                                                ) : (
                                                                                    <ChevronDown
                                                                                        size={
                                                                                            12
                                                                                        }
                                                                                        strokeWidth={
                                                                                            3
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </span>
                                                                            {namaBulan[
                                                                                row
                                                                                    .bulan
                                                                            ]
                                                                                .substring(
                                                                                    0,
                                                                                    3,
                                                                                )
                                                                                .toUpperCase()}
                                                                        </span>
                                                                        {detailCount >
                                                                            0 && (
                                                                            <span className="px-1.5 py-0.5 text-[8px] font-black bg-indigo-600 text-white rounded-full">
                                                                                {
                                                                                    detailCount
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 text-slate-500 font-medium">
                                                                    {formatRp(
                                                                        row
                                                                            .rencana
                                                                            .b51,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 text-slate-500 font-medium">
                                                                    {formatRp(
                                                                        row
                                                                            .rencana
                                                                            .b52,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 text-slate-500 font-medium">
                                                                    {formatRp(
                                                                        row
                                                                            .rencana
                                                                            .b53,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 text-emerald-700 bg-emerald-50/30 font-bold">
                                                                    {formatRp(
                                                                        row
                                                                            .realisasi
                                                                            .b51,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 font-black text-amber-600 bg-amber-50/20">
                                                                    {formatDecimal(
                                                                        row
                                                                            .persen_deviasi
                                                                            .b51,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 text-emerald-700 bg-emerald-50/30 font-bold">
                                                                    {formatRp(
                                                                        row
                                                                            .realisasi
                                                                            .b52,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 font-black text-amber-600 bg-amber-50/20">
                                                                    {formatDecimal(
                                                                        row
                                                                            .persen_deviasi
                                                                            .b52,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 text-emerald-700 bg-emerald-50/30 font-bold">
                                                                    {formatRp(
                                                                        row
                                                                            .realisasi
                                                                            .b53,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 font-black text-amber-600 bg-amber-50/20">
                                                                    {formatDecimal(
                                                                        row
                                                                            .persen_deviasi
                                                                            .b53,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 text-rose-500 font-medium">
                                                                    {formatRp(
                                                                        row
                                                                            .deviasi
                                                                            .b51,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 text-rose-500 font-medium">
                                                                    {formatRp(
                                                                        row
                                                                            .deviasi
                                                                            .b52,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 text-rose-500 font-medium">
                                                                    {formatRp(
                                                                        row
                                                                            .deviasi
                                                                            .b53,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 text-slate-400 text-[10px]">
                                                                    {formatDecimal(
                                                                        row
                                                                            .proporsi_pagu
                                                                            .b51,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 text-slate-400 text-[10px]">
                                                                    {formatDecimal(
                                                                        row
                                                                            .proporsi_pagu
                                                                            .b52,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 text-slate-400 text-[10px]">
                                                                    {formatDecimal(
                                                                        row
                                                                            .proporsi_pagu
                                                                            .b53,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 font-bold text-indigo-500">
                                                                    {formatDecimal(
                                                                        row
                                                                            .deviasi_tertimbang
                                                                            .b51,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 font-bold text-indigo-500">
                                                                    {formatDecimal(
                                                                        row
                                                                            .deviasi_tertimbang
                                                                            .b52,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-3 border-r border-slate-100 font-bold text-indigo-500">
                                                                    {formatDecimal(
                                                                        row
                                                                            .deviasi_tertimbang
                                                                            .b53,
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-3 border-r border-slate-100 font-black text-slate-800 bg-slate-50/50">
                                                                    {formatDecimal(
                                                                        row.persen_seluruh,
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-3 border-r border-slate-100 font-black text-indigo-700 bg-indigo-50/30">
                                                                    {formatDecimal(
                                                                        row.rata_kumulatif,
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-3 text-center align-middle bg-slate-50">
                                                                    <span
                                                                        className={`px-2.5 py-1 inline-flex text-[11px] font-black rounded-lg border ${ikpaColor} font-sans min-w-[40px] justify-center`}
                                                                    >
                                                                        {formatDecimal(
                                                                            row.ikpa,
                                                                        )}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            {isExpanded &&
                                                                renderDetailDrawer(
                                                                    row,
                                                                    22,
                                                                )}
                                                        </React.Fragment>
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

                {/* =====================================================================
                    4. EVALUASI TARGET & POIN TERTIMBANG (65 POIN PER TRIWULAN)
                ===================================================================== */}
                {laporanData?.evaluasi_tw && (
                    <div className="glass-card rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden relative z-10">
                        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 flex items-center gap-4">
                            <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-md shrink-0">
                                <Target size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                    Evaluasi Target &amp; Nilai Tertimbang (65
                                    Poin SIRA)
                                </h3>
                                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                                    Kalkulasi otomatis sumbangsih poin
                                    Penyerapan (20%), Hal III (10%), Output RO
                                    (25%), dan Revisi DIPA (10%).
                                </p>
                            </div>
                        </div>

                        <div className="mx-6 mt-6 p-5 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-start gap-4">
                            <div className="p-2.5 bg-indigo-100 rounded-xl shrink-0 text-indigo-600">
                                <Info className="w-5 h-5" strokeWidth={2.5} />
                            </div>
                            <div className="text-xs sm:text-sm text-indigo-900 leading-relaxed">
                                <strong className="block mb-1.5 font-black text-indigo-900">
                                    Kenapa Deviasi "AMAN", tapi Penyerapan
                                    "GAGAL"?
                                </strong>
                                <ul className="list-disc pl-5 space-y-1 font-medium text-xs">
                                    <li>
                                        <strong>IKPA Penyerapan:</strong>{" "}
                                        Kumulatif terhadap Pagu Kotor.
                                        Kekurangan serap di satu TW akan
                                        membebani TW berikutnya jika belum
                                        terkejar.
                                    </li>
                                    <li>
                                        <strong>
                                            IKPA Deviasi Hal. III DIPA:
                                        </strong>{" "}
                                        Menilai ketepatan{" "}
                                        <strong>
                                            Janji (RPD) vs Realisasi
                                        </strong>
                                        .
                                    </li>
                                    <li>
                                        <strong>Revisi DIPA (10%):</strong>{" "}
                                        Hanya kategori{" "}
                                        <strong>Pagu Tetap</strong> yang
                                        dihitung (maksimal 1x/TW = 100; jika
                                        &gt;1x = 100/frekuensi).
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {["I", "II", "III", "IV"].map((tw) => {
                                const evalTw = laporanData.evaluasi_tw[tw];
                                if (!evalTw) return null;
                                const p = evalTw.poin;
                                return (
                                    <div
                                        key={tw}
                                        className="border border-slate-200/80 rounded-[1.75rem] p-5 bg-slate-50/60 flex flex-col hover:border-indigo-300 hover:shadow-md transition-all"
                                    >
                                        <h4 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2.5">
                                            <span className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                                <CalendarRange
                                                    size={17}
                                                    strokeWidth={2.5}
                                                />
                                            </span>
                                            TRIWULAN {tw}
                                        </h4>

                                        <div className="space-y-3 mb-5">
                                            {["51", "52", "53"].map((kode) => {
                                                const item = evalTw[kode];
                                                const isLulus =
                                                    item.status ===
                                                        "Tercapai" ||
                                                    item.status === "Lulus";
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
                                                        className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-3.5 rounded-2xl border ${
                                                            isNA
                                                                ? "bg-slate-100/80 border-slate-200/80"
                                                                : isLulus
                                                                  ? "bg-emerald-50/50 border-emerald-200"
                                                                  : "bg-rose-50/50 border-rose-200"
                                                        }`}
                                                    >
                                                        <div className="min-w-0">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                                                {isNA ? (
                                                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                                ) : isLulus ? (
                                                                    <CheckCircle2
                                                                        size={
                                                                            14
                                                                        }
                                                                        className="text-emerald-500 shrink-0"
                                                                        strokeWidth={
                                                                            2.5
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <XCircle
                                                                        size={
                                                                            14
                                                                        }
                                                                        className="text-rose-500 shrink-0"
                                                                        strokeWidth={
                                                                            2.5
                                                                        }
                                                                    />
                                                                )}
                                                                Belanja {nama} (
                                                                {kode})
                                                            </span>
                                                            {!isNA && (
                                                                <p className="text-xs font-black text-slate-800 mt-1 tabular-nums">
                                                                    Rp{" "}
                                                                    {formatRp(
                                                                        item.nominal,
                                                                    )}{" "}
                                                                    <span className="text-[10px] text-slate-400 font-bold">
                                                                        / Rp{" "}
                                                                        {formatRp(
                                                                            item.target_nominal,
                                                                        )}
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>

                                                        {isNA ? (
                                                            <span className="text-[9px] font-black text-slate-400 px-2.5 py-1 bg-slate-200 rounded-lg uppercase tracking-wider shrink-0">
                                                                Tidak Ada Pagu
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-3.5 text-right shrink-0">
                                                                <div>
                                                                    <span className="block text-[9px] font-black uppercase text-slate-400">
                                                                        Target
                                                                    </span>
                                                                    <span className="text-xs font-black text-slate-700 tabular-nums">
                                                                        {
                                                                            item.target_persen
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="block text-[9px] font-black uppercase text-slate-400">
                                                                        Aktual
                                                                    </span>
                                                                    <span
                                                                        className={`text-xs font-black tabular-nums ${
                                                                            isLulus
                                                                                ? "text-emerald-600"
                                                                                : "text-rose-600"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            item.realisasi_persen
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                                <span
                                                                    className={`px-2.5 py-1 text-[9px] font-black tracking-widest rounded-lg border ${
                                                                        isLulus
                                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                            : "bg-rose-100 text-rose-700 border-rose-200"
                                                                    }`}
                                                                >
                                                                    {isLulus
                                                                        ? "LULUS"
                                                                        : "GAGAL"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* BOX KALKULATOR NEON 4 PILAR = 65 POIN */}
                                        <div className="mt-auto bg-[#0A192F] rounded-[1.5rem] p-5 shadow-inner border border-slate-700/80 relative overflow-hidden">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 border-b border-slate-700/80 pb-4 relative z-10">
                                                <div>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                        Penyerapan
                                                    </div>
                                                    <div className="text-lg font-black text-emerald-400 tabular-nums">
                                                        {formatDecimal(
                                                            p.nilai_penyerapan,
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-slate-300 font-bold">
                                                        {formatDecimal(
                                                            p.tertimbang_penyerapan,
                                                        )}{" "}
                                                        pts
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                        Hal III
                                                    </div>
                                                    <div className="text-lg font-black text-blue-400 tabular-nums">
                                                        {formatDecimal(
                                                            p.ikpa_hal_iii,
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-slate-300 font-bold">
                                                        {formatDecimal(
                                                            p.tertimbang_hal_iii,
                                                        )}{" "}
                                                        pts
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                        Output RO
                                                    </div>
                                                    <div className="text-lg font-black text-purple-400 tabular-nums">
                                                        {formatDecimal(
                                                            p.nilai_ro,
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-slate-300 font-bold">
                                                        {formatDecimal(
                                                            p.tertimbang_ro,
                                                        )}{" "}
                                                        pts
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                        Revisi DIPA
                                                    </div>
                                                    <div className="text-lg font-black text-amber-400 tabular-nums">
                                                        {formatDecimal(
                                                            p.nilai_revisi_dipa ||
                                                                0,
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-slate-300 font-bold">
                                                        {formatDecimal(
                                                            p.tertimbang_revisi_dipa ||
                                                                0,
                                                        )}{" "}
                                                        pts (
                                                        {p.frekuensi_revisi_tetap ||
                                                            0}
                                                        x)
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between relative z-10">
                                                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Star
                                                        size={14}
                                                        className="fill-yellow-500 text-yellow-500"
                                                    />{" "}
                                                    TOTAL POIN TW {tw}
                                                </span>
                                                <span className="text-2xl font-black text-yellow-400 tabular-nums">
                                                    {formatDecimal(
                                                        p.total_poin,
                                                    )}{" "}
                                                    <span className="text-xs text-yellow-600 font-bold">
                                                        / 65 Pts
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
            </div>
        </MainLayout>
    );
}
