import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Save, Loader2 } from "lucide-react";

export default function EditModal({
    isOpen,
    onClose,
    onSuccess,
    satkers,
    editData,
}) {
    const [formData, setFormData] = useState({
        satker_id: "",
        tahun: "",
        belanja_gaji: "",
        belanja_barang: "",
        belanja_modal: "",
        pagu_blokir: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (isOpen && editData) {
            setFormData({
                satker_id: editData.satker_id || "",
                tahun: editData.tahun || "",
                belanja_gaji: editData.belanja_gaji || "",
                belanja_barang: editData.belanja_barang || "",
                belanja_modal: editData.belanja_modal || "",
                pagu_blokir: editData.pagu_blokir || "",
            });
            setErrorMsg("");
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg("");

        try {
            const response = await axios.put(
                `/api/anggaran/${editData.id}`,
                formData,
            );
            onSuccess(
                response.data.message || "Pagu Anggaran berhasil diperbarui!",
            );
            onClose();
        } catch (error) {
            setErrorMsg(
                error.response?.data?.message ||
                    "Terjadi kesalahan sistem saat update data.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900">
                            Edit Pagu Anggaran
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Perbarui nominal alokasi dana & pagu blokir.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-start gap-3">
                            <X className="w-5 h-5 flex-shrink-0 text-red-500" />
                            <p className="pt-0.5">{errorMsg}</p>
                        </div>
                    )}

                    <form
                        id="editAnggaranForm"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Area Disabled */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">
                                    Satuan Kerja
                                </label>
                                <select
                                    disabled
                                    value={formData.satker_id}
                                    className="w-full border-gray-300 rounded-xl shadow-sm py-2.5 px-3 border bg-gray-100 text-gray-500 text-sm"
                                >
                                    <option value={formData.satker_id}>
                                        {satkers.find(
                                            (s) => s.id === formData.satker_id,
                                        )?.nama_satker || "Memuat..."}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">
                                    Tahun Anggaran
                                </label>
                                <input
                                    disabled
                                    type="number"
                                    value={formData.tahun}
                                    className="w-full border-gray-300 rounded-xl shadow-sm py-2.5 px-3 border bg-gray-100 text-gray-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Area Edit */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                Alokasi Belanja & Blokir
                            </h3>
                            {["gaji", "barang", "modal", "blokir"].map(
                                (jenis) => (
                                    <div
                                        key={jenis}
                                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                                    >
                                        <label
                                            className={`sm:w-1/3 text-sm font-bold capitalize ${jenis === "blokir" ? "text-red-500" : "text-gray-700"}`}
                                        >
                                            Pagu{" "}
                                            {jenis === "blokir"
                                                ? "Blokir"
                                                : `Belanja ${jenis}`}
                                        </label>
                                        <div className="relative sm:w-2/3">
                                            <span className="absolute left-3 top-2.5 text-gray-500 font-bold">
                                                Rp
                                            </span>
                                            <input
                                                type="number"
                                                name={
                                                    jenis === "blokir"
                                                        ? "pagu_blokir"
                                                        : `belanja_${jenis}`
                                                }
                                                value={
                                                    formData[
                                                        jenis === "blokir"
                                                            ? "pagu_blokir"
                                                            : `belanja_${jenis}`
                                                    ]
                                                }
                                                onChange={handleChange}
                                                required
                                                min="0"
                                                className={`w-full pl-10 border-gray-300 rounded-xl shadow-sm py-2.5 border font-mono text-sm ${jenis === "blokir" ? "focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50/30" : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                                            />
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="editAnggaranForm"
                        disabled={isSubmitting}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-md ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"}`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isSubmitting ? "Menyimpan..." : "Update Pagu"}
                    </button>
                </div>
            </div>
        </div>
    );
}
