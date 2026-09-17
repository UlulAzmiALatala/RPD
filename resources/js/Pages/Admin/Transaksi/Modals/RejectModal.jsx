import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Send } from "lucide-react";

export default function RejectModal({ isOpen, onClose, data, onConfirm }) {
    const [catatan, setCatatan] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCatatan(""); // Reset catatan setiap kali modal dibuka
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!catatan.trim()) return;

        setIsSubmitting(true);
        // Memanggil fungsi dari parent dengan menyertakan id dan catatan
        await onConfirm(data.id, catatan);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up-scale">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-gray-900">
                                Tolak Data Transaksi
                            </h3>
                            <p className="text-xs text-rose-600 font-medium">
                                Bulan {data.bulan}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors"
                        disabled={isSubmitting}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Alasan Penolakan{" "}
                            <span className="text-rose-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            Catatan ini akan dikirim ke Satker{" "}
                            <strong>{data.satker?.nama_satker}</strong> sebagai
                            panduan revisi.
                        </p>
                        <textarea
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            placeholder="Contoh: Lampiran bukti dukung kurang lengkap, mohon periksa kembali nominal belanja barang..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:bg-white resize-none"
                            rows="4"
                            required
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !catatan.trim()}
                            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <Send size={16} /> Kirim Penolakan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
