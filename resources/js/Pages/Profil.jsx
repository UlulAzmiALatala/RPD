import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import MainLayout from "../Layouts/MainLayout";
import {
    Camera,
    Save,
    Loader2,
    User,
    Mail,
    Phone,
    Hash,
    ShieldCheck,
    CheckCircle,
    XCircle,
    Smartphone,
    KeyRound,
    Copy,
    Check,
    RefreshCw,
    ShieldAlert,
    Lock,
    Eye,
    EyeOff,
    Download,
    QrCode,
    AlertTriangle,
} from "lucide-react";

export default function Profil() {
    const [userData, setUserData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        nip: "",
        no_hp: "",
        password: "",
    });
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ==========================================
    // STATE KEAMANAN 2FA GOOGLE AUTHENTICATOR
    // ==========================================
    const [twoFactor, setTwoFactor] = useState({
        loading: true,
        enabled: false,
        pending_confirm: false,
        confirmed_at: null,
        qr_svg: null,
        secret_key: null,
    });
    const [setupStep, setSetupStep] = useState("idle"); // idle | verify_password | scan_qr
    const [authPassword, setAuthPassword] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [actionMode, setActionMode] = useState(null); // null | view_recovery | regen_recovery | disable_2fa
    const [securityPassword, setSecurityPassword] = useState("");
    const [twoFactorBusy, setTwoFactorBusy] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
        isExiting: false,
    });
    const toastTimeout = useRef(null);
    const exitTimeout = useRef(null);
    const fileInputRef = useRef(null);

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

    const fetchTwoFactorStatus = async () => {
        try {
            const res = await axios.get("/api/security/two-factor");
            const d = res.data?.data || {};
            setTwoFactor({
                loading: false,
                enabled: Boolean(d.enabled),
                pending_confirm: Boolean(d.pending_confirm),
                confirmed_at: d.confirmed_at || null,
                qr_svg: d.qr_svg || null,
                secret_key: d.secret_key || null,
            });
            if (d.pending_confirm && d.qr_svg) {
                setSetupStep("scan_qr");
            }
        } catch (err) {
            setTwoFactor((prev) => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        Promise.all([axios.get("/api/user"), fetchTwoFactorStatus()])
            .then(([userRes]) => {
                const user = userRes.data;
                setUserData(user);
                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    nip: user.nip || "",
                    no_hp: user.no_hp || "",
                    password: "",
                });
                if (user.avatar) {
                    setAvatarPreview(`/storage/${user.avatar}`);
                }
            })
            .catch((error) => {
                console.error("Gagal mengambil profil:", error);
            })
            .finally(() => setIsLoadingData(false));
    }, []);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast("Ukuran gambar maksimal 2MB!", "error");
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("nip", formData.nip || "");
        data.append("no_hp", formData.no_hp || "");
        if (formData.password) data.append("password", formData.password);
        if (avatarFile) data.append("avatar", avatarFile);

        try {
            const response = await axios.post("/api/profile", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            showToast(response.data.message, "success");
            setTimeout(() => window.location.reload(), 1400);
        } catch (error) {
            showToast(
                error.response?.data?.message || "Gagal memperbarui profil.",
                "error",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // ==========================================
    // HANDLER 2FA GOOGLE AUTHENTICATOR
    // ==========================================
    const handleStartEnable2FA = async (e) => {
        e.preventDefault();
        if (!authPassword) return;
        setTwoFactorBusy(true);
        try {
            const res = await axios.post("/api/security/two-factor/enable", {
                current_password: authPassword,
            });
            const d = res.data?.data || {};
            setTwoFactor((prev) => ({
                ...prev,
                pending_confirm: true,
                qr_svg: d.qr_svg || null,
                secret_key: d.secret_key || null,
            }));
            setSetupStep("scan_qr");
            setAuthPassword("");
            setOtpCode("");
            showToast(
                res.data?.message ||
                    "QR Code Google Authenticator siap dipindai.",
                "success",
            );
        } catch (err) {
            showToast(
                err.response?.data?.message || "Gagal memulai aktivasi 2FA.",
                "error",
            );
        } finally {
            setTwoFactorBusy(false);
        }
    };

    const handleConfirm2FA = async (e) => {
        e.preventDefault();
        if (otpCode.length !== 6) return;
        setTwoFactorBusy(true);
        try {
            const res = await axios.post("/api/security/two-factor/confirm", {
                code: otpCode,
            });
            const codes = res.data?.data?.recovery_codes || [];
            setRecoveryCodes(codes);
            setShowRecoveryModal(true);
            setSetupStep("idle");
            setOtpCode("");
            await fetchTwoFactorStatus();
            showToast(
                res.data?.message || "Google Authenticator 2FA aktif!",
                "success",
            );
        } catch (err) {
            showToast(
                err.response?.data?.message ||
                    "Kode 6 digit salah atau kedaluwarsa.",
                "error",
            );
        } finally {
            setTwoFactorBusy(false);
        }
    };

    const handleSecurityActionSubmit = async (e) => {
        e.preventDefault();
        if (!securityPassword) return;
        setTwoFactorBusy(true);

        try {
            if (actionMode === "disable_2fa") {
                const res = await axios.post(
                    "/api/security/two-factor/disable",
                    { current_password: securityPassword },
                );
                setTwoFactor({
                    loading: false,
                    enabled: false,
                    pending_confirm: false,
                    confirmed_at: null,
                    qr_svg: null,
                    secret_key: null,
                });
                setSetupStep("idle");
                setActionMode(null);
                setSecurityPassword("");
                showToast(
                    res.data?.message || "2FA berhasil dinonaktifkan.",
                    "success",
                );
            } else if (
                actionMode === "view_recovery" ||
                actionMode === "regen_recovery"
            ) {
                const res = await axios.post(
                    "/api/security/two-factor/recovery-codes",
                    {
                        current_password: securityPassword,
                        regenerate: actionMode === "regen_recovery",
                    },
                );
                setRecoveryCodes(res.data?.data?.recovery_codes || []);
                setShowRecoveryModal(true);
                setActionMode(null);
                setSecurityPassword("");
                showToast(
                    res.data?.message || "Kode pemulihan dimuat.",
                    "success",
                );
            }
        } catch (err) {
            showToast(
                err.response?.data?.message ||
                    "Password saat ini tidak sesuai.",
                "error",
            );
        } finally {
            setTwoFactorBusy(false);
        }
    };

    const copyText = (text, setter) => {
        navigator.clipboard?.writeText(text);
        setter(true);
        setTimeout(() => setter(false), 2000);
    };

    const downloadRecoveryCodes = () => {
        const content = [
            "KODE PEMULIHAN (RECOVERY CODES) — SIRA 2.0",
            "Kantor Wilayah Kementerian Hukum Sulawesi Tengah",
            `Akun: ${userData?.name || "-"} (${userData?.email || "-"})`,
            `Diunduh: ${new Date().toLocaleString("id-ID")} WITA`,
            "================================================",
            "Simpan kode ini di tempat aman. Setiap kode hanya dapat dipakai 1x jika ponsel hilang:",
            "",
            ...recoveryCodes.map((c, idx) => `${idx + 1}. ${c}`),
        ].join("\n");

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SIRA_2FA_Recovery_Codes_${userData?.kode_satker || "ADMIN"}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const initial = userData?.name
        ? userData.name.charAt(0).toUpperCase()
        : "U";

    return (
        <MainLayout
            authUser={userData}
            tahun={new Date().getFullYear().toString()}
        >
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                @keyframes slideOutRight { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(120%) scale(0.9); opacity: 0; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
                .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
            `}</style>

            <div className="max-w-6xl mx-auto space-y-6 font-sans text-slate-600 relative pb-12">
                <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10"></div>

                {/* TOAST */}
                {toast.show && (
                    <div
                        className={`fixed top-8 right-8 z-[110] flex items-center p-4 min-w-[320px] max-w-md rounded-2xl border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.35)] backdrop-blur-xl ${
                            toast.isExiting ? "toast-exit" : "toast-enter"
                        } ${
                            toast.type === "success"
                                ? "bg-[#0A192F]/95 border-emerald-500/35"
                                : "bg-[#0A192F]/95 border-rose-500/35"
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
                                className={`text-[10px] font-black tracking-widest uppercase ${
                                    toast.type === "success"
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                }`}
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

                {/* HEADER */}
                <div className="glass-card p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-lg shrink-0">
                            <User size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Profil &amp; Keamanan Akun
                            </h2>
                            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                                Perbarui identitas pegawai, password, serta
                                aktifkan proteksi 2FA Google Authenticator.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${
                                twoFactor.enabled
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                        >
                            {twoFactor.enabled ? (
                                <>
                                    <ShieldCheck size={15} /> 2FA Aktif
                                </>
                            ) : (
                                <>
                                    <ShieldAlert size={15} /> 2FA Belum Aktif
                                </>
                            )}
                        </span>
                    </div>
                </div>

                {isLoadingData ? (
                    <div className="glass-card rounded-[2rem] border border-white p-14 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mb-3"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Memuat Profil &amp; Status Keamanan...
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* =====================================================
                            KOLOM KIRI (7 KOLOM): FORM BIODATA & PASSWORD
                        ===================================================== */}
                        <div className="xl:col-span-7 glass-card rounded-[2.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
                            <form onSubmit={handleSubmit}>
                                <div className="h-32 bg-gradient-to-r from-[#0B1120] via-indigo-950 to-purple-950 relative">
                                    <div className="absolute -bottom-12 left-7 flex items-end gap-4">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-[1.5rem] border-4 border-white bg-indigo-100 overflow-hidden shadow-lg flex items-center justify-center text-indigo-600 font-black text-3xl">
                                                {avatarPreview ? (
                                                    <img
                                                        src={avatarPreview}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    initial
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white border-2 border-white shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
                                                title="Ganti Foto Profil"
                                            >
                                                <Camera size={14} />
                                            </button>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>
                                        <div className="pb-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black bg-white text-indigo-700 uppercase tracking-widest shadow-sm border border-indigo-100">
                                                <ShieldCheck size={13} />{" "}
                                                {userData?.role === "admin"
                                                    ? "Admin Kanwil"
                                                    : `Satker ${userData?.kode_satker || ""}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-7 pt-18 pb-7 grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                            Nama Lengkap *
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleFormChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-sm font-bold text-slate-800 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                            Email Dinas *
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleFormChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-sm font-bold text-slate-800 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                            NIP (Opsional)
                                        </label>
                                        <div className="relative">
                                            <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                name="nip"
                                                value={formData.nip}
                                                onChange={handleFormChange}
                                                placeholder="19xxxxxxxxxxxxxxxx"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-sm font-mono font-bold text-slate-800 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                            No. HP / WhatsApp (Opsional)
                                        </label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                name="no_hp"
                                                value={formData.no_hp}
                                                onChange={handleFormChange}
                                                placeholder="0812xxxxxxxx"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-sm font-bold text-slate-800 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-4 border-t border-slate-100">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                            Ganti Password (Kosongkan jika tidak
                                            diubah)
                                        </label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type={
                                                    showNewPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                value={formData.password}
                                                onChange={handleFormChange}
                                                minLength="6"
                                                placeholder="Masukkan password baru minimal 6 karakter..."
                                                className="w-full pl-10 pr-11 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-sm font-bold text-slate-800 outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        (p) => !p,
                                                    )
                                                }
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff size={16} />
                                                ) : (
                                                    <Eye size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-7 py-5 bg-slate-50/80 border-t border-slate-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {isSubmitting ? (
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        Simpan Perubahan Profil
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* =====================================================
                            KOLOM KANAN (5 KOLOM): GOOGLE AUTHENTICATOR 2FA
                        ===================================================== */}
                        <div className="xl:col-span-5 bg-[#0B1120] text-white rounded-[2.25rem] p-6 sm:p-7 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
                            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex items-start justify-between gap-3 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-3 rounded-2xl border shrink-0 ${
                                            twoFactor.enabled
                                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/35"
                                                : "bg-amber-500/15 text-amber-400 border-amber-500/35"
                                        }`}
                                    >
                                        <Smartphone size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-white tracking-tight">
                                            Google Authenticator (2FA)
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                            Lapisan keamanan kode OTP 6 digit
                                            saat login.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* STATUS 1: 2FA SUDAH AKTIF */}
                            {twoFactor.enabled ? (
                                <div className="space-y-4 relative z-10">
                                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                                        <ShieldCheck
                                            size={20}
                                            className="text-emerald-400 shrink-0 mt-0.5"
                                        />
                                        <div className="text-xs leading-relaxed">
                                            <p className="font-black text-emerald-300 uppercase tracking-wider text-[10px]">
                                                Proteksi 2FA Aktif
                                            </p>
                                            <p className="text-slate-300 mt-1">
                                                Akun Anda dilindungi oleh kode
                                                TOTP 6 digit dari aplikasi
                                                Google Authenticator setiap kali
                                                login.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActionMode("view_recovery");
                                                setSecurityPassword("");
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-slate-700 text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer"
                                        >
                                            <KeyRound size={15} /> Lihat Kode
                                            Pemulihan
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActionMode("regen_recovery");
                                                setSecurityPassword("");
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-xs font-black uppercase tracking-wider text-indigo-200 transition-all cursor-pointer"
                                        >
                                            <RefreshCw size={15} /> Buat Ulang
                                            Kode Pemulihan
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActionMode("disable_2fa");
                                                setSecurityPassword("");
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-600 border border-rose-500/35 text-xs font-black uppercase tracking-wider text-rose-300 hover:text-white transition-all cursor-pointer"
                                        >
                                            <ShieldAlert size={15} />{" "}
                                            Nonaktifkan 2FA
                                        </button>
                                    </div>
                                </div>
                            ) : setupStep === "scan_qr" && twoFactor.qr_svg ? (
                                /* STATUS 2: PINDAI QR CODE & KONFIRMASI 6 DIGIT */
                                <div className="space-y-4 relative z-10">
                                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-center space-y-3">
                                        <p className="text-[11px] font-bold text-amber-300">
                                            1. Pindai QR Code ini dengan
                                            aplikasi Google Authenticator:
                                        </p>
                                        <div
                                            className="bg-white p-3.5 rounded-2xl inline-block shadow-lg mx-auto"
                                            dangerouslySetInnerHTML={{
                                                __html: twoFactor.qr_svg,
                                            }}
                                        />
                                        {twoFactor.secret_key && (
                                            <div className="pt-2 border-t border-slate-800">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                                    Atau masukkan kode manual:
                                                </p>
                                                <div className="flex items-center justify-center gap-2">
                                                    <code className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-cyan-300 tracking-wider">
                                                        {twoFactor.secret_key}
                                                    </code>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            copyText(
                                                                twoFactor.secret_key,
                                                                setCopiedKey,
                                                            )
                                                        }
                                                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                                                        title="Salin Secret Key"
                                                    >
                                                        {copiedKey ? (
                                                            <Check
                                                                size={14}
                                                                className="text-emerald-400"
                                                            />
                                                        ) : (
                                                            <Copy size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <form
                                        onSubmit={handleConfirm2FA}
                                        className="space-y-3"
                                    >
                                        <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            2. Masukkan 6 Digit Kode Konfirmasi:
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            required
                                            value={otpCode}
                                            onChange={(e) =>
                                                setOtpCode(
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        "",
                                                    ),
                                                )
                                            }
                                            placeholder="000000"
                                            className="w-full py-3.5 px-4 bg-slate-950 border border-emerald-500/40 focus:border-emerald-400 rounded-xl text-center text-2xl font-mono font-black tracking-[0.4em] text-white outline-none"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActionMode(
                                                        "disable_2fa",
                                                    );
                                                    setSecurityPassword("");
                                                }}
                                                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={
                                                    twoFactorBusy ||
                                                    otpCode.length !== 6
                                                }
                                                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                                            >
                                                {twoFactorBusy ? (
                                                    <Loader2
                                                        size={15}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <ShieldCheck size={15} />
                                                )}
                                                Konfirmasi &amp; Aktifkan
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : setupStep === "verify_password" ? (
                                /* STATUS 3: VERIFIKASI PASSWORD SEBELUM GENERATE QR */
                                <form
                                    onSubmit={handleStartEnable2FA}
                                    className="space-y-4 relative z-10"
                                >
                                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed">
                                        Masukkan password akun Anda saat ini
                                        untuk menerbitkan QR Code Google
                                        Authenticator.
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                            Password Saat Ini *
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            autoFocus
                                            value={authPassword}
                                            onChange={(e) =>
                                                setAuthPassword(e.target.value)
                                            }
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl text-sm font-semibold text-white outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSetupStep("idle");
                                                setAuthPassword("");
                                            }}
                                            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={
                                                twoFactorBusy || !authPassword
                                            }
                                            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                                        >
                                            {twoFactorBusy ? (
                                                <Loader2
                                                    size={15}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <QrCode size={15} />
                                            )}
                                            Tampilkan QR Code
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* STATUS 4: BELUM AKTIF (IDLE) */
                                <div className="space-y-4 relative z-10">
                                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-300 leading-relaxed">
                                        <p className="font-black text-amber-300 uppercase tracking-wider text-[10px] mb-1">
                                            Sangat Direkomendasikan
                                        </p>
                                        Aktifkan 2FA menggunakan aplikasi{" "}
                                        <strong className="text-white">
                                            Google Authenticator
                                        </strong>{" "}
                                        di Android/iOS untuk mencegah akses
                                        tidak sah meskipun password bocor.
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSetupStep("verify_password")
                                        }
                                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                                    >
                                        <QrCode size={16} /> Aktifkan Google
                                        Authenticator
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI PASSWORD (LIHAT / REGENERATE RECOVERY / DISABLE 2FA) */}
                {actionMode && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0B1120]/80 backdrop-blur-md">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white">
                            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                                <div
                                    className={`p-2.5 rounded-xl text-white ${
                                        actionMode === "disable_2fa"
                                            ? "bg-rose-600"
                                            : "bg-indigo-600"
                                    }`}
                                >
                                    {actionMode === "disable_2fa" ? (
                                        <AlertTriangle size={20} />
                                    ) : (
                                        <KeyRound size={20} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">
                                        {actionMode === "disable_2fa"
                                            ? "Nonaktifkan 2FA"
                                            : actionMode === "regen_recovery"
                                              ? "Buat Ulang Kode Pemulihan"
                                              : "Lihat Kode Pemulihan"}
                                    </h3>
                                    <p className="text-[11px] font-semibold text-slate-500">
                                        Konfirmasi password saat ini untuk
                                        melanjutkan.
                                    </p>
                                </div>
                            </div>
                            <form
                                onSubmit={handleSecurityActionSubmit}
                                className="p-6 space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-black text-slate-700 mb-1.5">
                                        Password Saat Ini *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        autoFocus
                                        value={securityPassword}
                                        onChange={(e) =>
                                            setSecurityPassword(e.target.value)
                                        }
                                        placeholder="Masukkan password Anda"
                                        className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>
                                <div className="flex gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActionMode(null);
                                            setSecurityPassword("");
                                        }}
                                        disabled={twoFactorBusy}
                                        className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            twoFactorBusy || !securityPassword
                                        }
                                        className={`flex-[1.4] inline-flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white disabled:opacity-50 cursor-pointer ${
                                            actionMode === "disable_2fa"
                                                ? "bg-rose-600 hover:bg-rose-700"
                                                : "bg-indigo-600 hover:bg-indigo-700"
                                        }`}
                                    >
                                        {twoFactorBusy && (
                                            <Loader2
                                                size={15}
                                                className="animate-spin"
                                            />
                                        )}
                                        Konfirmasi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL DAFTAR RECOVERY CODES */}
                {showRecoveryModal && recoveryCodes.length > 0 && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0B1120]/85 backdrop-blur-md">
                        <div className="bg-white rounded-[2.25rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white">
                            <div className="px-6 py-5 bg-[#0B1120] text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
                                        <KeyRound size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black">
                                            Kode Pemulihan (Recovery Codes)
                                        </h3>
                                        <p className="text-[11px] text-slate-400">
                                            Simpan di tempat aman untuk login
                                            darurat jika ponsel hilang.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                                    {recoveryCodes.map((code, idx) => (
                                        <div
                                            key={idx}
                                            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-xs font-bold text-emerald-300 tracking-wider"
                                        >
                                            {code}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyText(
                                                recoveryCodes.join("\n"),
                                                setCopiedCodes,
                                            )
                                        }
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-black uppercase tracking-wider cursor-pointer"
                                    >
                                        {copiedCodes ? (
                                            <>
                                                <Check size={14} /> Tersalin!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} /> Salin Semua
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={downloadRecoveryCodes}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-black uppercase tracking-wider cursor-pointer"
                                    >
                                        <Download size={14} /> Unduh .TXT
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowRecoveryModal(false)}
                                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    Saya Sudah Menyimpan Kode Ini
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
