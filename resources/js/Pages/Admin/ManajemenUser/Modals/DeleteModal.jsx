import React from "react";
import { AlertTriangle, X, Trash2, Loader2 } from "lucide-react";

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border-[6px] border-white shadow-[0_0_15px_rgba(239,68,68,0.1)] relative">
                        <div className="absolute inset-0 border border-red-100 rounded-full animate-ping"></div>
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                        Hapus Pengguna?
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed px-2">
                        Tindakan ini tidak dapat dibatalkan. Pengguna ini akan
                        kehilangan semua akses ke dalam sistem SIRA.
                    </p>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors focus:ring-2 focus:ring-gray-200"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white transition-all shadow-md ${
                            isDeleting
                                ? "bg-red-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 hover:shadow-lg"
                        }`}
                    >
                        {isDeleting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Trash2 size={18} />
                        )}
                        {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                </div>
            </div>
        </div>
    );
}
