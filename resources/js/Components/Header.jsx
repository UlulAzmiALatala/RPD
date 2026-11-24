import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
    Bell,
    CheckCircle,
    XCircle,
    Info,
    AlertTriangle,
    Check,
    ShieldCheck,
    UserCog,
    LogOut,
    Sparkles,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronDown,
    Calendar,
    Building2,
} from "lucide-react";

const ROUTE_TITLES = {
    "/dashboard": "Command Center",
    "/dashboard/input-anggaran": "Master Pagu DIPA",
    "/dashboard/input-ro": "Target & Capaian RO",
    "/dashboard/input-transaksi": "Ledger Transaksi",
    "/dashboard/laporan-realisasi": "Rapor Kinerja Satker",
    "/dashboard/laporan-bulanan": "Leaderboard Nasional",
    "/dashboard/manajemen-user": "Manajemen Pengguna",
    "/dashboard/tutup-buku": "Periode & Cut-Off",
    "/dashboard/pengaturan-pdf": "Kop & TTD PDF",
    "/dashboard/log-aktivitas": "Audit Trail (CCTV)",
    "/dashboard/profil": "Pengaturan Profil",
};

export default function Header({
    sidebarOpen,
    setSidebarOpen,
    tahun,
    authUser,
}) {
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifFilter, setNotifFilter] = useState("all");
    const notifRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const activePageTitle =
        ROUTE_TITLES[location.pathname] || "SIRA Enterprise";

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setProfileOpen(false);
                setIsNotifOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (authUser) {
            fetchNotifications();

            const checkEcho = setInterval(() => {
                if (window.Echo) {
                    clearInterval(checkEcho);
                    window.Echo.private(
                        `App.Models.User.${authUser.id}`,
                    ).notification((notification) => {
                        const newNotif = {
                            id: notification.id,
                            data: {
                                title: notification.title,
                                message: notification.message,
                                type: notification.type,
                            },
                            created_at: new Date().toISOString(),
                            read_at: null,
                        };
                        setNotifications((prev) => [newNotif, ...prev]);
                        setUnreadCount((prev) => prev + 1);
                    });
                }
            }, 500);

            return () => {
                clearInterval(checkEcho);
                if (window.Echo)
                    window.Echo.leave(`App.Models.User.${authUser.id}`);
            };
        }
    }, [authUser]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get("/api/notifications");
            setNotifications(
                Array.isArray(res.data.notifications)
                    ? res.data.notifications
                    : [],
            );
            setUnreadCount(res.data.unread_count || 0);
        } catch (error) {
            console.error("Gagal mengambil notifikasi", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? { ...n, read_at: new Date().toISOString() }
                        : n,
                ),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Gagal update notif", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put("/api/notifications/mark-all-read");
            setNotifications((prev) =>
                prev.map((n) => ({
                    ...n,
                    read_at: n.read_at || new Date().toISOString(),
                })),
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Gagal tandai semua dibaca", error);
        }
    };

    const handleNotifClick = (notif) => {
        if (!notif.read_at) markAsRead(notif.id);
        setIsNotifOpen(false);
        navigate("/dashboard/input-transaksi");
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case "success":
                return (
                    <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                );
            case "danger":
                return (
                    <XCircle className="text-rose-500 w-5 h-5 flex-shrink-0" />
                );
            case "warning":
                return (
                    <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0" />
                );
            default:
                return (
                    <Info className="text-indigo-500 w-5 h-5 flex-shrink-0" />
                );
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("/logout");
            window.location.href = "/login";
        } catch (error) {
            console.error("Gagal logout:", error);
            window.location.href = "/login";
        }
    };

    const filteredNotifications =
        notifFilter === "unread"
            ? notifications.filter((n) => !n.read_at)
            : notifications;

    const initial = authUser?.name
        ? authUser.name.charAt(0).toUpperCase()
        : "U";
    const roleLabel =
        authUser?.role === "admin" ? "Administrator" : "Satuan Kerja";

    return (
        <>
            <style>{`
                @keyframes ring-dewa {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(14deg) scale(1.08); }
                    50% { transform: rotate(-10deg) scale(1.08); }
                    75% { transform: rotate(5deg) scale(1.08); }
                }
                .animate-ring-dewa { animation: ring-dewa 1.6s ease-in-out infinite; }

                @keyframes lintas-elegan {
                    0% { transform: translateX(110vw); }
                    100% { transform: translateX(-30vw); }
                }
                @keyframes wave-navy {
                    0%, 100% { transform: translateY(0px); opacity: 0.65; }
                    50% { transform: translateY(-7px); opacity: 0.25; }
                }
                @keyframes wave-emas {
                    0%, 100% { transform: translateY(0px); opacity: 0.25; }
                    50% { transform: translateY(7px); opacity: 0.65; }
                }
                @keyframes dropdownPop {
                    0% { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .dropdown-pop { animation: dropdownPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

            <header className="sticky top-0 z-40 flex justify-between items-center py-3 px-4 sm:px-8 bg-white/80 backdrop-blur-2xl border-b border-slate-200/75 shadow-[0_12px_35px_-12px_rgba(15,23,42,0.08)] h-24 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-visible">
                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none"></div>

                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-1/2 -translate-y-1/2 w-full animate-[lintas-elegan_32s_linear_infinite] will-change-transform">
                        <div className="relative flex items-center w-full max-w-[500px] opacity-55">
                            <div className="absolute left-0 w-full animate-[wave-navy_9s_ease-in-out_infinite]">
                                <div className="flex items-center">
                                    <div className="relative w-1.5 h-1.5 bg-indigo-400 rounded-full z-10 shadow-[0_0_10px_2px_#1e3a8a]"></div>
                                    <div className="h-[1.5px] w-[140px] bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6]/20 to-transparent -ml-1 rounded-r-full"></div>
                                </div>
                            </div>
                            <div className="absolute left-6 w-full animate-[wave-emas_9s_ease-in-out_infinite]">
                                <div className="flex items-center">
                                    <div className="relative w-1.5 h-1.5 bg-amber-300 rounded-full z-10 shadow-[0_0_10px_2px_#d97706]"></div>
                                    <div className="h-[1.5px] w-[140px] bg-gradient-to-r from-[#b45309] via-[#fbbf24]/20 to-transparent -ml-1 rounded-r-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KIRI */}
                <div className="flex items-center gap-x-3.5 sm:gap-x-5 relative z-20 min-w-0">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="relative p-3 rounded-2xl text-slate-600 bg-white border border-slate-200/90 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200 shadow-sm hover:shadow-[0_8px_20px_rgba(79,70,229,0.28)] focus:outline-none active:scale-95 shrink-0 cursor-pointer"
                        title={
                            sidebarOpen
                                ? "Perkecil Menu Sidebar"
                                : "Perluas Menu Sidebar"
                        }
                    >
                        {sidebarOpen ? (
                            <PanelLeftClose size={20} strokeWidth={2.2} />
                        ) : (
                            <PanelLeftOpen size={20} strokeWidth={2.2} />
                        )}
                    </button>

                    <div className="hidden md:flex items-center gap-3.5 min-w-0">
                        <div className="relative flex items-center justify-center shrink-0">
                            <div className="absolute w-4 h-4 bg-emerald-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative z-10 shadow-[0_0_8px_rgba(16,185,129,1)] border border-white"></div>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-[13px] font-black tracking-[0.15em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-800 to-indigo-600 leading-tight truncate">
                                    SIRA Enterprise
                                </p>
                                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-[10px] font-extrabold text-slate-600 tracking-wide truncate">
                                    {activePageTitle}
                                </span>
                            </div>
                            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-[0.18em] mt-0.5 truncate">
                                Kanwil Kemenkum Sulawesi Tengah
                            </p>
                        </div>
                    </div>
                </div>

                {/* KANAN */}
                <div className="flex items-center gap-x-2.5 sm:gap-x-3.5 relative z-20 shrink-0">
                    <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#0B1120] to-indigo-950 text-white px-4 py-2.5 rounded-2xl border border-indigo-500/30 shadow-[0_8px_20px_-6px_rgba(15,23,42,0.45)]">
                        <Calendar size={14} className="text-amber-400" />
                        <span className="text-[11px] font-black tracking-[0.14em] uppercase">
                            TA {tahun || new Date().getFullYear()}
                        </span>
                        <span className="w-[1px] h-3.5 bg-slate-700 mx-0.5"></span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 uppercase tracking-wider">
                            <Sparkles size={11} /> 65 Pts
                        </span>
                    </div>

                    {/* LONCENG NOTIFIKASI */}
                    <div className="relative" ref={notifRef}>
                        {unreadCount > 0 && (
                            <div className="absolute inset-0 bg-rose-500/20 rounded-2xl blur-md animate-pulse pointer-events-none"></div>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                setIsNotifOpen((prev) => !prev);
                                setProfileOpen(false);
                            }}
                            aria-expanded={isNotifOpen}
                            aria-label="Notifikasi Sistem"
                            className={`relative p-3 rounded-2xl transition-all duration-200 border focus:outline-none shadow-sm cursor-pointer active:scale-95 ${
                                isNotifOpen
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-[0_8px_20px_rgba(79,70,229,0.3)]"
                                    : "bg-white text-slate-600 border-slate-200/90 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                            }`}
                            title="Notifikasi Sistem"
                        >
                            <Bell
                                size={20}
                                className={
                                    unreadCount > 0 && !isNotifOpen
                                        ? "animate-ring-dewa text-indigo-600"
                                        : ""
                                }
                            />

                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[21px] h-[21px] px-1 text-[10px] font-black text-white bg-gradient-to-br from-rose-500 to-red-600 rounded-full shadow-[0_0_12px_rgba(225,29,72,0.65)] border-2 border-white">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotifOpen && (
                            <div className="dropdown-pop absolute right-0 top-full mt-3 w-[320px] sm:w-[420px] bg-white rounded-[2rem] shadow-[0_25px_70px_-15px_rgba(15,23,42,0.28)] border border-slate-200/80 overflow-hidden z-[60]">
                                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-[#0B1120] via-slate-900 to-indigo-950 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-white/10 rounded-xl border border-white/15 text-amber-300">
                                                <Bell
                                                    size={16}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black tracking-tight text-white">
                                                    Notifikasi Sistem
                                                </h3>
                                                <p className="text-[10px] font-bold text-indigo-200/80 uppercase tracking-widest mt-0.5">
                                                    {unreadCount} Pesan Belum
                                                    Dibaca
                                                </p>
                                            </div>
                                        </div>

                                        {unreadCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={markAllAsRead}
                                                className="text-[10px] font-black text-slate-900 bg-amber-400 hover:bg-amber-300 flex items-center gap-1 transition-all px-3 py-1.5 rounded-xl shadow-sm cursor-pointer outline-none"
                                            >
                                                <Check
                                                    size={12}
                                                    strokeWidth={3}
                                                />{" "}
                                                Baca Semua
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-4 relative z-10">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setNotifFilter("all")
                                            }
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                notifFilter === "all"
                                                    ? "bg-white text-slate-900 shadow-sm"
                                                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                                            }`}
                                        >
                                            Semua ({notifications.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setNotifFilter("unread")
                                            }
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                notifFilter === "unread"
                                                    ? "bg-white text-slate-900 shadow-sm"
                                                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                                            }`}
                                        >
                                            Belum Dibaca ({unreadCount})
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-[380px] overflow-y-auto custom-scrollbar bg-white">
                                    {filteredNotifications.length === 0 ? (
                                        <div className="py-14 flex flex-col items-center justify-center text-center px-8">
                                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300 shadow-inner">
                                                <Bell
                                                    size={26}
                                                    strokeWidth={1.6}
                                                />
                                            </div>
                                            <p className="text-sm font-black text-slate-700 tracking-tight">
                                                {notifFilter === "unread"
                                                    ? "Semua Pesan Sudah Dibaca"
                                                    : "Belum Ada Notifikasi"}
                                            </p>
                                            <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">
                                                Sistem berjalan optimal tanpa
                                                peringatan baru saat ini.
                                            </p>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-slate-100 p-2.5 space-y-1">
                                            {filteredNotifications.map(
                                                (notif) => (
                                                    <li
                                                        key={notif.id}
                                                        onClick={() =>
                                                            handleNotifClick(
                                                                notif,
                                                            )
                                                        }
                                                        className={`p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex gap-3.5 items-start group ${
                                                            notif.read_at
                                                                ? "hover:bg-slate-50 opacity-80"
                                                                : "bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/80"
                                                        }`}
                                                    >
                                                        <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm flex-shrink-0 transition-transform group-hover:scale-105">
                                                            {getNotifIcon(
                                                                notif.data
                                                                    ?.type ||
                                                                    "info",
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                                <p
                                                                    className={`text-xs truncate ${
                                                                        notif.read_at
                                                                            ? "font-bold text-slate-700"
                                                                            : "font-black text-slate-900"
                                                                    }`}
                                                                >
                                                                    {notif.data
                                                                        ?.title ||
                                                                        "Pembaruan Sistem"}
                                                                </p>
                                                                {!notif.read_at && (
                                                                    <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1 shadow-[0_0_8px_rgba(99,102,241,0.75)]"></span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">
                                                                {notif.data
                                                                    ?.message ||
                                                                    ""}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">
                                                                {new Date(
                                                                    notif.created_at,
                                                                ).toLocaleDateString(
                                                                    "id-ID",
                                                                    {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    },
                                                                )}{" "}
                                                                WITA
                                                            </p>
                                                        </div>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PROFIL DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => {
                                setProfileOpen((prev) => !prev);
                                setIsNotifOpen(false);
                            }}
                            aria-expanded={profileOpen}
                            aria-label="Menu Profil Pengguna"
                            className={`flex items-center gap-3 p-1.5 sm:pr-3.5 rounded-2xl border transition-all duration-200 focus:outline-none cursor-pointer active:scale-[0.98] ${
                                profileOpen
                                    ? "bg-indigo-50/90 border-indigo-300 shadow-[0_8px_20px_rgba(79,70,229,0.16)]"
                                    : "bg-white border-slate-200/90 hover:border-indigo-200 hover:bg-slate-50/80 shadow-sm"
                            }`}
                        >
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-amber-400 p-[2px] shadow-sm shrink-0">
                                <div className="h-full w-full bg-white rounded-[10px] overflow-hidden flex items-center justify-center text-indigo-700 font-black">
                                    {authUser?.avatar ? (
                                        <img
                                            src={`/storage/${authUser.avatar}`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm">
                                            {initial}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="hidden lg:flex flex-col text-left min-w-0 max-w-[140px]">
                                <span className="text-xs font-black text-slate-800 truncate leading-tight">
                                    {authUser?.name || "Pengguna"}
                                </span>
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider truncate mt-0.5">
                                    {roleLabel}
                                </span>
                            </div>

                            <ChevronDown
                                size={15}
                                className={`hidden sm:block text-slate-400 transition-transform duration-200 ${
                                    profileOpen
                                        ? "rotate-180 text-indigo-600"
                                        : ""
                                }`}
                            />
                        </button>

                        {profileOpen && (
                            <div className="dropdown-pop absolute right-0 top-full mt-3 w-72 sm:w-80 bg-white rounded-[2rem] shadow-[0_25px_70px_-15px_rgba(15,23,42,0.28)] overflow-hidden z-[60] border border-slate-200/80">
                                <div className="px-6 py-6 bg-gradient-to-br from-[#0B1120] via-slate-900 to-indigo-950 text-white relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"></div>
                                    <div className="flex items-center gap-3.5 relative z-10">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 p-[2px] shrink-0 shadow-md">
                                            <div className="h-full w-full bg-slate-900 rounded-[14px] overflow-hidden flex items-center justify-center text-amber-300 font-black">
                                                {authUser?.avatar ? (
                                                    <img
                                                        src={`/storage/${authUser.avatar}`}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-lg">
                                                        {initial}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-black text-white truncate tracking-tight">
                                                {authUser?.name || "Memuat..."}
                                            </p>
                                            <p className="text-[11px] font-medium text-slate-300 truncate mt-0.5">
                                                {authUser?.email ||
                                                    "memuat@email.com"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2 relative z-10">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10 text-emerald-300 border border-white/15">
                                            <ShieldCheck size={13} />{" "}
                                            {roleLabel}
                                        </span>
                                        {authUser?.kode_satker && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-300 border border-amber-400/25">
                                                <Building2 size={12} />{" "}
                                                {authUser.kode_satker}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3 space-y-1 bg-white">
                                    <Link
                                        to="/dashboard/profil"
                                        onClick={() => setProfileOpen(false)}
                                        className="w-full text-left flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 text-slate-700 transition-all group font-black text-xs uppercase tracking-wider"
                                    >
                                        <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-indigo-600 text-slate-500 group-hover:text-white transition-colors">
                                            <UserCog size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>Profil Saya</span>
                                            <span className="text-[10px] font-semibold normal-case tracking-normal text-slate-400">
                                                Ubah akun, password &amp; avatar
                                            </span>
                                        </div>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 text-rose-600 transition-all group font-black text-xs uppercase tracking-wider outline-none cursor-pointer"
                                    >
                                        <div className="p-2 rounded-xl bg-rose-100/70 group-hover:bg-rose-600 text-rose-500 group-hover:text-white transition-colors">
                                            <LogOut
                                                size={16}
                                                className="group-hover:-translate-x-0.5 transition-transform"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>Log Out Sistem</span>
                                            <span className="text-[10px] font-semibold normal-case tracking-normal text-rose-400">
                                                Akhiri sesi aman Anda
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}
