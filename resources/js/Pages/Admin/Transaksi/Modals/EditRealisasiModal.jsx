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
    Calculator,
    Info,
    Target,
    CheckCircle,
    Lock,
} from "lucide-react";

export default function EditRealisasiModal({
    isOpen,
    onClose,
    onSuccess,
    satkers = [],
    editData,
    satkerSummary = {},
    localAuth,
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

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

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

    // Uang yang lama dikembalikan dulu ke dompet sebelum dicek sisa dinamisnya
    const sisaRpdAwal = rpdBulanIni - realBulanIni + oldTotal;
    const sisaRpdDinamis = sisaRpdAwal - totalRealisasi;

    const sisaPagu =
        formData.satker_id && satkerSummary?.[formData.satker_id]
            ? satkerSummary[formData.satker_id].sisa_pagu_realisasi + oldTotal
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

        // ABAIKAN BULAN INI KARENA SEDANG DIEDIT (UANG MASUK DOMPET SEMENTARA)
        for (let i = 1; i <= 12; i++) {
            if (i !== parseInt(formData.bulan)) {
                kumRealGajiTotal += bulananData[i]?.real_detail?.gaji || 0;
                kumRealBarangTotal += bulananData[i]?.real_detail?.barang || 0;
                kumRealModalTotal += bulananData[i]?.real_detail?.modal || 0;
            }
        }

        targetKemenkeu.listBulan?.forEach((m) => {
            if (m !== parseInt(formData.bulan)) {
                kumRealGajiTW += bulananData[m]?.real_detail?.gaji || 0;
                kumRealBarangTW += bulananData[m]?.real_detail?.barang || 0;
                kumRealModalTW += bulananData[m]?.real_detail?.modal || 0;
            }
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

    // 🔥 POSISI PALING AMAN PENAHAN CRASH REACT (DI BAWAH SEMUA HOOKS) 🔥
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

    const handleRincianChange = (id, field, value) => {
        if (field === "jenis_belanja" && value === "gaji" && !isSetjen) return;
        setRincian(
            rincian.map((item) =>
                item.id === id ? { ...item, [field]: value } : item,
            ),
        );
    };

    const handleSubmit = async (e, forceSubmit = false) => {
        if (e) e.preventDefault();
        if (isOverbudget)
            return setErrorMsg(
                `Total Realisasi melebihi Batas Pagu Keseluruhan!`,
            );

        if (inputGaji > sisaEfektifGaji)
            return setErrorMsg(
                `Total Input Gaji melebihi Sisa Pagu Gaji (${formatCurrency(sisaEfektifGaji)})`,
            );
        if (inputBarang > sisaEfektifBarang)
            return setErrorMsg(
                `Total Input Barang melebihi Sisa Pagu Barang (${formatCurrency(sisaEfektifBarang)})`,
            );
        if (inputModal > sisaEfektifModal)
            return setErrorMsg(
                `Total Input Modal melebihi Sisa Pagu Modal (${formatCurrency(sisaEfektifModal)})`,
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
                                    Total Realisasi melebihi Sisa Pagu Negara.
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm opacity-90">
                            <div className="md:col-span-3 pb-2 mb-2 border-b border-gray-100">
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
                                    className="w-full border-gray-300 rounded-xl py-2.5 px-3 border bg-gray-100 text-gray-500 text-sm font-bold"
                                >
                                    <option value={formData.satker_id}>
                                        {satkers?.find(
                                            (s) => s.id === formData.satker_id,
                                        )?.nama_satker || "Memuat..."}
                                    </option>
                                </select>
                                {formData.satker_id && (
                                    <div className="mt-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                                        <p
                                            className={`text-xs font-bold flex justify-between ${sisaRpdDinamis < 0 ? "text-amber-600" : "text-emerald-700"}`}
                                        >
                                            <span>
                                                Sisa RPD Keseluruhan{" "}
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
                                    className="w-full border-gray-300 rounded-xl py-2.5 px-3 border bg-gray-100 text-gray-500 text-sm font-bold"
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
                                    className="w-full border-gray-300 rounded-xl py-2.5 px-3 border bg-gray-100 text-gray-500 text-sm font-bold"
                                />
                                <div className="mt-2 inline-block px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md">
                                    <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                                        Triwulan {currentTW.tw} • Target IKPA:{" "}
                                        {currentTW.target}
                                    </span>
                                </div>
                            </div>

                            {formData.satker_id && (
                                <div className="md:col-span-3 mt-4 bg-gradient-to-r from-slate-50 to-emerald-50/50 border border-emerald-100 p-5 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-center border-b border-emerald-100 pb-2 mb-3">
                                        <h4 className="text-[11px] font-black text-emerald-800 flex items-center gap-1.5 uppercase tracking-widest">
                                            <Calculator
                                                size={14}
                                                className="text-emerald-600"
                                            />{" "}
                                            Target Minimal Realisasi (IKPA
                                            Penyerapan TW {targetKemenkeu.tw})
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
                                            className={`p-3 rounded-xl border shadow-sm flex flex-col justify-between relative overflow-hidden ${!isSetjen ? "bg-slate-100 border-slate-200 opacity-60" : "bg-white border-emerald-100"}`}
                                        >
                                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                                <Target size={40} />
                                            </div>
                                            <div className="text-center border-b border-slate-50 pb-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                                    51 - Pegawai
                                                </span>
                                                <div className="text-[9px] font-bold text-slate-400">
                                                    TARGET KUMULATIF (
                                                    {targetKemenkeu.gaji}%)
                                                </div>
                                                <div className="text-sm font-black text-emerald-700">
                                                    {formatCurrency(
                                                        targetRpGaji,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-center pt-2 bg-slate-50 rounded-lg py-2 mt-1 min-h-[50px] flex flex-col justify-center">
                                                <div className="text-[8px] font-bold text-slate-500 mb-0.5">
                                                    MINIMAL HARUS DIISI
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

                                        <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                                <Target size={40} />
                                            </div>
                                            <div className="text-center border-b border-slate-50 pb-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                                    52 - Barang
                                                </span>
                                                <div className="text-[9px] font-bold text-slate-400">
                                                    TARGET KUMULATIF (
                                                    {targetKemenkeu.barang}%)
                                                </div>
                                                <div className="text-sm font-black text-emerald-700">
                                                    {formatCurrency(
                                                        targetRpBarang,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-center pt-2 bg-slate-50 rounded-lg py-2 mt-1 min-h-[50px] flex flex-col justify-center">
                                                <div className="text-[8px] font-bold text-slate-500 mb-0.5">
                                                    MINIMAL HARUS DIISI
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

                                        <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                                <Target size={40} />
                                            </div>
                                            <div className="text-center border-b border-slate-50 pb-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                                    53 - Modal
                                                </span>
                                                <div className="text-[9px] font-bold text-slate-400">
                                                    TARGET KUMULATIF (
                                                    {targetKemenkeu.modal}%)
                                                </div>
                                                <div className="text-sm font-black text-emerald-700">
                                                    {formatCurrency(
                                                        targetRpModal,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-center pt-2 bg-slate-50 rounded-lg py-2 mt-1 min-h-[50px] flex flex-col justify-center">
                                                <div className="text-[8px] font-bold text-slate-500 mb-0.5">
                                                    MINIMAL HARUS DIISI
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
                                    <div className="mt-3.5 flex items-start gap-1.5 text-[9px] font-bold text-slate-400 bg-white p-2 rounded-lg border border-slate-100">
                                        <Info
                                            size={12}
                                            className="flex-shrink-0 mt-0.5 text-emerald-400"
                                        />
                                        <p>
                                            Target realisasi berjalan secara{" "}
                                            <strong className="text-rose-500">
                                                real-time
                                            </strong>{" "}
                                            sesuai rincian di bawah. Jika nilai
                                            kekurangan terlunasi, status berubah{" "}
                                            <strong className="text-emerald-500">
                                                AMAN
                                            </strong>{" "}
                                            (IKPA Maksimal).
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm relative">
                            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-100">
                                <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                                    Rincian Pengeluaran
                                </h3>
                                <div className="text-sm font-extrabold text-gray-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                    Total Input:{" "}
                                    <span className="text-amber-600">
                                        {formatCurrency(totalRealisasi)}
                                    </span>
                                </div>
                            </div>

                            {/* 🔥 INFO BATAS MAKSIMAL RPD & PAGU EFEKTIF (LIVE UPDATE) 🔥 */}
                            {formData.satker_id && (
                                <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        {
                                            id: "gaji",
                                            title: "51 - Pegawai",
                                            sisa: sisaEfektifGaji,
                                            rpd: rpdDetail.gaji,
                                            terisi: inputGaji,
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
                                            className={`p-3 rounded-xl border flex flex-col justify-center transition-colors ${k.sisa - k.terisi < 0 ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"}`}
                                        >
                                            <div className="flex justify-between items-center mb-2 border-b border-slate-200/60 pb-1.5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                    {k.title}
                                                </span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-bold text-slate-500">
                                                        Sisa Dompet (Maks Input)
                                                    </span>
                                                    <span
                                                        className={`font-mono text-xs font-black ${k.sisa - k.terisi < 0 ? "text-rose-600 animate-pulse" : "text-indigo-600"}`}
                                                    >
                                                        Rp{" "}
                                                        {formatCurrency(
                                                            Math.max(
                                                                0,
                                                                k.sisa -
                                                                    k.terisi,
                                                            ),
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-bold text-slate-500">
                                                        Rencana Penarikan (RPD)
                                                    </span>
                                                    <span className="font-mono text-[10px] font-black text-amber-600">
                                                        Rp{" "}
                                                        {formatCurrency(k.rpd)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-3">
                                {rincian.map((item, index) => {
                                    // Hitung maks dompet untuk spesifik inputan ini agar tidak bablas
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
                                                    <option
                                                        value="gaji"
                                                        disabled={!isSetjen}
                                                    >
                                                        51 - Gaji{" "}
                                                        {!isSetjen &&
                                                            "(Khusus Setjen)"}
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
                                                        max={
                                                            maxInputItem > 0
                                                                ? maxInputItem
                                                                : undefined
                                                        }
                                                        className="w-full border-gray-300 rounded-xl py-2.5 px-3 border focus:ring-2 focus:ring-amber-500 text-sm font-mono font-bold text-slate-700"
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
                                                        className="p-2.5 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-colors disabled:opacity-30"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                {formData.satker_id && (
                                                    <p
                                                        className={`text-[9px] font-bold mt-1 ml-1 ${maxInputItem < Number(item.nominal) ? "text-rose-500 animate-pulse" : "text-indigo-500"}`}
                                                    >
                                                        Maks: Rp{" "}
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
