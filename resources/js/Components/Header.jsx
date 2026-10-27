import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    Menu,
} from "lucide-react";

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
    const notifRef = useRef(null);

    const navigate = useNavigate();

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
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
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
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unread_count);
        } catch (error) {
            console.error("Gagal mengambil notifikasi", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            setNotifications(
                notifications.map((n) =>
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
            setNotifications(
                notifications.map((n) => ({
                    ...n,
                    read_at: new Date().toISOString(),
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
                    25% { transform: rotate(15deg) scale(1.1); }
                    50% { transform: rotate(-10deg) scale(1.1); }
                    75% { transform: rotate(5deg) scale(1.1); }
                }
                .animate-ring-dewa { animation: ring-dewa 1.5s ease-in-out infinite; }

                @keyframes lintas-elegan {
                    0% { transform: translateX(110vw); }
                    100% { transform: translateX(-30vw); }
                }
                @keyframes wave-navy {
                    0%, 100% { transform: translateY(0px); opacity: 0.7; }
                    50% { transform: translateY(-8px); opacity: 0.3; }
                }
                @keyframes wave-emas {
                    0%, 100% { transform: translateY(0px); opacity: 0.3; }
                    50% { transform: translateY(8px); opacity: 0.7; }
                }
            `}</style>

            {/* HEADER UTAMA DENGAN TRANSISI SUPER MULUS 300MS */}
            <header className="sticky top-0 z-30 flex justify-between items-center py-3 px-4 sm:px-8 bg-white/70 backdrop-blur-2xl border-b border-white/80 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.03)] h-24 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] relative overflow-hidden">
                {/* Garis Cahaya Bawah Header */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

                {/* Background Komet Halus (Dioptimalkan agar tidak lag saat resize) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-1/2 -translate-y-1/2 w-full animate-[lintas-elegan_30s_linear_infinite]">
                        <div className="relative flex items-center w-full max-w-[500px] opacity-60">
                            <div className="absolute left-0 w-full animate-[wave-navy_8s_ease-in-out_infinite]">
                                <div className="flex items-center">
                                    <div className="relative w-1.5 h-1.5 bg-blue-100 rounded-full z-10 shadow-[0_0_10px_2px_#1e3a8a]"></div>
                                    <div className="h-[1.5px] w-[150px] bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6]/20 to-transparent -ml-1 rounded-r-full blur-[0.5px]"></div>
                                </div>
                            </div>
                            <div className="absolute left-6 w-full animate-[wave-emas_8s_ease-in-out_infinite]">
                                <div className="flex items-center">
                                    <div className="relative w-1.5 h-1.5 bg-yellow-50 rounded-full z-10 shadow-[0_0_10px_2px_#d97706]"></div>
                                    <div className="h-[1.5px] w-[150px] bg-gradient-to-r from-[#b45309] via-[#fbbf24]/20 to-transparent -ml-1 rounded-r-full blur-[0.5px]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================================================
                    KIRI: TOMBOL TOGGLE SIDEBAR & BRANDING KANWIL
                ========================================================================= */}
                <div className="flex items-center gap-x-4 sm:gap-x-5 relative z-10">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="relative p-3 rounded-2xl text-slate-600 bg-white/90 backdrop-blur-sm border border-slate-200/80 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-200 shadow-sm focus:outline-none group overflow-hidden active:scale-95"
                        title="Buka / Tutup Menu Sidebar"
                    >
                        <div className="absolute inset-0 bg-indigo-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
                        <Menu
                            size={20}
                            className="relative z-10 transition-transform duration-300 group-hover:rotate-90"
                        />
                    </button>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute w-4 h-4 bg-emerald-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative z-10 shadow-[0_0_8px_rgba(16,185,129,1)] border border-white"></div>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[13px] font-black tracking-[0.15em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-700 leading-tight">
                                SIRA Enterprise
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                Kanwil Kemenkum Sulawesi Tengah
                            </p>
                        </div>
                    </div>
                </div>

                {/* =========================================================================
                    KANAN: TAHUN ANGGARAN, NOTIFIKASI LONCENG, & PROFIL
                ========================================================================= */}
                <div className="flex items-center gap-x-3.5 sm:gap-x-5 relative z-10">
                    {/* TAHUN ANGGARAN BADGE */}
                    <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-50/90 to-blue-50/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-indigo-100/80 shadow-sm">
                        <Sparkles
                            size={15}
                            className="text-indigo-500 animate-[spin_6s_linear_infinite]"
                        />
                        <span className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">
                            TA: {tahun || new Date().getFullYear()}
                        </span>
                    </div>

                    {/* LONCENG NOTIFIKASI */}
                    <div
                        className="relative flex items-center justify-center"
                        ref={notifRef}
                    >
                        {unreadCount > 0 && (
                            <div className="absolute w-10 h-10 bg-rose-500/20 rounded-full blur-md animate-pulse pointer-events-none"></div>
                        )}

                        <button
                            onClick={() => {
                                setIsNotifOpen(!isNotifOpen);
                                setProfileOpen(false);
                            }}
                            className={`relative p-3 rounded-2xl transition-all duration-200 border focus:outline-none shadow-sm ${isNotifOpen ? "bg-indigo-50 text-indigo-600 border-indigo-200 shadow-inner" : "bg-white/90 backdrop-blur-md text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-indigo-600"}`}
                            title="Notifikasi Sistem"
                        >
                            <Bell
                                size={20}
                                className={
                                    unreadCount > 0
                                        ? "animate-ring-dewa text-indigo-600 drop-shadow-md"
                                        : ""
                                }
                            />

                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-black text-white bg-gradient-to-br from-rose-500 to-red-600 rounded-full shadow-[0_0_10px_rgba(225,29,72,0.6)] border-2 border-white transform scale-110">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* PANEL NOTIFIKASI DROPDOWN */}
                        {isNotifOpen && (
                            <div className="absolute right-0 top-14 mt-2 w-80 sm:w-[420px] bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] border border-white overflow-hidden z-50 transform origin-top-right animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-6 py-5 border-b border-slate-100/80 bg-slate-50/50 flex justify-between items-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600">
                                            <Bell size={16} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 tracking-tight">
                                                Notifikasi Sistem
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                {unreadCount} Pesan Baru
                                            </p>
                                        </div>
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="relative z-10 text-[10px] font-black text-indigo-600 hover:text-white bg-white hover:bg-indigo-600 flex items-center gap-1.5 transition-all px-3 py-2 rounded-xl border border-indigo-100 shadow-sm outline-none"
                                        >
                                            <Check size={12} strokeWidth={3} />{" "}
                                            Tandai Dibaca
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-white/50">
                                    {notifications.length === 0 ? (
                                        <div className="py-16 flex flex-col items-center justify-center text-center px-8">
                                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300 shadow-inner">
                                                <Bell
                                                    size={28}
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                            <p className="text-base font-black text-slate-700 tracking-tight">
                                                Belum Ada Notifikasi
                                            </p>
                                            <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">
                                                Sistem berjalan lancar tanpa
                                                peringatan baru saat ini.
                                            </p>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-slate-100/60 p-2">
                                            {notifications.map((notif) => (
                                                <li
                                                    key={notif.id}
                                                    onClick={() =>
                                                        handleNotifClick(notif)
                                                    }
                                                    className={`p-4 rounded-2xl transition-all duration-200 cursor-pointer flex gap-4 items-start group ${notif.read_at ? "hover:bg-slate-50 opacity-75" : "bg-indigo-50/40 hover:bg-indigo-50 border border-indigo-100/50 mb-1"}`}
                                                >
                                                    <div
                                                        className={`p-2.5 rounded-2xl shadow-sm flex-shrink-0 transition-transform group-hover:scale-110 ${notif.read_at ? "bg-white border border-slate-100" : "bg-white border border-indigo-100"}`}
                                                    >
                                                        {getNotifIcon(
                                                            notif.data.type ||
                                                                "info",
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p
                                                                className={`text-sm truncate pr-3 ${notif.read_at ? "font-bold text-slate-700" : "font-black text-slate-900 tracking-tight"}`}
                                                            >
                                                                {
                                                                    notif.data
                                                                        .title
                                                                }
                                                            </p>
                                                            {!notif.read_at && (
                                                                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex-shrink-0 mt-1 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">
                                                            {notif.data.message}
                                                        </p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                                            {new Date(
                                                                notif.created_at,
                                                            ).toLocaleDateString(
                                                                "id-ID",
                                                                {
                                                                    day: "numeric",
                                                                    month: "long",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                },
                                                            )}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PROFIL DROPDOWN */}
                    <div className="relative ml-1" ref={dropdownRef}>
                        <button
                            onClick={() => {
                                setProfileOpen(!profileOpen);
                                setIsNotifOpen(false);
                            }}
                            className="relative flex items-center transition-all duration-200 hover:scale-105 focus:outline-none group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-sky-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity"></div>

                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 p-[2px] relative z-10 shadow-sm">
                                <div className="h-full w-full bg-white rounded-[14px] overflow-hidden flex items-center justify-center text-indigo-600 font-black shadow-inner">
                                    {authUser?.avatar ? (
                                        <img
                                            src={`/storage/${authUser.avatar}`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-base">
                                            {initial}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>

                        {/* PANEL PROFIL DROPDOWN */}
                        {profileOpen && (
                            <div className="absolute right-0 top-14 mt-2 w-72 bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] overflow-hidden z-50 border border-white transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-6 py-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/30 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                    <p className="text-base font-black text-slate-900 truncate tracking-tight relative z-10">
                                        {authUser?.name || "Memuat..."}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate mt-1 relative z-10">
                                        {authUser?.email || "memuat@email.com"}
                                    </p>
                                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm bg-white text-indigo-700 border-indigo-100 relative z-10">
                                        <ShieldCheck
                                            size={14}
                                            className="text-emerald-500"
                                        />{" "}
                                        {roleLabel}
                                    </div>
                                </div>

                                <div className="p-3 space-y-1 bg-white/50">
                                    <Link
                                        to="/dashboard/profil"
                                        onClick={() => setProfileOpen(false)}
                                        className="w-full text-left flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 hover:shadow-sm border border-transparent hover:border-slate-100 text-slate-600 transition-all group font-black text-xs uppercase tracking-wider"
                                    >
                                        <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-600 transition-colors">
                                            <UserCog size={16} />
                                        </div>
                                        <span>Profil Saya</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-rose-50 hover:shadow-sm border border-transparent hover:border-rose-100 text-rose-600 transition-all group font-black text-xs uppercase tracking-wider outline-none"
                                    >
                                        <div className="p-1.5 rounded-lg bg-rose-100/50 group-hover:bg-rose-500 text-rose-500 group-hover:text-white transition-colors">
                                            <LogOut
                                                size={16}
                                                className="group-hover:-translate-x-0.5 transition-transform"
                                            />
                                        </div>
                                        <span>Log Out Sistem</span>
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
