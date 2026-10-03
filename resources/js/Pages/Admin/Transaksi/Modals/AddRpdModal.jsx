import React, { useState } from "react";
import axios from "axios";
import {
    X,
    Save,
    Loader2,
    CalendarRange,
    AlertCircle,
    Lock,
    Target,
    Calculator,
    Info,
    CheckCircle,
    AlertTriangle,
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

    const selectedSatkerObj = satkers.find(
        (s) => s.id.toString() === formData.satker_id?.toString(),
    );
    const isSetjen =
        (selectedSatkerObj?.nama_satker || "")
            .toUpperCase()
            .includes("SETJEN") ||
        (selectedSatkerObj?.nama_satker || "")
            .toUpperCase()
            .includes("SEKRETARIAT JENDERAL");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "satker_id") {
                const targetIsSetjen = (
                    satkers.find((s) => s.id.toString() === value?.toString())
                        ?.nama_satker || ""
                )
                    .toUpperCase()
                    .includes("SETJEN");
                if (!targetIsSetjen) updated.belanja_gaji = "0";
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

    const sisaPagu =
        formData.satker_id && satkerSummary[formData.satker_id]
            ? satkerSummary[formData.satker_id].sisa_pagu_rpd
            : 0;

    const paguGaji =
        formData.satker_id && satkerSummary[formData.satker_id]?.pagu_gaji
            ? satkerSummary[formData.satker_id].pagu_gaji
            : 0;
    const paguBarang =
        formData.satker_id && satkerSummary[formData.satker_id]?.pagu_barang
            ? satkerSummary[formData.satker_id].pagu_barang
            : 0;
    const paguModal =
        formData.satker_id && satkerSummary[formData.satker_id]?.pagu_modal
            ? satkerSummary[formData.satker_id].pagu_modal
            : 0;

    const blokirGaji =
        formData.satker_id && satkerSummary[formData.satker_id]?.blokir_gaji
            ? satkerSummary[formData.satker_id].blokir_gaji
            : 0;
    const blokirBarang =
        formData.satker_id && satkerSummary[formData.satker_id]?.blokir_barang
            ? satkerSummary[formData.satker_id].blokir_barang
            : 0;
    const blokirModal =
        formData.satker_id && satkerSummary[formData.satker_id]?.blokir_modal
            ? satkerSummary[formData.satker_id].blokir_modal
            : 0;

    const paguGajiEfektif = paguGaji - blokirGaji;
    const paguBarangEfektif = paguBarang - blokirBarang;
    const paguModalEfektif = paguModal - blokirModal;

    const totalInput =
        (Number(formData.belanja_gaji) || 0) +
        (Number(formData.belanja_barang) || 0) +
        (Number(formData.belanja_modal) || 0);
    const isOverbudget = formData.satker_id && totalInput > sisaPagu;

    const getTargetTW = (bulan) => {
        const b = parseInt(bulan);
        if (!b || isNaN(b))
            return { tw: "-", gaji: 0, barang: 0, modal: 0, listBulan: [] };
        if (b <= 3)
            return {
                tw: "I",
                gaji: 20,
                barang: 15,
                modal: 10,
                listBulan: [1, 2, 3],
            };
        if (b <= 6)
            return {
                tw: "II",
                gaji: 50,
                barang: 50,
                modal: 40,
                listBulan: [1, 2, 3, 4, 5, 6],
            };
        if (b <= 9)
            return {
                tw: "III",
                gaji: 75,
                barang: 70,
                modal: 70,
                listBulan: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            };
        return {
            tw: "IV",
            gaji: 95,
            barang: 90,
            modal: 90,
            listBulan: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        };
    };
    const targetTW = getTargetTW(formData.bulan);

    let kumRpdGajiTW = 0,
        kumRpdBarangTW = 0,
        kumRpdModalTW = 0;
    let kumRpdGajiTotal = 0,
        kumRpdBarangTotal = 0,
        kumRpdModalTotal = 0;

    if (formData.satker_id && satkerSummary[formData.satker_id]) {
        const bulananData = satkerSummary[formData.satker_id].bulanan;

        for (let i = 1; i <= 12; i++) {
            kumRpdGajiTotal += bulananData[i]?.rpd_detail?.gaji || 0;
            kumRpdBarangTotal += bulananData[i]?.rpd_detail?.barang || 0;
            kumRpdModalTotal += bulananData[i]?.rpd_detail?.modal || 0;
        }

        targetTW.listBulan?.forEach((m) => {
            kumRpdGajiTW += bulananData[m]?.rpd_detail?.gaji || 0;
            kumRpdBarangTW += bulananData[m]?.rpd_detail?.barang || 0;
            kumRpdModalTW += bulananData[m]?.rpd_detail?.modal || 0;
        });
    }

    const proyGajiTW = kumRpdGajiTW + (Number(formData.belanja_gaji) || 0);
    const proyBarangTW =
        kumRpdBarangTW + (Number(formData.belanja_barang) || 0);
    const proyModalTW = kumRpdModalTW + (Number(formData.belanja_modal) || 0);

    const targetGaji = paguGaji * (targetTW.gaji / 100);
    const targetBarang = paguBarang * (targetTW.barang / 100);
    const targetModal = paguModal * (targetTW.modal / 100);

    const defGaji = Math.max(0, targetGaji - proyGajiTW);
    const defBarang = Math.max(0, targetBarang - proyBarangTW);
    const defModal = Math.max(0, targetModal - proyModalTW);

    const sisaEfektifGaji = Math.max(0, paguGajiEfektif - kumRpdGajiTotal);
    const sisaEfektifBarang = Math.max(
        0,
        paguBarangEfektif - kumRpdBarangTotal,
    );
    const sisaEfektifModal = Math.max(0, paguModalEfektif - kumRpdModalTotal);

    const isGajiImpossible = defGaji > 0 && defGaji > sisaEfektifGaji;
    const isBarangImpossible = defBarang > 0 && defBarang > sisaEfektifBarang;
    const isModalImpossible = defModal > 0 && defModal > sisaEfektifModal;
    const isAnyImpossible =
        isGajiImpossible || isBarangImpossible || isModalImpossible;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isOverbudget)
            return setErrorMsg("Total RPD melebih Sisa Pagu Keseluruhan!");

        if (Number(formData.belanja_gaji) > sisaEfektifGaji)
            return setErrorMsg(
                `Input Gaji melebihi Sisa Pagu Gaji (${formatCurrency(sisaEfektifGaji)})`,
            );
        if (Number(formData.belanja_barang) > sisaEfektifBarang)
            return setErrorMsg(
                `Input Barang melebihi Sisa Pagu Barang (${formatCurrency(sisaEfektifBarang)})`,
            );
        if (Number(formData.belanja_modal) > sisaEfektifModal)
            return setErrorMsg(
                `Input Modal melebihi Sisa Pagu Modal (${formatCurrency(sisaEfektifModal)})`,
            );

        setIsSubmitting(true);
        setErrorMsg("");
        try {
            const response = await axios.post("/api/transaksi/rpd", {
                ...formData,
                belanja_gaji: isSetjen ? formData.belanja_gaji : 0,
            });
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

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {errorMsg && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
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
                                    className="w-full border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-800"
                                >
                                    <option value="">-- Pilih Satker --</option>
                                    {satkers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.kode_satker} - {s.nama_satker}
                                        </option>
                                    ))}
                                </select>
                                {formData.satker_id && !isSetjen && (
                                    <p className="text-xs font-bold text-amber-600 mt-2 flex items-center gap-1">
                                        <Lock size={12} />{" "}
                                        <span>
                                            Info: Satker ini bukan DIPA Setjen.
                                            Kolom Gaji (51) dikunci (0).
                                        </span>
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
                                    className="w-full border-gray-300 rounded-xl p-2.5 text-sm font-bold text-slate-700"
                                >
                                    {namaBulan.map((b, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {b}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formData.satker_id && (
                                <div className="md:col-span-3 mt-2 bg-gradient-to-r from-slate-50 to-blue-50/50 border border-blue-100 p-5 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-center border-b border-blue-100 pb-2 mb-3">
                                        <h4 className="text-[11px] font-black text-blue-800 flex items-center gap-1.5 uppercase tracking-widest">
                                            <Calculator
                                                size={14}
                                                className="text-blue-600"
                                            />{" "}
                                            Monitor Target Kumulatif TW{" "}
                                            {targetTW.tw}
                                        </h4>
                                    </div>

                                    {isAnyImpossible && (
                                        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[10px] flex items-start gap-3 shadow-sm">
                                            <AlertTriangle
                                                size={18}
                                                className="flex-shrink-0 mt-0.5 text-amber-500"
                                            />
                                            <p className="leading-relaxed">
                                                <span className="block text-xs font-black mb-1 uppercase tracking-widest text-amber-900">
                                                    ⚠️ TARGET IKPA TIDAK DAPAT
                                                    TERCAPAI
                                                </span>
                                                Sisa dompet (Pagu Efektif) Anda
                                                tidak cukup untuk memenuhi
                                                Target Kemenkeu akibat adanya
                                                Pagu Blokir. <br />
                                                Status akan tetap merah (
                                                <strong className="text-rose-600">
                                                    KURANG
                                                </strong>
                                                ), namun Anda{" "}
                                                <strong>
                                                    hanya dapat menginput
                                                    maksimal sebesar sisa uang
                                                    yang tertera di stempel
                                                    merah.
                                                </strong>
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div
                                            className={`p-3 rounded-xl border shadow-sm flex flex-col justify-between relative overflow-hidden ${!isSetjen ? "bg-slate-100 border-slate-200 opacity-60" : "bg-white border-blue-100"}`}
                                        >
                                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                                <Target size={40} />
                                            </div>
                                            <div className="text-center border-b border-slate-50 pb-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                                    51 - Pegawai
                                                </span>
                                                <div className="text-[9px] font-bold text-slate-400">
                                                    TARGET ({targetTW.gaji}%)
                                                </div>
                                                <div className="text-sm font-black text-blue-700">
                                                    {formatCurrency(targetGaji)}
                                                </div>
                                            </div>
                                            <div className="text-center pt-2 bg-slate-50 rounded-lg py-2 mt-1 min-h-[50px] flex flex-col justify-center">
                                                <div className="text-[8px] font-bold text-slate-500 mb-0.5">
                                                    SISA TARGET TW {targetTW.tw}
                                                </div>
                                                {defGaji > 0 ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-[11px] font-black text-rose-600 animate-pulse">
                                                            KURANG: <br />
                                                            {formatCurrency(
                                                                defGaji,
                                                            )}
                                                        </div>
                                                        {isGajiImpossible && (
                                                            <div className="mt-1.5 px-2 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 text-[8px] rounded font-bold uppercase text-center leading-tight">
                                                                {sisaEfektifGaji <=
                                                                0
                                                                    ? "PAGU HABIS / BLOKIR"
                                                                    : `Maks diinput: ${formatCurrency(sisaEfektifGaji)}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs font-black text-emerald-600 flex justify-center items-center gap-1">
                                                        <CheckCircle
                                                            size={12}
                                                        />{" "}
                                                        AMAN
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                                <Target size={40} />
                                            </div>
                                            <div className="text-center border-b border-slate-50 pb-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                                    52 - Barang
                                                </span>
                                                <div className="text-[9px] font-bold text-slate-400">
                                                    TARGET ({targetTW.barang}%)
                                                </div>
                                                <div className="text-sm font-black text-blue-700">
                                                    {formatCurrency(
                                                        targetBarang,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-center pt-2 bg-slate-50 rounded-lg py-2 mt-1 min-h-[50px] flex flex-col justify-center">
                                                <div className="text-[8px] font-bold text-slate-500 mb-0.5">
                                                    SISA TARGET TW {targetTW.tw}
                                                </div>
                                                {defBarang > 0 ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-[11px] font-black text-rose-600 animate-pulse">
                                                            KURANG: <br />
                                                            {formatCurrency(
                                                                defBarang,
                                                            )}
                                                        </div>
                                                        {isBarangImpossible && (
                                                            <div className="mt-1.5 px-2 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 text-[8px] rounded font-bold uppercase text-center leading-tight">
                                                                {sisaEfektifBarang <=
                                                                0
                                                                    ? "PAGU HABIS / BLOKIR"
                                                                    : `Maks diinput: ${formatCurrency(sisaEfektifBarang)}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs font-black text-emerald-600 flex justify-center items-center gap-1">
                                                        <CheckCircle
                                                            size={12}
                                                        />{" "}
                                                        AMAN
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                                <Target size={40} />
                                            </div>
                                            <div className="text-center border-b border-slate-50 pb-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                                    53 - Modal
                                                </span>
                                                <div className="text-[9px] font-bold text-slate-400">
                                                    TARGET ({targetTW.modal}%)
                                                </div>
                                                <div className="text-sm font-black text-blue-700">
                                                    {formatCurrency(
                                                        targetModal,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-center pt-2 bg-slate-50 rounded-lg py-2 mt-1 min-h-[50px] flex flex-col justify-center">
                                                <div className="text-[8px] font-bold text-slate-500 mb-0.5">
                                                    SISA TARGET TW {targetTW.tw}
                                                </div>
                                                {defModal > 0 ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-[11px] font-black text-rose-600 animate-pulse">
                                                            KURANG: <br />
                                                            {formatCurrency(
                                                                defModal,
                                                            )}
                                                        </div>
                                                        {isModalImpossible && (
                                                            <div className="mt-1.5 px-2 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 text-[8px] rounded font-bold uppercase text-center leading-tight">
                                                                {sisaEfektifModal <=
                                                                0
                                                                    ? "PAGU HABIS / BLOKIR"
                                                                    : `Maks diinput: ${formatCurrency(sisaEfektifModal)}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs font-black text-emerald-600 flex justify-center items-center gap-1">
                                                        <CheckCircle
                                                            size={12}
                                                        />{" "}
                                                        AMAN
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {formData.satker_id && (
                            <div
                                className={`p-4 rounded-xl border flex justify-between items-center shadow-sm ${sisaPagu <= 0 ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-300 text-emerald-800"}`}
                            >
                                <p className="text-sm font-black flex flex-col sm:flex-row justify-between w-full">
                                    <span>
                                        Status Pagu Tersedia (Sisa Anggaran
                                        Efektif Keseluruhan):
                                    </span>
                                    <span>{formatCurrency(sisaPagu)}</span>
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {["gaji", "barang", "modal"].map((jenis) => {
                                const isDisabled =
                                    jenis === "gaji" &&
                                    formData.satker_id &&
                                    !isSetjen;
                                const maxInput =
                                    jenis === "gaji"
                                        ? sisaEfektifGaji
                                        : jenis === "barang"
                                          ? sisaEfektifBarang
                                          : sisaEfektifModal;
                                const isInputLocked =
                                    maxInput <= 0 && formData.satker_id;

                                return (
                                    <div
                                        key={jenis}
                                        className="flex flex-col sm:flex-row gap-2 sm:items-center"
                                    >
                                        <div className="sm:w-1/3 flex flex-col">
                                            <label
                                                className={`text-sm font-bold capitalize flex items-center gap-1.5 ${isDisabled || isInputLocked ? "text-gray-400" : "text-gray-700"}`}
                                            >
                                                Rencana {jenis}
                                                {(isDisabled ||
                                                    isInputLocked) && (
                                                    <Lock
                                                        size={14}
                                                        className="text-amber-500"
                                                    />
                                                )}
                                            </label>
                                            {/* 🔥 INI DIA UI UX TAMBAHAN YANG KAMU MINTA 🔥 */}
                                            {formData.satker_id &&
                                                !isDisabled && (
                                                    <span
                                                        className={`text-[10px] font-bold mt-0.5 ${isInputLocked ? "text-red-400" : "text-indigo-500"}`}
                                                    >
                                                        Maks:{" "}
                                                        {formatCurrency(
                                                            maxInput,
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                        <div className="relative sm:w-2/3">
                                            <span
                                                className={`absolute left-3 top-2.5 font-bold ${isDisabled || isInputLocked ? "text-gray-300" : "text-gray-500"}`}
                                            >
                                                Rp
                                            </span>
                                            <input
                                                type="number"
                                                name={`belanja_${jenis}`}
                                                value={
                                                    isDisabled || isInputLocked
                                                        ? "0"
                                                        : formData[
                                                              `belanja_${jenis}`
                                                          ]
                                                }
                                                onChange={handleChange}
                                                required
                                                disabled={
                                                    isDisabled || isInputLocked
                                                }
                                                min="0"
                                                max={maxInput}
                                                className={`w-full pl-10 border-gray-300 rounded-xl p-2.5 font-mono font-bold text-sm focus:ring-2 focus:ring-indigo-500 ${isDisabled || isInputLocked ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-indigo-900 bg-indigo-50/10"}`}
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
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>
        </div>
    );
}
