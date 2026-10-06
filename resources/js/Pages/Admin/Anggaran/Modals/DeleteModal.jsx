import React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    title = "Hapus Master Anggaran",
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-8 md:p-10 max-w-lg w-full text-center animate-in zoom-in-95 duration-300 border border-white/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 to-red-600"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-24 h-24 bg-rose-50/80 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10 border border-rose-100">
                    <AlertTriangle size={48} strokeWidth={2} />
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight relative z-10">
                    {title}
                </h3>

                <div className="text-sm text-slate-500 mb-8 leading-relaxed relative z-10">
                    Apakah Anda yakin ingin menghapus data pagu anggaran ini?
                    <br />
                    <strong className="text-rose-600 mt-1 block">
                        Semua data alokasi dana akan musnah permanen
                    </strong>
                    dan tidak dapat dipulihkan.
                </div>

                <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={`flex-[1.5] flex justify-center items-center gap-2 px-6 py-4 rounded-2xl font-bold text-white transition-all shadow-md ${isDeleting ? "bg-rose-400 cursor-not-allowed shadow-none" : "bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 hover:shadow-[0_8px_20px_rgba(225,29,72,0.4)] hover:-translate-y-0.5"}`}
                    >
                        {isDeleting ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                            <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                        )}
                        {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
                    </button>
                </div>
            </div>
        </div>
    );
}
