import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EditModal({
    isOpen,
    onClose,
    onSuccess,
    activeTab,
    satkers,
    editData,
}) {
    const [formData, setFormData] = useState({
        satker_id: "",
        tahun: "",
        bulan: "",
        belanja_gaji: "",
        belanja_barang: "",
        belanja_modal: "",
    });

    const [message, setMessage] = useState({ type: "", text: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Isi form dengan data yang mau diedit saat modal dibuka
    useEffect(() => {
        if (isOpen && editData) {
            setFormData({
                satker_id: editData.satker_id || "",
                tahun: editData.tahun || "",
                bulan: editData.bulan || "",
                belanja_gaji: editData.belanja_gaji || "",
                belanja_barang: editData.belanja_barang || "",
                belanja_modal: editData.belanja_modal || "",
            });
            setMessage({ type: "", text: "" });
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: "", text: "" });

        // Pakai method PUT dan tambahkan ID data
        const endpoint =
            activeTab === "rpd"
                ? `/api/transaksi/rpd/${editData.id}`
                : `/api/transaksi/realisasi/${editData.id}`;

        axios
            .put(endpoint, formData)
            .then((response) => {
                onSuccess();
                onClose();
            })
            .catch((error) => {
                // Console log ini membantu kamu cek error dari Laravel (seperti di gambar tadi)
                console.error("Detail Error:", error.response);

                if (error.response && error.response.status === 422) {
                    setMessage({
                        type: "error",
                        text: "Pastikan semua kolom diisi dengan benar.",
                    });
                } else if (error.response && error.response.status === 409) {
                    setMessage({
                        type: "error",
                        text: error.response.data.message,
                    });
                } else {
                    setMessage({
                        type: "error",
                        text: "Terjadi kesalahan sistem. Cek F12 -> Network.",
                    });
                }
            })
            .finally(() => setIsSubmitting(false));
    };

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div
                className={`bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border-t-4 ${activeTab === "rpd" ? "border-yellow-400" : "border-yellow-400"}`}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-[#0A192F]">
                            Edit Data{" "}
                            {activeTab === "rpd" ? "RPD" : "Realisasi"}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Perbarui nominal transaksi. Satker, Tahun, dan Bulan
                            tidak dapat diubah.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {message.text && (
                        <div
                            className={`p-4 mb-6 rounded-md ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} border`}
                        >
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-100 p-4 rounded-md border border-gray-200">
                            {/* Disabled fields karena mode Edit */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-2">
                                    Satuan Kerja
                                </label>
                                <select
                                    value={formData.satker_id}
                                    disabled
                                    className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 border bg-gray-200 text-gray-500"
                                >
                                    <option value={formData.satker_id}>
                                        {satkers.find(
                                            (s) => s.id === formData.satker_id,
                                        )?.nama_satker || "Memuat..."}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-2">
                                    Tahun
                                </label>
                                <input
                                    type="number"
                                    value={formData.tahun}
                                    disabled
                                    className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 border bg-gray-200 text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-2">
                                    Bulan
                                </label>
                                <input
                                    type="text"
                                    value={namaBulan[formData.bulan]}
                                    disabled
                                    className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 border bg-gray-200 text-gray-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {["gaji", "barang", "modal"].map((jenis) => (
                                <div key={jenis}>
                                    <label className="block text-sm font-semibold text-[#0A192F] mb-2 capitalize">
                                        Belanja {jenis}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            name={`belanja_${jenis}`}
                                            value={formData[`belanja_${jenis}`]}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="w-full pl-10 border-gray-300 rounded-md shadow-sm py-2 border focus:ring-2 focus:ring-yellow-400"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-6 gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-md font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-2.5 rounded-md font-bold transition-colors shadow-sm ${
                                    isSubmitting
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-yellow-500 text-white hover:bg-yellow-600"
                                }`}
                            >
                                {isSubmitting ? "Menyimpan..." : "Update Data"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
