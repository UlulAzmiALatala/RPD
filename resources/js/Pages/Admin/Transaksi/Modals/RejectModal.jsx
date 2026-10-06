import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Send, FileWarning, Building2 } from "lucide-react";

export default function RejectModal({ isOpen, onClose, data, onConfirm }) {
    const [catatan, setCatatan] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCatatan("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!catatan.trim()) return;

        setIsSubmitting(true);
        await onConfirm(data.id, catatan);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(225,29,72,0.4)] w-full max-w-lg overflow-hidden border border-white/60 flex flex-col relative animate-in zoom-in-95 fade-in duration-300">
                {/* AMBIENT GLOW */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                {/* HEADER */}
                <div className="px-6 py-6 md:px-8 border-b border-slate-100/60 flex items-center justify-between bg-slate-50/30 relative z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl shadow-[0_8px_16px_rgba(225,29,72,0.25)] relative">
                            <AlertTriangle size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                Tolak Transaksi
                            </h3>
                            <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mt-0.5">
                                Verifikasi Bulan {data.bulan}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* BODY */}
                <form
                    onSubmit={handleSubmit}
                    className="p-6 md:p-8 relative z-10 flex flex-col gap-6"
                >
                    {/* INFO SATKER HUD */}
                    <div className="bg-slate-50/80 border border-slate-200/60 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-inner">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400">
                            <Building2 size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Target Satuan Kerja
                            </p>
                            <p className="text-sm font-extrabold text-slate-700 mt-0.5 leading-snug">
                                {data.satker?.nama_satker}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-2">
                            <FileWarning size={16} className="text-rose-500" />{" "}
                            Alasan Penolakan / Catatan Revisi{" "}
                            <span className="text-rose-500">*</span>
                        </label>
                        <p className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest">
                            Catatan ini akan dikirim otomatis ke pihak satker.
                        </p>
                        <div className="relative group">
                            <textarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                placeholder="Contoh: Lampiran bukti dukung kurang lengkap, nominal belanja barang tidak sesuai..."
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium text-slate-700 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 resize-none outline-none transition-all shadow-sm placeholder:text-slate-300 custom-scrollbar"
                                rows="5"
                                required
                                disabled={isSubmitting}
                            ></textarea>
                            {/* Dekorasi HUD */}
                            <div className="absolute bottom-4 right-4 pointer-events-none bg-white/80 backdrop-blur px-2 py-1 rounded-md shadow-sm border border-slate-100 transition-opacity">
                                <span
                                    className={`text-[10px] font-black tracking-widest ${catatan.length > 0 ? "text-rose-500" : "text-slate-300"}`}
                                >
                                    {catatan.length} CHAR
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-4 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-colors outline-none"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !catatan.trim()}
                            className={`flex-[2] px-6 py-4 text-sm font-bold text-white rounded-2xl transition-all flex items-center justify-center gap-2 outline-none ${isSubmitting || !catatan.trim() ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-[0_8px_16px_rgba(225,29,72,0.25)] hover:shadow-[0_8px_20px_rgba(225,29,72,0.4)] hover:-translate-y-0.5"}`}
                        >
                            {isSubmitting ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <Send size={18} strokeWidth={2.5} /> Kirim
                                    Penolakan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }`}</style>
        </div>
    );
}
