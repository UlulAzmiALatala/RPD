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
                if (window.Echo) {
                    window.Echo.leave(`App.Models.User.${authUser.id}`);
                }
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
        if (!notif.read_at) {
            markAsRead(notif.id);
        }
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
        <header className="sticky top-0 z-30 flex justify-between items-center py-3 px-6 bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-20 transition-all duration-300">
            {/* KIRI: Tombol Toggle Sidebar & Tagline dengan Efek Futuristik */}
            <div className="flex items-center gap-x-5">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2.5 rounded-2xl text-slate-500 bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-600 transition-all focus:outline-none shadow-sm active:scale-95"
                    title="Toggle Sidebar"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {sidebarOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M4 6h16M4 12h16M4 18h7"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>

                <div className="hidden md:flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    <p className="text-xs font-black tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-600">
                        Sistem Informasi Realisasi Anggaran
                    </p>
                </div>
            </div>

            {/* KANAN: Indikator TA, Lonceng Notifikasi, & Profile */}
            <div className="flex items-center gap-x-3.5">
                {/* 📌 TAHUN ANGGARAN BADGE */}
                <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-sky-50 px-3.5 py-2 rounded-xl border border-indigo-100/80 shadow-sm">
                    <Sparkles
                        size={14}
                        className="text-indigo-500 animate-spin"
                        style={{ animationDuration: "6s" }}
                    />
                    <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">
                        TA: {tahun || new Date().getFullYear()}
                    </span>
                </div>

                {/* 🔔 KOMPONEN DROPDOWN NOTIFIKASI */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => {
                            setIsNotifOpen(!isNotifOpen);
                            setProfileOpen(false);
                        }}
                        className="relative p-2.5 text-slate-500 bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all focus:outline-none shadow-sm"
                        title="Notifikasi"
                    >
                        <Bell
                            size={20}
                            className={
                                unreadCount > 0
                                    ? "animate-bounce text-indigo-600"
                                    : ""
                            }
                        />

                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white transform bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Panel Dropdown Notifikasi */}
                    {isNotifOpen && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-slate-900">
                                        Notifikasi Sistem
                                    </h3>
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded-full">
                                        {unreadCount} Baru
                                    </span>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors bg-white px-2.5 py-1 rounded-lg border border-indigo-100 shadow-sm"
                                    >
                                        <Check size={12} /> Tandai Dibaca
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
                                            <Bell size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">
                                            Belum ada notifikasi.
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Semua aktivitas berjalan lancar!
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-slate-50">
                                        {notifications.map((notif) => (
                                            <li
                                                key={notif.id}
                                                onClick={() =>
                                                    handleNotifClick(notif)
                                                }
                                                className={`p-4 hover:bg-indigo-50/30 transition-all cursor-pointer flex gap-3.5 items-start ${notif.read_at ? "opacity-75" : "bg-indigo-50/50"}`}
                                            >
                                                {getNotifIcon(
                                                    notif.data.type || "info",
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p
                                                            className={`text-xs truncate pr-2 ${notif.read_at ? "font-bold text-slate-700" : "font-extrabold text-slate-900"}`}
                                                        >
                                                            {notif.data.title}
                                                        </p>
                                                        {!notif.read_at && (
                                                            <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                        {notif.data.message}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-2">
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

                {/* 👤 PROFIL DROPDOWN FUTURISTIK */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => {
                            setProfileOpen(!profileOpen);
                            setIsNotifOpen(false);
                        }}
                        className="flex items-center transition-all duration-300 hover:scale-105 focus:outline-none group"
                    >
                        <div className="h-11 w-11 rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-600 to-sky-400 p-0.5 shadow-md group-hover:shadow-indigo-500/25 transition-shadow">
                            <div className="h-full w-full bg-white rounded-[14px] overflow-hidden flex items-center justify-center text-indigo-600 font-black">
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
                        </div>
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden z-50 border border-slate-100 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-5 py-5 border-b border-slate-100 bg-slate-50/50">
                                <p className="text-sm font-black text-slate-900 truncate">
                                    {authUser?.name || "Memuat..."}
                                </p>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 truncate mt-0.5 font-medium">
                                    {authUser?.email || "memuat@email.com"}
                                </p>
                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm bg-indigo-50 text-indigo-700 border-indigo-100">
                                    <ShieldCheck size={13} /> {roleLabel}
                                </div>
                            </div>

                            <div className="p-2 space-y-1">
                                <Link
                                    to="/dashboard/profil"
                                    onClick={() => setProfileOpen(false)}
                                    className="w-full text-left flex items-center gap-3 py-2.5 px-4 rounded-2xl hover:bg-slate-100/80 text-slate-600 transition-colors group font-bold text-xs"
                                >
                                    <UserCog
                                        size={16}
                                        className="text-slate-400 group-hover:text-indigo-600 transition-colors"
                                    />
                                    <span>Profil Saya</span>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left flex items-center gap-3 py-2.5 px-4 rounded-2xl hover:bg-rose-50 text-rose-600 transition-colors group font-bold text-xs"
                                >
                                    <LogOut
                                        size={16}
                                        className="text-rose-400 group-hover:-translate-x-1 transition-transform"
                                    />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
