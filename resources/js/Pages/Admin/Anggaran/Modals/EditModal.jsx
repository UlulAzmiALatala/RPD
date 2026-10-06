import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    X,
    Save,
    Loader2,
    Edit3,
    AlertCircle,
    ShieldAlert,
    Lock,
} from "lucide-react";

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
        blokir_gaji: "",
        blokir_barang: "",
        blokir_modal: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // 🔥 LOGIKA PENGECEKAN SATKER SETJEN 🔥
    const selectedSatkerData = satkers?.find(
        (s) => s.id?.toString() === formData.satker_id?.toString(),
    );
    const namaSatkerUpper = (
        selectedSatkerData?.nama_satker || ""
    ).toUpperCase();
    const isSetjen =
        namaSatkerUpper.includes("SETJEN") ||
        namaSatkerUpper.includes("SEKRETARIAT JENDERAL") ||
        selectedSatkerData?.kode_satker === "692028";

    useEffect(() => {
        if (isOpen && editData) {
            setFormData({
                satker_id: editData.satker_id || "",
                tahun: editData.tahun || "",
                belanja_gaji: editData.belanja_gaji || "",
                belanja_barang: editData.belanja_barang || "",
                belanja_modal: editData.belanja_modal || "",
                blokir_gaji: editData.blokir_gaji || "",
                blokir_barang: editData.blokir_barang || "",
                blokir_modal: editData.blokir_modal || "",
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
        <div className="fixed top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-4xl overflow-hidden border border-white/60 flex flex-col max-h-[95vh] animate-in zoom-in-95 fade-in duration-300 relative">
                {/* AMBIENT GLOW */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                {/* HEADER */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-100/60 bg-slate-50/30 shrink-0 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-[0_8px_16px_rgba(79,70,229,0.25)]">
                            <Edit3 size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                Edit Pagu Anggaran
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                Perbarui rincian alokasi dana dan pagu blokir.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors outline-none"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white/50 flex-1 relative z-10">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-bold text-rose-800">
                                {errorMsg}
                            </p>
                        </div>
                    )}

                    <form
                        id="editAnggaranForm"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* AREA TERKUNCI */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-dashed border-slate-200 shadow-inner">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                    <Lock size={12} /> Satuan Kerja (Terkunci)
                                </label>
                                <select
                                    disabled
                                    value={formData.satker_id}
                                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-500 cursor-not-allowed appearance-none"
                                >
                                    <option value={formData.satker_id}>
                                        {satkers.find(
                                            (s) => s.id === formData.satker_id,
                                        )?.nama_satker || "Memuat..."}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                    <Lock size={12} /> Tahun Anggaran (Terkunci)
                                </label>
                                <input
                                    disabled
                                    type="number"
                                    value={formData.tahun}
                                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* RINCIAN BELANJA */}
                        <div className="space-y-4 mt-2">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                                Rincian Alokasi Belanja & Blokir
                            </h3>

                            {["gaji", "barang", "modal"].map((jenis) => {
                                const title =
                                    jenis === "gaji"
                                        ? "51 - Pegawai"
                                        : jenis === "barang"
                                          ? "52 - Barang"
                                          : "53 - Modal";
                                // 🔥 Kunci input jika jenis="gaji" dan satker bukan Setjen
                                const isLocked = jenis === "gaji" && !isSetjen;

                                return (
                                    <div
                                        key={jenis}
                                        className={`p-6 rounded-[2rem] border shadow-sm transition-colors ${isLocked ? "bg-slate-100/50 border-slate-200/80" : "bg-white border-slate-200/80 hover:border-indigo-200"}`}
                                    >
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${isLocked ? "bg-slate-400" : "bg-indigo-500"}`}
                                            ></div>{" "}
                                            {title}
                                            {isLocked && (
                                                <Lock
                                                    size={12}
                                                    className="text-amber-500 ml-1"
                                                />
                                            )}
                                        </h4>
                                        <div className="flex flex-col sm:flex-row gap-5">
                                            {/* Pagu Murni */}
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                                    Total Pagu DIPA{" "}
                                                    {!isLocked && (
                                                        <span className="text-rose-500">
                                                            *
                                                        </span>
                                                    )}
                                                </label>
                                                <div className="relative">
                                                    <span
                                                        className={`absolute left-4 top-3.5 font-black ${isLocked ? "text-slate-300" : "text-slate-400"}`}
                                                    >
                                                        Rp
                                                    </span>
                                                    <input
                                                        disabled={isLocked}
                                                        type="number"
                                                        name={`belanja_${jenis}`}
                                                        value={
                                                            formData[
                                                                `belanja_${jenis}`
                                                            ]
                                                        }
                                                        onChange={handleChange}
                                                        required={!isLocked}
                                                        min="0"
                                                        placeholder={
                                                            isLocked
                                                                ? "Terkunci"
                                                                : "0"
                                                        }
                                                        className={`w-full pl-11 pr-4 py-3.5 border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-mono font-bold outline-none transition-all ${isLocked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white text-indigo-900"}`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Pagu Blokir */}
                                            <div className="flex-1">
                                                <label
                                                    className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5 ${isLocked ? "text-slate-400" : "text-rose-500"}`}
                                                >
                                                    <ShieldAlert size={12} />{" "}
                                                    Pagu Blokir (Jika Ada)
                                                </label>
                                                <div className="relative">
                                                    <span
                                                        className={`absolute left-4 top-3.5 font-black ${isLocked ? "text-slate-300" : "text-rose-400"}`}
                                                    >
                                                        Rp
                                                    </span>
                                                    <input
                                                        disabled={isLocked}
                                                        type="number"
                                                        name={`blokir_${jenis}`}
                                                        value={
                                                            formData[
                                                                `blokir_${jenis}`
                                                            ]
                                                        }
                                                        onChange={handleChange}
                                                        min="0"
                                                        placeholder={
                                                            isLocked
                                                                ? "Terkunci"
                                                                : "0"
                                                        }
                                                        className={`w-full pl-11 pr-4 py-3.5 border-rose-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-sm font-mono font-bold outline-none transition-all ${isLocked ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" : "bg-rose-50/50 text-rose-700"}`}
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

                {/* FOOTER */}
                <div className="p-6 md:px-8 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 relative z-20">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3.5 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors outline-none"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="editAnggaranForm"
                        disabled={isSubmitting}
                        className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white transition-all duration-300 outline-none ${isSubmitting ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-gradient-to-br from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 shadow-[0_8px_16px_rgba(79,70,229,0.25)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5"}`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" strokeWidth={2.5} />
                        )}{" "}
                        Update Pagu
                    </button>
                </div>
            </div>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>
        </div>
    );
}
