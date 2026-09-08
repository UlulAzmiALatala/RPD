import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, Loader2, ArrowRight, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await axios.get("/sanctum/csrf-cookie");
            await axios.post("/register", formData);
            window.location.href = "/dashboard"; // Otomatis login setelah sukses daftar
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-2xl bg-[#0F172A]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800/60 overflow-hidden flex flex-col z-10 p-8 md:p-12">
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 to-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] mb-4">
                        <span className="font-black text-[#0A192F] text-3xl">
                            K
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Registrasi Akun SIRA
                    </h2>
                    <p className="text-sm text-slate-400 text-center">
                        Buat akun untuk mendapatkan akses ke dalam sistem.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Nama Lengkap
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full pl-11 pr-4 py-3 bg-slate-900 border ${errors.name ? "border-rose-500" : "border-slate-700 focus:ring-indigo-500"} rounded-xl text-white focus:outline-none focus:ring-2 transition-all`}
                                placeholder="Budi Santoso"
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1.5 text-xs text-rose-400 font-medium">
                                {errors.name[0]}
                            </p>
                        )}
                    </div>

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
                                className={`w-full pl-11 pr-4 py-3 bg-slate-900 border ${errors.email ? "border-rose-500" : "border-slate-700 focus:ring-indigo-500"} rounded-xl text-white focus:outline-none focus:ring-2 transition-all`}
                                placeholder="operator@kemenkum.go.id"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1.5 text-xs text-rose-400 font-medium">
                                {errors.email[0]}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-11 pr-4 py-3 bg-slate-900 border ${errors.password ? "border-rose-500" : "border-slate-700 focus:ring-indigo-500"} rounded-xl text-white focus:outline-none focus:ring-2 transition-all`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-rose-400 font-medium">
                                    {errors.password[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Ulangi Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 focus:ring-indigo-500 rounded-xl text-white focus:outline-none focus:ring-2 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-6"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Daftar Akun
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Sudah memiliki akun?{" "}
                    <Link
                        to="/login"
                        className="font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}
