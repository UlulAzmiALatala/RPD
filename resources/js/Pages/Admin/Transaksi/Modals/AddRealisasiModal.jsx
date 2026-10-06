import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
    X,
    Save,
    Plus,
    Trash2,
    Loader2,
    Receipt,
    AlertCircle,
    AlertTriangle,
    Calculator,
    Info,
    Target,
    CheckCircle,
    Lock,
    Wallet,
    Sparkles,
} from "lucide-react";

export default function AddRealisasiModal({
    isOpen,
    onClose,
    onSuccess,
    satkers,
    defaultTahun,
    satkerSummary,
    localAuth,
}) {
    const [formData, setFormData] = useState({
        satker_id: "",
        tahun: defaultTahun || new Date().getFullYear().toString(),
        bulan: new Date().getMonth() + 1,
    });

    const [rincian, setRincian] = useState([
        { id: Date.now(), jenis_belanja: "barang", uraian: "", nominal: "" },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    const selectedSatkerData = satkers?.find(
        (s) => s.id === parseInt(formData.satker_id || 0),
    );
    const namaSatkerUpper = (
        selectedSatkerData?.nama_satker || ""
    ).toUpperCase();
    const isSetjen =
        namaSatkerUpper.includes("SETJEN") ||
        namaSatkerUpper.includes("SEKRETARIAT JENDERAL") ||
        selectedSatkerData?.kode_satker === "692028";

    useEffect(() => {
        if (!isSetjen) {
            setRincian((prev) =>
                prev.map((item) =>
                    item.jenis_belanja === "gaji"
                        ? { ...item, jenis_belanja: "barang" }
                        : item,
                ),
            );
        }
    }, [formData.satker_id, isSetjen]);

    useEffect(() => {
        if (
            localAuth &&
            localAuth.role !== "admin" &&
            satkers.length > 0 &&
            !formData.satker_id
        ) {
            const mySatker = satkers.find(
                (s) => s.kode_satker === localAuth.kode_satker,
            );
            if (mySatker)
                setFormData((prev) => ({ ...prev, satker_id: mySatker.id }));
        }
    }, [localAuth, satkers, formData.satker_id]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

    const totalRealisasi = useMemo(
        () =>
            rincian.reduce(
                (total, item) => total + (Number(item.nominal) || 0),
                0,
            ),
        [rincian],
    );
    const inputGaji = useMemo(
        () =>
            rincian.reduce(
                (tot, item) =>
                    item.jenis_belanja === "gaji"
                        ? tot + (Number(item.nominal) || 0)
                        : tot,
                0,
            ),
        [rincian],
    );
    const inputBarang = useMemo(
        () =>
            rincian.reduce(
                (tot, item) =>
                    item.jenis_belanja === "barang"
                        ? tot + (Number(item.nominal) || 0)
                        : tot,
                0,
            ),
        [rincian],
    );
    const inputModal = useMemo(
        () =>
            rincian.reduce(
                (tot, item) =>
                    item.jenis_belanja === "modal"
                        ? tot + (Number(item.nominal) || 0)
                        : tot,
                0,
            ),
        [rincian],
    );

    const targetBulan = formData.bulan;
    const rpdBulanIni =
        formData.satker_id && satkerSummary?.[formData.satker_id]?.bulanan
            ? satkerSummary[formData.satker_id].bulanan[targetBulan]?.rpd || 0
            : 0;
    const realBulanIni =
        formData.satker_id && satkerSummary?.[formData.satker_id]?.bulanan
            ? satkerSummary[formData.satker_id].bulanan[targetBulan]
                  ?.realisasi || 0
            : 0;
    const rpdDetail =
        formData.satker_id &&
        satkerSummary?.[formData.satker_id]?.bulanan[targetBulan]?.rpd_detail
            ? satkerSummary[formData.satker_id].bulanan[targetBulan].rpd_detail
            : { gaji: 0, barang: 0, modal: 0 };

    const sisaRpdAwal = rpdBulanIni - realBulanIni;
    const sisaRpdDinamis = sisaRpdAwal - totalRealisasi;

    const sisaPagu =
        formData.satker_id && satkerSummary?.[formData.satker_id]
            ? satkerSummary[formData.satker_id].sisa_pagu_realisasi
            : 0;
    const isOverbudget = formData.satker_id && totalRealisasi > sisaPagu;

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

    const getTriwulan = (bln) => {
        if (bln <= 3) return { tw: "I", target: "20%" };
        if (bln <= 6) return { tw: "II", target: "50%" };
        if (bln <= 9) return { tw: "III", target: "75%" };
        return { tw: "IV", target: "100%" };
    };
    const currentTW = getTriwulan(formData.bulan);

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
    const targetKemenkeu = getTargetTW(formData.bulan);

    let kumRealGajiTW = 0,
        kumRealBarangTW = 0,
        kumRealModalTW = 0;
    let kumRealGajiTotal = 0,
        kumRealBarangTotal = 0,
        kumRealModalTotal = 0;

    if (formData.satker_id && satkerSummary?.[formData.satker_id]) {
        const bulananData = satkerSummary[formData.satker_id].bulanan;
        for (let i = 1; i <= 12; i++) {
            kumRealGajiTotal += bulananData[i]?.real_detail?.gaji || 0;
            kumRealBarangTotal += bulananData[i]?.real_detail?.barang || 0;
            kumRealModalTotal += bulananData[i]?.real_detail?.modal || 0;
        }
        targetKemenkeu.listBulan?.forEach((m) => {
            kumRealGajiTW += bulananData[m]?.real_detail?.gaji || 0;
            kumRealBarangTW += bulananData[m]?.real_detail?.barang || 0;
            kumRealModalTW += bulananData[m]?.real_detail?.modal || 0;
        });
    }

    const proyGaji = kumRealGajiTW + inputGaji;
    const proyBarang = kumRealBarangTW + inputBarang;
    const proyModal = kumRealModalTW + inputModal;

    const targetRpGaji = paguGaji * (targetKemenkeu.gaji / 100);
    const targetRpBarang = paguBarang * (targetKemenkeu.barang / 100);
    const targetRpModal = paguModal * (targetKemenkeu.modal / 100);

    const defGaji = Math.max(0, targetRpGaji - proyGaji);
    const defBarang = Math.max(0, targetRpBarang - proyBarang);
    const defModal = Math.max(0, targetRpModal - proyModal);

    const sisaEfektifGaji = Math.max(0, paguGajiEfektif - kumRealGajiTotal);
    const sisaEfektifBarang = Math.max(
        0,
        paguBarangEfektif - kumRealBarangTotal,
    );
    const sisaEfektifModal = Math.max(0, paguModalEfektif - kumRealModalTotal);

    const isGajiImpossible =
        defGaji > 0 && defGaji > sisaEfektifGaji - inputGaji;
    const isBarangImpossible =
        defBarang > 0 && defBarang > sisaEfektifBarang - inputBarang;
    const isModalImpossible =
        defModal > 0 && defModal > sisaEfektifModal - inputModal;
    const isAnyImpossible =
        isGajiImpossible || isBarangImpossible || isModalImpossible;

    if (!isOpen) return null;

    const handleAddRow = () =>
        setRincian([
            ...rincian,
            {
                id: Date.now(),
                jenis_belanja: "barang",
                uraian: "",
                nominal: "",
            },
        ]);
    const handleRemoveRow = (id) =>
        rincian.length > 1 &&
        setRincian(rincian.filter((item) => item.id !== id));
    const handleRincianChange = (id, field, value) => {
        if (field === "jenis_belanja" && value === "gaji" && !isSetjen) return;
        setRincian(
            rincian.map((item) =>
                item.id === id ? { ...item, [field]: value } : item,
            ),
        );
    };
    const handleFormChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e, forceSubmit = false) => {
        if (e) e.preventDefault();
        if (isOverbudget)
            return setErrorMsg(
                `Gagal: Total Realisasi melebihi Batas Pagu Keseluruhan!`,
            );
        if (inputGaji > sisaEfektifGaji)
            return setErrorMsg(
                `Input Gaji melebihi Sisa Pagu Gaji (${formatCurrency(sisaEfektifGaji)})`,
            );
        if (inputBarang > sisaEfektifBarang)
            return setErrorMsg(
                `Input Barang melebihi Sisa Pagu Barang (${formatCurrency(sisaEfektifBarang)})`,
            );
        if (inputModal > sisaEfektifModal)
            return setErrorMsg(
                `Input Modal melebihi Sisa Pagu Modal (${formatCurrency(sisaEfektifModal)})`,
            );

        const isRincianValid = rincian.every(
            (item) =>
                item.uraian.trim() !== "" &&
                item.nominal !== "" &&
                Number(item.nominal) > 0,
        );
        if (!isRincianValid)
            return setErrorMsg(
                "Lengkapi semua rincian pengeluaran (Uraian & Nominal tidak boleh kosong).",
            );
        if (sisaRpdDinamis < 0 && !forceSubmit) return setShowConfirm(true);

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            const payload = { ...formData, rincian: rincian };
            const response = await axios.post(
                "/api/transaksi/realisasi",
                payload,
            );
            setFormData({
                satker_id:
                    localAuth?.role === "admin" ? "" : formData.satker_id,
                tahun: defaultTahun,
                bulan: new Date().getMonth() + 1,
            });
            setRincian([
                {
                    id: Date.now(),
                    jenis_belanja: "barang",
                    uraian: "",
                    nominal: "",
                },
            ]);
            onSuccess(
                response.data.message || "Data Realisasi berhasil ditambahkan!",
            );
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-md transition-all duration-300">
            <div
                className={`bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-5xl overflow-hidden border flex flex-col max-h-[95vh] animate-in zoom-in-95 fade-in duration-300 transition-colors relative ${isOverbudget ? "border-rose-400 shadow-[0_0_40px_rgba(225,29,72,0.2)]" : "border-white"}`}
            >
                {/* 🛡️ PREMIUM CONFIRMATION OVERLAY (DEVIASI RPD) */}
                {showConfirm && (
                    <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md rounded-[2.5rem]">
                        <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-300 border border-amber-200 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                            <div className="w-20 h-20 bg-amber-100/50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                                <AlertTriangle size={40} strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                                Konfirmasi Deviasi RPD
                            </h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                Total realisasi yang Anda masukkan{" "}
                                <strong>
                                    melebihi rencana (RPD) bulan{" "}
                                    {namaBulan[formData.bulan - 1]}
                                </strong>
                                . Hal ini dapat menurunkan nilai{" "}
                                <strong>IKPA Halaman III DIPA</strong>. Yakin
                                ingin melanjutkan?
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 px-5 py-3.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConfirm(false);
                                        handleSubmit(null, true);
                                    }}
                                    className="flex-1 px-5 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all shadow-[0_8px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5"
                                >
                                    Ya, Lanjutkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* HEADER */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-100/60 bg-slate-50/30 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl shadow-[0_8px_16px_rgba(16,185,129,0.2)]">
                            <Receipt size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                Input Realisasi
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                Catat rincian pengeluaran aktual dana Satuan
                                Kerja.
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
                                    Peringatan Fatal!
                                </h4>
                                <p className="text-sm text-rose-600 mt-1 font-medium">
                                    Total Realisasi melebihi Sisa Pagu Negara.
                                    Anda tidak dapat menyimpannya.
                                </p>
                            </div>
                        </div>
                    )}
                    {formData.satker_id &&
                        !isOverbudget &&
                        sisaRpdDinamis < 0 && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-sm transition-all duration-300">
                                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-black text-amber-800 uppercase tracking-widest">
                                        Deviasi RPD Bulan{" "}
                                        {namaBulan[formData.bulan - 1]}
                                    </h4>
                                    <p className="text-sm text-amber-700 mt-1 font-medium">
                                        Realisasi Anda melebihi batas RPD yang
                                        direncanakan. Ini dapat menurunkan nilai
                                        IKPA Halaman III DIPA.
                                    </p>
                                </div>
                            </div>
                        )}

                    <form
                        id="addRealisasiForm"
                        onSubmit={handleSubmit}
                        className="space-y-6 relative z-10"
                    >
                        {/* IDENTITAS LAPORAN */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/80 p-5 rounded-[2rem] border border-slate-200/60 shadow-inner backdrop-blur-sm">
                            <div className="md:col-span-3">
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    Satuan Kerja{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="satker_id"
                                    value={formData.satker_id}
                                    onChange={handleFormChange}
                                    required
                                    disabled={localAuth?.role !== "admin"}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none appearance-none cursor-pointer transition-all disabled:opacity-70 disabled:bg-slate-100"
                                >
                                    <option value="" disabled>
                                        -- Pilih Satker --
                                    </option>
                                    {satkers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.kode_satker} - {s.nama_satker}
                                        </option>
                                    ))}
                                </select>
                                {formData.satker_id && (
                                    <div className="mt-3 p-3 bg-white border border-emerald-100 rounded-xl shadow-sm flex justify-between items-center">
                                        <span
                                            className={`text-[11px] font-black uppercase tracking-widest ${sisaRpdDinamis < 0 ? "text-amber-600" : "text-emerald-600"}`}
                                        >
                                            Sisa RPD{" "}
                                            {namaBulan[formData.bulan - 1]}{" "}
                                            (Live)
                                        </span>
                                        <span
                                            className={`font-mono font-bold text-sm ${sisaRpdDinamis < 0 ? "text-amber-600 animate-pulse" : "text-emerald-700"}`}
                                        >
                                            {formatCurrency(sisaRpdDinamis)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    Tahun{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="tahun"
                                    value={formData.tahun}
                                    onChange={handleFormChange}
                                    required
                                    min="2020"
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    Bulan{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="bulan"
                                    value={formData.bulan}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none appearance-none cursor-pointer transition-all"
                                >
                                    {namaBulan.map((bulan, index) => (
                                        <option
                                            key={index + 1}
                                            value={index + 1}
                                        >
                                            {bulan}
                                        </option>
                                    ))}
                                </select>
                                <div className="mt-2.5 inline-block px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                                        <Target size={12} /> TW {currentTW.tw} •
                                        Target: {currentTW.target}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* TARGET MINIMAL REALISASI (HUD) */}
                        {formData.satker_id && (
                            <div className="mt-2 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-100/80 p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-40 h-40 bg-white/40 rounded-full blur-[40px] pointer-events-none"></div>
                                <div className="flex justify-between items-center border-b border-emerald-200/50 pb-3 mb-4 relative z-10">
                                    <h4 className="text-xs font-black text-emerald-800 flex items-center gap-2 uppercase tracking-widest">
                                        <Calculator
                                            size={16}
                                            className="text-emerald-600"
                                        />{" "}
                                        Target Minimal (IKPA Penyerapan TW{" "}
                                        {targetKemenkeu.tw})
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
                                            . Anda hanya dapat menginput
                                            maksimal sebesar sisa uang yang
                                            tertera.
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative z-10">
                                    {[
                                        {
                                            label: "51 - Pegawai",
                                            target: targetKemenkeu.gaji,
                                            valTarget: targetRpGaji,
                                            def: defGaji,
                                            sisa: sisaEfektifGaji,
                                            imp: isGajiImpossible,
                                            icon: Target,
                                            isLocked: !isSetjen,
                                        },
                                        {
                                            label: "52 - Barang",
                                            target: targetKemenkeu.barang,
                                            valTarget: targetRpBarang,
                                            def: defBarang,
                                            sisa: sisaEfektifBarang,
                                            imp: isBarangImpossible,
                                            icon: Target,
                                        },
                                        {
                                            label: "53 - Modal",
                                            target: targetKemenkeu.modal,
                                            valTarget: targetRpModal,
                                            def: defModal,
                                            sisa: sisaEfektifModal,
                                            imp: isModalImpossible,
                                            icon: Target,
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-2xl border flex flex-col justify-between relative overflow-hidden transition-all ${item.isLocked ? "bg-slate-100 border-slate-200 opacity-60" : "bg-white/80 backdrop-blur-sm border-emerald-100 shadow-[0_4px_15px_rgba(16,185,129,0.05)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)]"}`}
                                        >
                                            <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] rotate-12">
                                                <item.icon size={60} />
                                            </div>
                                            <div className="text-center border-b border-slate-100 pb-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1 mb-1">
                                                    {item.label}{" "}
                                                    {item.isLocked && (
                                                        <Lock
                                                            size={10}
                                                            className="text-amber-500"
                                                        />
                                                    )}
                                                </span>
                                                <div className="text-[9px] font-extrabold text-slate-400/80 mb-1">
                                                    TARGET KUMULATIF (
                                                    {item.target}%)
                                                </div>
                                                <div className="text-[15px] font-black text-emerald-700">
                                                    {formatCurrency(
                                                        item.valTarget,
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className={`text-center pt-3 mt-1 min-h-[60px] flex flex-col justify-center rounded-xl ${item.def > 0 ? "bg-rose-50/50" : "bg-emerald-50/50"}`}
                                            >
                                                <div className="text-[8px] font-bold text-slate-500 mb-1 uppercase tracking-widest">
                                                    MINIMAL HARUS DIISI
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
                                                                    ? "PAGU HABIS"
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

                        {/* RINCIAN PENGELUARAN DINAMIS */}
                        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-emerald-100 shadow-sm relative">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 mb-5 border-b border-slate-100 gap-4">
                                <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                    <Receipt size={18} /> Rincian Transaksi
                                </h3>
                            </div>

                            {/* LIVE DOMPET CARDS */}
                            {formData.satker_id && (
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        {
                                            id: "gaji",
                                            title: "51 - Pegawai",
                                            sisa: sisaEfektifGaji,
                                            rpd: rpdDetail.gaji,
                                            terisi: inputGaji,
                                            isLocked: !isSetjen,
                                        },
                                        {
                                            id: "barang",
                                            title: "52 - Barang",
                                            sisa: sisaEfektifBarang,
                                            rpd: rpdDetail.barang,
                                            terisi: inputBarang,
                                        },
                                        {
                                            id: "modal",
                                            title: "53 - Modal",
                                            sisa: sisaEfektifModal,
                                            rpd: rpdDetail.modal,
                                            terisi: inputModal,
                                        },
                                    ].map((k) => (
                                        <div
                                            key={k.title}
                                            className={`p-4 rounded-[1.5rem] border flex flex-col justify-center transition-all ${k.isLocked ? "bg-slate-100 border-slate-200 opacity-60" : k.sisa - k.terisi < 0 ? "bg-rose-50 border-rose-200 shadow-sm" : "bg-slate-50/80 border-slate-200/80"}`}
                                        >
                                            <div className="flex justify-between items-center mb-2.5 border-b border-slate-200/60 pb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                                    {k.title}{" "}
                                                    {k.isLocked && (
                                                        <Lock
                                                            size={12}
                                                            className="text-amber-500"
                                                        />
                                                    )}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">
                                                        Sisa Dompet (Maks)
                                                    </span>
                                                    <span
                                                        className={`font-mono text-sm font-black ${k.isLocked ? "text-slate-400" : k.sisa - k.terisi < 0 ? "text-rose-600 animate-pulse" : "text-emerald-600"}`}
                                                    >
                                                        {formatCurrency(
                                                            Math.max(
                                                                0,
                                                                k.sisa -
                                                                    k.terisi,
                                                            ),
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">
                                                        RPD Terencana
                                                    </span>
                                                    <span
                                                        className={`font-mono text-[11px] font-bold ${k.isLocked ? "text-slate-400" : "text-amber-600"}`}
                                                    >
                                                        {formatCurrency(k.rpd)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* DYNAMIC ROWS */}
                            <div className="space-y-4">
                                {rincian.map((item, index) => {
                                    const maxInputItem =
                                        item.jenis_belanja === "gaji"
                                            ? sisaEfektifGaji -
                                              inputGaji +
                                              (Number(item.nominal) || 0)
                                            : item.jenis_belanja === "barang"
                                              ? sisaEfektifBarang -
                                                inputBarang +
                                                (Number(item.nominal) || 0)
                                              : sisaEfektifModal -
                                                inputModal +
                                                (Number(item.nominal) || 0);
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex flex-col md:flex-row gap-3 items-start p-4 bg-slate-50 rounded-[1.5rem] border border-slate-200/60 hover:border-emerald-200 transition-colors group"
                                        >
                                            <div className="w-full md:w-1/4">
                                                {index === 0 && (
                                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
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
                                                    className="w-full border-slate-200 rounded-2xl py-3 px-4 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                                                >
                                                    <option
                                                        value="gaji"
                                                        disabled={!isSetjen}
                                                    >
                                                        51 - Gaji{" "}
                                                        {!isSetjen &&
                                                            "(Setjen)"}
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
                                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                                        Uraian Transaksi
                                                    </label>
                                                )}
                                                <input
                                                    type="text"
                                                    placeholder="Contoh: Pembayaran Honorarium..."
                                                    value={item.uraian}
                                                    onChange={(e) =>
                                                        handleRincianChange(
                                                            item.id,
                                                            "uraian",
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    className="w-full border-slate-200 rounded-2xl py-3 px-4 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold outline-none placeholder:font-normal"
                                                />
                                            </div>
                                            <div className="w-full md:w-1/4">
                                                {index === 0 && (
                                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                                        Nominal
                                                    </label>
                                                )}
                                                <div className="flex gap-2 relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                                        <span className="font-black text-sm text-slate-400">
                                                            Rp
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
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
                                                        max={
                                                            maxInputItem > 0
                                                                ? maxInputItem
                                                                : undefined
                                                        }
                                                        className="w-full pl-11 pr-3 border-slate-200 rounded-2xl py-3 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-mono font-bold text-slate-800 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveRow(
                                                                item.id,
                                                            )
                                                        }
                                                        disabled={
                                                            rincian.length === 1
                                                        }
                                                        className="p-3 text-rose-400 bg-white border border-rose-100 hover:bg-rose-500 hover:text-white hover:border-rose-500 rounded-2xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-rose-400"
                                                    >
                                                        <Trash2
                                                            size={18}
                                                            strokeWidth={2.5}
                                                        />
                                                    </button>
                                                </div>
                                                {formData.satker_id && (
                                                    <p
                                                        className={`text-[9px] font-bold mt-1.5 ml-2 ${maxInputItem < Number(item.nominal) ? "text-rose-500 animate-pulse" : "text-emerald-500"}`}
                                                    >
                                                        Maks:{" "}
                                                        {formatCurrency(
                                                            Math.max(
                                                                0,
                                                                maxInputItem,
                                                            ),
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="mt-5 flex items-center justify-center w-full gap-2 py-3.5 border-2 border-dashed border-emerald-200 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 hover:border-emerald-400 transition-all outline-none"
                            >
                                <Plus size={18} strokeWidth={2.5} /> Tambah
                                Baris Pengeluaran
                            </button>
                        </div>
                    </form>
                </div>

                {/* FOOTER */}
                <div className="p-6 md:px-8 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 relative z-20">
                    <div className="flex flex-col w-full sm:w-auto text-center sm:text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Total Realisasi Diajukan
                        </span>
                        <span
                            className={`text-2xl font-black tracking-tight ${isOverbudget ? "text-rose-500 animate-pulse" : "text-emerald-600"}`}
                        >
                            {formatCurrency(totalRealisasi)}
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
                            form="addRealisasiForm"
                            disabled={isSubmitting || isOverbudget}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white transition-all duration-300 outline-none ${isSubmitting || isOverbudget ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-emerald-500 hover:bg-emerald-600 shadow-[0_8px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"}`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" strokeWidth={2.5} />
                            )}{" "}
                            Simpan Realisasi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
