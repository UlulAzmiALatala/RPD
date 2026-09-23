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
        setErrorMsg(""); // Reset error setiap ganti bulan
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
            .then((res) => {
                onSuccess(res.data.message);
            })
            .catch((err) => {
                setErrorMsg(
                    err.response?.data?.message ||
                        "Terjadi kesalahan sistem saat menyimpan laporan.",
                );
                setLoading(false);
            });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-900 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-md">
                                    {ro.kode_ro}
                                </span>
                            </div>
                            <h3 className="font-black text-lg line-clamp-1">
                                {ro.nama_ro}
                            </h3>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">
                                Target:{" "}
                                <span className="text-emerald-400 font-bold">
                                    {ro.target_volume} {ro.satuan}
                                </span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-500 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50">
                    {/* --- ERROR BOX ELEGAN --- */}
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertTriangle
                                size={18}
                                className="text-rose-500 mt-0.5 shrink-0"
                            />
                            <p className="text-sm font-bold text-rose-700">
                                {errorMsg}
                            </p>
                        </div>
                    )}

                    <form
                        id="form-progress-ro"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                                <CalendarDays
                                    size={16}
                                    className="text-indigo-500"
                                />{" "}
                                Pilih Bulan Pelaporan
                            </label>
                            <div className="flex flex-wrap gap-2">
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
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${bulan === b.toString() ? "bg-indigo-600 border-indigo-600 text-white shadow-md" : hasData ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                                        >
                                            {namaBulan[b].substring(0, 3)}{" "}
                                            {hasData && (
                                                <CheckSquare
                                                    size={10}
                                                    className="inline ml-1"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <label className="flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
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
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                                />
                                <p className="text-[9px] text-slate-400 mt-2 font-medium">
                                    Berapa tambahan volume khusus bulan{" "}
                                    {namaBulan[bulan]} ini?
                                </p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <label className="flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
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
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-700 focus:ring-2 focus:ring-sky-500"
                                />
                                <p className="text-[9px] text-slate-400 mt-2 font-medium">
                                    Berapa rupiah yang terserap untuk RO ini di
                                    bulan {namaBulan[bulan]}?
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                Keterangan / Analisis
                            </label>
                            <textarea
                                name="keterangan"
                                rows="3"
                                placeholder="Opsional. Isi jika ada kendala pelaksanaan..."
                                value={formData.keterangan}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="form-progress-ro"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                    >
                        <Save size={16} />{" "}
                        {loading
                            ? "Menyimpan..."
                            : `Simpan Data ${namaBulan[bulan]}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
