import React, { useState } from "react";
import axios from "axios";
import {
    ShieldAlert,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    Loader2,
    LogOut,
    AlertTriangle,
    KeyRound,
} from "lucide-react";

export default function ForceChangePassword() {
    const [formData, setFormData] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg("");
    };

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { label: "-", score: 0, color: "bg-slate-700" };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1)
            return { label: "Lemah", score: 25, color: "bg-rose-500" };
        if (score === 2)
            return { label: "Cukup", score: 50, color: "bg-amber-500" };
        if (score === 3)
            return { label: "Kuat", score: 75, color: "bg-cyan-500" };
        return { label: "Sangat Kuat", score: 100, color: "bg-emerald-500" };
    };

    const strength = getPasswordStrength(formData.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            setErrorMsg("Password baru minimal harus 8 karakter.");
            return;
        }
        if (formData.password !== formData.password_confirmation) {
            setErrorMsg("Konfirmasi password baru tidak cocok.");
            return;
        }

        setLoading(true);
        setErrorMsg("");

        try {
            const res = await axios.post(
                "/api/security/force-change-password",
                formData,
            );
            setSuccessMsg(
                res.data?.message ||
                    "Password baru berhasil disimpan! Mengarahkan ke Dashboard...",
            );
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1200);
        } catch (err) {
            setErrorMsg(
                err.response?.data?.message ||
                    "Gagal memperbarui password. Pastikan password sementara benar.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("/logout");
        } finally {
            window.location.href = "/login";
        }
    };

    return (
        <div className="min-h-screen bg-[#040814] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#818cf8_1px,transparent_1px),linear-gradient(to_bottom,#818cf8_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none"></div>
            <div className="absolute top-[-15%] left-[-10%] w-[480px] h-[480px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none"></div>
            <div className="absolute bottom-[-15%] right-[-10%] w-[480px] h-[480px] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none"></div>

            <div className="w-full max-w-lg bg-[#0A1128]/85 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.65)] border border-amber-500/30 p-8 sm:p-10 relative z-10">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
                        <ShieldAlert size={30} strokeWidth={2.3} />
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest mb-2">
                        Wajib Aktivasi Keamanan
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Buat Password Pribadi Baru
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-400 mt-2 leading-relaxed">
                        Akun Anda masih menggunakan password sementara dari
                        Admin. Ganti dengan password pribadi minimal 8 karakter
                        sebelum mengakses SIRA 2.0.
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-5 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                        <AlertTriangle
                            size={18}
                            className="text-rose-400 shrink-0 mt-0.5"
                        />
                        <p className="text-xs sm:text-sm font-bold text-rose-300">
                            {errorMsg}
                        </p>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                        <CheckCircle2
                            size={18}
                            className="text-emerald-400 shrink-0 mt-0.5"
                        />
                        <p className="text-xs sm:text-sm font-bold text-emerald-300">
                            {successMsg}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Password Sementara / Saat Ini *
                        </label>
                        <div className="relative">
                            <KeyRound
                                size={17}
                                className="text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            />
                            <input
                                type={showPass ? "text" : "password"}
                                name="current_password"
                                required
                                value={formData.current_password}
                                onChange={handleChange}
                                placeholder="Masukkan password sementara Anda"
                                className="w-full pl-11 pr-12 py-3.5 bg-[#040814]/70 border border-slate-700 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 rounded-2xl text-white text-sm font-semibold outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((p) => !p)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                            >
                                {showPass ? (
                                    <EyeOff size={17} />
                                ) : (
                                    <Eye size={17} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Password Baru (Min. 8 Karakter) *
                        </label>
                        <div className="relative">
                            <Lock
                                size={17}
                                className="text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            />
                            <input
                                type={showPass ? "text" : "password"}
                                name="password"
                                required
                                minLength={8}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Kombinasi huruf besar, angka & simbol"
                                className="w-full pl-11 pr-4 py-3.5 bg-[#040814]/70 border border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 rounded-2xl text-white text-sm font-semibold outline-none transition-all"
                            />
                        </div>
                        {formData.password && (
                            <div className="mt-2.5 px-1">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                    <span>Kekuatan Password:</span>
                                    <span className="text-white">
                                        {strength.label}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${strength.color}`}
                                        style={{ width: `${strength.score}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Ulangi Password Baru *
                        </label>
                        <div className="relative">
                            <Lock
                                size={17}
                                className="text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            />
                            <input
                                type={showPass ? "text" : "password"}
                                name="password_confirmation"
                                required
                                minLength={8}
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                placeholder="Ketik ulang password baru"
                                className="w-full pl-11 pr-4 py-3.5 bg-[#040814]/70 border border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 rounded-2xl text-white text-sm font-semibold outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(245,158,11,0.3)] transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />{" "}
                                Menyimpan Password...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={18} /> Simpan &amp; Masuk
                                Dashboard
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                        <LogOut size={14} /> Keluar &amp; Ganti Akun
                    </button>
                </div>
            </div>
        </div>
    );
}
