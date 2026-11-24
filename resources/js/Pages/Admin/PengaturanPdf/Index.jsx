import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MainLayout from "../../../Layouts/MainLayout";
import {
    PenTool,
    Save,
    RotateCcw,
    CheckCircle,
    XCircle,
    Loader2,
    Building2,
    UserCheck,
    FileText,
    Eye,
    Sparkles,
    Clock,
    ShieldCheck,
    ImagePlus,
    Trash2,
    Upload,
} from "lucide-react";

const DEFAULT_VALUES = {
    instansi_baris_1: "KEMENTERIAN HUKUM REPUBLIK INDONESIA",
    instansi_baris_2: "KANTOR WILAYAH SULAWESI TENGAH",
    alamat_kop:
        "Jalan Dewi Sartika No. 74, Palu Selatan, Kota Palu, Sulawesi Tengah 94114 | Laman: silakum.kemenkumsulteng.cloud",
    kota_ttd: "Palu",
    jabatan_ttd: "Kepala Kantor Wilayah,",
    nama_pejabat: "Rakhmat Renaldy, S.H., M.H.",
    nip_pejabat: "197310101996031001",
    catatan_kaki:
        "Dokumen dicetak secara otomatis dari Sistem Informasi Realisasi Anggaran (SIRA) 2.0 (Skala 65 Poin). Tidak memerlukan cap basah.",
};

export default function IndexPengaturanPdf() {
    const [formData, setFormData] = useState(DEFAULT_VALUES);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [removeLogo, setRemoveLogo] = useState(false);

    const [metaInfo, setMetaInfo] = useState({
        updated_at: null,
        editor_name: null,
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef(null);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
        isExiting: false,
    });
    const toastTimeout = useRef(null);
    const exitTimeout = useRef(null);

    const showToast = (message, type = "success") => {
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        if (exitTimeout.current) clearTimeout(exitTimeout.current);
        setToast({ show: true, message, type, isExiting: false });
        exitTimeout.current = setTimeout(
            () => setToast((prev) => ({ ...prev, isExiting: true })),
            3500,
        );
        toastTimeout.current = setTimeout(
            () =>
                setToast({
                    show: false,
                    message: "",
                    type: "success",
                    isExiting: false,
                }),
            4000,
        );
    };

    useEffect(() => {
        setLoading(true);
        axios
            .get("/api/pdf-settings")
            .then((res) => {
                const d = res.data?.data;
                if (d) {
                    setFormData({
                        instansi_baris_1:
                            d.instansi_baris_1 ||
                            DEFAULT_VALUES.instansi_baris_1,
                        instansi_baris_2:
                            d.instansi_baris_2 ||
                            DEFAULT_VALUES.instansi_baris_2,
                        alamat_kop: d.alamat_kop || DEFAULT_VALUES.alamat_kop,
                        kota_ttd: d.kota_ttd || DEFAULT_VALUES.kota_ttd,
                        jabatan_ttd:
                            d.jabatan_ttd || DEFAULT_VALUES.jabatan_ttd,
                        nama_pejabat:
                            d.nama_pejabat || DEFAULT_VALUES.nama_pejabat,
                        nip_pejabat:
                            d.nip_pejabat || DEFAULT_VALUES.nip_pejabat,
                        catatan_kaki: d.catatan_kaki ?? "",
                    });
                    setLogoPreview(d.logo_url || null);
                    setMetaInfo({
                        updated_at: d.updated_at || null,
                        editor_name: d.editor?.name || null,
                    });
                }
            })
            .catch(() =>
                showToast("Gagal memuat pengaturan PDF dari server.", "error"),
            )
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            showToast("Format logo harus PNG, JPG, atau WEBP.", "error");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast("Ukuran file logo maksimal 2 MB.", "error");
            return;
        }

        setLogoFile(file);
        setRemoveLogo(false);
        setLogoPreview(URL.createObjectURL(file));
        e.target.value = "";
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setRemoveLogo(true);
    };

    const handleResetDefaults = () => {
        setFormData(DEFAULT_VALUES);
        showToast(
            "Teks default dimuat ke form. Klik Simpan Perubahan untuk menerapkan.",
            "success",
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = new FormData();
            payload.append("_method", "PUT");
            Object.entries(formData).forEach(([key, val]) => {
                payload.append(key, val ?? "");
            });
            payload.append("remove_logo", removeLogo ? "1" : "0");
            if (logoFile) {
                payload.append("logo", logoFile);
            }

            const res = await axios.post("/api/pdf-settings", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const d = res.data?.data;
            if (d) {
                setLogoFile(null);
                setRemoveLogo(false);
                setLogoPreview(
                    d.logo_url ? `${d.logo_url}?t=${Date.now()}` : null,
                );
                setMetaInfo({
                    updated_at: d.updated_at || new Date().toISOString(),
                    editor_name: d.editor?.name || "Administrator",
                });
            }
            showToast(
                res.data?.message ||
                    "Pengaturan Logo, Kop & TTD PDF berhasil disimpan!",
                "success",
            );
        } catch (err) {
            showToast(
                err.response?.data?.message ||
                    "Gagal menyimpan pengaturan PDF.",
                "error",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const tanggalHariIni = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const formatUpdatedAt = (iso) => {
        if (!iso) return "Belum pernah diubah (Default Sistem)";
        return (
            new Date(iso).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }) + " WITA"
        );
    };

    return (
        <MainLayout tahun={new Date().getFullYear().toString()}>
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                @keyframes slideOutRight { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(120%) scale(0.9); opacity: 0; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
            `}</style>

            <div className="space-y-6 font-sans text-slate-700 relative min-h-screen pb-12">
                <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none -z-10"></div>

                {/* Toast Notification */}
                {toast.show && (
                    <div
                        className={`fixed top-8 right-8 z-[100] flex items-center p-4 min-w-[320px] max-w-md rounded-2xl border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl ${
                            toast.isExiting ? "toast-exit" : "toast-enter"
                        } ${
                            toast.type === "success"
                                ? "bg-[#0A192F]/95 border-emerald-500/30"
                                : "bg-[#0A192F]/95 border-rose-500/30"
                        }`}
                    >
                        <div
                            className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border ${
                                toast.type === "success"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                        >
                            {toast.type === "success" ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                        </div>
                        <div className="ml-3.5 min-w-0">
                            <h4
                                className={`text-[10px] font-black tracking-widest uppercase ${toast.type === "success" ? "text-emerald-400" : "text-rose-400"}`}
                            >
                                {toast.type === "success"
                                    ? "Berhasil"
                                    : "Gagal"}
                            </h4>
                            <p className="text-sm font-semibold text-slate-200 mt-0.5 leading-snug">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* HEADER CARD */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white rounded-2xl shadow-[0_10px_24px_rgba(245,158,11,0.3)] shrink-0">
                            <PenTool size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    Pengaturan Kop &amp; TTD PDF
                                </h2>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-widest">
                                    <Sparkles size={11} /> Dinamis 4 Dokumen
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                                Atur logo instansi, kop surat resmi, dan pejabat
                                penanda tangan untuk seluruh laporan PDF.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-start lg:items-end text-xs bg-slate-50/90 px-4 py-3 rounded-2xl border border-slate-200/80 shrink-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={12} className="text-indigo-500" />{" "}
                            Pembaruan Terakhir
                        </span>
                        <span className="font-extrabold text-slate-800 mt-1">
                            {formatUpdatedAt(metaInfo.updated_at)}
                        </span>
                        {metaInfo.editor_name && (
                            <span className="text-[10px] font-bold text-indigo-600 mt-0.5">
                                Oleh: {metaInfo.editor_name}
                            </span>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-72 bg-white/70 rounded-[2.5rem] border border-white gap-4">
                        <Loader2
                            size={36}
                            className="animate-spin text-amber-500"
                        />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Memuat Konfigurasi PDF...
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* KOLOM KIRI: FORM PENGATURAN */}
                        <form
                            onSubmit={handleSubmit}
                            className="xl:col-span-7 bg-white/85 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-6"
                        >
                            {/* SEKSI 0: LOGO KOP SURAT */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                    <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                                        <ImagePlus
                                            size={18}
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                            Logo Instansi (Header Kop Surat)
                                        </h3>
                                        <p className="text-[11px] font-medium text-slate-400">
                                            Unggah logo Pengayoman/Kementerian
                                            berlatar transparan (PNG/JPG/WEBP,
                                            maks 2 MB).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-[1.75rem] bg-slate-50/80 border border-dashed border-slate-300">
                                    <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-inner flex items-center justify-center overflow-hidden shrink-0 p-2">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo Kop Surat"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-center text-slate-300">
                                                <ImagePlus
                                                    size={28}
                                                    className="mx-auto mb-1"
                                                />
                                                <span className="text-[9px] font-black uppercase tracking-wider block">
                                                    Tanpa Logo
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 text-center sm:text-left space-y-2.5">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={handleLogoSelect}
                                            className="hidden"
                                        />
                                        <p className="text-xs font-bold text-slate-700">
                                            {logoFile
                                                ? `File baru dipilih: ${logoFile.name}`
                                                : logoPreview
                                                  ? "Logo aktif siap ditampilkan di sudut kiri kop surat PDF."
                                                  : "Belum ada logo diunggah. Kop surat akan dicetak tanpa logo."}
                                        </p>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                                            >
                                                <Upload size={14} />{" "}
                                                {logoPreview
                                                    ? "Ganti Logo"
                                                    : "Unggah Logo"}
                                            </button>
                                            {logoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-200 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                                                >
                                                    <Trash2 size={14} /> Hapus
                                                    Logo
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SEKSI 1: KOP SURAT */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                        <Building2
                                            size={18}
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                            Identitas Kop Surat Resmi
                                        </h3>
                                        <p className="text-[11px] font-medium text-slate-400">
                                            Ditampilkan di bagian atas seluruh
                                            dokumen cetak PDF.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                        Instansi Baris 1 (Kementerian) *
                                    </label>
                                    <input
                                        type="text"
                                        name="instansi_baris_1"
                                        value={formData.instansi_baris_1}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-50/70 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                        Instansi Baris 2 (Unit Kantor Wilayah) *
                                    </label>
                                    <input
                                        type="text"
                                        name="instansi_baris_2"
                                        value={formData.instansi_baris_2}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-50/70 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                        Alamat &amp; Laman Kop Surat *
                                    </label>
                                    <textarea
                                        name="alamat_kop"
                                        rows="2"
                                        value={formData.alamat_kop}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-50/70 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* SEKSI 2: PEJABAT PENANDA TANGAN */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                        <UserCheck
                                            size={18}
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                            Pejabat Penanda Tangan
                                        </h3>
                                        <p className="text-[11px] font-medium text-slate-400">
                                            Ubah langsung saat terjadi rotasi
                                            atau pergantian pejabat.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                            Kota Penandatanganan *
                                        </label>
                                        <input
                                            type="text"
                                            name="kota_ttd"
                                            value={formData.kota_ttd}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-50/70 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                            Jabatan Penanda Tangan *
                                        </label>
                                        <input
                                            type="text"
                                            name="jabatan_ttd"
                                            value={formData.jabatan_ttd}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-50/70 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                            Nama Lengkap &amp; Gelar Pejabat *
                                        </label>
                                        <input
                                            type="text"
                                            name="nama_pejabat"
                                            value={formData.nama_pejabat}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-50/70 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                            NIP Pejabat (Tanpa Kata "NIP.") *
                                        </label>
                                        <input
                                            type="text"
                                            name="nip_pejabat"
                                            value={formData.nip_pejabat}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-50/70 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SEKSI 3: CATATAN KAKI */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                        <FileText size={18} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                            Catatan Kaki (Footer PDF)
                                        </h3>
                                        <p className="text-[11px] font-medium text-slate-400">
                                            Teks keterangan autentikasi di
                                            bagian bawah dokumen cetak.
                                        </p>
                                    </div>
                                </div>
                                <textarea
                                    name="catatan_kaki"
                                    rows="2"
                                    value={formData.catatan_kaki}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/70 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
                                />
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleResetDefaults}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                                >
                                    <RotateCcw size={15} /> Muat Default
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 shadow-[0_10px_24px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />{" "}
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} strokeWidth={2.5} />{" "}
                                            Simpan Perubahan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* KOLOM KANAN: LIVE PREVIEW DOKUMEN PDF */}
                        <div className="xl:col-span-5 space-y-4">
                            <div className="bg-[#0B1120] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                            <Eye size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-white">
                                                Live Preview Cetak PDF
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-semibold">
                                                Pratinjau langsung Logo, Kop
                                                &amp; TTD
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                                        Sinkron Real-Time
                                    </span>
                                </div>

                                {/* SIMULASI LEMBAR KERTAS A4 */}
                                <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-inner border border-slate-200 space-y-6">
                                    {/* Kop Surat Preview dengan Logo */}
                                    <div className="border-b-2 border-slate-900 pb-3 text-center">
                                        <div className="inline-flex items-center justify-center gap-3">
                                            {logoPreview && (
                                                <div className="shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logo"
                                                        className="max-h-10 max-w-10 object-contain"
                                                    />
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <p className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wider leading-tight">
                                                    {formData.instansi_baris_1 ||
                                                        "INSTANSI BARIS 1"}
                                                </p>
                                                <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-wide mt-0.5 leading-tight">
                                                    {formData.instansi_baris_2 ||
                                                        "INSTANSI BARIS 2"}
                                                </h4>
                                            </div>
                                        </div>
                                        <p className="text-[8px] text-slate-500 mt-1.5 leading-relaxed">
                                            {formData.alamat_kop ||
                                                "Alamat kop surat..."}
                                        </p>
                                    </div>

                                    {/* Skeleton Konten Laporan */}
                                    <div className="space-y-2 py-2">
                                        <div className="h-3 w-3/5 mx-auto bg-slate-200 rounded"></div>
                                        <div className="h-2 w-2/5 mx-auto bg-indigo-100 rounded"></div>
                                        <div className="grid grid-cols-3 gap-2 pt-3">
                                            <div className="h-8 bg-slate-100 rounded border border-slate-200"></div>
                                            <div className="h-8 bg-slate-100 rounded border border-slate-200"></div>
                                            <div className="h-8 bg-slate-100 rounded border border-slate-200"></div>
                                        </div>
                                        <div className="h-12 bg-slate-50 rounded border border-dashed border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            Area Tabel &amp; Grafik Kinerja 65
                                            Poin
                                        </div>
                                    </div>

                                    {/* Blok Tanda Tangan Preview */}
                                    <div className="flex justify-end pt-2">
                                        <div className="w-56 text-center text-[10px] leading-snug">
                                            <p>
                                                {formData.kota_ttd || "Palu"},{" "}
                                                {tanggalHariIni}
                                            </p>
                                            <p className="font-bold mt-0.5">
                                                {formData.jabatan_ttd ||
                                                    "Kepala Kantor Wilayah,"}
                                            </p>
                                            <div className="h-14"></div>
                                            <p className="font-black underline text-[11px] text-slate-900">
                                                {formData.nama_pejabat ||
                                                    "Nama Pejabat"}
                                            </p>
                                            <p className="text-[9.5px] font-semibold text-slate-700 mt-0.5">
                                                NIP.{" "}
                                                {formData.nip_pejabat || "-"}
                                            </p>
                                        </div>
                                    </div>

                                    {formData.catatan_kaki && (
                                        <div className="pt-2 border-t border-dashed border-slate-300 text-[8px] italic text-slate-400">
                                            * {formData.catatan_kaki}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <ShieldCheck size={13} /> Otomatis
                                        Diterapkan Pada 4 PDF:
                                    </p>
                                    <ul className="text-[11px] text-slate-300 font-medium space-y-1 pl-4 list-disc">
                                        <li>
                                            Executive Summary Dashboard (Command
                                            Center)
                                        </li>
                                        <li>
                                            Leaderboard Nasional Lintas Satker
                                        </li>
                                        <li>
                                            Rapor Kinerja IKPA 65 Poin Satker
                                        </li>
                                        <li>
                                            Laporan Detail Capaian Output (RO)
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
