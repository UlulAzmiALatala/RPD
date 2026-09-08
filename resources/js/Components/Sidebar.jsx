import React from "react";
import { Link, useLocation } from "react-router-dom";

// Tangkap props authUser dari MainLayout
export default function Sidebar({
    sidebarOpen,
    sidebarWidth,
    isLoaded,
    authUser,
}) {
    const location = useLocation();

    // ==========================================
    // LOGIKA ROLE / JABATAN
    // ==========================================
    // Kita pastikan defaultnya false jika data belum ke-load
    const isAdmin = authUser?.role === "admin";

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return `flex items-center gap-3 px-4 py-3 mx-1 mt-1 rounded-2xl text-xs font-bold transition-all duration-300 group ${
            isActive
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]"
                : "border border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        } ${sidebarOpen ? "justify-start" : "justify-center"}`;
    };

    const getIconClass = (path) => {
        const isActive = location.pathname === path;
        return `fa-fw w-5 text-center text-lg transition-transform group-hover:scale-110 ${
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

                {/* NAVIGASI MENU */}
                <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-6 relative z-10">
                    {/* ============================================== */}
                    {/* AREA ANALYTICS - DASHBOARD UTAMA */}
                    {/* ============================================== */}
                    {sidebarOpen && (
                        <div className="px-4 mt-2 mb-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">
                            Analytics
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
                            <span className="transition-opacity duration-200 whitespace-nowrap tracking-wide">
                                Dashboard
                            </span>
                        )}
                    </Link>

                    {/* ============================================== */}
                    {/* AREA TRANSAKSI - DIAKSES SEMUA (ADMIN & SATKER) */}
                    {/* ============================================== */}
                    {sidebarOpen && (
                        <div className="px-4 mt-6 mb-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">
                            Transaksi
                        </div>
                    )}
                    <Link
                        to="/dashboard/input-transaksi"
                        className={getLinkClass("/dashboard/input-transaksi")}
                        title="Input Transaksi"
                    >
                        <i
                            className={`fa-solid fa-receipt ${getIconClass("/dashboard/input-transaksi")}`}
                        ></i>
                        {sidebarOpen && (
                            <span className="transition-opacity duration-200 whitespace-nowrap tracking-wide">
                                Input Transaksi
                            </span>
                        )}
                    </Link>

                    {/* ============================================== */}
                    {/* AREA Laporan - HANYA TAMPIL UNTUK ADMIN KANWIL */}
                    {/* ============================================== */}
                    {isAdmin && (
                        <>
                            {sidebarOpen && (
                                <div className="px-4 mt-6 mb-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">
                                    Laporan
                                </div>
                            )}

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
                                    <span className="transition-opacity duration-200 whitespace-nowrap tracking-wide">
                                        Laporan Bulanan
                                    </span>
                                )}
                            </Link>

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
                                    <span className="transition-opacity duration-200 whitespace-nowrap tracking-wide">
                                        Realisasi per Satker
                                    </span>
                                )}
                            </Link>
                        </>
                    )}

                    {/* ============================================== */}
                    {/* AREA SETTINGS & MASTER - HANYA TAMPIL UNTUK ADMIN */}
                    {/* ============================================== */}
                    {isAdmin && (
                        <>
                            {sidebarOpen && (
                                <div className="px-4 mt-6 mb-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">
                                    Pengaturan
                                </div>
                            )}

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
                                    <span className="transition-opacity duration-200 whitespace-nowrap tracking-wide">
                                        Master Anggaran
                                    </span>
                                )}
                            </Link>

                            {/* MENU MANAJEMEN USER BARU */}
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
                                    <span className="transition-opacity duration-200 whitespace-nowrap tracking-wide">
                                        Manajemen Pengguna
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
                                    <span className="transition-opacity duration-200 whitespace-nowrap tracking-wide">
                                        Log Aktivitas
                                    </span>
                                )}
                            </Link>
                        </>
                    )}
                </nav>
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
