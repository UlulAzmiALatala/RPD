import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";

/**
 * Penjaga Halaman Tamu (/login, /forgot-password)
 * Jika sudah login, otomatis arahkan masuk ke Dashboard.
 */
export function GuestRoute({ children }) {
    const [status, setStatus] = useState("checking"); // checking | guest | authed | force_password

    useEffect(() => {
        let active = true;
        axios
            .get("/api/user", { headers: { Accept: "application/json" } })
            .then((res) => {
                if (!active) return;
                if (res.data?.must_change_password) {
                    setStatus("force_password");
                } else {
                    setStatus("authed");
                }
            })
            .catch(() => {
                if (active) setStatus("guest");
            });

        return () => {
            active = false;
        };
    }, []);

    if (status === "checking") {
        return (
            <div className="min-h-screen bg-[#040814] flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 size={32} className="animate-spin text-indigo-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.22em]">
                    Memeriksa Sesi SIRA...
                </span>
            </div>
        );
    }

    if (status === "force_password") {
        return <Navigate to="/ganti-password-wajib" replace />;
    }

    if (status === "authed") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

/**
 * Penjaga Halaman Internal (Auth + Wajib Ganti Password + Role Admin Guard)
 */
export function ProtectedRoute({
    children,
    requireAdmin = false,
    allowForceChange = false,
}) {
    const [state, setState] = useState({
        checking: true,
        user: null,
        authenticated: false,
    });

    useEffect(() => {
        let active = true;
        axios
            .get("/api/user", { headers: { Accept: "application/json" } })
            .then((res) => {
                if (!active) return;
                setState({
                    checking: false,
                    user: res.data,
                    authenticated: true,
                });
            })
            .catch(() => {
                if (!active) return;
                setState({
                    checking: false,
                    user: null,
                    authenticated: false,
                });
            });

        return () => {
            active = false;
        };
    }, []);

    if (state.checking) {
        return (
            <div className="min-h-screen bg-[#040814] flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 size={32} className="animate-spin text-amber-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.22em]">
                    Memverifikasi Otoritas Akses...
                </span>
            </div>
        );
    }

    if (!state.authenticated || !state.user) {
        return <Navigate to="/login" replace />;
    }

    // Jika akun wajib ganti password, cegat ke /ganti-password-wajib
    if (state.user.must_change_password && !allowForceChange) {
        return <Navigate to="/ganti-password-wajib" replace />;
    }

    // Jika akun sudah ganti password tapi masih membuka /ganti-password-wajib
    if (!state.user.must_change_password && allowForceChange) {
        return <Navigate to="/dashboard" replace />;
    }

    // Role Guard: Blokir Operator Satker mengakses halaman khusus Admin Kanwil
    if (requireAdmin && state.user.role !== "admin") {
        return (
            <div className="min-h-screen bg-[#040814] flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full bg-[#0A1128]/90 border border-rose-500/35 rounded-[2.5rem] p-8 sm:p-10 text-center shadow-2xl">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-400 flex items-center justify-center mb-5">
                        <ShieldAlert size={32} />
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-widest">
                        Error 403 — Akses Dibatasi
                    </span>
                    <h2 className="text-2xl font-black text-white mt-3 tracking-tight">
                        Halaman Khusus Admin Kanwil
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium mt-2 leading-relaxed">
                        Akun Operator Satker Anda tidak memiliki hak otoritas
                        untuk membuka modul tata kelola pusat ini.
                    </p>
                    <Link
                        to="/dashboard"
                        className="mt-7 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg"
                    >
                        <ArrowLeft size={15} /> Kembali ke Command Center
                    </Link>
                </div>
            </div>
        );
    }

    return children;
}
