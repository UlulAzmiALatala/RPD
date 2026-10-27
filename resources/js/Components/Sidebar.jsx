import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Wallet,
    Target,
    Receipt,
    FileSpreadsheet,
    Trophy,
    Users,
    Lock,
    ShieldAlert,
    ChevronRight,
    Cpu,
    Activity,
    Clock,
    ShieldCheck,
} from "lucide-react";

export default function Sidebar({
    sidebarOpen,
    sidebarWidth,
    isLoaded,
    authUser,
}) {
    const location = useLocation();
    const isAdmin = authUser?.role === "admin";

    // State Jam Digital Real-Time untuk Telemetry Dock
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = currentTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const dateString = currentTime.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    // Struktur Navigasi Profesional Berbasis Siklus Anggaran
    const navGroups = [
        {
            id: "overview",
            groupTitle: "Pusat Komando",
            items: [
                {
                    name: "Command Center",
                    subtext: "Ringkasan Eksekutif",
                    path: "/dashboard",
                    icon: LayoutDashboard,
                    badge: "Live",
                    badgeColor:
                        "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                    show: true,
                },
            ],
        },
        {
            id: "operasional",
            groupTitle: "Perencanaan & Eksekusi",
            items: [
                {
                    name: "Master Pagu DIPA",
                    subtext: "Plafon & Blokir Anggaran",
                    path: "/dashboard/input-anggaran",
                    icon: Wallet,
                    show: isAdmin,
                },
                {
                    name: "Target & Capaian RO",
                    subtext: "Kinerja Fisik & Alokasi",
                    path: "/dashboard/input-ro",
                    icon: Target,
                    badge: "25%",
                    badgeColor:
                        "bg-purple-500/15 text-purple-300 border-purple-500/30",
                    show: true,
                },
                {
                    name: "Ledger Transaksi",
                    subtext: "RPD & Realisasi Belanja",
                    path: "/dashboard/input-transaksi",
                    icon: Receipt,
                    badge: "55 Pts",
                    badgeColor:
                        "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
                    show: true,
                },
            ],
        },
        {
            id: "pelaporan",
            groupTitle: "Evaluasi & Pelaporan",
            items: [
                {
                    name: "Rapor Kinerja Satker",
                    subtext: "Matriks IKPA & Detail RO",
                    path: "/dashboard/laporan-realisasi",
                    icon: FileSpreadsheet,
                    show: true,
                },
                {
                    name: "Leaderboard Nasional",
                    subtext: "Klasemen Lintas Satker",
                    path: "/dashboard/laporan-bulanan",
                    icon: Trophy,
                    badge: "Kanwil",
                    badgeColor:
                        "bg-amber-500/15 text-amber-300 border-amber-500/30",
                    show: isAdmin,
                },
            ],
        },
        {
            id: "governance",
            groupTitle: "Tata Kelola & Keamanan",
            items: [
                {
                    name: "Manajemen Pengguna",
                    subtext: "Otoritas Akun & Satker",
                    path: "/dashboard/manajemen-user",
                    icon: Users,
                    show: isAdmin,
                },
                {
                    name: "Periode & Cut-Off",
                    subtext: "Kunci Batas Pelaporan",
                    path: "/dashboard/tutup-buku",
                    icon: Lock,
                    show: isAdmin,
                },
                {
                    name: "Audit Trail (CCTV)",
                    subtext: "Rekam Jejak Aktivitas",
                    path: "/dashboard/log-aktivitas",
                    icon: ShieldAlert,
                    show: isAdmin,
                },
            ],
        },
    ];

    return (
        <aside
            style={{ width: `${sidebarWidth}px` }}
            className={`fixed inset-y-0 left-0 bg-[#060B19]/95 backdrop-blur-2xl border-r border-slate-800/80 text-slate-300 flex flex-col z-30 shadow-[15px_0_40px_rgba(0,0,0,0.6)] select-none ${
                isLoaded
                    ? "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    : ""
            } ${!sidebarOpen ? "-translate-x-full md:translate-x-0" : ""}`}
        >
            {/* AMBIENT GLOW DECORATIONS */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-10 right-0 w-56 h-56 bg-amber-500/5 rounded-full blur-[90px] pointer-events-none translate-x-1/3"></div>
            <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent pointer-events-none"></div>

            {/* =====================================================================
                1. HEADER BRANDING (PRESISI SAAT MINIMIZE MAUPUN EXPAND)
            ===================================================================== */}
            <div className="h-24 px-3 border-b border-slate-800/80 flex items-center justify-center relative shrink-0 z-20 bg-[#040814]/40">
                <Link
                    to="/dashboard"
                    className={`flex items-center w-full group focus:outline-none transition-all duration-300 ${
                        sidebarOpen
                            ? "px-2 gap-3.5 justify-start"
                            : "justify-center"
                    }`}
                >
                    {/* Logo Emblem */}
                    <div className="relative flex items-center justify-center shrink-0">
                        <div className="absolute inset-0 bg-amber-400/30 rounded-2xl blur-md group-hover:bg-amber-400/50 transition-all duration-500"></div>
                        <div className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 shadow-[0_0_20px_rgba(245,158,11,0.35)] border border-amber-200/40 group-hover:scale-105 transition-all duration-300">
                            <span className="font-black text-[#040814] text-xl tracking-tighter">
                                K
                            </span>
                        </div>
                    </div>

                    {/* Brand Text */}
                    {sidebarOpen && (
                        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200 leading-none">
                                    SIRA
                                </span>
                                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md">
                                    2.0
                                </span>
                            </div>
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mt-1 truncate">
                                Kemenkum Sulteng
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* =====================================================================
                2. NAVIGATION MENU (ANTI-KEPOTONG SAAT MINIMIZE 80PX)
            ===================================================================== */}
            <nav
                className={`flex-1 py-5 overflow-y-auto custom-scrollbar space-y-6 relative z-10 ${
                    sidebarOpen ? "px-3" : "px-2"
                }`}
            >
                {navGroups.map((group) => {
                    const visibleItems = group.items.filter(
                        (item) => item.show,
                    );
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.id} className="space-y-1.5">
                            {/* Group Header */}
                            {sidebarOpen ? (
                                <div className="px-3 mb-2 flex items-center gap-2">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        {group.groupTitle}
                                    </span>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-800 to-transparent"></div>
                                </div>
                            ) : (
                                <div className="w-6 h-[1px] bg-slate-800/90 mx-auto my-2"></div>
                            )}

                            {/* Menu Items */}
                            {visibleItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive =
                                    location.pathname === item.path;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        title={
                                            !sidebarOpen
                                                ? `${item.name} — ${item.subtext}`
                                                : undefined
                                        }
                                        className={`relative flex items-center rounded-2xl transition-all duration-300 group ${
                                            sidebarOpen
                                                ? "px-3 py-2.5 gap-3 justify-between w-full overflow-hidden"
                                                : "w-12 h-12 mx-auto justify-center"
                                        } ${
                                            isActive
                                                ? "bg-gradient-to-r from-indigo-600/25 via-indigo-500/15 to-transparent text-white border border-indigo-500/40 shadow-[0_8px_25px_-5px_rgba(79,70,229,0.3)]"
                                                : "text-slate-400 border border-transparent hover:bg-slate-800/60 hover:text-slate-200 hover:border-slate-700/60"
                                        }`}
                                    >
                                        {/* Left Active Laser Bar */}
                                        {isActive && (
                                            <div
                                                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-gradient-to-b from-amber-400 via-indigo-400 to-indigo-600 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.9)] ${
                                                    sidebarOpen ? "h-7" : "h-5"
                                                }`}
                                            ></div>
                                        )}

                                        {sidebarOpen ? (
                                            /* TAMPILAN SAAT SIDEBAR TERBUKA (EXPANDED) */
                                            <>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={`w-9 h-9 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center ${
                                                            isActive
                                                                ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                                                : "bg-slate-800/80 text-slate-400 border border-slate-700/60 group-hover:text-indigo-300 group-hover:bg-slate-800"
                                                        }`}
                                                    >
                                                        <IconComponent
                                                            size={18}
                                                            strokeWidth={
                                                                isActive
                                                                    ? 2.5
                                                                    : 2
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex flex-col min-w-0">
                                                        <span
                                                            className={`text-xs truncate leading-snug ${
                                                                isActive
                                                                    ? "font-black text-white tracking-wide"
                                                                    : "font-bold text-slate-300 group-hover:text-white"
                                                            }`}
                                                        >
                                                            {item.name}
                                                        </span>
                                                        <span
                                                            className={`text-[10px] truncate leading-tight mt-0.5 ${
                                                                isActive
                                                                    ? "text-indigo-300/90 font-semibold"
                                                                    : "text-slate-500 font-medium group-hover:text-slate-400"
                                                            }`}
                                                        >
                                                            {item.subtext}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {item.badge && (
                                                        <span
                                                            className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${item.badgeColor}`}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    <ChevronRight
                                                        size={14}
                                                        className={`transition-all duration-300 ${
                                                            isActive
                                                                ? "text-indigo-400 translate-x-0 opacity-100"
                                                                : "text-slate-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                                        }`}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            /* TAMPILAN SAAT SIDEBAR MINIMIZE (80PX) — PRESISI DI TENGAH */
                                            <div className="relative flex items-center justify-center w-full h-full">
                                                <IconComponent
                                                    size={20}
                                                    strokeWidth={
                                                        isActive ? 2.5 : 2
                                                    }
                                                    className={`transition-transform duration-300 group-hover:scale-110 ${
                                                        isActive
                                                            ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                                                            : "text-slate-400 group-hover:text-white"
                                                    }`}
                                                />
                                                {/* Dot Indikator Kecil jika menu memiliki badge */}
                                                {item.badge && (
                                                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></span>
                                                )}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            {/* =====================================================================
                3. FOOTER: SIRA QUANTUM TELEMETRY DOCK (PENGGANTI FOTO PROFIL)
            ===================================================================== */}
            <div className="p-3 border-t border-slate-800/80 bg-[#040814]/90 relative z-20 shrink-0">
                {sidebarOpen ? (
                    <div className="relative rounded-2xl p-3.5 bg-gradient-to-br from-slate-900/95 via-[#0A1128]/95 to-indigo-950/40 border border-slate-800/90 shadow-inner overflow-hidden group">
                        {/* Shimmer & Glow Effect */}
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/15 rounded-full blur-xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 opacity-70"></div>

                        {/* Top Row: Core Status & Signal Bars */}
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                    SIRA Core Active
                                </span>
                            </div>
                            {/* Animated Equalizer / Signal Bars */}
                            <div className="flex items-end gap-0.5 h-3">
                                <span className="w-0.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                                <span className="w-0.5 h-2.5 bg-indigo-400 rounded-full animate-pulse [animation-delay:150ms]"></span>
                                <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-pulse [animation-delay:300ms]"></span>
                                <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:450ms]"></span>
                            </div>
                        </div>

                        {/* Middle Row: Real-Time Digital Clock (WITA) */}
                        <div className="flex items-center justify-between bg-[#040814]/80 px-3 py-2 rounded-xl border border-slate-800/80 mb-2">
                            <div className="flex items-center gap-2">
                                <Clock
                                    size={13}
                                    className="text-amber-400 shrink-0"
                                />
                                <span className="text-xs font-mono font-black text-white tracking-wider">
                                    {timeString}
                                </span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                {dateString}
                            </span>
                        </div>

                        {/* Bottom Row: Security & Sync Badge */}
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 px-0.5">
                            <span className="flex items-center gap-1 text-indigo-300 truncate">
                                <Cpu
                                    size={11}
                                    className="text-indigo-400 shrink-0"
                                />
                                Engine 55-Pts Sync
                            </span>
                            <span className="flex items-center gap-1 text-amber-300/90 shrink-0">
                                <ShieldCheck
                                    size={11}
                                    className="text-amber-400"
                                />
                                {isAdmin ? "Root Auth" : "Satker Auth"}
                            </span>
                        </div>
                    </div>
                ) : (
                    /* TAMPILAN TELEMETRY SAAT MINIMIZE (ORB RADAR) */
                    <div
                        className="w-12 h-12 mx-auto rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center gap-1 relative group cursor-help"
                        title={`SIRA Core Active • ${timeString} WITA`}
                    >
                        <div className="relative flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-50"></span>
                            <Activity
                                size={16}
                                className="text-emerald-400 relative z-10"
                            />
                        </div>
                        <span className="text-[8px] font-mono font-black text-slate-400">
                            LIVE
                        </span>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(99, 102, 241, 0.25); border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(99, 102, 241, 0.6); }
            `}</style>
        </aside>
    );
}
