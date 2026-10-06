import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    X,
    Save,
    Loader2,
    Edit,
    AlertCircle,
    Lock,
    Calculator,
    Target,
    CheckCircle,
    AlertTriangle,
    Wallet,
} from "lucide-react";

export default function EditRpdModal({
    isOpen,
    onClose,
    onSuccess,
    satkers = [],
    editData,
    satkerSummary = {},
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

    const oldTotal = useMemo(() => {
        if (!editData) return 0;
        return (
            (Number(editData.belanja_gaji) || 0) +
            (Number(editData.belanja_barang) || 0) +
            (Number(editData.belanja_modal) || 0)
        );
    }, [editData]);

    if (!isOpen) return null;

    const selectedSatkerObj = satkers?.find(
        (s) => s.id?.toString() === formData.satker_id?.toString(),
    );
    const isSetjen =
        (selectedSatkerObj?.nama_satker || "")
            .toUpperCase()
            .includes("SETJEN") ||
        (selectedSatkerObj?.nama_satker || "")
            .toUpperCase()
            .includes("SEKRETARIAT JENDERAL");

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

    const sisaPagu =
        formData.satker_id && satkerSummary?.[formData.satker_id]
            ? satkerSummary[formData.satker_id].sisa_pagu_rpd + oldTotal
            : 0;
    const paguGaji =
        formData.satker_id && satkerSummary?.[formData.satker_id]?.pagu_gaji
            ? satkerSummary[formData.satker_id].pagu_gaji
            : 0;
    const paguBarang =
        formData.satker_id && satkerSummary?.[formData.satker_id]?.pagu_barang
            ? satkerSummary[formData.satker_id].pagu_barang
            : 0;
    const paguModal =
        formData.satker_id && satkerSummary?.[formData.satker_id]?.pagu_modal
            ? satkerSummary[formData.satker_id].pagu_modal
            : 0;
    const blokirGaji =
        formData.satker_id && satkerSummary?.[formData.satker_id]?.blokir_gaji
            ? satkerSummary[formData.satker_id].blokir_gaji
            : 0;
    const blokirBarang =
        formData.satker_id && satkerSummary?.[formData.satker_id]?.blokir_barang
            ? satkerSummary[formData.satker_id].blokir_barang
            : 0;
    const blokirModal =
        formData.satker_id && satkerSummary?.[formData.satker_id]?.blokir_modal
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

    if (formData.satker_id && satkerSummary?.[formData.satker_id]) {
        const bulananData = satkerSummary[formData.satker_id].bulanan;
        for (let i = 1; i <= 12; i++) {
            if (i !== parseInt(formData.bulan)) {
                kumRpdGajiTotal += bulananData?.[i]?.rpd_detail?.gaji || 0;
                kumRpdBarangTotal += bulananData?.[i]?.rpd_detail?.barang || 0;
                kumRpdModalTotal += bulananData?.[i]?.rpd_detail?.modal || 0;
            }
        }
        targetTW.listBulan?.forEach((m) => {
            if (m !== parseInt(formData.bulan)) {
                kumRpdGajiTW += bulananData?.[m]?.rpd_detail?.gaji || 0;
                kumRpdBarangTW += bulananData?.[m]?.rpd_detail?.barang || 0;
                kumRpdModalTW += bulananData?.[m]?.rpd_detail?.modal || 0;
            }
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

    const handleChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isOverbudget)
            return setErrorMsg(`Total RPD melebih Sisa Pagu Keseluruhan!`);
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
            const response = await axios.put(
                `/api/transaksi/rpd/${editData.id}`,
                {
                    ...formData,
                    belanja_gaji: isSetjen ? formData.belanja_gaji : 0,
                },
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-md transition-all duration-300">
            <div
                className={`bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-3xl overflow-hidden border flex flex-col max-h-[95vh] animate-in zoom-in-95 fade-in duration-300 transition-colors ${isOverbudget ? "border-rose-400 shadow-[0_0_40px_rgba(225,29,72,0.2)]" : "border-white"}`}
            >
                {/* HEADER (AMBER THEME) */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-100/60 bg-slate-50/30 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-[0_8px_16px_rgba(245,158,11,0.2)]">
                            <Edit size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                Edit RPD
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                Perbarui Rencana Penarikan Dana Halaman III
                                DIPA.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors relative z-10"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar bg-white/50 relative">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle
                                className="text-rose-500 shrink-0 mt-0.5"
                                size={20}
                            />
                            <div>
                                <h4 className="text-sm font-bold text-rose-800">
                                    Gagal Memproses
                                </h4>
                                <p className="text-sm text-rose-600 font-medium mt-0.5">
                                    {errorMsg}
                                </p>
                            </div>
                        </div>
                    )}
                    {isOverbudget && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-pulse shadow-sm">
                            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-black text-rose-800 uppercase tracking-widest">
                                    Peringatan Overbudget!
                                </h4>
                                <p className="text-sm text-rose-600 mt-1 font-medium">
                                    Total RPD Anda (
                                    <span className="font-extrabold">
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
                        className="space-y-6 relative z-10"
                    >
                        {/* LOCKED FIELDS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/50 p-5 rounded-[2rem] border border-dashed border-slate-200 backdrop-blur-sm">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                    <Lock size={10} /> Satker
                                </label>
                                <input
                                    disabled
                                    value={
                                        satkers?.find(
                                            (s) => s.id === formData.satker_id,
                                        )?.kode_satker || ""
                                    }
                                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-500 outline-none cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                    <Lock size={10} /> Tahun
                                </label>
                                <input
                                    disabled
                                    value={formData.tahun}
                                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-500 outline-none cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                    <Lock size={10} /> Bulan
                                </label>
                                <input
                                    disabled
                                    value={namaBulan[formData.bulan - 1] || ""}
                                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-500 outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {formData.satker_id && (
                            <div className="mt-2 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 border border-indigo-100/80 p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-40 h-40 bg-white/40 rounded-full blur-[40px] pointer-events-none"></div>
                                <div className="flex justify-between items-center border-b border-indigo-200/50 pb-3 mb-4 relative z-10">
                                    <h4 className="text-xs font-black text-indigo-800 flex items-center gap-2 uppercase tracking-widest">
                                        <Calculator
                                            size={16}
                                            className="text-indigo-600"
                                        />{" "}
                                        Analitik Target Kumulatif TW{" "}
                                        {targetTW.tw}
                                    </h4>
                                </div>

                                {isAnyImpossible && (
                                    <div className="mb-5 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-[11px] flex items-start gap-3 shadow-sm relative z-10">
                                        <AlertTriangle
                                            size={20}
                                            className="flex-shrink-0 mt-0.5 text-amber-500"
                                        />
                                        <p className="leading-relaxed font-medium">
                                            <span className="block text-[11px] font-black mb-1 uppercase tracking-widest text-amber-900">
                                                ⚠️ Pagu Tersedia Tidak Mencukupi
                                                Target
                                            </span>
                                            Sisa Pagu Efektif Anda tidak cukup
                                            untuk memenuhi Target Kemenkeu
                                            akibat adanya{" "}
                                            <span className="font-bold">
                                                Pagu Blokir
                                            </span>
                                            . Status akan tetap merah, namun
                                            Anda{" "}
                                            <strong className="text-rose-600">
                                                hanya dapat menginput maksimal
                                                sebesar sisa pagu efektif yang
                                                tertera.
                                            </strong>
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative z-10">
                                    {[
                                        {
                                            label: "51 - Pegawai",
                                            target: targetTW.gaji,
                                            valTarget: targetGaji,
                                            def: defGaji,
                                            sisa: sisaEfektifGaji,
                                            imp: isGajiImpossible,
                                            icon: Target,
                                            isLocked: !isSetjen,
                                        },
                                        {
                                            label: "52 - Barang",
                                            target: targetTW.barang,
                                            valTarget: targetBarang,
                                            def: defBarang,
                                            sisa: sisaEfektifBarang,
                                            imp: isBarangImpossible,
                                            icon: Target,
                                        },
                                        {
                                            label: "53 - Modal",
                                            target: targetTW.modal,
                                            valTarget: targetModal,
                                            def: defModal,
                                            sisa: sisaEfektifModal,
                                            imp: isModalImpossible,
                                            icon: Target,
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-2xl border flex flex-col justify-between relative overflow-hidden transition-all ${item.isLocked ? "bg-slate-100 border-slate-200 opacity-60" : "bg-white/80 backdrop-blur-sm border-indigo-100 shadow-[0_4px_15px_rgba(99,102,241,0.05)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)]"}`}
                                        >
                                            <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] rotate-12">
                                                <item.icon size={60} />
                                            </div>
                                            <div className="text-center border-b border-slate-100 pb-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                                    {item.label}
                                                </span>
                                                <div className="text-[9px] font-extrabold text-slate-400/80 mb-1">
                                                    TARGET ({item.target}%)
                                                </div>
                                                <div className="text-[15px] font-black text-indigo-700">
                                                    {formatCurrency(
                                                        item.valTarget,
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className={`text-center pt-3 mt-1 min-h-[60px] flex flex-col justify-center rounded-xl ${item.def > 0 ? "bg-rose-50/50" : "bg-emerald-50/50"}`}
                                            >
                                                <div className="text-[8px] font-bold text-slate-500 mb-1 uppercase tracking-widest">
                                                    Kekurangan TW {targetTW.tw}
                                                </div>
                                                {item.def > 0 ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-[12px] font-black text-rose-600 tracking-tight">
                                                            {formatCurrency(
                                                                item.def,
                                                            )}
                                                        </div>
                                                        {item.imp && (
                                                            <div className="mt-2 px-2.5 py-1 bg-rose-100 text-rose-700 border border-rose-200 text-[8px] rounded-lg font-bold uppercase text-center leading-tight shadow-sm">
                                                                {item.sisa <= 0
                                                                    ? "PAGU HABIS/BLOKIR"
                                                                    : `Maks: ${formatCurrency(item.sisa)}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-[11px] font-black text-emerald-600 flex justify-center items-center gap-1.5">
                                                        <CheckCircle
                                                            size={14}
                                                            strokeWidth={2.5}
                                                        />{" "}
                                                        AMAN
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 🔥 BANNER INFORMASI DOMPET UTAMA 🔥 */}
                        {formData.satker_id && (
                            <div
                                className={`p-5 mt-2 rounded-[1.5rem] border flex flex-col sm:flex-row justify-between items-center shadow-sm relative overflow-hidden transition-all ${sisaPagu <= 0 ? "bg-rose-50 border-rose-200" : "bg-emerald-50/80 border-emerald-200"}`}
                            >
                                <div className="absolute right-0 top-0 w-32 h-32 bg-white/40 rounded-full blur-[30px] pointer-events-none"></div>
                                <div className="relative z-10 flex items-center gap-4">
                                    <div
                                        className={`p-3 rounded-2xl shadow-inner ${sisaPagu <= 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}
                                    >
                                        <Wallet size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p
                                            className={`text-[11px] font-black uppercase tracking-widest ${sisaPagu <= 0 ? "text-rose-500" : "text-emerald-600"}`}
                                        >
                                            Status Dompet Utama
                                        </p>
                                        <p className="text-sm font-bold text-slate-700 mt-0.5">
                                            Sisa Pagu Efektif Keseluruhan
                                            (Termasuk Input Saat Ini)
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`text-2xl font-black relative z-10 mt-4 sm:mt-0 tracking-tight ${sisaPagu <= 0 ? "text-rose-600 animate-pulse" : "text-emerald-700"}`}
                                >
                                    {formatCurrency(sisaPagu)}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 pt-2">
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
                                        className="flex flex-col sm:flex-row gap-3 sm:items-center p-3 rounded-[1.5rem] hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                                    >
                                        <div className="sm:w-1/3 flex flex-col px-2">
                                            <label
                                                className={`text-[13px] font-extrabold capitalize flex items-center gap-2 ${isDisabled || isInputLocked ? "text-slate-400" : "text-slate-700"}`}
                                            >
                                                Rencana {jenis}{" "}
                                                {(isDisabled ||
                                                    isInputLocked) && (
                                                    <Lock
                                                        size={14}
                                                        className="text-amber-500"
                                                    />
                                                )}
                                            </label>
                                            {formData.satker_id &&
                                                !isDisabled && (
                                                    <span
                                                        className={`text-[10px] font-bold mt-1 ${isInputLocked ? "text-rose-400" : "text-indigo-500"}`}
                                                    >
                                                        Maks:{" "}
                                                        {formatCurrency(
                                                            maxInput,
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                        <div className="relative sm:w-2/3">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                                                <span
                                                    className={`font-black text-sm ${isDisabled || isInputLocked ? "text-slate-300" : "text-slate-400"}`}
                                                >
                                                    Rp
                                                </span>
                                            </div>
                                            <input
                                                type="number"
                                                name={`belanja_${jenis}`}
                                                value={
                                                    isDisabled && !isInputLocked
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
                                                className={`w-full pl-12 pr-5 py-3.5 border-slate-200/80 rounded-2xl font-mono font-bold text-[15px] focus:ring-4 focus:border-amber-500 transition-all outline-none shadow-sm ${isDisabled || isInputLocked ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" : "text-slate-800 bg-white hover:border-amber-300 focus:ring-amber-500/10"}`}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </form>
                </div>

                {/* FOOTER */}
                <div className="p-6 md:px-8 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 relative z-20">
                    <div className="flex flex-col w-full sm:w-auto text-center sm:text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Total Perubahan
                        </span>
                        <span
                            className={`text-2xl font-black tracking-tight ${isOverbudget ? "text-rose-500 animate-pulse" : "text-slate-800"}`}
                        >
                            {formatCurrency(totalInput)}
                        </span>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors outline-none"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="editRpdForm"
                            disabled={isSubmitting || isOverbudget}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white transition-all duration-300 outline-none ${isSubmitting || isOverbudget ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-[0_8px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5"}`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <Save className="w-5 h-5" strokeWidth={2.5} />
                            )}{" "}
                            Update RPD
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
