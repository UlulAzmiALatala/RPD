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
    Sparkles,
} from "lucide-react";

export default function Sidebar({
    sidebarOpen,
    sidebarWidth,
    isLoaded,
    authUser,
}) {
    const location = useLocation();
    const isAdmin = authUser?.role === "admin";

    // Jam Digital Real-Time (WITA) untuk Quantum Telemetry Dock
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

    // Struktur Navigasi Berbasis Siklus Anggaran (Sinkron 65 Poin + Tata Kelola)
    const navGroups = [
        {
            id: "overview",
            groupTitle: "Pusat Komando",
            dotColor: "bg-emerald-400",
            items: [
                {
                    name: "Command Center",
                    subtext: "Ringkasan 65 Pts & Tata Kelola",
                    path: "/dashboard",
                    icon: LayoutDashboard,
                    badge: "Live",
                    badgeColor:
                        "bg-emerald-500/15 text-emerald-300 border-emerald-400/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
                    show: true,
                },
            ],
        },
        {
            id: "operasional",
            groupTitle: "Perencanaan & Eksekusi",
            dotColor: "bg-indigo-400",
            items: [
                {
                    name: "Master Pagu DIPA",
                    subtext: "Plafon, Blokir & Revisi DIPA",
                    path: "/dashboard/input-anggaran",
                    icon: Wallet,
                    badge: "10%",
                    badgeColor:
                        "bg-amber-500/15 text-amber-300 border-amber-400/30",
                    show: isAdmin,
                },
                {
                    name: "Target & Capaian RO",
                    subtext: "Kinerja Fisik & Alokasi",
                    path: "/dashboard/input-ro",
                    icon: Target,
                    badge: "25%",
                    badgeColor:
                        "bg-purple-500/15 text-purple-300 border-purple-400/30",
                    show: true,
                },
                {
                    name: "Ledger Transaksi",
                    subtext: "RPD, Realisasi & Impor Excel",
                    path: "/dashboard/input-transaksi",
                    icon: Receipt,
                    badge: "65 Pts",
                    badgeColor:
                        "bg-cyan-500/15 text-cyan-300 border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.18)]",
                    show: true,
                },
            ],
        },
        {
            id: "pelaporan",
            groupTitle: "Evaluasi & Pelaporan",
            dotColor: "bg-amber-400",
            items: [
                {
                    name: "Rapor Kinerja Satker",
                    subtext: "Matriks IKPA 65 Pts & RO",
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
                        "bg-amber-500/15 text-amber-300 border-amber-400/30",
                    show: isAdmin,
                },
            ],
        },
        {
            id: "governance",
            groupTitle: "Tata Kelola & Keamanan",
            dotColor: "bg-rose-400",
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
            className={`fixed inset-y-0 left-0 bg-gradient-to-b from-[#050914] via-[#070D1F] to-[#040711] backdrop-blur-2xl border-r border-slate-800/90 text-slate-300 flex flex-col z-30 shadow-[20px_0_50px_rgba(2,6,23,0.75)] select-none overflow-hidden ${
                isLoaded
                    ? "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    : ""
            } ${!sidebarOpen ? "-translate-x-full md:translate-x-0" : ""}`}
        >
            {/* TEXTURE MICRO-GRID & AMBIENT NEBULA GLOW */}
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#818cf8_1px,transparent_1px),linear-gradient(to_bottom,#818cf8_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-[110px] pointer-events-none"></div>
            <div className="absolute top-1/2 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-16 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* GARIS CAHAYA KANAN BERKILAU */}
            <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-amber-400/20 via-indigo-500/40 to-cyan-400/20 pointer-events-none"></div>

            {/* =====================================================================
                1. HEADER BRANDING (ROYAL GOLD CREST & HOLOGRAPHIC BADGE)
            ===================================================================== */}
            <div className="h-24 px-3 border-b border-slate-800/80 flex items-center justify-center relative shrink-0 z-20 bg-[#040711]/70">
                <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"></div>

                <Link
                    to="/dashboard"
                    className={`flex items-center w-full group focus:outline-none transition-all duration-300 ${
                        sidebarOpen
                            ? "px-2 gap-3.5 justify-start"
                            : "justify-center"
                    }`}
                >
                    {/* Metallic Crest Emblem */}
                    <div className="relative flex items-center justify-center shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-amber-400 via-orange-500 to-indigo-500 rounded-2xl blur-md opacity-45 group-hover:opacity-80 transition-opacity duration-500"></div>
                        <div className="relative w-11 h-11 p-[1.5px] rounded-2xl bg-gradient-to-br from-amber-200 via-amber-500 to-orange-700 shadow-[0_8px_24px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform duration-300">
                            <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#141A2E] via-[#0A0F20] to-[#050814] flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-indigo-400/20"></div>
                                <span className="font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 text-xl tracking-tighter relative z-10">
                                    K
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Brand Title */}
                    {sidebarOpen && (
                        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-amber-200 leading-none">
                                    SIRA
                                </span>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-400/35 rounded-md shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                                    <Sparkles size={9} /> 2.0
                                </span>
                            </div>
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.22em] mt-1.5 truncate">
                                Kemenkum Sulteng
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* =====================================================================
                2. NAVIGATION MENU (LUXURY GLASS CARDS & NEON LASER BAR)
            ===================================================================== */}
            <nav
                className={`flex-1 py-5 overflow-y-auto custom-scrollbar space-y-6 relative z-10 ${
                    sidebarOpen ? "px-3.5" : "px-2"
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
                                <div className="px-3 mb-2.5 flex items-center gap-2">
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${group.dotColor} shadow-[0_0_8px_currentColor]`}
                                    ></span>
                                    <span className="text-[9px] font-black text-slate-400/90 uppercase tracking-[0.22em]">
                                        {group.groupTitle}
                                    </span>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-800 via-slate-800/50 to-transparent"></div>
                                </div>
                            ) : (
                                <div className="w-7 h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-auto my-2.5"></div>
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
                                                ? "bg-gradient-to-r from-indigo-600/25 via-indigo-500/10 to-cyan-500/5 text-white border border-indigo-400/35 shadow-[0_10px_28px_-8px_rgba(79,70,229,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]"
                                                : "text-slate-400 border border-transparent hover:bg-white/[0.04] hover:text-slate-100 hover:border-slate-700/70"
                                        }`}
                                    >
                                        {/* Active Top Shimmer */}
                                        {isActive && (
                                            <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent pointer-events-none"></div>
                                        )}

                                        {/* Left Active Laser Bar */}
                                        {isActive && (
                                            <div
                                                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] bg-gradient-to-b from-amber-300 via-cyan-400 to-indigo-500 rounded-r-full shadow-[0_0_14px_rgba(34,211,238,0.95)] ${
                                                    sidebarOpen ? "h-7" : "h-5"
                                                }`}
                                            ></div>
                                        )}

                                        {sidebarOpen ? (
                                            <>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={`w-9 h-9 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center relative ${
                                                            isActive
                                                                ? "bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 text-white shadow-[0_0_18px_rgba(79,70,229,0.65)] ring-1 ring-white/25"
                                                                : "bg-slate-900/90 text-slate-400 border border-slate-800 group-hover:text-cyan-300 group-hover:border-indigo-500/40 group-hover:bg-slate-800/90"
                                                        }`}
                                                    >
                                                        <IconComponent
                                                            size={17}
                                                            strokeWidth={
                                                                isActive
                                                                    ? 2.5
                                                                    : 2
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex flex-col min-w-0">
                                                        <span
                                                            className={`text-[12.5px] truncate leading-snug ${
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
                                                                    ? "text-cyan-200/80 font-semibold"
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
                                                            className={`px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-md border ${item.badgeColor}`}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    <ChevronRight
                                                        size={14}
                                                        className={`transition-all duration-300 ${
                                                            isActive
                                                                ? "text-cyan-300 translate-x-0 opacity-100"
                                                                : "text-slate-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                                        }`}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            /* MODE MINIMIZE (80PX) — PRESISI DI TENGAH */
                                            <div className="relative flex items-center justify-center w-full h-full">
                                                <IconComponent
                                                    size={20}
                                                    strokeWidth={
                                                        isActive ? 2.5 : 2
                                                    }
                                                    className={`transition-all duration-300 group-hover:scale-110 ${
                                                        isActive
                                                            ? "text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.85)]"
                                                            : "text-slate-400 group-hover:text-white"
                                                    }`}
                                                />
                                                {item.badge && (
                                                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>
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
                3. FOOTER: SIRA QUANTUM TELEMETRY DOCK
            ===================================================================== */}
            <div className="p-3 border-t border-slate-800/80 bg-[#040711]/95 relative z-20 shrink-0">
                {sidebarOpen ? (
                    <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-indigo-500/35 via-slate-800 to-amber-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.45)] overflow-hidden">
                        <div className="relative rounded-[15px] p-3.5 bg-gradient-to-br from-[#0B1226] via-[#070C1A] to-[#050814] overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 opacity-75"></div>

                            {/* Top Row: Status Core */}
                            <div className="flex items-center justify-between mb-2.5 relative z-10">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400">
                                        SIRA Core Active
                                    </span>
                                </div>
                                <div className="flex items-end gap-0.5 h-3">
                                    <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                                    <span className="w-0.5 h-2.5 bg-indigo-400 rounded-full animate-pulse [animation-delay:150ms]"></span>
                                    <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-pulse [animation-delay:300ms]"></span>
                                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:450ms]"></span>
                                </div>
                            </div>

                            {/* Middle Row: Digital Clock WITA */}
                            <div className="flex items-center justify-between bg-[#030610]/90 px-3 py-2 rounded-xl border border-slate-800/90 mb-2.5 relative z-10 shadow-inner">
                                <div className="flex items-center gap-2">
                                    <Clock
                                        size={13}
                                        className="text-amber-400 shrink-0"
                                    />
                                    <span className="text-xs font-mono font-black text-white tracking-wider">
                                        {timeString}
                                    </span>
                                    <span className="text-[8px] font-black text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                        WITA
                                    </span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    {dateString}
                                </span>
                            </div>

                            {/* Bottom Row: Engine & Auth Badge */}
                            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 px-0.5 relative z-10">
                                <span className="flex items-center gap-1.5 text-cyan-300 truncate">
                                    <Cpu
                                        size={11}
                                        className="text-cyan-400 shrink-0"
                                    />
                                    Engine 65-Pts Sync
                                </span>
                                <span className="flex items-center gap-1 text-amber-300/95 shrink-0">
                                    <ShieldCheck
                                        size={11}
                                        className="text-amber-400"
                                    />
                                    {isAdmin ? "Root Auth" : "Satker Auth"}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* MODE MINIMIZE: ORB TELEMETRY RADAR */
                    <div
                        className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-slate-900 to-[#060B19] border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] flex flex-col items-center justify-center gap-0.5 relative group cursor-help"
                        title={`SIRA Core Active • ${timeString} WITA • 65-Pts Engine`}
                    >
                        <div className="relative flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-50"></span>
                            <Activity
                                size={15}
                                className="text-emerald-400 relative z-10"
                            />
                        </div>
                        <span className="text-[8px] font-mono font-black text-cyan-300 tracking-wider">
                            LIVE
                        </span>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(99, 102, 241, 0.3); border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(34, 211, 238, 0.65); }
            `}</style>
        </aside>
    );
}
