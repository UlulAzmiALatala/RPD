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

    // Efek UI Premium untuk Menu Aktif vs Tidak Aktif
    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return `relative flex items-center gap-3 px-4 py-3 mx-3 my-1 rounded-xl text-sm font-semibold transition-all duration-300 group overflow-hidden ${
            isActive
                ? "bg-gradient-to-r from-indigo-600/20 to-indigo-600/5 text-indigo-300 border border-indigo-500/20 shadow-[0_4px_20px_-5px_rgba(79,70,229,0.15)]"
                : "text-slate-400 border border-transparent hover:bg-slate-800/40 hover:text-slate-200"
        } ${sidebarOpen ? "justify-start" : "justify-center"}`;
    };

    const getIconClass = (path) => {
        const isActive = location.pathname === path;
        return `fa-fw w-5 text-center text-lg transition-all duration-300 group-hover:scale-110 ${
            isActive
                ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]"
                : "text-slate-500 group-hover:text-slate-300"
        }`;
    };

    // Komponen Indikator Garis Neon untuk Menu Aktif
    const ActiveIndicator = ({ path }) => {
        if (location.pathname !== path) return null;
        return (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3/5 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.9)]"></div>
        );
    };

    // Helper Judul Seksi Dinamis
    const SectionTitle = ({ title }) => {
        if (!sidebarOpen) return <div className="h-6"></div>; // Spacer saat collapse
        return (
            <div className="px-5 mt-6 mb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                {title}
            </div>
        );
    };

    return (
        <div
            style={{ width: `${sidebarWidth}px` }}
            className={`fixed inset-y-0 left-0 bg-[#0B1120]/95 backdrop-blur-xl border-r border-slate-700/50 text-slate-300 flex flex-col z-30 shadow-[10px_0_30px_rgba(0,0,0,0.5)] ${
                isLoaded ? "transition-all duration-300 ease-in-out" : ""
            } ${!sidebarOpen ? "-translate-x-full md:translate-x-0" : ""}`}
        >
            <div className="flex-grow flex flex-col overflow-hidden relative">
                {/* Efek Ambience Glow di Pojok Kiri Atas */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

                {/* HEADER LOGO PREMIUM */}
                <div className="flex items-center justify-center h-20 px-4 border-b border-slate-700/50 relative flex-shrink-0 z-20">
                    <Link
                        to="/dashboard"
                        className="transition-transform duration-300 hover:scale-105 whitespace-nowrap flex justify-center items-center w-full group relative gap-4"
                    >
                        <div
                            className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 border border-amber-300/30 ${
                                sidebarOpen ? "w-10 h-10" : "w-8 h-8"
                            }`}
                        >
                            <span className="font-black text-[#0A192F] text-lg">
                                K
                            </span>
                        </div>
                        {sidebarOpen && (
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-100">
                                    SIRA
                                </span>
                                <span className="text-[9px] font-bold text-indigo-300 tracking-[0.2em] -mt-1">
                                    KEMENKUM
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* NAVIGASI MENU (DYNAMIC RBAC) */}
                <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar pb-6 relative z-10">
                    <SectionTitle title="Utama" />
                    <Link
                        to="/dashboard"
                        className={getLinkClass("/dashboard")}
                        title="Dashboard"
                    >
                        <ActiveIndicator path="/dashboard" />
                        <i
                            className={`fa-solid fa-chart-pie ${getIconClass("/dashboard")}`}
                        ></i>
                        {sidebarOpen && (
                            <span className="truncate">Dashboard</span>
                        )}
                    </Link>

                    {isAdmin && (
                        <>
                            <SectionTitle title="Master Data" />
                            <Link
                                to="/dashboard/input-anggaran"
                                className={getLinkClass(
                                    "/dashboard/input-anggaran",
                                )}
                                title="Master Anggaran"
                            >
                                <ActiveIndicator path="/dashboard/input-anggaran" />
                                <i
                                    className={`fa-solid fa-wallet ${getIconClass("/dashboard/input-anggaran")}`}
                                ></i>
                                {sidebarOpen && (
                                    <span className="truncate">
                                        Master Pagu DIPA
                                    </span>
                                )}
                            </Link>
                        </>
                    )}

                    <SectionTitle title="Operasional Kinerja" />
                    <Link
                        to="/dashboard/input-transaksi"
                        className={getLinkClass("/dashboard/input-transaksi")}
                        title="Input Transaksi"
                    >
                        <ActiveIndicator path="/dashboard/input-transaksi" />
                        <i
                            className={`fa-solid fa-receipt ${getIconClass("/dashboard/input-transaksi")}`}
                        ></i>
                        {sidebarOpen && (
                            <span className="truncate">Transaksi 55 Poin</span>
                        )}
                    </Link>
                    <Link
                        to="/dashboard/input-ro"
                        className={getLinkClass("/dashboard/input-ro")}
                        title="Capaian Output (RO)"
                    >
                        <ActiveIndicator path="/dashboard/input-ro" />
                        <i
                            className={`fa-solid fa-list-check ${getIconClass("/dashboard/input-ro")}`}
                        ></i>
                        {sidebarOpen && (
                            <span className="truncate">
                                Capaian Output (RO)
                            </span>
                        )}
                    </Link>

                    <SectionTitle title="Analitik & Laporan" />
                    {/* Rapor Satker bisa dilihat semua role */}
                    <Link
                        to="/dashboard/laporan-realisasi"
                        className={getLinkClass("/dashboard/laporan-realisasi")}
                        title="Rapor Kinerja Satker"
                    >
                        <ActiveIndicator path="/dashboard/laporan-realisasi" />
                        <i
                            className={`fa-solid fa-file-invoice ${getIconClass("/dashboard/laporan-realisasi")}`}
                        ></i>
                        {sidebarOpen && (
                            <span className="truncate">Rapor Kinerja</span>
                        )}
                    </Link>
                    {/* Laporan Nasional khusus Admin */}
                    {isAdmin && (
                        <Link
                            to="/dashboard/laporan-bulanan"
                            className={getLinkClass(
                                "/dashboard/laporan-bulanan",
                            )}
                            title="Laporan Nasional"
                        >
                            <ActiveIndicator path="/dashboard/laporan-bulanan" />
                            <i
                                className={`fa-solid fa-globe ${getIconClass("/dashboard/laporan-bulanan")}`}
                            ></i>
                            {sidebarOpen && (
                                <span className="truncate">
                                    Laporan Nasional
                                </span>
                            )}
                        </Link>
                    )}

                    {isAdmin && (
                        <>
                            <SectionTitle title="Administrator" />
                            <Link
                                to="/dashboard/manajemen-user"
                                className={getLinkClass(
                                    "/dashboard/manajemen-user",
                                )}
                                title="Manajemen Pengguna"
                            >
                                <ActiveIndicator path="/dashboard/manajemen-user" />
                                <i
                                    className={`fa-solid fa-users-gear ${getIconClass("/dashboard/manajemen-user")}`}
                                ></i>
                                {sidebarOpen && (
                                    <span className="truncate">
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
                                <ActiveIndicator path="/dashboard/tutup-buku" />
                                <i
                                    className={`fa-solid fa-lock ${getIconClass("/dashboard/tutup-buku")}`}
                                ></i>
                                {sidebarOpen && (
                                    <span className="truncate">
                                        Periode & Tutup Buku
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
                                <ActiveIndicator path="/dashboard/log-aktivitas" />
                                <i
                                    className={`fa-solid fa-user-secret ${getIconClass("/dashboard/log-aktivitas")}`}
                                ></i>
                                {sidebarOpen && (
                                    <span className="truncate">
                                        Log Aktivitas CCTV
                                    </span>
                                )}
                            </Link>
                        </>
                    )}
                </nav>
            </div>

            {/* FOOTER SIDEBAR (PROFIL INFO SINGKAT) */}
            <div
                className={`p-4 border-t border-slate-700/50 bg-[#070b16] transition-all duration-300 relative overflow-hidden ${sidebarOpen ? "text-left" : "text-center"}`}
            >
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-[20px]"></div>

                {sidebarOpen ? (
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-9 h-9 rounded-full bg-slate-700 border-2 border-indigo-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <i className="fa-solid fa-user text-slate-400 text-xs"></i>
                        </div>
                        <div className="flex flex-col truncate">
                            <p className="text-xs font-bold text-slate-200 truncate">
                                {authUser?.name || "Pengguna"}
                            </p>
                            <p className="text-[10px] text-indigo-400 uppercase tracking-wider truncate">
                                {isAdmin
                                    ? "SUPER ADMIN"
                                    : authUser?.kode_satker || "OPERATOR"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-full relative z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-700 border border-indigo-500/30 flex items-center justify-center">
                            <i className="fa-solid fa-user-shield text-indigo-400 text-xs"></i>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(99, 102, 241, 0.3); border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(99, 102, 241, 0.8); }
            `}</style>
        </div>
    );
}
