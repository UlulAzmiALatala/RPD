import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    X,
    Save,
    TrendingUp,
    Box,
    Banknote,
    CalendarDays,
    AlertTriangle,
    CheckSquare,
    Loader2,
} from "lucide-react";

export default function ProgressModal({ ro, onClose, onSuccess }) {
    const [bulan, setBulan] = useState((new Date().getMonth() + 1).toString());
    const [formData, setFormData] = useState({
        realisasi_volume: "",
        realisasi_anggaran: "",
        keterangan: "",
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

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

    useEffect(() => {
        if (ro && ro.detail_bulanan && ro.detail_bulanan[bulan]) {
            const detail = ro.detail_bulanan[bulan];
            setFormData({
                realisasi_volume: detail.realisasi_volume || "",
                realisasi_anggaran: detail.realisasi_anggaran || "",
                keterangan: detail.keterangan || "",
            });
        } else {
            setFormData({
                realisasi_volume: "",
                realisasi_anggaran: "",
                keterangan: "",
            });
        }
        setErrorMsg("");
    }, [bulan, ro]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMsg) setErrorMsg("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const payload = {
            ...formData,
            rincian_output_id: ro.id,
            bulan: parseInt(bulan),
        };

        axios
            .post("/api/rincian-output/realisasi", payload)
            .then((res) => onSuccess(res.data.message))
            .catch((err) => {
                setErrorMsg(
                    err.response?.data?.message ||
                        "Terjadi kesalahan sistem saat menyimpan laporan.",
                );
                setLoading(false);
            });
    };

    return (
        <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden border border-white/60 flex flex-col max-h-[95vh] animate-in zoom-in-95 fade-in duration-300 relative">
                {/* DARK HEADER PREMIUM */}
                <div className="flex justify-between items-start p-6 md:p-8 border-b border-slate-700 bg-gradient-to-br from-slate-900 to-[#0A192F] text-white shrink-0 relative z-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-[1.2rem] border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <TrendingUp size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-700">
                                    {ro.kode_ro}
                                </span>
                            </div>
                            <h3 className="font-black text-xl tracking-tight leading-tight line-clamp-1 pr-4">
                                {ro.nama_ro}
                            </h3>
                            <p className="text-[11px] font-bold text-slate-400 mt-1.5 tracking-widest uppercase">
                                Target Total:{" "}
                                <span className="text-emerald-400 font-black">
                                    {ro.target_volume} {ro.satuan}
                                </span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-rose-500 border border-slate-700 hover:border-rose-500 rounded-xl transition-all outline-none"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white/50 flex-1 relative z-10">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
                            <AlertTriangle
                                size={20}
                                className="text-rose-500 mt-0.5 shrink-0"
                            />
                            <p className="text-sm font-bold text-rose-800">
                                {errorMsg}
                            </p>
                        </div>
                    )}

                    <form
                        id="form-progress-ro"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* BULAN SELECTOR */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-sm">
                            <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">
                                <CalendarDays
                                    size={16}
                                    className="text-indigo-500"
                                />{" "}
                                Pilih Bulan Pelaporan
                            </label>
                            <div className="flex flex-wrap gap-2.5">
                                {[...Array(12)].map((_, i) => {
                                    const b = i + 1;
                                    const hasData =
                                        ro.detail_bulanan &&
                                        ro.detail_bulanan[b];
                                    return (
                                        <button
                                            key={b}
                                            type="button"
                                            onClick={() =>
                                                setBulan(b.toString())
                                            }
                                            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border outline-none ${bulan === b.toString() ? "bg-gradient-to-r from-indigo-600 to-blue-600 border-transparent text-white shadow-md hover:-translate-y-0.5" : hasData ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                                        >
                                            {namaBulan[b].substring(0, 3)}{" "}
                                            {hasData && (
                                                <CheckSquare
                                                    size={12}
                                                    className="inline ml-1 text-emerald-500"
                                                    strokeWidth={2.5}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-sm">
                                <label className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">
                                    <span className="flex items-center gap-1.5">
                                        <Box
                                            size={14}
                                            className="text-emerald-500"
                                        />{" "}
                                        Realisasi Volume
                                    </span>
                                </label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="realisasi_volume"
                                    placeholder="Contoh: 10"
                                    value={formData.realisasi_volume}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-emerald-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:font-normal"
                                />
                                <p className="text-[10px] text-slate-400 mt-2.5 font-bold leading-tight">
                                    Tambahan volume khusus bulan{" "}
                                    {namaBulan[bulan]} ini.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-sm">
                                <label className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">
                                    <span className="flex items-center gap-1.5">
                                        <Banknote
                                            size={14}
                                            className="text-sky-500"
                                        />{" "}
                                        Serapan Anggaran
                                    </span>
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    name="realisasi_anggaran"
                                    placeholder="Contoh: 5000000"
                                    value={formData.realisasi_anggaran}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-sky-700 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all placeholder:font-normal"
                                />
                                <p className="text-[10px] text-slate-400 mt-2.5 font-bold leading-tight">
                                    Uang terserap khusus bulan{" "}
                                    {namaBulan[bulan]}.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-sm">
                            <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">
                                Keterangan / Analisis
                            </label>
                            <textarea
                                name="keterangan"
                                rows="3"
                                placeholder="Opsional. Isi jika ada kendala pelaksanaan di lapangan..."
                                value={formData.keterangan}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all custom-scrollbar placeholder:text-slate-400"
                            />
                        </div>
                    </form>
                </div>

                {/* FOOTER */}
                <div className="p-6 md:px-8 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 relative z-20">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-3.5 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors outline-none"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="form-progress-ro"
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white transition-all duration-300 outline-none ${loading ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-[0_8px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"}`}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save size={18} strokeWidth={2.5} />
                        )}
                        {loading
                            ? "Menyimpan..."
                            : `Simpan Data ${namaBulan[bulan]}`}
                    </button>
                </div>
            </div>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>
        </div>
    );
}
