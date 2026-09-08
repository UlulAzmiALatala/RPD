import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Header({
    sidebarOpen,
    setSidebarOpen,
    tahun,
    authUser,
}) {
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fungsi untuk menutup dropdown jika klik di sembarang tempat
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post("/logout");
            window.location.href = "/login";
        } catch (error) {
            console.error("Gagal logout:", error);
            window.location.href = "/login";
        }
    };

    // Ambil inisial nama
    const initial = authUser?.name
        ? authUser.name.charAt(0).toUpperCase()
        : "U";

    const roleLabel =
        authUser?.role === "admin" ? "Administrator" : "Satuan Kerja";

    return (
        <header className="sticky top-0 z-20 flex justify-between items-center py-3 px-6 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm h-20 transition-colors duration-300">
            {/* KIRI: Tombol Toggle Sidebar & Tagline */}
            <div className="flex items-center gap-x-6">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-indigo-500 transition-all focus:outline-none"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {sidebarOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h7"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
                <p className="hidden md:block text-xs font-black tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-400">
                    Sistem Informasi Realisasi Anggaran
                </p>
            </div>

            {/* KANAN: Tahun & Profile */}
            <div className="flex items-center gap-x-4">
                <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-[inset_0_0_10px_rgba(99,102,241,0.05)]">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                        TA: {tahun || new Date().getFullYear()}
                    </span>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center transition ease-in-out duration-300 hover:scale-105 focus:outline-none"
                    >
                        {/* UPDATE AVATAR DI SINI */}
                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-indigo-100 border border-indigo-200 shadow-sm flex items-center justify-center text-indigo-600 font-black">
                            {authUser?.avatar ? (
                                <img
                                    src={`/storage/${authUser.avatar}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                initial
                            )}
                        </div>
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-white backdrop-blur-xl rounded-[1.5rem] shadow-xl overflow-hidden z-30 border border-slate-200/50 transform opacity-100 scale-100 transition-all duration-200">
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                <p className="text-sm font-black text-slate-900 truncate">
                                    {authUser?.name || "Memuat..."}
                                </p>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 truncate mt-0.5">
                                    {authUser?.email || "memuat@email.com"}
                                </p>
                                <span
                                    className={`mt-2 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest inline-block border ${
                                        authUser?.role === "admin"
                                            ? "text-indigo-600 bg-indigo-100 border-indigo-200"
                                            : "text-emerald-600 bg-emerald-100 border-emerald-200"
                                    }`}
                                >
                                    {roleLabel}
                                </span>
                            </div>

                            <div className="py-1">
                                <Link
                                    to="/dashboard/profil"
                                    onClick={() => setProfileOpen(false)}
                                    className="w-full text-left flex items-center gap-3 py-3 px-5 hover:bg-slate-50 text-slate-600 transition-colors group"
                                >
                                    <i className="fa-solid fa-user-gear w-5 text-center text-slate-400 group-hover:text-indigo-500 transition-colors"></i>
                                    <span className="font-bold text-sm">
                                        Profil Saya
                                    </span>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left flex items-center gap-3 py-3 px-5 hover:bg-rose-50 text-rose-600 transition-colors group border-t border-slate-100"
                                >
                                    <i className="fa-solid fa-sign-out-alt w-5 text-center group-hover:-translate-x-1 transition-transform"></i>
                                    <span className="font-bold text-sm">
                                        Log Out
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
