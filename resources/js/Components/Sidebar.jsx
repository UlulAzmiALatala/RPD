import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({
    sidebarOpen,
    sidebarWidth,
    isLoaded,
    authUser,
}) {
    const location = useLocation();
    const isAdmin = authUser?.role === "admin";

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return `flex items-center gap-3 px-4 py-2.5 mx-2 mt-1 rounded-xl text-xs font-bold transition-all duration-300 group ${
            isActive
                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[inset_0_0_15px_rgba(99,102,241,0.05)]"
                : "border border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
        } ${sidebarOpen ? "justify-start" : "justify-center"}`;
    };

    const getIconClass = (path) => {
        const isActive = location.pathname === path;
        return `fa-fw w-5 text-center text-base transition-transform group-hover:scale-110 ${
            isActive ? "text-indigo-400" : "text-slate-500"
        }`;
    };

    return (
        <div
            style={{ width: `${sidebarWidth}px` }}
            className={`fixed inset-y-0 left-0 bg-[#0B1120] border-r border-slate-800/80 text-slate-400 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.4)] ${isLoaded ? "transition-all duration-300 ease-in-out" : ""} ${!sidebarOpen ? "-translate-x-full md:translate-x-0" : ""}`}
        >
            <div className="flex-grow flex flex-col overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-40 bg-indigo-600/5 blur-[50px] pointer-events-none"></div>

                {/* HEADER LOGO */}
                <div className="flex items-center justify-center h-20 px-4 border-b border-slate-800/60 relative flex-shrink-0 bg-[#0B1120]/80 backdrop-blur-md z-20">
                    <Link
                        to="/dashboard"
                        className="transition-transform duration-300 hover:scale-105 whitespace-nowrap flex justify-center items-center w-full group relative gap-3"
                    >
                        <div
                            className={`flex items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-500 to-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-300 ${sidebarOpen ? "w-10 h-10" : "w-8 h-8"}`}
                        >
                            <span className="font-black text-[#0A192F] text-lg">
                                K
                            </span>
                        </div>
                        {sidebarOpen && (
                            <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                                SIRA
                            </span>
                        )}
                    </Link>
                </div>

                {/* NAVIGASI MENU TERSTRUKTUR PROFESIONAL */}
                <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto custom-scrollbar pb-6 relative z-10">
                    {/* KELOMPOK 1: UTAMA / ANALYTICS */}
                    <div>
                        {sidebarOpen && (
                            <div className="px-3 mb-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">
                                Utama
                            </div>
                        )}
                        <Link
                            to="/dashboard"
                            className={getLinkClass("/dashboard")}
                            title="Dashboard"
                        >
                            <i
                                className={`fa-solid fa-chart-pie ${getIconClass("/dashboard")}`}
                            ></i>
                            {sidebarOpen && (
                                <span className="whitespace-nowrap">
                                    Dashboard
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* KELOMPOK 2: OPERASIONAL & TRANSAKSI (Input Transaksi disatukan dekat Master Anggaran) */}
                    <div>
                        {sidebarOpen && (
                            <div className="px-3 mb-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">
                                Transaksi & Anggaran
                            </div>
                        )}
                        <Link
                            to="/dashboard/input-transaksi"
                            className={getLinkClass(
                                "/dashboard/input-transaksi",
                            )}
                            title="Input Transaksi"
                        >
                            <i
                                className={`fa-solid fa-receipt ${getIconClass("/dashboard/input-transaksi")}`}
                            ></i>
                            {sidebarOpen && (
                                <span className="whitespace-nowrap">
                                    Input Transaksi
                                </span>
                            )}
                        </Link>

                        {isAdmin && (
                            <Link
                                to="/dashboard/input-anggaran"
                                className={getLinkClass(
                                    "/dashboard/input-anggaran",
                                )}
                                title="Master Anggaran"
                            >
                                <i
                                    className={`fa-solid fa-wallet ${getIconClass("/dashboard/input-anggaran")}`}
                                ></i>
                                {sidebarOpen && (
                                    <span className="whitespace-nowrap">
                                        Master Anggaran
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>

                    {/* KELOMPOK 3: LAPORAN & MONITORING */}
                    {isAdmin && (
                        <div>
                            {sidebarOpen && (
                                <div className="px-3 mb-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">
                                    Laporan & Analitik
                                </div>
                            )}
                            <Link
                                to="/dashboard/laporan-realisasi"
                                className={getLinkClass(
                                    "/dashboard/laporan-realisasi",
                                )}
                                title="Realisasi per Satker"
                            >
                                <i
                                    className={`fa-solid fa-file-invoice ${getIconClass("/dashboard/laporan-realisasi")}`}
                                ></i>
                                {sidebarOpen && (
                                    <span className="whitespace-nowrap">
                                        Realisasi per Satker
                                    </span>
                                )}
                            </Link>

                            <Link
                                to="/dashboard/laporan-bulanan"
                                className={getLinkClass(
                                    "/dashboard/laporan-bulanan",
                                )}
                                title="Laporan Bulanan"
                            >
                                <i
                                    className={`fa-solid fa-calendar-check ${getIconClass("/dashboard/laporan-bulanan")}`}
                                ></i>
                                {sidebarOpen && (
                                    <span className="whitespace-nowrap">
                                        Laporan Bulanan
                                    </span>
                                )}
                            </Link>
                        </div>
                    )}

                    {/* KELOMPOK 4: ADMINISTRASI SISTEM & PENGATURAN */}
                    {isAdmin && (
                        <div>
                            {sidebarOpen && (
                                <div className="px-3 mb-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">
                                    Sistem & Keamanan
                                </div>
                            )}
                            <Link
                                to="/dashboard/manajemen-user"
                                className={getLinkClass(
                                    "/dashboard/manajemen-user",
                                )}
                                title="Manajemen Pengguna"
                            >
                                <i
                                    className={`fa-solid fa-users-gear ${getIconClass("/dashboard/manajemen-user")}`}
                                ></i>
                                {sidebarOpen && (
                                    <span className="whitespace-nowrap">
                                        Manajemen Pengguna
                                    </span>
                                )}
                            </Link>

                            <Link
                                to="/dashboard/tutup-buku"
                                className={getLinkClass(
                                    "/dashboard/tutup-buku",
                                )}
                                title="Kunci Periode"
                            >
                                <i
                                    className={`fa-solid fa-lock ${getIconClass("/dashboard/tutup-buku")}`}
                                ></i>
                                {sidebarOpen && (
                                    <span className="whitespace-nowrap">
                                        Kunci Periode
                                    </span>
                                )}
                            </Link>

                            <Link
                                to="/dashboard/log-aktivitas"
                                className={getLinkClass(
                                    "/dashboard/log-aktivitas",
                                )}
                                title="Log Aktivitas"
                            >
                                <i
                                    className={`fa-solid fa-user-secret ${getIconClass("/dashboard/log-aktivitas")}`}
                                ></i>
                                {sidebarOpen && (
                                    <span className="whitespace-nowrap">
                                        Log Aktivitas
                                    </span>
                                )}
                            </Link>
                        </div>
                    )}
                </nav>
            </div>

            {/* FOOTER SIDEBAR */}
            <div
                className={`p-4 border-t border-slate-800/60 bg-[#0B1120] transition-all duration-300 ${sidebarOpen ? "text-left" : "text-center"}`}
            >
                {sidebarOpen ? (
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            SIRA Kemenkum
                        </p>
                        <p className="text-[9px] text-slate-600">
                            &copy; {new Date().getFullYear()} Kanwil Sulteng.
                        </p>
                        <p className="text-[8px] text-indigo-500/70 font-mono mt-1">
                            v.1.0.0 (Realtime Ready)
                        </p>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-full">
                        <i className="fa-solid fa-shield-halved text-slate-600 text-sm"></i>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(99, 102, 241, 0.2); border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(99, 102, 241, 0.5); }
            `}</style>
        </div>
    );
}
