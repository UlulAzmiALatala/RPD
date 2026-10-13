import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
// Gunakan import Link sesuai router Anda (Inertia.js atau React Router)
import { Link } from "react-router-dom";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setServerError("");

        try {
            await axios.get("/sanctum/csrf-cookie");
            await axios.post("/login", formData);
            window.location.href = "/dashboard";
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setServerError(
                    "Kredensial tidak valid atau terjadi kesalahan server.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#040814] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* --- ANIMATED AMBIENT BACKGROUND --- */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-10000"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

            {/* --- MAIN GLASS CONTAINER --- */}
            <div className="w-full max-w-6xl min-h-[600px] bg-[#0A1128]/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700/50 overflow-hidden flex flex-col md:flex-row z-10 animate-in zoom-in-95 fade-in duration-500">
                {/* LEFT SIDE - PREMIUM BRANDING */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-900/80 via-[#0A1128]/80 to-[#040814]/90 p-10 lg:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.4)] border border-yellow-300/50">
                                <span className="font-black text-[#040814] text-3xl tracking-tighter">
                                    K
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                                    SIRA <span className="text-white">2.0</span>
                                </h2>
                                <p className="text-[10px] font-bold text-indigo-300 tracking-widest uppercase mt-0.5">
                                    Enterprise Edition
                                </p>
                            </div>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-5 tracking-tight">
                            Sistem Informasi <br />{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                                Realisasi Anggaran
                            </span>
                        </h1>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                            Kanwil Kementerian Hukum dan HAM Sulawesi Tengah.
                            Kelola, evaluasi, dan pantau serapan pagu DIPA
                            secara real-time dan presisi.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 md:mt-0 flex items-center gap-3">
                        <ShieldCheck className="text-emerald-400 w-5 h-5" />
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                            Secured Internal System &copy;{" "}
                            {new Date().getFullYear()}
                        </span>
                    </div>
                </div>

                {/* RIGHT SIDE - LOGIN FORM */}
                <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
                    <div className="max-w-md w-full mx-auto relative z-10">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                                Selamat Datang
                            </h2>
                            <p className="text-sm font-medium text-slate-400">
                                Silakan masuk menggunakan kredensial akun SIRA
                                Anda.
                            </p>
                        </div>

                        {serverError && (
                            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                                    !
                                </div>
                                <p className="text-rose-400 text-sm font-bold leading-tight">
                                    {serverError}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                    Alamat Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail
                                            className={`h-5 w-5 transition-colors ${errors.email ? "text-rose-400" : "text-slate-500 group-focus-within:text-indigo-400"}`}
                                        />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-12 pr-4 py-3.5 bg-[#040814]/50 border ${errors.email ? "border-rose-500/50 focus:ring-rose-500/20" : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"} rounded-2xl text-white font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-600`}
                                        placeholder="admin@kemenkum.go.id"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 ml-1 text-xs text-rose-400 font-bold">
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
                                        className="text-[11px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
                                    >
                                        Lupa Password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock
                                            className={`h-5 w-5 transition-colors ${errors.password ? "text-rose-400" : "text-slate-500 group-focus-within:text-indigo-400"}`}
                                        />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-12 pr-4 py-3.5 bg-[#040814]/50 border ${errors.password ? "border-rose-500/50 focus:ring-rose-500/20" : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"} rounded-2xl text-white font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-600`}
                                        placeholder="••••••••"
                                    />
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
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/30 focus:ring-offset-0 transition-all cursor-pointer appearance-none checked:bg-indigo-500 checked:border-indigo-500 relative"
                                    />
                                    {formData.remember && (
                                        <CheckCircle className="absolute inset-0 w-4 h-4 text-white pointer-events-none scale-75" />
                                    )}
                                </div>
                                <label
                                    htmlFor="remember"
                                    className="ml-3 block text-sm font-bold text-slate-400 cursor-pointer select-none"
                                >
                                    Ingat sesi saya
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group mt-8 outline-none"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />{" "}
                                        Mengautentikasi...
                                    </>
                                ) : (
                                    <>
                                        Masuk ke Sistem{" "}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-10 text-center text-sm font-medium text-slate-500">
                            Belum memiliki akses?{" "}
                            <Link
                                to="/register"
                                className="font-black text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                                Daftar di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
