import React from "react";
import { Link } from "react-router-dom";
import {
    KeyRound,
    ShieldCheck,
    ArrowLeft,
    UserCog,
    Smartphone,
    LockKeyhole,
} from "lucide-react";

export default function ForgotPassword() {
    return (
        <div className="min-h-screen bg-[#040814] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#818cf8_1px,transparent_1px),linear-gradient(to_bottom,#818cf8_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none"></div>
            <div className="absolute top-[-15%] left-[-10%] w-[450px] h-[450px] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none"></div>
            <div className="absolute bottom-[-15%] right-[-10%] w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none"></div>

            <div className="w-full max-w-xl bg-[#0A1128]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.65)] border border-slate-700/60 p-8 sm:p-12 relative z-10 text-slate-200">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/35 text-amber-400 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                        <KeyRound size={30} strokeWidth={2.3} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Pemulihan Akses Akun
                    </h1>
                    <p className="text-sm font-medium text-slate-400 mt-2 max-w-md leading-relaxed">
                        Demi keamanan data anggaran DIPA Kanwil Kemenkum
                        Sulawesi Tengah, reset password dan reset darurat 2FA
                        dilakukan secara terverifikasi melalui Admin Kanwil.
                    </p>
                </div>

                <div className="space-y-3.5 mb-8">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-slate-700/60 flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/25 shrink-0">
                            <UserCog size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                1. Hubungi Admin Keuangan / Pranata Komputer
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Sampaikan Nama Lengkap, Email terdaftar, dan
                                Kode Satuan Kerja Anda untuk verifikasi
                                identitas.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-slate-700/60 flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/25 shrink-0">
                            <LockKeyhole size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                2. Terima Password Sementara (1x Pakai)
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Admin akan menerbitkan password sementara
                                melalui modul Manajemen Pengguna. Saat Anda
                                login, sistem otomatis mewajibkan pembuatan
                                password pribadi baru.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-slate-700/60 flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/25 shrink-0">
                            <Smartphone size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                3. Kehilangan HP / Google Authenticator?
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Gunakan salah satu{" "}
                                <strong className="text-slate-200">
                                    Kode Pemulihan (Recovery Code)
                                </strong>{" "}
                                pada layar login, atau minta Admin melakukan{" "}
                                <strong className="text-slate-200">
                                    Reset Darurat 2FA
                                </strong>
                                .
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-800">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                        <ShieldCheck size={15} /> Standar Keamanan Internal SPBE
                    </span>
                    <Link
                        to="/login"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg"
                    >
                        <ArrowLeft size={15} /> Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
