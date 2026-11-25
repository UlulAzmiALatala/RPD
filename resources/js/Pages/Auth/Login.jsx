import React, { useState } from "react";
import axios from "axios";
import {
    Mail,
    Lock,
    Loader2,
    ArrowRight,
    ShieldCheck,
    CheckCircle,
    Eye,
    EyeOff,
    KeyRound,
    Smartphone,
    ArrowLeft,
    AlertTriangle,
    Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    // State Tahap 2: Tantangan 2FA Google Authenticator
    const [step, setStep] = useState("credentials"); // 'credentials' | 'two_factor'
    const [useRecovery, setUseRecovery] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [recoveryCode, setRecoveryCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");

    const handleChange = (e) => {
        const value =
            e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        setErrors({ ...errors, [e.target.name]: "" });
        setServerError("");
    };

    const redirectAfterLogin = async () => {
        try {
            const userRes = await axios.get("/api/user", {
                headers: { Accept: "application/json" },
            });
            if (userRes.data?.must_change_password) {
                window.location.href = "/ganti-password-wajib";
                return;
            }
        } catch {
            // Lanjutkan fallback ke dashboard
        }
        window.location.href = "/dashboard";
    };

    // SUBMIT TAHAP 1: EMAIL & PASSWORD
    const handleSubmitCredentials = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setServerError("");

        try {
            await axios.get("/sanctum/csrf-cookie");
            const res = await axios.post("/login", formData, {
                headers: { Accept: "application/json" },
            });

            if (res.data?.two_factor) {
                setStep("two_factor");
                setOtpCode("");
                setRecoveryCode("");
                setUseRecovery(false);
                return;
            }

            await redirectAfterLogin();
        } catch (error) {
            const status = error.response?.status;
            if (status === 422) {
                setErrors(error.response.data.errors || {});
                if (
                    !error.response.data.errors &&
                    error.response.data.message
                ) {
                    setServerError(error.response.data.message);
                }
            } else if (status === 429) {
                setServerError(
                    "Terlalu banyak percobaan login gagal. Demi keamanan, tunggu 1 menit sebelum mencoba lagi.",
                );
            } else {
                setServerError(
                    error.response?.data?.message ||
                        "Kredensial tidak valid atau terjadi kesalahan server.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // SUBMIT TAHAP 2: KODE GOOGLE AUTHENTICATOR / RECOVERY CODE
    const handleSubmitTwoFactor = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setServerError("");

        const payload = useRecovery
            ? { recovery_code: recoveryCode.trim() }
            : { code: otpCode.trim() };

        try {
            await axios.post("/two-factor-challenge", payload, {
                headers: { Accept: "application/json" },
            });
            await redirectAfterLogin();
        } catch (error) {
            const status = error.response?.status;
            if (status === 422) {
                const errs = error.response.data.errors || {};
                const firstErr =
                    errs.code?.[0] ||
                    errs.recovery_code?.[0] ||
                    error.response.data.message ||
                    "Kode verifikasi 2FA tidak valid.";
                setServerError(firstErr);
            } else if (status === 429) {
                setServerError(
                    "Terlalu banyak percobaan kode 2FA. Silakan tunggu 1 menit.",
                );
            } else {
                setServerError(
                    "Sesi verifikasi habis atau kode salah. Silakan ulangi login.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#040814] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* AMBIENT GLOW & MICRO-GRID */}
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#818cf8_1px,transparent_1px),linear-gradient(to_bottom,#818cf8_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[520px] h-[520px] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none"></div>

            {/* MAIN GLASS CONTAINER */}
            <div className="w-full max-w-6xl min-h-[620px] bg-[#0A1128]/75 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.65)] border border-slate-700/60 overflow-hidden flex flex-col md:flex-row z-10">
                {/* LEFT SIDE - ROYAL OBSIDIAN BRANDING */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-950/90 via-[#0A1128]/95 to-[#040814] p-10 lg:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-br from-amber-200 via-amber-500 to-orange-700 shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                                <div className="w-13 h-13 px-4 py-2.5 rounded-[14px] bg-gradient-to-br from-[#141A2E] via-[#0A0F20] to-[#050814] flex items-center justify-center">
                                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 text-3xl tracking-tighter">
                                        K
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-black tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-amber-200">
                                        SIRA
                                    </h2>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/35 rounded-md">
                                        <Sparkles size={10} /> 2.0
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-indigo-300 tracking-[0.2em] uppercase mt-1">
                                    Enterprise 65-Pts Engine
                                </p>
                            </div>
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-5 tracking-tight">
                            Sistem Informasi <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-amber-200">
                                Realisasi Anggaran
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                            Kantor Wilayah Kementerian Hukum Sulawesi Tengah.
                            Pantau serapan pagu DIPA, deviasi Hal. III, capaian
                            RO, dan tata kelola secara presisi dan real-time.
                        </p>

                        {/* Security Feature Badges */}
                        <div className="mt-8 space-y-2.5">
                            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-slate-700/60 text-xs font-bold text-slate-300">
                                <ShieldCheck
                                    size={15}
                                    className="text-emerald-400 shrink-0"
                                />
                                <span>
                                    Proteksi 2FA Google Authenticator &amp; Rate
                                    Limit
                                </span>
                            </div>
                            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-slate-700/60 text-xs font-bold text-slate-300">
                                <Lock
                                    size={15}
                                    className="text-amber-400 shrink-0"
                                />
                                <span>
                                    Akses Terkendali Internal (Admin-Only
                                    Provisioning)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-10 md:mt-0 flex items-center gap-3 pt-6 border-t border-slate-800/80">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                            Secured Internal System &copy;{" "}
                            {new Date().getFullYear()}
                        </span>
                    </div>
                </div>

                {/* RIGHT SIDE - FORM LOGIN / VERIFIKASI 2FA */}
                <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
                    <div className="max-w-md w-full mx-auto relative z-10">
                        {step === "credentials" ? (
                            <>
                                <div className="mb-8">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest mb-3">
                                        Gerbang Autentikasi
                                    </span>
                                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                                        Selamat Datang
                                    </h2>
                                    <p className="text-sm font-medium text-slate-400">
                                        Masuk menggunakan akun resmi yang
                                        diterbitkan oleh Admin Kanwil.
                                    </p>
                                </div>

                                {serverError && (
                                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                                        <AlertTriangle
                                            size={18}
                                            className="text-rose-400 shrink-0 mt-0.5"
                                        />
                                        <p className="text-rose-300 text-xs sm:text-sm font-bold leading-snug">
                                            {serverError}
                                        </p>
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmitCredentials}
                                    className="space-y-5"
                                >
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                            Alamat Email Dinas
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail
                                                    className={`h-5 w-5 transition-colors ${
                                                        errors.email
                                                            ? "text-rose-400"
                                                            : "text-slate-500 group-focus-within:text-indigo-400"
                                                    }`}
                                                />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                autoComplete="username"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full pl-12 pr-4 py-3.5 bg-[#040814]/65 border ${
                                                    errors.email
                                                        ? "border-rose-500/50 focus:ring-rose-500/20"
                                                        : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                                                } rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-600`}
                                                placeholder="nama@kemenkum.go.id"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-2 ml-1 text-xs text-rose-400 font-bold leading-snug">
                                                {errors.email[0]}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2 ml-1 pr-1">
                                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Password
                                            </label>
                                            <Link
                                                to="/forgot-password"
                                                className="text-[11px] font-black text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
                                            >
                                                Lupa Password?
                                            </Link>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock
                                                    className={`h-5 w-5 transition-colors ${
                                                        errors.password
                                                            ? "text-rose-400"
                                                            : "text-slate-500 group-focus-within:text-indigo-400"
                                                    }`}
                                                />
                                            </div>
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                required
                                                autoComplete="current-password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`w-full pl-12 pr-12 py-3.5 bg-[#040814]/65 border ${
                                                    errors.password
                                                        ? "border-rose-500/50 focus:ring-rose-500/20"
                                                        : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                                                } rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-600`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((p) => !p)
                                                }
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="mt-2 ml-1 text-xs text-rose-400 font-bold">
                                                {errors.password[0]}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center ml-1">
                                        <div className="relative flex items-center">
                                            <input
                                                id="remember"
                                                type="checkbox"
                                                name="remember"
                                                checked={formData.remember}
                                                onChange={handleChange}
                                                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/30 focus:ring-offset-0 transition-all cursor-pointer appearance-none checked:bg-indigo-500 checked:border-indigo-500"
                                            />
                                            {formData.remember && (
                                                <CheckCircle className="absolute inset-0 w-4 h-4 text-white pointer-events-none scale-75" />
                                            )}
                                        </div>
                                        <label
                                            htmlFor="remember"
                                            className="ml-3 block text-xs sm:text-sm font-bold text-slate-400 cursor-pointer select-none"
                                        >
                                            Ingat sesi saya di perangkat ini
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_10px_25px_rgba(79,70,229,0.35)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />{" "}
                                                Mengautentikasi...
                                            </>
                                        ) : (
                                            <>
                                                Masuk ke Sistem{" "}
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                                    <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                                        Pendaftaran publik dinonaktifkan demi
                                        keamanan data DIPA. Belum memiliki akun?
                                        Hubungi{" "}
                                        <span className="text-amber-300 font-bold">
                                            Admin Keuangan / Tim Pranata
                                            Komputer Kanwil
                                        </span>
                                        .
                                    </p>
                                </div>
                            </>
                        ) : (
                            /* TAHAP 2: TANTANGAN GOOGLE AUTHENTICATOR 2FA */
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("credentials");
                                        setServerError("");
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-6 transition-colors cursor-pointer"
                                >
                                    <ArrowLeft size={14} /> Kembali ke Login
                                </button>

                                <div className="mb-7">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-400/35 text-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                                        {useRecovery ? (
                                            <KeyRound size={26} />
                                        ) : (
                                            <Smartphone size={26} />
                                        )}
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                                        {useRecovery
                                            ? "Kode Pemulihan 2FA"
                                            : "Verifikasi 2 Langkah"}
                                    </h2>
                                    <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                        {useRecovery
                                            ? "Masukkan salah satu Kode Pemulihan (Recovery Code) darurat Anda untuk masuk ke sistem."
                                            : "Buka aplikasi Google Authenticator di ponsel Anda lalu masukkan 6 digit kode verifikasi yang aktif."}
                                    </p>
                                </div>

                                {serverError && (
                                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                                        <AlertTriangle
                                            size={18}
                                            className="text-rose-400 shrink-0 mt-0.5"
                                        />
                                        <p className="text-rose-300 text-xs sm:text-sm font-bold leading-snug">
                                            {serverError}
                                        </p>
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmitTwoFactor}
                                    className="space-y-6"
                                >
                                    {!useRecovery ? (
                                        <div>
                                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                                6 Digit Kode Authenticator
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                autoFocus
                                                required
                                                value={otpCode}
                                                onChange={(e) => {
                                                    setOtpCode(
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            "",
                                                        ),
                                                    );
                                                    setServerError("");
                                                }}
                                                placeholder="000000"
                                                className="w-full py-4 px-5 bg-[#040814]/80 border border-emerald-500/40 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 rounded-2xl text-white text-center text-3xl font-mono font-black tracking-[0.45em] focus:outline-none transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                                Kode Pemulihan (Recovery Code)
                                            </label>
                                            <input
                                                type="text"
                                                autoFocus
                                                required
                                                value={recoveryCode}
                                                onChange={(e) => {
                                                    setRecoveryCode(
                                                        e.target.value,
                                                    );
                                                    setServerError("");
                                                }}
                                                placeholder="xxxxxxxxxx-xxxxxxxxxx"
                                                className="w-full py-4 px-5 bg-[#040814]/80 border border-amber-500/40 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20 rounded-2xl text-white text-center text-base font-mono font-bold tracking-wider focus:outline-none transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={
                                            loading ||
                                            (!useRecovery
                                                ? otpCode.length !== 6
                                                : !recoveryCode.trim())
                                        }
                                        className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_10px_25px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />{" "}
                                                Memverifikasi...
                                            </>
                                        ) : (
                                            <>
                                                Verifikasi &amp; Masuk{" "}
                                                <ShieldCheck className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUseRecovery((prev) => !prev);
                                            setServerError("");
                                        }}
                                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 cursor-pointer"
                                    >
                                        {useRecovery
                                            ? "Gunakan 6 Digit Kode Google Authenticator"
                                            : "Kehilangan akses ponsel? Gunakan Kode Pemulihan"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
