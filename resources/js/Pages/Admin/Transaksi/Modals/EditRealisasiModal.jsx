import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    X,
    Save,
    Plus,
    Trash2,
    Loader2,
    Edit3,
    AlertCircle,
    AlertTriangle,
} from "lucide-react";

export default function EditRealisasiModal({
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
    });
    const [rincian, setRincian] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (isOpen && editData) {
            setFormData({
                satker_id: editData.satker_id || "",
                tahun: editData.tahun || "",
                bulan: editData.bulan || "",
            });
            if (editData.details && editData.details.length > 0) {
                setRincian(
                    editData.details.map((d) => ({
                        id: d.id,
                        jenis_belanja: d.jenis_belanja,
                        uraian: d.uraian,
                        nominal: d.nominal,
                    })),
                );
            } else {
                setRincian([
                    {
                        id: Date.now(),
                        jenis_belanja: "barang",
                        uraian: "",
                        nominal: "",
                    },
                ]);
            }
            setErrorMsg("");
            setShowConfirm(false);
        }
    }, [isOpen, editData]);

    const totalRealisasi = useMemo(
        () =>
            rincian.reduce(
                (total, item) => total + (Number(item.nominal) || 0),
                0,
            ),
        [rincian],
    );
    const oldTotal = useMemo(
        () =>
            editData && editData.details
                ? editData.details.reduce(
                      (sum, item) => sum + (Number(item.nominal) || 0),
                      0,
                  )
                : 0,
        [editData],
    );
    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

    // --- LOGIKA SISA PAGU & RPD (DINAMIS BULANAN EDIT) ---
    const targetBulan = formData.bulan;

    const rpdBulanIni =
        formData.satker_id && satkerSummary[formData.satker_id]?.bulanan
            ? satkerSummary[formData.satker_id].bulanan[targetBulan]?.rpd || 0
            : 0;

    const realBulanIni =
        formData.satker_id && satkerSummary[formData.satker_id]?.bulanan
            ? satkerSummary[formData.satker_id].bulanan[targetBulan]
                  ?.realisasi || 0
            : 0;

    // Kembalikan dana lama dulu ke hitungan bulan ini, lalu kurangi dengan inputan baru secara real-time
    const sisaRpdAwal = rpdBulanIni - realBulanIni + oldTotal;
    const sisaRpdDinamis = sisaRpdAwal - totalRealisasi;

    const sisaPagu =
        formData.satker_id && satkerSummary[formData.satker_id]
            ? satkerSummary[formData.satker_id].sisa_pagu_realisasi + oldTotal
            : 0;
    const isOverbudget = formData.satker_id && totalRealisasi > sisaPagu;

    const getTriwulan = (bln) => {
        if (bln <= 3) return { tw: "I", target: "20%" };
        if (bln <= 6) return { tw: "II", target: "50%" };
        if (bln <= 9) return { tw: "III", target: "75%" };
        return { tw: "IV", target: "100%" };
    };
    const currentTW = getTriwulan(formData.bulan);

    if (!isOpen) return null;

    const handleAddRow = () =>
        setRincian([
            ...rincian,
            {
                id: `new_${Date.now()}`,
                jenis_belanja: "barang",
                uraian: "",
                nominal: "",
            },
        ]);
    const handleRemoveRow = (id) =>
        rincian.length > 1 &&
        setRincian(rincian.filter((item) => item.id !== id));
    const handleRincianChange = (id, field, value) =>
        setRincian(
            rincian.map((item) =>
                item.id === id ? { ...item, [field]: value } : item,
            ),
        );

    const handleSubmit = async (e, forceSubmit = false) => {
        if (e) e.preventDefault();

        if (isOverbudget) {
            setErrorMsg(
                `Total Realisasi melebihi Batas Pagu Negara! Kurangi nominal sebesar ${formatCurrency(totalRealisasi - sisaPagu)}`,
            );
            return;
        }

        const isRincianValid = rincian.every(
            (item) =>
                item.uraian.trim() !== "" &&
                item.nominal !== "" &&
                Number(item.nominal) > 0,
        );
        if (!isRincianValid) {
            setErrorMsg("Lengkapi semua rincian pengeluaran.");
            return;
        }

        // MUNCULKAN POP-UP KONFIRMASI JIKA DEVIASI RPD
        if (sisaRpdDinamis < 0 && !forceSubmit) {
            setShowConfirm(true);
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");
        try {
            await axios.put(`/api/transaksi/realisasi/${editData.id}`, {
                rincian,
            });
            onSuccess("Data Realisasi berhasil diperbarui!");
            setShowConfirm(false);
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] relative">
                {/* --- OVERLAY POP-UP KONFIRMASI DEVIASI --- */}
                {showConfirm && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
                            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 mb-2">
                                Konfirmasi Deviasi RPD
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                Total update realisasi ini{" "}
                                <strong>
                                    melebihi rencana bulan{" "}
                                    {namaBulan[formData.bulan - 1]}
                                </strong>
                                . Hal ini dapat menurunkan nilai{" "}
                                <strong>IKPA Halaman III DIPA</strong>. Apakah
                                Anda yakin ingin tetap mengubahnya?
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors w-full"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConfirm(false);
                                        handleSubmit(null, true);
                                    }}
                                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-md w-full"
                                >
                                    Ya, Update
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* ----------------------------------------- */}

                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Edit3 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">
                                Edit Data Realisasi
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Perbarui rincian pengeluaran dana satker.
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

                <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/30 flex-1">
                    {errorMsg && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                            {errorMsg}
                        </div>
                    )}

                    {isOverbudget && (
                        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-rose-800">
                                    Peringatan Fatal!
                                </h4>
                                <p className="text-sm text-rose-600 mt-1">
                                    Total Realisasi ({" "}
                                    <span className="font-bold">
                                        {formatCurrency(totalRealisasi)}
                                    </span>{" "}
                                    ) melebihi Sisa Pagu Negara.
                                </p>
                            </div>
                        </div>
                    )}

                    {formData.satker_id &&
                        !isOverbudget &&
                        sisaRpdDinamis < 0 && (
                            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-800">
                                        Perhatian: Deviasi RPD Bulan{" "}
                                        {namaBulan[formData.bulan - 1]}
                                    </h4>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Realisasi Anda melebihi rencana (RPD)
                                        pada bulan ini. Ini dapat menurunkan
                                        nilai IKPA.
                                    </p>
                                </div>
                            </div>
                        )}

                    <form
                        id="editRealisasiForm"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm opacity-80">
                            <div className="md:col-span-3 pb-2 mb-2 border-b border-gray-200">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                    Identitas Laporan (Terkunci)
                                </h3>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-bold text-gray-500 mb-2">
                                    Satuan Kerja
                                </label>
                                <select
                                    disabled
                                    value={formData.satker_id}
                                    className="w-full border-gray-300 rounded-xl py-2.5 px-3 border bg-gray-200 text-gray-500 text-sm"
                                >
                                    <option value={formData.satker_id}>
                                        {satkers.find(
                                            (s) => s.id === formData.satker_id,
                                        )?.nama_satker || "Memuat..."}
                                    </option>
                                </select>
                                {formData.satker_id && (
                                    <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                        <p
                                            className={`text-xs font-bold flex justify-between ${sisaRpdDinamis < 0 ? "text-amber-600" : "text-blue-700"}`}
                                        >
                                            <span>
                                                Sisa RPD{" "}
                                                {namaBulan[formData.bulan - 1]}:
                                            </span>
                                            <span className="font-mono text-sm">
                                                {formatCurrency(sisaRpdDinamis)}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">
                                    Tahun
                                </label>
                                <input
                                    disabled
                                    type="text"
                                    value={formData.tahun}
                                    className="w-full border-gray-300 rounded-xl py-2.5 px-3 border bg-gray-200 text-gray-500 text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-500 mb-2">
                                    Bulan
                                </label>
                                <input
                                    disabled
                                    type="text"
                                    value={
                                        namaBulan[formData.bulan - 1] ||
                                        formData.bulan
                                    }
                                    className="w-full border-gray-300 rounded-xl py-2.5 px-3 border bg-gray-200 text-gray-500 text-sm"
                                />
                                <div className="mt-2 inline-block px-2.5 py-1 bg-gray-200 border border-gray-300 rounded-md">
                                    <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                                        Triwulan {currentTW.tw} • Target:{" "}
                                        {currentTW.target}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm relative">
                            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-100">
                                <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                                    Rincian Pengeluaran
                                </h3>
                                <div className="text-sm font-extrabold text-gray-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                    Total:{" "}
                                    <span
                                        className={
                                            sisaRpdDinamis < 0
                                                ? "text-amber-600"
                                                : "text-amber-600"
                                        }
                                    >
                                        {formatCurrency(totalRealisasi)}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {rincian.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col md:flex-row gap-3 items-start"
                                    >
                                        <div className="w-full md:w-1/4">
                                            {index === 0 && (
                                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                                    Jenis Belanja
                                                </label>
                                            )}
                                            <select
                                                value={item.jenis_belanja}
                                                onChange={(e) =>
                                                    handleRincianChange(
                                                        item.id,
                                                        "jenis_belanja",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border-gray-300 rounded-xl py-2.5 px-3 border focus:ring-2 focus:ring-amber-500 text-sm"
                                            >
                                                <option value="gaji">
                                                    51 - Gaji
                                                </option>
                                                <option value="barang">
                                                    52 - Barang
                                                </option>
                                                <option value="modal">
                                                    53 - Modal
                                                </option>
                                            </select>
                                        </div>
                                        <div className="w-full md:w-2/4">
                                            {index === 0 && (
                                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                                    Uraian / Keterangan
                                                </label>
                                            )}
                                            <input
                                                type="text"
                                                value={item.uraian}
                                                onChange={(e) =>
                                                    handleRincianChange(
                                                        item.id,
                                                        "uraian",
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className="w-full border-gray-300 rounded-xl py-2.5 px-3 border focus:ring-2 focus:ring-amber-500 text-sm"
                                            />
                                        </div>
                                        <div className="w-full md:w-1/4">
                                            {index === 0 && (
                                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                                    Nominal (Rp)
                                                </label>
                                            )}
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={item.nominal}
                                                    onChange={(e) =>
                                                        handleRincianChange(
                                                            item.id,
                                                            "nominal",
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    min="1"
                                                    className="w-full border-gray-300 rounded-xl py-2.5 px-3 border focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveRow(item.id)
                                                    }
                                                    disabled={
                                                        rincian.length === 1
                                                    }
                                                    className="p-2.5 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-colors disabled:opacity-30"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="mt-4 flex items-center justify-center w-full gap-2 py-3 border-2 border-dashed border-amber-200 text-amber-500 font-bold rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-colors"
                            >
                                <Plus size={18} /> Tambah Item Pengeluaran
                            </button>
                        </div>
                    </form>
                </div>

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
                        form="editRealisasiForm"
                        disabled={isSubmitting || isOverbudget}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-md ${isSubmitting || isOverbudget ? "bg-amber-400 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-600 hover:shadow-lg"}`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}{" "}
                        Update Realisasi
                    </button>
                </div>
            </div>
        </div>
    );
}
