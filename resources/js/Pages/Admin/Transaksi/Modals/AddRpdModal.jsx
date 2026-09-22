import React, { useState } from "react";
import axios from "axios";
import {
    X,
    Save,
    Loader2,
    CalendarRange,
    AlertCircle,
    Lock,
} from "lucide-react";

export default function AddRpdModal({
    isOpen,
    onClose,
    onSuccess,
    satkers,
    defaultTahun,
    satkerSummary,
}) {
    const [formData, setFormData] = useState({
        satker_id: "",
        tahun: defaultTahun || new Date().getFullYear().toString(),
        bulan: new Date().getMonth() + 1,
        belanja_gaji: "",
        belanja_barang: "",
        belanja_modal: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen) return null;

    // 🔥 DETEKSI APAKAH SATKER YANG DIPILIH ADALAH SETJEN
    const selectedSatkerObj = satkers.find(
        (s) => s.id.toString() === formData.satker_id?.toString(),
    );
    const namaSatkerUpper = (
        selectedSatkerObj?.nama_satker || ""
    ).toUpperCase();
    const isSetjen =
        namaSatkerUpper.includes("SETJEN") ||
        namaSatkerUpper.includes("SEKRETARIAT JENDERAL");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            // Jika satker berubah dan bukan Setjen, pastikan belanja_gaji di-set jadi 0/kosong
            if (name === "satker_id") {
                const satkerTarget = satkers.find(
                    (s) => s.id.toString() === value?.toString(),
                );
                const nameUpper = (
                    satkerTarget?.nama_satker || ""
                ).toUpperCase();
                const targetIsSetjen =
                    nameUpper.includes("SETJEN") ||
                    nameUpper.includes("SEKRETARIAT JENDERAL");
                if (!targetIsSetjen) {
                    updated.belanja_gaji = "0";
                }
            }
            return updated;
        });
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

    // --- LOGIKA VALIDASI SISA PAGU REAL-TIME ---
    const sisaPagu =
        formData.satker_id && satkerSummary[formData.satker_id]
            ? satkerSummary[formData.satker_id].sisa_pagu_rpd
            : 0;

    // Hitung total inputan user saat ini
    const totalInput =
        (Number(formData.belanja_gaji) || 0) +
        (Number(formData.belanja_barang) || 0) +
        (Number(formData.belanja_modal) || 0);

    // Cek apakah jebol?
    const isOverbudget = formData.satker_id && totalInput > sisaPagu;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isOverbudget) {
            setErrorMsg(
                `Total RPD melebih Sisa Pagu! Kurangi nominal sebesar ${formatCurrency(totalInput - sisaPagu)}`,
            );
            return;
        }

        // Jika bukan Setjen, pastikan kirim nilai gaji 0
        const payload = {
            ...formData,
            belanja_gaji: isSetjen ? formData.belanja_gaji : 0,
        };

        setIsSubmitting(true);
        setErrorMsg("");
        try {
            const response = await axios.post("/api/transaksi/rpd", payload);
            setFormData({
                satker_id: "",
                tahun: defaultTahun,
                bulan: new Date().getMonth() + 1,
                belanja_gaji: "",
                belanja_barang: "",
                belanja_modal: "",
            });
            onSuccess(response.data.message || "RPD berhasil ditambahkan!");
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
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <CalendarRange size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">
                                Tambah RPD
                            </h2>
                            <p className="text-sm text-gray-500">
                                Input Rencana Penarikan Dana.
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

                <div className="p-6 overflow-y-auto flex-1">
                    {errorMsg && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
                            {errorMsg}
                        </div>
                    )}

                    {/* Boks Peringatan Overbudget */}
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
                        id="addRpdForm"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-indigo-50/30 p-5 rounded-xl border border-indigo-100">
                            <div className="md:col-span-3">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Pilih Satuan Kerja
                                </label>
                                <select
                                    name="satker_id"
                                    value={formData.satker_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">-- Pilih Satker --</option>
                                    {satkers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.kode_satker} - {s.nama_satker}
                                        </option>
                                    ))}
                                </select>

                                {/* Notifikasi khusus Satker Non-Setjen */}
                                {formData.satker_id && !isSetjen && (
                                    <p className="text-xs font-bold text-amber-600 mt-2 flex items-center gap-1">
                                        <Lock size={12} />{" "}
                                        <span>
                                            Info: Satker ini bukan DIPA Setjen.
                                            Kolom Belanja Gaji (51) dikunci
                                            otomatis (0).
                                        </span>
                                    </p>
                                )}

                                {/* Indikator Sisa Pagu Muncul Disini */}
                                {formData.satker_id && (
                                    <p
                                        className={`text-xs font-bold mt-2 flex justify-between ${sisaPagu <= 0 ? "text-red-500" : "text-emerald-600"}`}
                                    >
                                        <span>Status Pagu Tersedia:</span>
                                        <span>{formatCurrency(sisaPagu)}</span>
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Tahun
                                </label>
                                <input
                                    type="number"
                                    name="tahun"
                                    value={formData.tahun}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-gray-300 rounded-xl p-2.5 text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Bulan Rencana
                                </label>
                                <select
                                    name="bulan"
                                    value={formData.bulan}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-gray-300 rounded-xl p-2.5 text-sm"
                                >
                                    {namaBulan.map((b, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {b}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {["gaji", "barang", "modal"].map((jenis) => {
                                // Jika jenis adalah 'gaji' dan satker BUKAN Setjen, maka disable inputan
                                const isDisabled =
                                    jenis === "gaji" &&
                                    formData.satker_id &&
                                    !isSetjen;

                                return (
                                    <div
                                        key={jenis}
                                        className="flex flex-col sm:flex-row gap-2 sm:items-center"
                                    >
                                        <label
                                            className={`sm:w-1/3 text-sm font-bold capitalize text-gray-700 flex items-center gap-1.5 ${isDisabled ? "text-gray-400" : ""}`}
                                        >
                                            Rencana {jenis}{" "}
                                            {isDisabled && (
                                                <Lock
                                                    size={14}
                                                    className="text-amber-500"
                                                />
                                            )}
                                        </label>
                                        <div className="relative sm:w-2/3">
                                            <span
                                                className={`absolute left-3 top-2.5 font-bold ${isDisabled ? "text-gray-300" : "text-gray-500"}`}
                                            >
                                                Rp
                                            </span>
                                            <input
                                                type="number"
                                                name={`belanja_${jenis}`}
                                                value={
                                                    isDisabled
                                                        ? "0"
                                                        : formData[
                                                              `belanja_${jenis}`
                                                          ]
                                                }
                                                onChange={handleChange}
                                                required
                                                disabled={isDisabled}
                                                min="0"
                                                className={`w-full pl-10 border-gray-300 rounded-xl p-2.5 font-mono text-sm focus:ring-2 focus:ring-indigo-500 ${isDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
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
                            form="addRpdForm"
                            disabled={
                                isSubmitting || isOverbudget || sisaPagu <= 0
                            }
                            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all ${isSubmitting || isOverbudget || sisaPagu <= 0 ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"}`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}{" "}
                            Simpan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
