import React, { useState, useEffect, useMemo } from "react";
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
    Medal,
    Crown,
    Loader2,
    ChevronDown,
    ChevronUp,
    Layers,
    Target,
    CheckCircle2,
    Activity,
    FileClock,
    ShieldCheck,
    ClipboardCheck,
    Calendar,
    Wallet,
    Search,
    Trophy,
} from "lucide-react";

export default function LaporanBulanan() {
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [bulan, setBulan] = useState((new Date().getMonth() + 1).toString());
    const [jenisLaporan, setJenisLaporan] = useState("rpd_vs_realisasi");
    const [searchQuery, setSearchQuery] = useState("");

    const [laporanData, setLaporanData] = useState([]);
    const [twAktif, setTwAktif] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [expandedSatkers, setExpandedSatkers] = useState([]);

    const toggleSatkerRow = (satkerId) => {
        setExpandedSatkers((prev) =>
            prev.includes(satkerId)
                ? prev.filter((id) => id !== satkerId)
                : [...prev, satkerId],
        );
    };

    const fetchLaporan = (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setExpandedSatkers([]);

        axios
            .get(`/api/laporan/bulanan?tahun=${tahun}&bulan=${bulan}`)
            .then((response) => {
                setLaporanData(response.data.data || []);
                setTwAktif(response.data.tw_aktif || "");
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

    const formatRp = (angka) =>
        new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: 0,
        }).format(angka || 0);

    const formatCurrencyFull = (angka) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(angka || 0);

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

    // Ringkasan KPI Agregat Nasional (otomatis dari laporanData)
    const nationalStats = useMemo(() => {
        const totalSatker = laporanData.length;
        const totalPagu = laporanData.reduce(
            (s, r) => s + Number(r.pagu_efektif || 0),
            0,
        );
        const totalRealisasi = laporanData.reduce(
            (s, r) => s + Number(r.total_realisasi || 0),
            0,
        );
        const persenSerap =
            totalPagu > 0 ? (totalRealisasi / totalPagu) * 100 : 0;

        const satkerAktif = laporanData.filter(
            (r) => Number(r.pagu_efektif) > 0,
        );
        const avgPoin =
            satkerAktif.length > 0
                ? satkerAktif.reduce(
                      (s, r) =>
                          s + Number(r.evaluasi_tw?.poin?.total_poin || 0),
                      0,
                  ) / satkerAktif.length
                : 0;
        const avgTk =
            satkerAktif.length > 0
                ? satkerAktif.reduce(
                      (s, r) =>
                          s + Number(r.tata_kelola?.skor_tata_kelola || 0),
                      0,
                  ) / satkerAktif.length
                : 0;

        const topSatker = laporanData[0] || null;
        return {
            totalSatker,
            totalPagu,
            totalRealisasi,
            persenSerap,
            avgPoin,
            avgTk,
            topSatker,
        };
    }, [laporanData]);

    // Pertahankan nomor peringkat asli saat difilter lewat pencarian
    const rankedFilteredData = useMemo(() => {
        const withRank = laporanData.map((row, idx) => ({
            ...row,
            _rank: idx,
        }));
        if (!searchQuery.trim()) return withRank;
        const q = searchQuery.toLowerCase();
        return withRank.filter(
            (r) =>
                r.satker?.nama_satker?.toLowerCase().includes(q) ||
                r.satker?.kode_satker?.toLowerCase().includes(q),
        );
    }, [laporanData, searchQuery]);

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
                    "Jumlah Target RO",
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
                    row.rincian_ro?.length || 0,
                ]);
            });
        } else {
            aoa = [
                [
                    "REKAPITULASI POIN SIRA (65 POIN), REVISI DIPA & TATA KELOLA LINTAS SATKER",
                ],
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
                    "NILAI REVISI DIPA (Maks 100)",
                    "Frekuensi Revisi Tetap",
                    "SKOR TATA KELOLA (Maks 100)",
                    "TOTAL POIN SIRA (Maks 65)",
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
                    row.nilai_ikpa === "-" ? "-" : Number(row.nilai_ikpa),
                    Number(row.evaluasi_tw?.poin?.nilai_ro || 0),
                    Number(row.evaluasi_tw?.poin?.nilai_revisi_dipa || 0),
                    Number(row.evaluasi_tw?.poin?.frekuensi_revisi_tetap || 0),
                    Number(row.tata_kelola?.skor_tata_kelola || 0),
                    Number(row.evaluasi_tw?.poin?.total_poin || 0),
                ]);
            });
        }

        const worksheet = XLSX.utils.aoa_to_sheet(aoa);
        worksheet["!cols"] = [
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
            { wch: 18 },
            { wch: 20 },
            { wch: 22 },
        ];

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

        const aoaRo = [
            [
                "RINCIAN CAPAIAN OUTPUT (RO) & SERAPAN ANGGARAN LEDGER LINTAS SATKER",
            ],
            [
                `Kumulatif s.d. Bulan: ${namaBulan[bulan]} ${tahun} (TW ${twAktif})`,
            ],
            [],
            [
                "Kode Satker",
                "Nama Satuan Kerja",
                "Kode RO",
                "Nama Rincian Output",
                "Target Volume",
                "Realisasi Volume",
                "Capaian Fisik (%)",
                "Pagu RO (Rp)",
                "Serapan Ledger (Rp)",
                "Serapan RO (%)",
                "Status Kinerja",
            ],
        ];

        laporanData.forEach((row) => {
            if (row.rincian_ro && row.rincian_ro.length > 0) {
                row.rincian_ro.forEach((ro) => {
                    aoaRo.push([
                        row.satker.kode_satker,
                        row.satker.nama_satker,
                        ro.kode_ro,
                        ro.nama_ro,
                        `${ro.target_volume} ${ro.satuan}`,
                        `${ro.realisasi_volume} ${ro.satuan}`,
                        Number(ro.persen_volume),
                        Number(ro.pagu_anggaran),
                        Number(ro.serapan_anggaran),
                        Number(ro.persen_anggaran),
                        ro.status_kinerja,
                    ]);
                });
            }
        });

        if (aoaRo.length > 4) {
            const wsRo = XLSX.utils.aoa_to_sheet(aoaRo);
            wsRo["!cols"] = [
                { wch: 15 },
                { wch: 35 },
                { wch: 18 },
                { wch: 40 },
                { wch: 18 },
                { wch: 18 },
                { wch: 15 },
                { wch: 20 },
                { wch: 20 },
                { wch: 15 },
                { wch: 18 },
            ];
            XLSX.utils.book_append_sheet(workbook, wsRo, `Rincian_RO_Satker`);
        }

        XLSX.writeFile(
            workbook,
            `Laporan_Nasional_SIRA_65Pts_${jenisLaporan}_${namaBulan[bulan]}_${tahun}.xlsx`,
        );
    };

    const handleDownloadPdf = (satkerId) => {
        window.open(
            `/api/laporan/realisasi-satker/pdf?tahun=${tahun}&satker_id=${satkerId}`,
            "_blank",
        );
    };

    const handleDownloadPdfRo = (satkerId) => {
        window.open(
            `/api/laporan/rincian-output/pdf?tahun=${tahun}&satker_id=${satkerId}`,
            "_blank",
        );
    };

    const handleExportPdfNasional = () => {
        window.open(
            `/api/laporan/bulanan/pdf?tahun=${tahun}&bulan=${bulan}`,
            "_blank",
        );
    };

    const renderRoDrawer = (row, colSpanCount) => {
        const tk = row.tata_kelola;
        const rev = row.evaluasi_tw?.revisi_dipa;

        return (
            <tr className="bg-slate-50/90 border-b border-slate-200">
                <td
                    colSpan={colSpanCount}
                    className="p-6 text-left font-sans whitespace-normal"
                >
                    <div className="bg-white rounded-[1.5rem] border border-indigo-100 shadow-inner p-5 max-w-6xl space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                                    <Layers size={16} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                                        Keterlacakan Rincian Output (RO) &amp;
                                        Tata Kelola — {row.satker.nama_satker}
                                    </h4>
                                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                        Kumulatif s.d. {namaBulan[bulan]}{" "}
                                        {tahun} • Capaian RO:{" "}
                                        <span className="text-purple-600 font-black">
                                            {formatDecimal(
                                                row.evaluasi_tw?.poin
                                                    ?.nilai_ro || 0,
                                            )}
                                            %
                                        </span>{" "}
                                        (
                                        {formatDecimal(
                                            row.evaluasi_tw?.poin
                                                ?.tertimbang_ro || 0,
                                        )}{" "}
                                        / 25 Pts) • Revisi DIPA:{" "}
                                        <span className="text-amber-600 font-black">
                                            {formatDecimal(
                                                row.evaluasi_tw?.poin
                                                    ?.tertimbang_revisi_dipa ||
                                                    0,
                                            )}{" "}
                                            / 10 Pts
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    handleDownloadPdfRo(row.satker.id)
                                }
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-200 transition-all shadow-sm self-start sm:self-auto cursor-pointer"
                            >
                                <FileText size={13} /> Cetak PDF Detail RO
                            </button>
                        </div>

                        {tk && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="p-2 bg-white text-amber-600 rounded-xl shadow-sm shrink-0">
                                            <FileClock size={15} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">
                                                Revisi DIPA (TW {twAktif})
                                            </p>
                                            <p className="text-[11px] font-bold text-slate-600 truncate">
                                                {rev?.frekuensi_pagu_tetap || 0}
                                                x Tetap • {rev?.status || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-base font-black text-amber-700 shrink-0 tabular-nums">
                                        {formatDecimal(
                                            rev?.nilai_revisi_dipa || 0,
                                        )}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="p-2 bg-white text-purple-600 rounded-xl shadow-sm shrink-0">
                                            <ShieldCheck size={15} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-purple-700">
                                                Sinkronisasi RO
                                            </p>
                                            <p className="text-[11px] font-bold text-slate-600 truncate">
                                                {tk.kesehatan_ro.ro_sehat}/
                                                {tk.kesehatan_ro.total_ro}{" "}
                                                Sinkron •{" "}
                                                {tk.kesehatan_ro.ro_anomali}{" "}
                                                Anomali
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-base font-black text-purple-700 shrink-0 tabular-nums">
                                        {formatDecimal(tk.kesehatan_ro.skor)}%
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="p-2 bg-white text-teal-600 rounded-xl shadow-sm shrink-0">
                                            <ClipboardCheck size={15} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-teal-700">
                                                Kedisiplinan Lapor
                                            </p>
                                            <p className="text-[11px] font-bold text-slate-600 truncate">
                                                Lengkap{" "}
                                                {formatDecimal(
                                                    tk.kedisiplinan
                                                        .persen_kelengkapan,
                                                )}
                                                % •{" "}
                                                {tk.kedisiplinan.total_ditolak}{" "}
                                                Ditolak
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-base font-black text-teal-700 shrink-0 tabular-nums">
                                        {formatDecimal(tk.kedisiplinan.skor)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {row.rincian_ro && row.rincian_ro.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {row.rincian_ro.map((ro) => (
                                    <div
                                        key={ro.id}
                                        className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-indigo-200 transition-all flex flex-col justify-between gap-3"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="px-2.5 py-1 bg-white text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200 shadow-sm">
                                                    {ro.kode_ro}
                                                </span>
                                                <span
                                                    className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border flex items-center gap-1 ${
                                                        ro.status_kinerja ===
                                                        "Selesai 100%"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : ro.status_kinerja ===
                                                                "Anomali Fisik"
                                                              ? "bg-amber-50 text-amber-700 border-amber-200"
                                                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                    }`}
                                                >
                                                    {ro.status_kinerja ===
                                                    "Selesai 100%" ? (
                                                        <CheckCircle2
                                                            size={11}
                                                        />
                                                    ) : ro.status_kinerja ===
                                                      "Anomali Fisik" ? (
                                                        <AlertTriangle
                                                            size={11}
                                                        />
                                                    ) : (
                                                        <Activity size={11} />
                                                    )}
                                                    {ro.status_kinerja}
                                                </span>
                                            </div>
                                            <p className="text-xs font-extrabold text-slate-800 leading-snug">
                                                {ro.nama_ro}
                                            </p>
                                        </div>

                                        <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                                    <span className="text-slate-500 flex items-center gap-1">
                                                        <Target
                                                            size={11}
                                                            className="text-emerald-500"
                                                        />{" "}
                                                        Fisik:{" "}
                                                        {ro.realisasi_volume} /{" "}
                                                        {ro.target_volume}{" "}
                                                        {ro.satuan}
                                                    </span>
                                                    <span className="text-emerald-600 font-black">
                                                        {ro.persen_volume}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-emerald-500 h-full rounded-full"
                                                        style={{
                                                            width: `${Math.min(ro.persen_volume, 100)}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                                    <span className="text-slate-500">
                                                        Serapan Ledger:{" "}
                                                        <strong className="text-slate-700">
                                                            Rp{" "}
                                                            {formatRp(
                                                                ro.serapan_anggaran,
                                                            )}
                                                        </strong>{" "}
                                                        / Rp{" "}
                                                        {formatRp(
                                                            ro.pagu_anggaran,
                                                        )}
                                                    </span>
                                                    <span className="text-blue-600 font-black">
                                                        {ro.persen_anggaran}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-blue-500 h-full rounded-full"
                                                        style={{
                                                            width: `${Math.min(ro.persen_anggaran, 100)}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-400 text-xs font-bold">
                                Satuan Kerja ini belum mendaftarkan Target
                                Rincian Output (RO) pada tahun {tahun}.
                            </div>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    const totalCols = jenisLaporan === "murni_realisasi" ? 8 : 15;

    return (
        <MainLayout tahun={tahun}>
            <style>{`
                .glass-card { background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
                .custom-scrollbar::-webkit-scrollbar { height: 10px; width: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #f8fafc; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

            <div className="space-y-6 font-sans text-slate-700 relative min-h-screen pb-10">
                <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none -z-10"></div>

                {/* =====================================================================
                    1. HERO COMMAND BAR (2 BARIS TERSTRUKTUR — ANTI TUMPANG TINDIH)
                ===================================================================== */}
                <div className="glass-card p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 relative z-10 space-y-5">
                    {/* BARIS 1: JUDUL + TOMBOL EKSPOR NASIONAL */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="p-3.5 bg-gradient-to-br from-amber-500 via-orange-500 to-indigo-600 text-white rounded-2xl shadow-[0_10px_24px_rgba(245,158,11,0.28)] shrink-0">
                                <CalendarSearch size={26} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                                        Leaderboard Nasional
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-widest">
                                        Kanwil • 65 Pts
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                                    Klasemen Poin SIRA (65 Pts), Revisi DIPA,
                                    Tata Kelola &amp; Keterlacakan RO seluruh
                                    Satuan Kerja.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={handleExportPdfNasional}
                                disabled={laporanData.length === 0 || loading}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <FileText size={15} /> PDF Nasional
                            </button>
                            <button
                                type="button"
                                onClick={handleExportExcel}
                                disabled={laporanData.length === 0 || loading}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <FileSpreadsheet size={15} /> Excel (+Sheet RO)
                            </button>
                        </div>
                    </div>

                    <div className="h-px w-full bg-slate-200/70"></div>

                    {/* BARIS 2: FORM FILTER GRID 12 KOLOM */}
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
                                        Poin SIRA 65 (IKPA + RO + Revisi)
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
                                Tahun
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

                        <div className="lg:col-span-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                Kumulatif s.d. Bulan
                            </label>
                            <div className="relative">
                                <CalendarSearch
                                    size={14}
                                    className="text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                                <select
                                    value={bulan}
                                    onChange={(e) => setBulan(e.target.value)}
                                    className="w-full pl-9 pr-9 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 cursor-pointer outline-none appearance-none"
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {namaBulan[i + 1]}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={15}
                                    className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-3">
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
                                        Menyusun...
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp size={16} /> Tampilkan
                                        Klasemen
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-sm flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-rose-100 rounded-xl shrink-0">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <p className="font-bold">{errorMsg}</p>
                    </div>
                )}

                {/* =====================================================================
                    2. 4 KARTU KPI RINGKASAN NASIONAL (STACKED EXECUTIVE)
                ===================================================================== */}
                {!loading && laporanData.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
                        <div className="bg-[#0B1120] p-5 rounded-[1.75rem] border border-amber-500/30 shadow-lg flex flex-col justify-between gap-2 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                                    Peringkat #1 Kanwil
                                </p>
                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                                    <Trophy size={17} />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3
                                    title={
                                        nationalStats.topSatker?.satker
                                            ?.nama_satker
                                    }
                                    className="text-base font-black text-white truncate"
                                >
                                    {nationalStats.topSatker?.satker
                                        ?.nama_satker || "-"}
                                </h3>
                                <p className="text-[11px] font-black text-amber-400 mt-1 tabular-nums">
                                    Skor:{" "}
                                    {formatDecimal(
                                        nationalStats.topSatker?.evaluasi_tw
                                            ?.poin?.total_poin || 0,
                                    )}{" "}
                                    / 65 Pts
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Total Pagu Efektif
                                </p>
                                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                    <Wallet size={17} />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3
                                    title={formatCurrencyFull(
                                        nationalStats.totalPagu,
                                    )}
                                    className="text-lg 2xl:text-xl font-black text-slate-900 tabular-nums truncate"
                                >
                                    {formatCurrencyFull(
                                        nationalStats.totalPagu,
                                    )}
                                </h3>
                                <p className="text-[10px] font-semibold text-slate-400 mt-1">
                                    Agregat {nationalStats.totalSatker} Satuan
                                    Kerja
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Total Realisasi Kanwil
                                </p>
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <TrendingUp size={17} />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3
                                    title={formatCurrencyFull(
                                        nationalStats.totalRealisasi,
                                    )}
                                    className="text-lg 2xl:text-xl font-black text-emerald-700 tabular-nums truncate"
                                >
                                    {formatCurrencyFull(
                                        nationalStats.totalRealisasi,
                                    )}
                                </h3>
                                <p className="text-[10px] font-bold text-emerald-600 mt-1">
                                    Serapan Nasional:{" "}
                                    {formatDecimal(nationalStats.persenSerap)}%
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Rata-Rata SIRA &amp; TK
                                </p>
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <ShieldCheck size={17} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-indigo-700 tabular-nums">
                                    {formatDecimal(nationalStats.avgPoin)}{" "}
                                    <span className="text-xs font-bold text-slate-400">
                                        / 65
                                    </span>
                                </h3>
                                <p className="text-[10px] font-bold text-teal-600 mt-1">
                                    Rata-Rata Tata Kelola:{" "}
                                    {formatDecimal(nationalStats.avgTk)} / 100
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* =====================================================================
                    3. TABEL LEADERBOARD NASIONAL
                ===================================================================== */}
                <div className="glass-card rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden relative z-10">
                    <div className="p-5 sm:px-6 border-b border-slate-100 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                                <TrendingUp size={20} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                                    Rekapitulasi s.d.{" "}
                                    <span className="text-indigo-600">
                                        {namaBulan[bulan]} {tahun}
                                    </span>
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {twAktif && (
                                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-200">
                                            Posisi TW {twAktif}
                                        </span>
                                    )}
                                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100 inline-flex items-center gap-1">
                                        <Layers size={11} /> Klik baris Satker
                                        untuk laci RO &amp; Tata Kelola
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full lg:w-72 shrink-0">
                            <Search
                                size={14}
                                className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            />
                            <input
                                type="text"
                                placeholder="Cari Satker di klasemen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 placeholder:font-normal"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar max-h-[700px] relative">
                        <table className="min-w-full divide-y divide-slate-200 text-[11px] border-collapse relative">
                            <thead className="bg-[#0A192F] text-slate-300 text-[10px] uppercase font-black tracking-widest text-center shadow-md sticky top-0 z-30">
                                {jenisLaporan === "murni_realisasi" ? (
                                    <tr>
                                        <th className="px-5 py-4 text-left border-r border-slate-700 bg-slate-900 sticky left-0 z-40">
                                            Satuan Kerja &amp; RO
                                        </th>
                                        <th className="px-5 py-4 text-right border-r border-slate-700">
                                            Pagu Efektif
                                        </th>
                                        <th className="px-5 py-4 text-right border-r border-slate-700 bg-emerald-900/30">
                                            Realisasi 51
                                        </th>
                                        <th className="px-5 py-4 text-right border-r border-slate-700 bg-emerald-900/30">
                                            Realisasi 52
                                        </th>
                                        <th className="px-5 py-4 text-right border-r border-slate-700 bg-emerald-900/30">
                                            Realisasi 53
                                        </th>
                                        <th className="px-5 py-4 text-right bg-emerald-900/60 border-l border-slate-700 text-white">
                                            Total Realisasi
                                        </th>
                                        <th className="px-5 py-4 bg-emerald-900/60 border-x border-slate-700 text-white">
                                            % Serap
                                        </th>
                                        <th className="px-5 py-4">
                                            Cetak Rapor
                                        </th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th
                                            className="px-5 py-4 text-left align-middle border-r border-slate-700 bg-slate-900 sticky left-0 z-40"
                                            rowSpan="2"
                                        >
                                            Satuan Kerja &amp; RO
                                        </th>
                                        <th
                                            className="px-5 py-4 text-right border-r border-slate-700 align-middle"
                                            rowSpan="2"
                                        >
                                            Pagu Efektif
                                        </th>
                                        <th
                                            className="px-5 py-4 text-right text-indigo-300 bg-indigo-900/50 align-middle border-r border-slate-700"
                                            rowSpan="2"
                                        >
                                            Total RPD
                                        </th>
                                        <th
                                            className="px-5 py-4 text-right text-emerald-300 bg-emerald-900/50 align-middle border-r border-slate-700"
                                            rowSpan="2"
                                        >
                                            Total Realisasi
                                        </th>
                                        <th
                                            className="px-5 py-4 text-right text-rose-300 bg-rose-900/50 border-r border-slate-700 align-middle leading-tight"
                                            rowSpan="2"
                                        >
                                            Selisih
                                            <br />
                                            Nominal
                                        </th>
                                        <th
                                            className="px-5 py-4 text-center align-middle border-r border-slate-700 bg-slate-800 leading-tight"
                                            rowSpan="2"
                                        >
                                            Deviasi
                                            <br />
                                            Tertimbang
                                        </th>
                                        <th
                                            className="px-5 py-2.5 border-r border-slate-700 bg-blue-900/50"
                                            colSpan="3"
                                        >
                                            Status Penyerapan Nasional (TW{" "}
                                            {twAktif})
                                        </th>
                                        <th
                                            className="px-4 py-4 bg-slate-800 text-slate-300 border-r border-slate-700 align-middle leading-tight"
                                            rowSpan="2"
                                        >
                                            Hal. III DIPA
                                            <div className="text-[8px] text-slate-400 mt-1 font-bold">
                                                Bobot 10%
                                            </div>
                                        </th>
                                        <th
                                            className="px-4 py-4 bg-purple-900/50 text-purple-300 border-r border-slate-700 align-middle leading-tight"
                                            rowSpan="2"
                                        >
                                            Capaian RO
                                            <div className="text-[8px] text-purple-300/60 mt-1 font-bold">
                                                Bobot 25%
                                            </div>
                                        </th>
                                        <th
                                            className="px-4 py-4 bg-amber-900/40 text-amber-300 border-r border-slate-700 align-middle leading-tight"
                                            rowSpan="2"
                                        >
                                            Revisi DIPA
                                            <div className="text-[8px] text-amber-300/60 mt-1 font-bold">
                                                Bobot 10%
                                            </div>
                                        </th>
                                        <th
                                            className="px-4 py-4 bg-teal-900/40 text-teal-300 border-r border-slate-700 align-middle leading-tight"
                                            rowSpan="2"
                                        >
                                            Tata Kelola
                                            <div className="text-[8px] text-teal-300/60 mt-1 font-bold">
                                                Internal /100
                                            </div>
                                        </th>
                                        <th
                                            className="px-5 py-4 bg-yellow-500/20 text-yellow-400 border-r border-slate-700 align-middle leading-tight"
                                            rowSpan="2"
                                        >
                                            TOTAL POIN
                                            <div className="text-[8px] text-yellow-400/70 mt-1 font-bold">
                                                SIRA (Maks 65)
                                            </div>
                                        </th>
                                        <th
                                            className="px-5 py-4 align-middle"
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
                                            colSpan={totalCols}
                                            className="px-6 py-20 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mb-3"></div>
                                            <p className="text-xs font-black text-slate-400 tracking-widest uppercase">
                                                Menyusun Leaderboard 65 Poin...
                                            </p>
                                        </td>
                                    </tr>
                                ) : rankedFilteredData.length > 0 ? (
                                    rankedFilteredData.map((row) => {
                                        const index = row._rank;
                                        let medalStyle =
                                            "bg-slate-100 text-slate-500 border-slate-200";
                                        let iconMedal = (
                                            <span className="font-mono text-xs">
                                                {index + 1}
                                            </span>
                                        );
                                        let pointStyle = "text-rose-600";
                                        let rowGlow = "";

                                        const totalPoin =
                                            row.evaluasi_tw?.poin?.total_poin ||
                                            0;

                                        if (index === 0) {
                                            medalStyle =
                                                "bg-gradient-to-br from-yellow-300 to-amber-500 text-white border-yellow-400 shadow-[0_0_12px_rgba(252,211,77,0.7)]";
                                            iconMedal = (
                                                <Crown
                                                    size={16}
                                                    strokeWidth={2.5}
                                                />
                                            );
                                            pointStyle = "text-amber-600";
                                            rowGlow =
                                                "bg-gradient-to-r from-yellow-50/50 to-transparent";
                                        } else if (index === 1) {
                                            medalStyle =
                                                "bg-gradient-to-br from-slate-300 to-slate-400 text-white border-slate-400";
                                            iconMedal = (
                                                <Medal
                                                    size={16}
                                                    strokeWidth={2.5}
                                                />
                                            );
                                            pointStyle = "text-slate-700";
                                            rowGlow = "bg-slate-50/50";
                                        } else if (index === 2) {
                                            medalStyle =
                                                "bg-gradient-to-br from-orange-300 to-amber-600 text-white border-orange-400";
                                            iconMedal = (
                                                <Medal
                                                    size={16}
                                                    strokeWidth={2.5}
                                                />
                                            );
                                            pointStyle = "text-orange-600";
                                            rowGlow = "bg-orange-50/20";
                                        } else if (totalPoin >= 54) {
                                            pointStyle = "text-emerald-600";
                                        } else if (totalPoin >= 42) {
                                            pointStyle = "text-amber-500";
                                        }

                                        const isExpanded =
                                            expandedSatkers.includes(
                                                row.satker.id,
                                            );
                                        const roCount =
                                            row.rincian_ro?.length || 0;
                                        const anomaliCount =
                                            row.rincian_ro?.filter(
                                                (r) =>
                                                    r.status_kinerja ===
                                                    "Anomali Fisik",
                                            ).length || 0;
                                        const skorTk =
                                            row.tata_kelola?.skor_tata_kelola ||
                                            0;

                                        return (
                                            <React.Fragment key={row.satker.id}>
                                                <tr
                                                    className={`hover:bg-indigo-50/60 transition-colors group whitespace-nowrap ${rowGlow} ${
                                                        isExpanded
                                                            ? "bg-indigo-50/50"
                                                            : ""
                                                    }`}
                                                >
                                                    <td
                                                        onClick={() =>
                                                            toggleSatkerRow(
                                                                row.satker.id,
                                                            )
                                                        }
                                                        className="px-5 py-4 flex items-center justify-between gap-4 border-r border-slate-100 bg-white sticky left-0 z-20 group-hover:bg-indigo-50/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] cursor-pointer select-none"
                                                        title="Klik untuk membuka Rincian Output (RO) & Tata Kelola Satker ini"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`w-9 h-9 flex items-center justify-center rounded-xl font-black border shrink-0 ${medalStyle}`}
                                                            >
                                                                {iconMedal}
                                                            </div>
                                                            <div>
                                                                <div
                                                                    className={`text-xs sm:text-sm ${
                                                                        index <=
                                                                        2
                                                                            ? "font-black text-slate-900"
                                                                            : "font-bold text-slate-700"
                                                                    }`}
                                                                >
                                                                    {
                                                                        row
                                                                            .satker
                                                                            .nama_satker
                                                                    }
                                                                </div>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                                                        {
                                                                            row
                                                                                .satker
                                                                                .kode_satker
                                                                        }
                                                                    </span>
                                                                    <span
                                                                        className={`px-1.5 py-0.5 text-[9px] font-black rounded-md border ${
                                                                            roCount >
                                                                            0
                                                                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                                                                : "bg-slate-100 text-slate-400 border-slate-200"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            roCount
                                                                        }{" "}
                                                                        RO
                                                                    </span>
                                                                    {anomaliCount >
                                                                        0 && (
                                                                        <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                                                                            {
                                                                                anomaliCount
                                                                            }{" "}
                                                                            Anomali
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={`p-1.5 rounded-lg border transition-colors ${
                                                                isExpanded
                                                                    ? "bg-indigo-600 text-white border-indigo-600"
                                                                    : "bg-slate-50 text-slate-400 border-slate-200 group-hover:text-indigo-600"
                                                            }`}
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronUp
                                                                    size={14}
                                                                    strokeWidth={
                                                                        3
                                                                    }
                                                                />
                                                            ) : (
                                                                <ChevronDown
                                                                    size={14}
                                                                    strokeWidth={
                                                                        3
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-black text-slate-600 border-r border-slate-100 bg-slate-50/30 text-xs tabular-nums">
                                                        Rp{" "}
                                                        {formatRp(
                                                            row.pagu_efektif,
                                                        )}
                                                    </td>

                                                    {jenisLaporan ===
                                                    "murni_realisasi" ? (
                                                        <>
                                                            <td className="px-5 py-4 text-right font-bold text-slate-500 border-r border-slate-100 tabular-nums">
                                                                {formatRp(
                                                                    row.realisasi_gaji,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 text-right font-bold text-slate-500 border-r border-slate-100 tabular-nums">
                                                                {formatRp(
                                                                    row.realisasi_barang,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 text-right font-bold text-slate-500 border-r border-slate-100 tabular-nums">
                                                                {formatRp(
                                                                    row.realisasi_modal,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 text-right font-black text-emerald-700 bg-emerald-50/30 border-r border-slate-100 text-xs tabular-nums">
                                                                {formatRp(
                                                                    row.total_realisasi,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 text-center bg-emerald-50/10 border-r border-slate-100">
                                                                <span
                                                                    className={`px-2.5 py-1 inline-flex text-[11px] font-black rounded-lg border ${
                                                                        row.persentase_penyerapan >=
                                                                        50
                                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                            : "bg-rose-100 text-rose-700 border-rose-200"
                                                                    }`}
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
                                                            <td className="px-5 py-4 text-right font-bold text-indigo-700 bg-indigo-50/40 border-r border-slate-100 tabular-nums">
                                                                {formatRp(
                                                                    row.total_rpd,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 text-right font-bold text-emerald-700 bg-emerald-50/40 border-r border-slate-100 tabular-nums">
                                                                {formatRp(
                                                                    row.total_realisasi,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 text-right font-bold text-rose-600 bg-rose-50/40 border-r border-slate-100 tabular-nums">
                                                                {formatRp(
                                                                    row.total_deviasi,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 text-center font-bold text-slate-700 border-r border-slate-100 bg-slate-50/50 tabular-nums">
                                                                {formatDecimal(
                                                                    row.deviasi_tertimbang_kumulatif,
                                                                )}{" "}
                                                                %
                                                            </td>

                                                            {[
                                                                "51",
                                                                "52",
                                                                "53",
                                                            ].map((kode) => {
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
                                                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200">
                                                                                TERCAPAI
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200">
                                                                                GAGAL
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}

                                                            <td className="px-4 py-4 text-center bg-slate-50/80 border-r border-slate-100 font-black text-slate-700 text-xs tabular-nums">
                                                                <div>
                                                                    {formatDecimal(
                                                                        row.nilai_ikpa,
                                                                    )}
                                                                </div>
                                                                <div className="text-[9px] font-bold text-slate-400">
                                                                    (
                                                                    {formatDecimal(
                                                                        row
                                                                            .evaluasi_tw
                                                                            ?.poin
                                                                            ?.tertimbang_hal_iii ||
                                                                            0,
                                                                    )}{" "}
                                                                    pts)
                                                                </div>
                                                            </td>

                                                            <td
                                                                onClick={() =>
                                                                    toggleSatkerRow(
                                                                        row
                                                                            .satker
                                                                            .id,
                                                                    )
                                                                }
                                                                className="px-4 py-4 text-center bg-purple-50/30 hover:bg-purple-100/50 border-r border-slate-100 font-black text-purple-700 text-xs cursor-pointer transition-colors tabular-nums"
                                                                title="Klik untuk membuka laci rincian RO"
                                                            >
                                                                <div>
                                                                    {formatDecimal(
                                                                        row
                                                                            .evaluasi_tw
                                                                            ?.poin
                                                                            ?.nilai_ro ||
                                                                            0,
                                                                    )}
                                                                </div>
                                                                <div className="text-[9px] font-bold text-purple-500">
                                                                    (
                                                                    {formatDecimal(
                                                                        row
                                                                            .evaluasi_tw
                                                                            ?.poin
                                                                            ?.tertimbang_ro ||
                                                                            0,
                                                                    )}{" "}
                                                                    pts)
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-4 text-center bg-amber-50/30 border-r border-slate-100 font-black text-amber-700 text-xs tabular-nums">
                                                                <div>
                                                                    {formatDecimal(
                                                                        row
                                                                            .evaluasi_tw
                                                                            ?.poin
                                                                            ?.nilai_revisi_dipa ||
                                                                            0,
                                                                    )}
                                                                </div>
                                                                <div className="text-[9px] font-bold text-amber-600">
                                                                    (
                                                                    {formatDecimal(
                                                                        row
                                                                            .evaluasi_tw
                                                                            ?.poin
                                                                            ?.tertimbang_revisi_dipa ||
                                                                            0,
                                                                    )}{" "}
                                                                    pts •{" "}
                                                                    {row
                                                                        .evaluasi_tw
                                                                        ?.poin
                                                                        ?.frekuensi_revisi_tetap ||
                                                                        0}
                                                                    x)
                                                                </div>
                                                            </td>

                                                            <td
                                                                onClick={() =>
                                                                    toggleSatkerRow(
                                                                        row
                                                                            .satker
                                                                            .id,
                                                                    )
                                                                }
                                                                className="px-4 py-4 text-center bg-teal-50/30 hover:bg-teal-100/50 border-r border-slate-100 cursor-pointer transition-colors"
                                                                title="Klik untuk melihat detail Sinkronisasi RO & Disiplin Pelaporan"
                                                            >
                                                                <span
                                                                    className={`px-2.5 py-1 rounded-lg text-xs font-black border tabular-nums ${
                                                                        skorTk >=
                                                                        85
                                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                            : skorTk >=
                                                                                65
                                                                              ? "bg-teal-100 text-teal-700 border-teal-200"
                                                                              : "bg-amber-100 text-amber-700 border-amber-200"
                                                                    }`}
                                                                >
                                                                    {formatDecimal(
                                                                        skorTk,
                                                                    )}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-4 text-center bg-amber-50/20 border-r border-slate-100">
                                                                <span
                                                                    className={`text-lg font-black tabular-nums ${pointStyle}`}
                                                                >
                                                                    {formatDecimal(
                                                                        totalPoin,
                                                                    )}
                                                                </span>
                                                                <div className="text-[9px] font-bold text-slate-400">
                                                                    / 65 Pts
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}

                                                    <td className="px-4 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDownloadPdf(
                                                                        row
                                                                            .satker
                                                                            .id,
                                                                    )
                                                                }
                                                                className="inline-flex items-center justify-center p-2 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-100 cursor-pointer shadow-sm"
                                                                title="Cetak PDF Rapor Eksekutif IKPA Satker"
                                                            >
                                                                <DownloadCloud
                                                                    size={15}
                                                                    strokeWidth={
                                                                        2.5
                                                                    }
                                                                />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDownloadPdfRo(
                                                                        row
                                                                            .satker
                                                                            .id,
                                                                    )
                                                                }
                                                                className="inline-flex items-center justify-center p-2 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-xl transition-all border border-purple-100 cursor-pointer shadow-sm"
                                                                title="Cetak PDF Detail RO Satker"
                                                            >
                                                                <FileText
                                                                    size={15}
                                                                    strokeWidth={
                                                                        2.5
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isExpanded &&
                                                    renderRoDrawer(
                                                        row,
                                                        totalCols,
                                                    )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={totalCols}
                                            className="px-6 py-20 text-center"
                                        >
                                            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                <AlertTriangle size={28} />
                                            </div>
                                            <p className="text-sm font-black text-slate-600">
                                                {laporanData.length > 0
                                                    ? "Satker Tidak Ditemukan"
                                                    : "Data Belum Tersedia"}
                                            </p>
                                            <p className="text-xs font-medium text-slate-400 mt-1">
                                                {laporanData.length > 0
                                                    ? "Coba ubah kata kunci pencarian Satker."
                                                    : "Belum ada aktivitas anggaran di periode ini."}
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
