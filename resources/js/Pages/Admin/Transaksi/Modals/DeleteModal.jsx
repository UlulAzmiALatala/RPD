import React from "react";

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-t-4 border-red-500">
                <div className="p-6 text-center">
                    {/* Ikon Peringatan */}
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            ></path>
                        </svg>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Konfirmasi Hapus Data
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Apakah Anda yakin ingin menghapus data transaksi ini?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>

                    <div className="flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-6 py-2.5 rounded-md font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className={`px-6 py-2.5 rounded-md font-bold text-white transition-colors shadow-sm ${
                                isDeleting
                                    ? "bg-red-400 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700"
                            }`}
                        >
                            {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
