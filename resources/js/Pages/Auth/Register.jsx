import React, { useState } from "react";
import axios from "axios";
import {
    Mail,
    Lock,
    Loader2,
    ArrowRight,
    User,
    ShieldCheck,
} from "lucide-react";
// Gunakan import Link sesuai router Anda
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
            window.location.href = "/dashboard";
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#040814] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* --- ANIMATED AMBIENT BACKGROUND --- */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

            {/* --- MAIN GLASS CONTAINER --- */}
            <div className="w-full max-w-2xl bg-[#0A1128]/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700/50 overflow-hidden flex flex-col z-10 p-8 md:p-12 animate-in zoom-in-95 fade-in duration-500 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex flex-col items-center mb-10 relative z-10 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-[1.2rem] bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.4)] border border-yellow-300/50 mb-5">
                        <span className="font-black text-[#040814] text-4xl tracking-tighter">
                            K
                        </span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                        Registrasi{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                            SIRA
                        </span>
                    </h2>
                    <p className="text-sm font-medium text-slate-400 max-w-sm">
                        Buat kredensial akun baru untuk mendapatkan akses ke
                        dalam sistem laporan.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 relative z-10"
                >
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Nama Lengkap / Satker
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User
                                    className={`h-5 w-5 transition-colors ${errors.name ? "text-rose-400" : "text-slate-500 group-focus-within:text-indigo-400"}`}
                                />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full pl-12 pr-4 py-3.5 bg-[#040814]/50 border ${errors.name ? "border-rose-500/50 focus:ring-rose-500/20" : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"} rounded-2xl text-white font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-600`}
                                placeholder="Budi Santoso"
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-2 ml-1 text-xs text-rose-400 font-bold">
                                {errors.name[0]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Email Address
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
                                placeholder="operator@kemenkum.go.id"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-2 ml-1 text-xs text-rose-400 font-bold">
                                {errors.email[0]}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Password
                            </label>
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

                        <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Ulangi Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ShieldCheck className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-[#040814]/50 border border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-2xl text-white font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group mt-8 outline-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />{" "}
                                Memproses...
                            </>
                        ) : (
                            <>
                                Daftar Akun{" "}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm font-medium text-slate-500 relative z-10">
                    Sudah memiliki akun?{" "}
                    <Link
                        to="/login"
                        className="font-black text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}
