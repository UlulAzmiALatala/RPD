import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { X, Save, Loader2, Edit, AlertCircle } from "lucide-react";

export default function EditRpdModal({
    isOpen,
    onClose,
    onSuccess,
    satkers,
    editData,
    satkerSummary,
}) {
    const [formData, setFormData] = useState({
        satker_id: "",
        tahun: "",
        bulan: "",
        belanja_gaji: "",
        belanja_barang: "",
        belanja_modal: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (isOpen && editData) {
            setFormData({ ...editData });
            setErrorMsg("");
        }
    }, [isOpen, editData]);

    // Hitung total inputan lama untuk dikembalikan ke Sisa Pagu sementara
    const oldTotal = useMemo(() => {
        if (!editData) return 0;
        return (
            (Number(editData.belanja_gaji) || 0) +
            (Number(editData.belanja_barang) || 0) +
            (Number(editData.belanja_modal) || 0)
        );
    }, [editData]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

    // LOGIKA VALIDASI
    const sisaPagu =
        formData.satker_id && satkerSummary[formData.satker_id]
            ? satkerSummary[formData.satker_id].sisa_pagu_rpd + oldTotal
            : 0;

    const totalInput =
        (Number(formData.belanja_gaji) || 0) +
        (Number(formData.belanja_barang) || 0) +
        (Number(formData.belanja_modal) || 0);
    const isOverbudget = formData.satker_id && totalInput > sisaPagu;

    if (!isOpen) return null;

    const handleChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isOverbudget) {
            setErrorMsg(
                `Total RPD melebih Sisa Pagu! Kurangi nominal sebesar ${formatCurrency(totalInput - sisaPagu)}`,
            );
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");
        try {
            const response = await axios.put(
                `/api/transaksi/rpd/${editData.id}`,
                formData,
            );
            onSuccess(response.data.message || "RPD berhasil diperbarui!");
            onClose();
        } catch (error) {
            setErrorMsg(
                error.response?.data?.message || "Terjadi kesalahan sistem.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const namaBulan = [
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Edit size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">
                                Edit RPD
                            </h2>
                            <p className="text-sm text-gray-500">
                                Perbarui Rencana Penarikan Dana.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-xl"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {errorMsg && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                            {errorMsg}
                        </div>
                    )}

                    {isOverbudget && (
                        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-rose-800">
                                    Peringatan Overbudget!
                                </h4>
                                <p className="text-sm text-rose-600 mt-1">
                                    Total RPD Anda (
                                    <span className="font-bold">
                                        {formatCurrency(totalInput)}
                                    </span>
                                    ) melebihi Sisa Pagu yang tersedia.
                                </p>
                            </div>
                        </div>
                    )}

                    <form
                        id="editRpdForm"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 p-5 rounded-xl border border-gray-200 opacity-80">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                    Satker (Terkunci)
                                </label>
                                <input
                                    disabled
                                    value={
                                        satkers.find(
                                            (s) => s.id === formData.satker_id,
                                        )?.kode_satker || ""
                                    }
                                    className="w-full bg-gray-200 border-gray-300 rounded-xl p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                    Tahun (Terkunci)
                                </label>
                                <input
                                    disabled
                                    value={formData.tahun}
                                    className="w-full bg-gray-200 border-gray-300 rounded-xl p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                    Bulan (Terkunci)
                                </label>
                                <input
                                    disabled
                                    value={namaBulan[formData.bulan - 1] || ""}
                                    className="w-full bg-gray-200 border-gray-300 rounded-xl p-2 text-sm"
                                />
                            </div>
                        </div>

                        {formData.satker_id && (
                            <div
                                className={`p-3 rounded-xl border ${sisaPagu <= 0 ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}
                            >
                                <p className="text-xs font-bold flex justify-between">
                                    <span>
                                        Status Pagu Tersedia (Edit Mode):
                                    </span>
                                    <span>{formatCurrency(sisaPagu)}</span>
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {["gaji", "barang", "modal"].map((jenis) => (
                                <div
                                    key={jenis}
                                    className="flex flex-col sm:flex-row gap-2 sm:items-center"
                                >
                                    <label className="sm:w-1/3 text-sm font-bold capitalize text-gray-700">
                                        Rencana {jenis}
                                    </label>
                                    <div className="relative sm:w-2/3">
                                        <span className="absolute left-3 top-2.5 text-gray-500 font-bold">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            name={`belanja_${jenis}`}
                                            value={formData[`belanja_${jenis}`]}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="w-full pl-10 border-gray-300 rounded-xl p-2.5 font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </form>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                    <div className="text-sm font-extrabold text-gray-500">
                        Total Input:{" "}
                        <span
                            className={
                                isOverbudget
                                    ? "text-red-500"
                                    : "text-indigo-600"
                            }
                        >
                            {formatCurrency(totalInput)}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="editRpdForm"
                            disabled={isSubmitting || isOverbudget}
                            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all ${isSubmitting || isOverbudget ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}{" "}
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
