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
    CheckCircle2,
    XCircle,
    Star,
    Wallet,
    Info,
    Download,
    Activity,
    ShieldCheck,
    Medal,
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

    // 🔥 LOGIKA GRADE RAPOR (SANGAT BAIK, BAIK, CUKUP, KURANG)
    const getGrade = (poin) => {
        if (poin === "-" || !poin)
            return {
                letter: "?",
                color: "text-slate-400",
                bg: "bg-slate-500/20",
                label: "Belum Ada Data",
                glow: "",
            };
        const p = parseFloat(poin);
        if (p >= 50)
            return {
                letter: "A",
                color: "text-emerald-400",
                bg: "bg-emerald-500/20",
                label: "Sangat Baik",
                glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
                border: "border-emerald-500/30",
            };
        if (p >= 40)
            return {
                letter: "B",
                color: "text-blue-400",
                bg: "bg-blue-500/20",
                label: "Baik",
                glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
                border: "border-blue-500/30",
            };
        if (p >= 30)
            return {
                letter: "C",
                color: "text-amber-400",
                bg: "bg-amber-500/20",
                label: "Cukup",
                glow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
                border: "border-amber-500/30",
            };
        return {
            letter: "D",
            color: "text-rose-400",
            bg: "bg-rose-500/20",
            label: "Kurang",
            glow: "shadow-[0_0_30px_rgba(225,29,72,0.3)]",
            border: "border-rose-500/30",
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
                ["LAPORAN RINCIAN REALISASI DAN IKPA"],
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
                aoa.push([]);
                aoa.push([]);
                aoa.push([
                    "EVALUASI TARGET PENYERAPAN KEMENKEU & POIN SIRA (PER TRIWULAN)",
                ]);
                aoa.push([
                    "Triwulan",
                    "Jenis Belanja",
                    "Realisasi Kumulatif (Rp)",
                    "Target Minimal Kemenkeu (%)",
                    "Target Nominal Kemenkeu (Rp)",
                    "Aktual Penyerapan (%)",
                    "Status",
                    "",
                    "Nilai Penyerapan (Maks 100)",
                    "Poin Penyerapan (Bobot 20%)",
                    "Nilai IKPA Hal III (Maks 100)",
                    "Poin Hal III (Bobot 10%)",
                    "Nilai Capaian RO (Maks 100)",
                    "Poin Capaian RO (Bobot 25%)",
                    "TOTAL POIN SIRA (Maks 55)",
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
            <div className="space-y-6 font-sans text-slate-700 relative overflow-hidden min-h-screen pb-12">
                {/* --- AMBIENT BACKGROUND GLOW --- */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10"></div>
                <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

                {/* --- HEADER & FILTER SECTION (GLASSMORPHISM) --- */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white/70 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                    <div className="flex-1 min-w-[300px] relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] border border-indigo-400/30">
                                <Building2 size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 tracking-tight leading-tight">
                                    Rapor Kinerja Satker
                                </h2>
                                <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
                                    Analisis Komprehensif 55 Poin SIRA (Hal III,
                                    Penyerapan, & Output).
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
                                className="w-full bg-white/90 backdrop-blur border border-slate-200/80 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                        </div>
                        <div className="flex-1 min-w-[240px]">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Satuan Kerja
                            </label>
                            <select
                                value={satkerId}
                                onChange={(e) => setSatkerId(e.target.value)}
                                className="w-full bg-white/90 backdrop-blur border border-slate-200/80 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/20 cursor-pointer transition-all outline-none"
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
                            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${loading ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1 outline-none"}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />{" "}
                                    Menyinkronkan...
                                </>
                            ) : (
                                <>
                                    <Activity size={18} /> Tampilkan Data
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {errorMsg && (
                    <div className="p-5 bg-rose-50/90 backdrop-blur text-rose-700 border border-rose-200 rounded-[1.5rem] text-sm flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-2 bg-rose-100 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <p className="font-bold">{errorMsg}</p>
                    </div>
                )}

                {/* --- SUMMARY CARDS --- */}
                {laporanData && summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 animate-in fade-in slide-in-from-bottom-8 duration-500 relative z-10">
                        {/* 🔥 SUPER CARD: RAPOR KINERJA & TOTAL POIN SIRA 🔥 */}
                        <div
                            className={`xl:col-span-2 bg-[#0B1120] p-7 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex items-center justify-between relative overflow-hidden group border ${grade.border}`}
                        >
                            <div
                                className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[60px] pointer-events-none transition-colors duration-700 ${grade.bg}`}
                            ></div>

                            <div className="flex items-center gap-6 relative z-10">
                                <div
                                    className={`w-24 h-24 rounded-[1.8rem] flex items-center justify-center border backdrop-blur-sm shadow-inner relative overflow-hidden ${grade.bg} ${grade.border} ${grade.color} ${grade.glow}`}
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                                    <span className="text-5xl font-black drop-shadow-md">
                                        {grade.letter}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                        Total Poin SIRA Satker
                                    </p>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <h3
                                            className={`text-5xl font-black tracking-tight ${grade.color}`}
                                        >
                                            {formatDecimal(
                                                summary.totalPoinSira,
                                            )}
                                        </h3>
                                        <span className="text-lg font-bold text-slate-500">
                                            / 55
                                        </span>
                                    </div>
                                    <div
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${grade.bg} ${grade.border} ${grade.color}`}
                                    >
                                        <ShieldCheck
                                            size={12}
                                            strokeWidth={2.5}
                                        />{" "}
                                        Grade: {grade.label}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* KARTU: PAGU EFEKTIF */}
                        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                <Wallet size={100} />
                            </div>
                            <div className="flex items-center gap-4 mb-3 relative z-10">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner bg-slate-100 text-slate-500">
                                    <Wallet size={22} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                    Total Pagu
                                    <br />
                                    Efektif
                                </h3>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 relative z-10 truncate">
                                {formatRp(laporanData.pagu_efektif)}
                            </h2>
                        </div>

                        {/* KARTU: NILAI IKPA */}
                        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                <Award size={100} />
                            </div>
                            <div className="flex items-center gap-4 mb-3 relative z-10">
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${typeof summary.finalIkpa !== "number" ? "bg-slate-100 text-slate-400" : summary.finalIkpa >= 95 ? "bg-emerald-50 text-emerald-500" : summary.finalIkpa >= 85 ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"}`}
                                >
                                    <Award size={22} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                    Nilai Hal.
                                    <br />
                                    III DIPA
                                </h3>
                            </div>
                            <h2
                                className={`text-4xl font-black relative z-10 tracking-tight ${typeof summary.finalIkpa !== "number" ? "text-slate-400" : summary.finalIkpa >= 95 ? "text-emerald-600" : summary.finalIkpa >= 85 ? "text-amber-500" : "text-rose-600"}`}
                            >
                                {formatDecimal(summary.finalIkpa)}
                            </h2>
                        </div>

                        {/* KARTU: TOTAL REALISASI */}
                        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-emerald-500">
                                <TrendingUp size={100} />
                            </div>
                            <div className="flex items-center gap-4 mb-3 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                                    <TrendingUp size={22} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                    Total Aktual
                                    <br />
                                    Realisasi
                                </h3>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 relative z-10 truncate">
                                {formatRp(summary.totRealisasi)}
                            </h2>
                        </div>
                    </div>
                )}

                {/* --- TABEL DETAIL IKPA (PREMIUM DATA GRID) --- */}
                {laporanData && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-700 relative z-10 mt-6">
                        {/* GLASSMORPHISM EXPORT PANEL */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 p-6 md:p-8 border-b border-slate-100/60 bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {jenisLaporan === "murni_realisasi"
                                        ? "Rincian Murni Realisasi"
                                        : "Grid Analisis Indikator Halaman III DIPA"}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                                        Satker:{" "}
                                        <span className="text-indigo-600 font-black">
                                            {laporanData.satker.nama_satker}
                                        </span>
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                                        Pagu Evaluasi Kemenkeu (Kotor):{" "}
                                        <span className="text-emerald-600 font-black">
                                            Rp{" "}
                                            {formatRp(laporanData.pagu_total)}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 w-full md:w-auto bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                                <button
                                    onClick={() =>
                                        window.open(
                                            `/api/laporan/rincian-output/pdf?tahun=${tahun}&satker_id=${satkerId}`,
                                            "_blank",
                                        )
                                    }
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-600 hover:bg-purple-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 outline-none"
                                >
                                    <FileText size={16} /> PDF R.O.
                                </button>
                                <button
                                    onClick={handleExportPdf}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 outline-none"
                                >
                                    <Download size={16} /> PDF IKPA
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 outline-none"
                                >
                                    <FileSpreadsheet size={16} /> Excel
                                </button>
                            </div>
                        </div>

                        {/* STICKY DATA GRID */}
                        <div className="overflow-x-auto custom-scrollbar max-h-[600px] relative">
                            <table className="min-w-full divide-y divide-slate-200 text-[11px] border-collapse relative">
                                {jenisLaporan === "murni_realisasi" ? (
                                    <>
                                        <thead className="bg-[#0A192F] text-white text-center font-bold sticky top-0 z-20 shadow-md">
                                            <tr>
                                                <th className="px-5 py-4 border-r border-slate-700 align-middle tracking-wider uppercase text-[10px]">
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
                                                    % Serap (Pagu Efektif)
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
                                                    return (
                                                        <tr
                                                            key={row.bulan}
                                                            className="hover:bg-slate-50 text-right transition-colors font-mono group whitespace-nowrap"
                                                        >
                                                            <td className="px-5 py-4 border-r border-slate-100 text-center font-sans font-black text-slate-900 bg-slate-50/50">
                                                                {namaBulan[
                                                                    row.bulan
                                                                ].toUpperCase()}
                                                            </td>
                                                            <td className="px-5 py-4 border-r border-slate-100 font-bold text-slate-600">
                                                                {formatRp(
                                                                    row
                                                                        .realisasi
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 border-r border-slate-100 font-bold text-slate-600">
                                                                {formatRp(
                                                                    row
                                                                        .realisasi
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 border-r border-slate-100 font-bold text-slate-600">
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
                                                                    className={`px-3 py-1.5 inline-flex text-xs font-black rounded-lg border shadow-sm ${persenSerap >= 50 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}`}
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
                                        <thead className="bg-[#0A192F] text-white text-center font-bold sticky top-0 z-20 shadow-md">
                                            <tr className="uppercase tracking-widest text-[9px]">
                                                <th
                                                    rowSpan="2"
                                                    className="px-3 py-3 border-r border-slate-700 align-middle bg-slate-900 sticky left-0 z-30"
                                                >
                                                    Bulan
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
                                                                "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm";
                                                        else if (row.ikpa >= 85)
                                                            ikpaColor =
                                                                "bg-amber-100 text-amber-700 border-amber-200 shadow-sm";
                                                        else
                                                            ikpaColor =
                                                                "bg-rose-100 text-rose-700 border-rose-200 shadow-sm";
                                                    }

                                                    return (
                                                        <tr
                                                            key={row.bulan}
                                                            className="hover:bg-slate-50/80 text-right transition-colors font-mono group whitespace-nowrap"
                                                        >
                                                            <td className="px-3 py-3 border-r border-slate-100 text-center font-sans font-black text-slate-800 bg-slate-50 sticky left-0 z-10 group-hover:bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                                {namaBulan[
                                                                    row.bulan
                                                                ]
                                                                    .substring(
                                                                        0,
                                                                        3,
                                                                    )
                                                                    .toUpperCase()}
                                                            </td>
                                                            <td className="px-2 py-3 border-r border-slate-100 text-slate-500 font-medium">
                                                                {formatRp(
                                                                    row.rencana
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-3 border-r border-slate-100 text-slate-500 font-medium">
                                                                {formatRp(
                                                                    row.rencana
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-3 border-r border-slate-100 text-slate-500 font-medium">
                                                                {formatRp(
                                                                    row.rencana
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
                                                                    row.deviasi
                                                                        .b51,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-3 border-r border-slate-100 text-rose-500 font-medium">
                                                                {formatRp(
                                                                    row.deviasi
                                                                        .b52,
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-3 border-r border-slate-100 text-rose-500 font-medium">
                                                                {formatRp(
                                                                    row.deviasi
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

                {/* 🔥 NEON HUD EVALUASI PENYERAPAN KEMENKEU & POIN SIRA 55 POINTS 🔥 */}
                {laporanData?.evaluasi_tw && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-16 duration-700 mt-8 relative z-10">
                        <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 flex flex-col md:flex-row items-start md:items-center gap-5">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-[0_8px_16px_rgba(59,130,246,0.2)]">
                                <Target size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    Evaluasi Target & Nilai Tertimbang (Bobot
                                    SIRA)
                                </h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">
                                    Kalkulasi otomatis sumbangsih poin Hal III
                                    (10%), Penyerapan (20%), dan Output (25%).
                                </p>
                            </div>
                        </div>

                        {/* SPANDUK EDUKASI */}
                        <div className="mx-6 md:mx-8 mt-8 p-6 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-start gap-5 shadow-sm">
                            <div className="p-3 bg-indigo-100/80 rounded-2xl flex-shrink-0 text-indigo-600">
                                <Info className="w-6 h-6" strokeWidth={2.5} />
                            </div>
                            <div className="text-sm text-indigo-900 leading-relaxed">
                                <strong className="block mb-2 text-[15px] font-black text-indigo-800">
                                    Kenapa Deviasi "AMAN", tapi Penyerapan
                                    "GAGAL"?
                                </strong>
                                <ul className="list-disc pl-5 space-y-2 mt-2 font-medium">
                                    <li>
                                        <strong className="font-extrabold text-indigo-950">
                                            IKPA Penyerapan (Tabel Bawah):
                                        </strong>{" "}
                                        Bersifat absolut dan{" "}
                                        <strong>kumulatif</strong>. Kemenkeu
                                        menghitung berdasarkan Pagu Kotor.
                                        Kekurangan serap akan menjadi "Hutang
                                        Berantai" yang terus membebani TW
                                        selanjutnya jika tidak dilunasi.
                                    </li>
                                    <li>
                                        <strong className="font-extrabold text-indigo-950">
                                            IKPA Deviasi Hal. III DIPA (Tabel
                                            Atas):
                                        </strong>{" "}
                                        Hanya menilai kesesuaian{" "}
                                        <strong>
                                            Janji (RPD) vs Realisasi
                                        </strong>
                                        . Anda bisa aman di Deviasi jika janji
                                        dan pencairan sesuai, namun gagal di
                                        Penyerapan jika nominalnya di bawah
                                        target Kemenkeu.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {["I", "II", "III", "IV"].map((tw) => {
                                const evalTw = laporanData.evaluasi_tw[tw];
                                if (!evalTw) return null;
                                const p = evalTw.poin;
                                return (
                                    <div
                                        key={tw}
                                        className="border border-slate-200/80 rounded-[2rem] p-6 bg-slate-50/50 flex flex-col hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group"
                                    >
                                        <h4 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                                                <CalendarRange
                                                    size={20}
                                                    strokeWidth={2.5}
                                                />
                                            </div>{" "}
                                            TRIWULAN {tw}
                                        </h4>
                                        <div className="space-y-4 mb-6">
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
                                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${isNA ? "bg-slate-100/80 border-slate-200/80" : isLulus ? "bg-emerald-50/50 border-emerald-200 hover:shadow-[0_4px_15px_rgba(16,185,129,0.1)]" : "bg-rose-50/50 border-rose-200 hover:shadow-[0_4px_15px_rgba(244,63,94,0.1)]"}`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                                                {isNA ? (
                                                                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                                                ) : isLulus ? (
                                                                    <CheckCircle2
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="text-emerald-500"
                                                                        strokeWidth={
                                                                            2.5
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <XCircle
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="text-rose-500"
                                                                        strokeWidth={
                                                                            2.5
                                                                        }
                                                                    />
                                                                )}{" "}
                                                                Belanja {nama} (
                                                                {kode})
                                                            </span>
                                                            {!isNA && (
                                                                <span className="text-sm font-black text-slate-700 mt-1">
                                                                    Rp{" "}
                                                                    {formatRp(
                                                                        item.nominal,
                                                                    )}{" "}
                                                                    <span className="text-[11px] text-slate-400 font-bold">
                                                                        / Rp{" "}
                                                                        {formatRp(
                                                                            item.target_nominal,
                                                                        )}
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isNA ? (
                                                            <span className="text-[10px] font-black text-slate-400 px-3 py-1.5 bg-slate-200 rounded-xl tracking-widest uppercase">
                                                                Tidak Ada Pagu
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-5 text-right">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                        Target
                                                                    </span>
                                                                    <span className="text-[13px] font-black text-slate-700">
                                                                        {
                                                                            item.target_persen
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                        Aktual
                                                                    </span>
                                                                    <span
                                                                        className={`text-[13px] font-black ${isLulus ? "text-emerald-600" : "text-rose-600"}`}
                                                                    >
                                                                        {
                                                                            item.realisasi_persen
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                                <div
                                                                    className={`px-3 py-1.5 text-[10px] font-black tracking-widest rounded-xl border ${isLulus ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}`}
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

                                        <div className="mt-auto bg-[#0A192F] rounded-[1.5rem] p-6 shadow-inner border border-slate-700/80 relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5 border-b border-slate-700/80 pb-5 relative z-10">
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                        Penyerapan (20%)
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-2xl font-black text-emerald-400 tracking-tight">
                                                            {formatDecimal(
                                                                p.nilai_penyerapan,
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-bold mb-1 border-l border-slate-700 pl-2 ml-1">
                                                            <span className="text-white font-black">
                                                                {formatDecimal(
                                                                    p.tertimbang_penyerapan,
                                                                )}{" "}
                                                                pts
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                        Hal III (10%)
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-2xl font-black text-blue-400 tracking-tight">
                                                            {formatDecimal(
                                                                p.ikpa_hal_iii,
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-bold mb-1 border-l border-slate-700 pl-2 ml-1">
                                                            <span className="text-white font-black">
                                                                {formatDecimal(
                                                                    p.tertimbang_hal_iii,
                                                                )}{" "}
                                                                pts
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                        Output RO (25%)
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-2xl font-black text-purple-400 tracking-tight">
                                                            {formatDecimal(
                                                                p.nilai_ro,
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-bold mb-1 border-l border-slate-700 pl-2 ml-1">
                                                            <span className="text-white font-black">
                                                                {formatDecimal(
                                                                    p.tertimbang_ro,
                                                                )}{" "}
                                                                pts
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between relative z-10">
                                                <span className="text-[11px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Star
                                                        size={16}
                                                        className="fill-yellow-500 text-yellow-500"
                                                    />{" "}
                                                    TOTAL POIN SIRA TW {tw}
                                                </span>
                                                <span className="text-3xl font-black text-yellow-400 tracking-tight">
                                                    {formatDecimal(
                                                        p.total_poin,
                                                    )}{" "}
                                                    <span className="text-sm text-yellow-700 font-bold tracking-normal">
                                                        / 55 Pts
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
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .custom-scrollbar::-webkit-scrollbar { height: 12px; width: 12px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 3px solid #f8fafc; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                `}</style>
            </div>
        </MainLayout>
    );
}
