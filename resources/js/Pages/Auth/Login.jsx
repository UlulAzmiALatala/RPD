import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom"; // Ganti pakai inertia Link kalau pakai inertia router

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
            // 1. Minta CSRF Cookie dulu (Wajib untuk SPA Fortify/Sanctum)
            await axios.get("/sanctum/csrf-cookie");

            // 2. Hit endpoint login Fortify
            await axios.post("/login", formData);

            // 3. Kalau sukses, lempar ke dashboard
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
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-5xl bg-[#0F172A]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800/60 overflow-hidden flex flex-col md:flex-row z-10">
                {/* Left Side - Branding */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-900/50 to-slate-900/50 p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/60 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-500 to-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                                <span className="font-black text-[#0A192F] text-2xl">
                                    K
                                </span>
                            </div>
                            <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                                SIRA
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                            Sistem Informasi <br /> Realisasi Anggaran
                        </h1>
                        <p className="text-slate-400 font-medium">
                            Kanwil Kementerian Hukum dan HAM. Kelola dan pantau
                            serapan anggaran secara real-time dan presisi.
                        </p>
                    </div>
                    <div className="relative z-10 mt-10 md:mt-0 text-xs text-slate-500 font-medium">
                        &copy; 2026 Kemenkumham. All rights reserved.
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#0F172A]">
                    <div className="max-w-md w-full mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Selamat Datang Kembali
                        </h2>
                        <p className="text-sm text-slate-400 mb-8">
                            Silakan masuk menggunakan kredensial akun Anda.
                        </p>

                        {serverError && (
                            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium">
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-11 pr-4 py-3 bg-slate-900 border ${errors.email ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-indigo-500"} rounded-xl text-white focus:outline-none focus:ring-2 transition-all`}
                                        placeholder="admin@kemenkum.go.id"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-rose-400 font-medium">
                                        {errors.email[0]}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        Lupa Password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-11 pr-4 py-3 bg-slate-900 border ${errors.password ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-indigo-500"} rounded-xl text-white focus:outline-none focus:ring-2 transition-all`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-rose-400 font-medium">
                                        {errors.password[0]}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                />
                                <label
                                    htmlFor="remember"
                                    className="ml-2 block text-sm text-slate-400 cursor-pointer"
                                >
                                    Ingat Saya
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Masuk ke Sistem
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Belum memiliki akun?{" "}
                            <Link
                                to="/register"
                                className="font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                                Daftar Sekarang
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
