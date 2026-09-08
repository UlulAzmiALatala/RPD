import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    title = "Konfirmasi Hapus",
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-red-100">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                        {title}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Apakah Anda yakin ingin menghapus data ini? Semua
                        rincian di dalamnya juga akan terhapus secara permanen.
                    </p>

                    <div className="flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-6 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-colors shadow-md ${isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                        >
                            {isDeleting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : null}
                            {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
