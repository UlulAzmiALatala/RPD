import React from "react";
import { AlertTriangle, X, Trash2, Loader2, ShieldAlert } from "lucide-react";

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-md transition-all duration-500">
            <div className="bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] w-full max-w-md overflow-hidden border border-white/80 flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 fade-in duration-300 relative text-center">
                {/* HAZARD PATTERN BACKGROUND (MEMBERI KESAN ZONA KRITIS) */}
                <div className="absolute top-0 left-0 w-full h-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZjRmNWY3IiBmaWxsLW9wYWNpdHk9IjAuNiIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMCA0MGw0MC00MEgwbTQwIDBWMGwtNDAgNDBoNDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-60 pointer-events-none"></div>

                {/* AMBIENT GLOW (MERAH/ROSE) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/15 rounded-full blur-[50px] pointer-events-none"></div>

                {/* TOMBOL CLOSE ABSOLUTE */}
                <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="absolute top-5 right-5 p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50/80 rounded-2xl transition-all z-20 backdrop-blur-md"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                {/* KONTEN MODAL */}
                <div className="p-8 pt-12 relative z-10 flex flex-col items-center">
                    {/* BADGE PERINGATAN KECIL DI ATAS */}
                    <div className="mb-6 px-3 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 shadow-sm border border-rose-200">
                        <ShieldAlert size={14} strokeWidth={2.5} />
                        Tindakan Kritis
                    </div>

                    {/* IKON PERINGATAN MULTI-LAYER (3D EFFECT) */}
                    <div className="w-28 h-28 mb-6 relative flex items-center justify-center group">
                        {/* Outer Pulse (Denyut Paling Luar) */}
                        <div className="absolute inset-0 bg-rose-200/40 rounded-full animate-ping opacity-70"></div>
                        {/* Middle Ring (Cincin Gradien) */}
                        <div className="absolute inset-2 bg-gradient-to-tr from-rose-100 to-white rounded-full shadow-[0_0_20px_rgba(225,29,72,0.2)] animate-pulse"></div>
                        {/* Inner 3D Block (Miring 3 derajat, akan lurus saat di-hover) */}
                        <div className="relative w-20 h-20 bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_10px_25px_rgba(225,29,72,0.4)] text-white rounded-2xl flex items-center justify-center z-10 rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-300">
                            <AlertTriangle size={40} strokeWidth={2.5} />
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                        Hapus Permanen?
                    </h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed px-2">
                        Seluruh jejak, hak akses, dan otorisasi pengguna ini
                        akan
                        <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded mx-1">
                            dimusnahkan
                        </span>
                        dari ekosistem SIRA. Tindakan ini tidak dapat
                        dibatalkan.
                    </p>
                </div>

                {/* FOOTER MODAL & TOMBOL AKSI */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4 relative z-10">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-[0.8] py-4 px-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-extrabold hover:bg-slate-100 hover:text-slate-800 transition-all focus:ring-4 focus:ring-slate-200 outline-none"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={`flex-[1.2] flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-extrabold text-white transition-all duration-300 outline-none overflow-hidden relative ${
                            isDeleting
                                ? "bg-slate-400 cursor-not-allowed shadow-none"
                                : "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-[0_10px_25px_rgba(225,29,72,0.35)] hover:shadow-[0_15px_30px_rgba(225,29,72,0.5)] hover:-translate-y-1 focus:ring-4 focus:ring-rose-500/30 group"
                        }`}
                    >
                        {/* Efek kilapan cahaya (shine) saat tombol di-hover */}
                        {!isDeleting && (
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                        )}

                        {isDeleting ? (
                            <Loader2
                                size={20}
                                className="animate-spin relative z-10"
                            />
                        ) : (
                            <Trash2
                                size={20}
                                strokeWidth={2.5}
                                className="relative z-10"
                            />
                        )}
                        <span className="relative z-10 tracking-widest uppercase text-xs">
                            {isDeleting ? "Memproses..." : "Ya, Musnahkan"}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
