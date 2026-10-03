import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Save, Loader2, Edit3, AlertCircle } from "lucide-react";

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
        blokir_gaji: "", // 🔥 STATE BARU
        blokir_barang: "", // 🔥 STATE BARU
        blokir_modal: "", // 🔥 STATE BARU
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
                blokir_gaji: editData.blokir_gaji || "", // 🔥 TANGKAP DATA LAMA
                blokir_barang: editData.blokir_barang || "", // 🔥 TANGKAP DATA LAMA
                blokir_modal: editData.blokir_modal || "", // 🔥 TANGKAP DATA LAMA
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

        // Validasi Frontend Cepat: Blokir tidak boleh lebih besar dari Pagu
        const invalidBlokir = ["gaji", "barang", "modal"].some((jenis) => {
            const belanja = Number(formData[`belanja_${jenis}`]) || 0;
            const blokir = Number(formData[`blokir_${jenis}`]) || 0;
            return blokir > belanja;
        });

        if (invalidBlokir) {
            setErrorMsg(
                "Nominal Pagu Blokir tidak boleh melebihi Total Pagu di masing-masing jenis belanja!",
            );
            setIsSubmitting(false);
            return;
        }

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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                {/* Header Modal */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Edit3 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">
                                Edit Pagu Anggaran
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Perbarui nominal alokasi dana & pagu blokir.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Modal (Scrollable) */}
                <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/30 flex-1">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                            <p className="pt-0.5 font-bold">{errorMsg}</p>
                        </div>
                    )}

                    <form
                        id="editAnggaranForm"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Area Terkunci (Identitas Satker & Tahun) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-100/50 p-5 rounded-xl border border-gray-200 shadow-sm opacity-90">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">
                                    Satuan Kerja
                                </label>
                                <select
                                    disabled
                                    value={formData.satker_id}
                                    className="w-full border-gray-300 rounded-xl shadow-sm py-2.5 px-3 border bg-gray-100 text-gray-500 text-sm font-bold"
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
                                    className="w-full border-gray-300 rounded-xl shadow-sm py-2.5 px-3 border bg-gray-100 text-gray-500 text-sm font-bold"
                                />
                            </div>
                        </div>

                        {/* Area Edit (Rincian Anggaran & Blokir) */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                Rincian Alokasi Belanja & Blokir
                            </h3>

                            {["gaji", "barang", "modal"].map((jenis) => {
                                const title =
                                    jenis === "gaji"
                                        ? "51 - PEGAWAI"
                                        : jenis === "barang"
                                          ? "52 - BARANG"
                                          : "53 - MODAL";

                                return (
                                    <div
                                        key={jenis}
                                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
                                    >
                                        <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                                            {title}
                                        </h4>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {/* Pagu Murni */}
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                                    Total Pagu Belanja{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold">
                                                        Rp
                                                    </span>
                                                    <input
                                                        type="number"
                                                        name={`belanja_${jenis}`}
                                                        value={
                                                            formData[
                                                                `belanja_${jenis}`
                                                            ]
                                                        }
                                                        onChange={handleChange}
                                                        required
                                                        min="0"
                                                        placeholder="0"
                                                        className="w-full pl-10 border-gray-300 rounded-xl shadow-sm py-2.5 border focus:ring-2 focus:ring-blue-500 text-sm font-mono font-bold text-slate-700"
                                                    />
                                                </div>
                                            </div>

                                            {/* Pagu Blokir */}
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-red-500 mb-1.5">
                                                    Pagu Blokir (Opsional)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-red-400 font-bold">
                                                        Rp
                                                    </span>
                                                    <input
                                                        type="number"
                                                        name={`blokir_${jenis}`}
                                                        value={
                                                            formData[
                                                                `blokir_${jenis}`
                                                            ]
                                                        }
                                                        onChange={handleChange}
                                                        min="0"
                                                        placeholder="0"
                                                        className="w-full pl-10 border-red-200 rounded-xl shadow-sm py-2.5 border focus:ring-2 focus:ring-red-500 text-sm font-mono focus:border-red-500 bg-red-50/30 text-red-700 font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </form>
                </div>

                {/* Footer Modal */}
                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
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
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-md ${
                            isSubmitting
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5"
                        }`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Update Pagu
                    </button>
                </div>
            </div>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>
        </div>
    );
}
