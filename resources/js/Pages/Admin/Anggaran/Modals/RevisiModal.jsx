import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    X,
    FileClock,
    Plus,
    Trash2,
    Loader2,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    Hash,
    Info,
} from "lucide-react";

export default function RevisiModal({ isOpen, onClose, anggaran, onSuccess }) {
    const [revisis, setRevisis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const getDefaultTw = () => {
        const m = new Date().getMonth() + 1;
        if (m <= 3) return "I";
        if (m <= 6) return "II";
        if (m <= 9) return "III";
        return "IV";
    };

    const [formData, setFormData] = useState({
        triwulan: getDefaultTw(),
        tanggal_revisi: new Date().toISOString().split("T")[0],
        nomor_revisi: "",
        jenis_revisi: "pagu_tetap",
        keterangan: "",
    });

    const fetchRevisi = async () => {
        if (!anggaran?.id) return;
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await axios.get(`/api/anggaran/${anggaran.id}/revisi`);
            setRevisis(res.data.data || []);
        } catch (err) {
            setErrorMsg("Gagal memuat riwayat revisi DIPA.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && anggaran) {
            fetchRevisi();
            setFormData({
                triwulan: getDefaultTw(),
                tanggal_revisi: new Date().toISOString().split("T")[0],
                nomor_revisi: "",
                jenis_revisi: "pagu_tetap",
                keterangan: "",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, anggaran]);

    // Simulasi skor IKPA Revisi DIPA per TW secara real-time
    const ringkasanTw = useMemo(() => {
        const list = ["I", "II", "III", "IV"];
        return list.map((tw) => {
            const tetap = revisis.filter(
                (r) => r.triwulan === tw && r.jenis_revisi === "pagu_tetap",
            ).length;
            const berubah = revisis.filter(
                (r) => r.triwulan === tw && r.jenis_revisi === "pagu_berubah",
            ).length;
            const skor =
                tetap <= 1 ? 100 : Math.round((100 / tetap) * 100) / 100;
            return { tw, tetap, berubah, skor };
        });
    }, [revisis]);

    const skorRataTahunan = useMemo(() => {
        const sum = ringkasanTw.reduce((acc, item) => acc + item.skor, 0);
        return (sum / 4).toFixed(2);
    }, [ringkasanTw]);

    if (!isOpen || !anggaran) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            if (name === "tanggal_revisi" && value) {
                const month = parseInt(value.split("-")[1], 10);
                if (!isNaN(month)) {
                    next.triwulan =
                        month <= 3
                            ? "I"
                            : month <= 6
                              ? "II"
                              : month <= 9
                                ? "III"
                                : "IV";
                }
            }
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg("");
        try {
            const res = await axios.post(
                `/api/anggaran/${anggaran.id}/revisi`,
                formData,
            );
            setFormData({
                triwulan: getDefaultTw(),
                tanggal_revisi: new Date().toISOString().split("T")[0],
                nomor_revisi: "",
                jenis_revisi: "pagu_tetap",
                keterangan: "",
            });
            await fetchRevisi();
            if (onSuccess) onSuccess(res.data.message);
        } catch (err) {
            setErrorMsg(
                err.response?.data?.message ||
                    "Gagal menyimpan catatan revisi DIPA.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (revisiId) => {
        setDeletingId(revisiId);
        setErrorMsg("");
        try {
            const res = await axios.delete(`/api/anggaran/revisi/${revisiId}`);
            await fetchRevisi();
            if (onSuccess) onSuccess(res.data.message);
        } catch (err) {
            setErrorMsg(
                err.response?.data?.message ||
                    "Gagal menghapus catatan revisi.",
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="fixed top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-4xl overflow-hidden border border-white/60 flex flex-col max-h-[95vh] animate-in zoom-in-95 fade-in duration-300 relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                {/* HEADER */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-100/80 bg-slate-50/40 shrink-0 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-[0_8px_16px_rgba(245,158,11,0.25)]">
                            <FileClock size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                Riwayat & Log Revisi DIPA
                            </h2>
                            <p className="text-sm font-semibold text-slate-500 mt-0.5">
                                {anggaran.satker?.nama_satker} (
                                {anggaran.satker?.kode_satker}) — T.A{" "}
                                {anggaran.tahun}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors outline-none"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white/50 flex-1 space-y-6 relative z-10">
                    {errorMsg && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold text-rose-800">
                                {errorMsg}
                            </p>
                        </div>
                    )}

                    {/* SIMULASI SKOR IKPA REVISI DIPA PER TRIWULAN */}
                    <div className="bg-[#0B1120] text-white p-6 rounded-[2rem] border border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
                            <div>
                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">
                                    Indikator IKPA Kemenkeu (Bobot 10%)
                                </p>
                                <h3 className="text-lg font-black tracking-tight mt-0.5">
                                    Simulasi Skor Revisi DIPA Setahun
                                </h3>
                            </div>
                            <div className="px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-right">
                                <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 block">
                                    Proyeksi Skor Tahunan
                                </span>
                                <span className="text-2xl font-black text-amber-400">
                                    {skorRataTahunan}{" "}
                                    <span className="text-xs text-slate-400">
                                        (
                                        {(
                                            (Number(skorRataTahunan) * 10) /
                                            100
                                        ).toFixed(2)}{" "}
                                        / 10 Pts)
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {ringkasanTw.map((item) => {
                                const aman = item.tetap <= 1;
                                return (
                                    <div
                                        key={item.tw}
                                        className={`p-4 rounded-2xl border ${
                                            aman
                                                ? "bg-emerald-500/10 border-emerald-500/30"
                                                : "bg-rose-500/10 border-rose-500/30"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-black text-slate-300">
                                                TW {item.tw}
                                            </span>
                                            {aman ? (
                                                <CheckCircle2
                                                    size={14}
                                                    className="text-emerald-400"
                                                />
                                            ) : (
                                                <AlertTriangle
                                                    size={14}
                                                    className="text-rose-400"
                                                />
                                            )}
                                        </div>
                                        <div
                                            className={`text-2xl font-black ${
                                                aman
                                                    ? "text-emerald-400"
                                                    : "text-rose-400"
                                            }`}
                                        >
                                            {item.skor}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                                            Tetap: {item.tetap}x • Berubah:{" "}
                                            {item.berubah}x
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-[11px] text-slate-400 font-medium mt-4 flex items-center gap-2">
                            <Info
                                size={14}
                                className="text-amber-400 shrink-0"
                            />
                            Standar Kemenkeu: Revisi Pagu Tetap maksimal 1x per
                            Triwulan bernilai 100. Revisi Pagu Berubah tidak
                            mengurangi skor.
                        </p>
                    </div>

                    {/* FORM TAMBAH CATATAN REVISI BARU */}
                    <form
                        onSubmit={handleSubmit}
                        className="bg-slate-50/90 p-6 rounded-[2rem] border border-slate-200/80 space-y-4"
                    >
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <Plus size={16} className="text-amber-600" /> Catat
                            Revisi DIPA Baru
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Tanggal Revisi *
                                </label>
                                <input
                                    type="date"
                                    name="tanggal_revisi"
                                    value={formData.tanggal_revisi}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Triwulan *
                                </label>
                                <select
                                    name="triwulan"
                                    value={formData.triwulan}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none cursor-pointer"
                                >
                                    <option value="I">Triwulan I</option>
                                    <option value="II">Triwulan II</option>
                                    <option value="III">Triwulan III</option>
                                    <option value="IV">Triwulan IV</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Jenis Revisi *
                                </label>
                                <select
                                    name="jenis_revisi"
                                    value={formData.jenis_revisi}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none cursor-pointer"
                                >
                                    <option value="pagu_tetap">
                                        Pagu Tetap (Hitung IKPA)
                                    </option>
                                    <option value="pagu_berubah">
                                        Pagu Berubah (Dikecualikan)
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Nomor Revisi / SK
                                </label>
                                <input
                                    type="text"
                                    name="nomor_revisi"
                                    placeholder="cth: Rev ke-1"
                                    value={formData.nomor_revisi}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Keterangan / Uraian Revisi *
                                </label>
                                <input
                                    type="text"
                                    name="keterangan"
                                    placeholder="Contoh: Pergeseran antar akun belanja barang operasional..."
                                    value={formData.keterangan}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Plus size={16} strokeWidth={3} />
                                )}
                                Catat Revisi
                            </button>
                        </div>
                    </form>

                    {/* DAFTAR RIWAYAT REVISI */}
                    <div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
                            Daftar Riwayat Revisi Tercatat ({revisis.length})
                        </h4>

                        {loading ? (
                            <div className="py-12 text-center">
                                <Loader2
                                    size={28}
                                    className="animate-spin text-amber-500 mx-auto"
                                />
                            </div>
                        ) : revisis.length === 0 ? (
                            <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-sm font-bold text-slate-500">
                                    Belum ada riwayat revisi DIPA pada tahun{" "}
                                    {anggaran.tahun}.
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Skor Indikator Revisi DIPA otomatis optimal
                                    (100 / 10 Pts).
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {revisis.map((rev) => (
                                    <div
                                        key={rev.id}
                                        className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-200 transition-colors shadow-sm"
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white rounded-md">
                                                    TW {rev.triwulan}
                                                </span>
                                                <span
                                                    className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md border ${
                                                        rev.jenis_revisi ===
                                                        "pagu_tetap"
                                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                                    }`}
                                                >
                                                    {rev.jenis_revisi ===
                                                    "pagu_tetap"
                                                        ? "Pagu Tetap (IKPA)"
                                                        : "Pagu Berubah"}
                                                </span>
                                                {rev.nomor_revisi && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                                                        <Hash size={12} />{" "}
                                                        {rev.nomor_revisi}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                                    <Calendar size={12} />{" "}
                                                    {rev.tanggal_revisi}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-800">
                                                {rev.keterangan}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(rev.id)}
                                            disabled={deletingId === rev.id}
                                            className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-100 self-end sm:self-center shrink-0"
                                            title="Hapus Catatan Revisi"
                                        >
                                            {deletingId === rev.id ? (
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-5 md:px-8 border-t border-slate-100 bg-white flex justify-end shrink-0 relative z-20">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-7 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors outline-none"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
