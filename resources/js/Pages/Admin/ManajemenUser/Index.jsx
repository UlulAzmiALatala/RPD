import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import MainLayout from "../../../Layouts/MainLayout";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Edit,
    Trash2,
    Plus,
    CheckCircle,
    XCircle,
    Users,
    ShieldAlert,
    Building,
    ShieldCheck,
    Building2,
    Filter,
    Ban,
    UserCheck,
    KeyRound,
    Smartphone,
    Copy,
    Check,
    Loader2,
    AlertTriangle,
} from "lucide-react";

import AddModal from "./Modals/AddModal";
import EditModal from "./Modals/EditModal";
import DeleteModal from "./Modals/DeleteModal";

const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.total === 0) return null;
    const { current_page, last_page, from, to, total } = meta;

    const getPageNumbers = () => {
        let pages = [];
        let startPage = Math.max(1, current_page - 2);
        let endPage = Math.min(last_page, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 rounded-b-[2rem]">
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Menampilkan{" "}
                <span className="font-extrabold text-slate-800">
                    {from || 0}
                </span>{" "}
                -{" "}
                <span className="font-extrabold text-slate-800">{to || 0}</span>{" "}
                dari{" "}
                <span className="font-extrabold text-slate-800">{total}</span>{" "}
                pengguna
            </p>
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
                >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                {getPageNumbers().map((page) => (
                    <button
                        type="button"
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all shadow-sm border cursor-pointer ${
                            current_page === page
                                ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.3)]"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600"
                        }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
                >
                    <ChevronRight size={16} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default function IndexUser({ authUser }) {
    const [localAuth, setLocalAuth] = useState(authUser || null);
    const [users, setUsers] = useState([]);
    const [satkers, setSatkers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditData, setSelectedEditData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State Aksi Keamanan Admin (Suspend, Reset Password, Reset 2FA)
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'suspend'|'reset_pw'|'reset_2fa', user }
    const [isSecurityBusy, setIsSecurityBusy] = useState(false);
    const [tempPasswordInfo, setTempPasswordInfo] = useState(null); // { user_name, user_email, temporary_password }
    const [copiedPw, setCopiedPw] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
        isExiting: false,
    });
    const toastTimeout = useRef(null);
    const exitTimeout = useRef(null);

    const showToast = (message, type = "success") => {
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        if (exitTimeout.current) clearTimeout(exitTimeout.current);
        setToast({ show: true, message, type, isExiting: false });
        exitTimeout.current = setTimeout(
            () => setToast((prev) => ({ ...prev, isExiting: true })),
            3500,
        );
        toastTimeout.current = setTimeout(
            () =>
                setToast({
                    show: false,
                    message: "",
                    type: "success",
                    isExiting: false,
                }),
            4000,
        );
    };

    useEffect(() => {
        if (!authUser) {
            axios
                .get("/api/user")
                .then((res) => setLocalAuth(res.data))
                .catch(() => {});
        } else {
            setLocalAuth(authUser);
        }
    }, [authUser]);

    const fetchUsers = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/api/users?page=${page}&search=${encodeURIComponent(search)}`,
            );
            setUsers(response.data.data?.data || []);
            setSatkers(response.data.satkers || []);
            setPagination({
                current_page: response.data.data?.current_page,
                last_page: response.data.data?.last_page,
                total: response.data.data?.total,
                from: response.data.data?.from,
                to: response.data.data?.to,
            });
        } catch (err) {
            showToast("Gagal memuat data pengguna.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(
            () => fetchUsers(currentPage, searchTerm),
            350,
        );
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm]);

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await axios.delete(
                `/api/users/${selectedDeleteId}`,
            );
            showToast(
                response.data.message || "User berhasil dihapus!",
                "success",
            );
            fetchUsers(currentPage, searchTerm);
            setIsDeleteModalOpen(false);
        } catch (err) {
            showToast(
                err.response?.data?.message || "Gagal menghapus user.",
                "error",
            );
            setIsDeleteModalOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    // Eksekusi Suspend / Reset Password / Reset 2FA
    const executeSecurityAction = async () => {
        if (!confirmAction) return;
        const { type, user } = confirmAction;
        setIsSecurityBusy(true);

        try {
            if (type === "suspend") {
                const res = await axios.put(
                    `/api/users/${user.id}/toggle-active`,
                );
                showToast(res.data.message, "success");
                fetchUsers(currentPage, searchTerm);
            } else if (type === "reset_pw") {
                const res = await axios.post(
                    `/api/users/${user.id}/reset-password`,
                );
                setTempPasswordInfo(res.data.data);
                showToast(res.data.message, "success");
                fetchUsers(currentPage, searchTerm);
            } else if (type === "reset_2fa") {
                const res = await axios.post(`/api/users/${user.id}/reset-2fa`);
                showToast(res.data.message, "success");
                fetchUsers(currentPage, searchTerm);
            }
            setConfirmAction(null);
        } catch (err) {
            showToast(
                err.response?.data?.message ||
                    "Aksi keamanan gagal dijalankan.",
                "error",
            );
        } finally {
            setIsSecurityBusy(false);
        }
    };

    const filteredUsers = useMemo(() => {
        if (roleFilter === "ALL") return users;
        if (roleFilter === "SUSPENDED")
            return users.filter((u) => u.is_active === false);
        if (roleFilter === "2FA")
            return users.filter((u) => Boolean(u.two_factor_enabled));
        return users.filter((u) => u.role === roleFilter);
    }, [users, roleFilter]);

    const roleStats = useMemo(() => {
        const adminCount = users.filter((u) => u.role === "admin").length;
        const twoFactorCount = users.filter((u) => u.two_factor_enabled).length;
        const suspendedCount = users.filter(
            (u) => u.is_active === false,
        ).length;
        return { adminCount, twoFactorCount, suspendedCount };
    }, [users]);

    const copyTempCredentials = (fullMessage = false) => {
        if (!tempPasswordInfo) return;
        const text = fullMessage
            ? `Akses SIRA 2.0 Kanwil Kemenkum Sulteng\nNama: ${tempPasswordInfo.user_name}\nEmail: ${tempPasswordInfo.user_email}\nPassword Sementara (1x Pakai): ${tempPasswordInfo.temporary_password}\n\nSilakan login dan segera buat password pribadi baru.`
            : tempPasswordInfo.temporary_password;
        navigator.clipboard?.writeText(text);
        setCopiedPw(true);
        setTimeout(() => setCopiedPw(false), 2000);
    };

    return (
        <MainLayout
            authUser={localAuth}
            tahun={new Date().getFullYear().toString()}
        >
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                @keyframes slideOutRight { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(120%) scale(0.9); opacity: 0; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
                .glass-card { background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
                .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>

            <div className="space-y-6 font-sans text-slate-600 relative min-h-screen pb-10">
                <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10"></div>

                {/* TOAST */}
                {toast.show && (
                    <div
                        className={`fixed top-8 right-8 z-[110] flex items-center p-4 min-w-[320px] max-w-md rounded-2xl border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl ${
                            toast.isExiting ? "toast-exit" : "toast-enter"
                        } ${
                            toast.type === "success"
                                ? "bg-[#0A192F]/95 border-emerald-500/30"
                                : "bg-[#0A192F]/95 border-rose-500/30"
                        }`}
                    >
                        <div
                            className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border ${
                                toast.type === "success"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                        >
                            {toast.type === "success" ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                        </div>
                        <div className="ml-3.5 min-w-0">
                            <h4
                                className={`text-[10px] font-black tracking-widest uppercase ${
                                    toast.type === "success"
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                }`}
                            >
                                {toast.type === "success"
                                    ? "Operasi Berhasil"
                                    : "Operasi Gagal"}
                            </h4>
                            <p className="text-sm font-semibold text-slate-200 mt-0.5 leading-snug">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* 1. HERO COMMAND BAR */}
                <div className="glass-card p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 relative z-10 space-y-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl shadow-[0_10px_24px_rgba(79,70,229,0.3)] shrink-0">
                                <Users size={26} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                                        Manajemen Pengguna
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase tracking-widest">
                                        Admin-Only • 2FA
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                                    Terbitkan akun baru, kelola status
                                    aktif/suspend, reset password 1x pakai,
                                    hingga pemulihan darurat 2FA.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-[0_8px_18px_rgba(79,70,229,0.28)] hover:-translate-y-0.5 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                        >
                            <Plus size={18} strokeWidth={2.5} />
                            <span>Tambah Akun Baru</span>
                        </button>
                    </div>

                    <div className="h-px w-full bg-slate-200/70"></div>

                    {/* FILTER PILLS & PENCARIAN */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
                        <div className="inline-flex flex-wrap items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 text-xs font-bold shadow-inner gap-1">
                            <span className="px-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:inline-flex items-center gap-1">
                                <Filter size={11} /> Filter:
                            </span>
                            {[
                                { key: "ALL", label: "Semua" },
                                { key: "admin", label: "Admin" },
                                { key: "satker", label: "Satker" },
                                { key: "2FA", label: "2FA Aktif" },
                                { key: "SUSPENDED", label: "Suspended" },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setRoleFilter(item.key)}
                                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                                        roleFilter === item.key
                                            ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full xl:w-80">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari Nama, Email, atau Kode Satker..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs font-semibold text-slate-700 shadow-sm placeholder:font-normal"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. 4 KARTU KPI PENGGUNA & KEAMANAN */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Total Pengguna
                            </p>
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                                <Users size={17} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tabular-nums">
                            {pagination.total || 0}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            {roleStats.adminCount} Admin • {satkers.length}{" "}
                            Master Satker
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                Terlindungi 2FA
                            </p>
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Smartphone size={17} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-emerald-700 tabular-nums">
                            {roleStats.twoFactorCount}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            Akun aktifkan Authenticator
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                                Akun Suspended
                            </p>
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Ban size={17} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-rose-600 tabular-nums">
                            {roleStats.suspendedCount}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            Akses login dinonaktifkan
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                Master Satker
                            </p>
                            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Building2 size={17} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tabular-nums">
                            {satkers.length}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            Unit Satker terintegrasi
                        </p>
                    </div>
                </div>

                {/* 3. TABEL PENGGUNA */}
                <div className="glass-card rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden relative z-10">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#0B1120] text-slate-300 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">
                                        Profil Pengguna
                                    </th>
                                    <th className="px-6 py-4">
                                        Peran &amp; Status Keamanan
                                    </th>
                                    <th className="px-6 py-4">
                                        Otoritas Wilayah
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Tindakan &amp; Keamanan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-indigo-200 border-t-indigo-600"></div>
                                            <p className="mt-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                Memuat Matriks Pengguna...
                                            </p>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
                                                <Users size={28} />
                                            </div>
                                            <p className="text-sm font-black text-slate-600">
                                                Tidak ada pengguna ditemukan.
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Ubah filter atau kata kunci
                                                pencarian.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((item) => {
                                        const isMe = localAuth?.id === item.id;
                                        const isActive =
                                            item.is_active !== false;
                                        const has2FA = Boolean(
                                            item.two_factor_enabled,
                                        );
                                        const satkerObj = satkers.find(
                                            (s) =>
                                                s.kode_satker ===
                                                item.kode_satker,
                                        );

                                        return (
                                            <tr
                                                key={item.id}
                                                className={`transition-colors ${
                                                    !isActive
                                                        ? "bg-rose-50/35 hover:bg-rose-50/60"
                                                        : "hover:bg-slate-50/90"
                                                }`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3.5">
                                                        <div
                                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-sm overflow-hidden shrink-0 ${
                                                                !isActive
                                                                    ? "bg-slate-400 grayscale"
                                                                    : item.role ===
                                                                        "admin"
                                                                      ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                                                                      : "bg-gradient-to-br from-teal-500 to-emerald-600"
                                                            }`}
                                                        >
                                                            {item.avatar ? (
                                                                <img
                                                                    src={`/storage/${item.avatar}`}
                                                                    alt={
                                                                        item.name
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                item.name
                                                                    .charAt(0)
                                                                    .toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <span
                                                                    className={`font-extrabold text-sm ${
                                                                        !isActive
                                                                            ? "text-slate-500 line-through"
                                                                            : "text-slate-900"
                                                                    }`}
                                                                >
                                                                    {item.name}
                                                                </span>
                                                                {isMe && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-black uppercase">
                                                                        Anda
                                                                    </span>
                                                                )}
                                                                {item.must_change_password && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black uppercase">
                                                                        Wajib
                                                                        Ganti PW
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs font-medium text-slate-400 mt-0.5">
                                                                {item.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {item.role ===
                                                        "admin" ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-700 uppercase tracking-wider border border-indigo-200/80">
                                                                <ShieldAlert
                                                                    size={12}
                                                                />{" "}
                                                                Admin
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-teal-50 text-teal-700 uppercase tracking-wider border border-teal-200/80">
                                                                <Building
                                                                    size={12}
                                                                />{" "}
                                                                Satker
                                                            </span>
                                                        )}

                                                        {isActive ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-700 uppercase tracking-wider border border-emerald-200">
                                                                Aktif
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-100 text-rose-700 uppercase tracking-wider border border-rose-200">
                                                                <Ban
                                                                    size={11}
                                                                />{" "}
                                                                Suspended
                                                            </span>
                                                        )}

                                                        {has2FA && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-900 text-emerald-400 uppercase tracking-wider border border-slate-700">
                                                                <ShieldCheck
                                                                    size={11}
                                                                />{" "}
                                                                2FA
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    {item.role === "admin" ? (
                                                        <span className="text-slate-500 font-bold bg-slate-100 border border-slate-200/70 px-3 py-1 rounded-lg text-xs">
                                                            Akses Global Kanwil
                                                        </span>
                                                    ) : (
                                                        <div className="font-bold text-slate-800 text-xs max-w-[260px] whitespace-normal leading-snug">
                                                            {satkerObj?.nama_satker ||
                                                                "Kode Tidak Valid"}
                                                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono border border-slate-200 font-bold">
                                                                    {
                                                                        item.kode_satker
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center items-center gap-1.5">
                                                        {/* Edit */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedEditData(
                                                                    item,
                                                                );
                                                                setIsEditModalOpen(
                                                                    true,
                                                                );
                                                            }}
                                                            className="p-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all shadow-sm border border-indigo-100 cursor-pointer"
                                                            title="Edit Profil User"
                                                        >
                                                            <Edit
                                                                size={15}
                                                                strokeWidth={
                                                                    2.5
                                                                }
                                                            />
                                                        </button>

                                                        {/* Reset Password 1x Pakai */}
                                                        <button
                                                            type="button"
                                                            disabled={isMe}
                                                            onClick={() =>
                                                                setConfirmAction(
                                                                    {
                                                                        type: "reset_pw",
                                                                        user: item,
                                                                    },
                                                                )
                                                            }
                                                            className="p-2 bg-white text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm border border-amber-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                            title="Terbitkan Password Sementara (1x Pakai)"
                                                        >
                                                            <KeyRound
                                                                size={15}
                                                                strokeWidth={
                                                                    2.5
                                                                }
                                                            />
                                                        </button>

                                                        {/* Suspend / Aktifkan */}
                                                        <button
                                                            type="button"
                                                            disabled={isMe}
                                                            onClick={() =>
                                                                setConfirmAction(
                                                                    {
                                                                        type: "suspend",
                                                                        user: item,
                                                                    },
                                                                )
                                                            }
                                                            className={`p-2 rounded-xl transition-all shadow-sm border disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                                                                isActive
                                                                    ? "bg-white text-orange-600 border-orange-200 hover:bg-orange-500 hover:text-white"
                                                                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white"
                                                            }`}
                                                            title={
                                                                isActive
                                                                    ? "Nonaktifkan (Suspend) Akun"
                                                                    : "Aktifkan Kembali Akun"
                                                            }
                                                        >
                                                            {isActive ? (
                                                                <Ban
                                                                    size={15}
                                                                    strokeWidth={
                                                                        2.5
                                                                    }
                                                                />
                                                            ) : (
                                                                <UserCheck
                                                                    size={15}
                                                                    strokeWidth={
                                                                        2.5
                                                                    }
                                                                />
                                                            )}
                                                        </button>

                                                        {/* Reset Darurat 2FA (muncul saat 2FA aktif) */}
                                                        {has2FA && !isMe && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setConfirmAction(
                                                                        {
                                                                            type: "reset_2fa",
                                                                            user: item,
                                                                        },
                                                                    )
                                                                }
                                                                className="p-2 bg-slate-900 text-emerald-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm border border-slate-700 cursor-pointer"
                                                                title="Reset Darurat 2FA (Jika HP Hilang)"
                                                            >
                                                                <Smartphone
                                                                    size={15}
                                                                    strokeWidth={
                                                                        2.5
                                                                    }
                                                                />
                                                            </button>
                                                        )}

                                                        {/* Hapus */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedDeleteId(
                                                                    item.id,
                                                                );
                                                                setIsDeleteModalOpen(
                                                                    true,
                                                                );
                                                            }}
                                                            disabled={isMe}
                                                            className="p-2 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                            title={
                                                                isMe
                                                                    ? "Tidak bisa menghapus akun sendiri"
                                                                    : "Hapus Permanen"
                                                            }
                                                        >
                                                            <Trash2
                                                                size={15}
                                                                strokeWidth={
                                                                    2.5
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        meta={pagination}
                        onPageChange={(p) => setCurrentPage(p)}
                    />
                </div>

                {/* MODAL KONFIRMASI AKSI KEAMANAN */}
                {confirmAction && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0B1120]/80 backdrop-blur-md">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white">
                            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">
                                        {confirmAction.type === "suspend"
                                            ? confirmAction.user.is_active !==
                                              false
                                                ? "Suspend Akun Pengguna?"
                                                : "Aktifkan Kembali Akun?"
                                            : confirmAction.type === "reset_pw"
                                              ? "Reset Password 1x Pakai?"
                                              : "Reset Darurat 2FA?"}
                                    </h3>
                                    <p className="text-xs font-bold text-indigo-600">
                                        {confirmAction.user.name} (
                                        {confirmAction.user.email})
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 space-y-5">
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    {confirmAction.type === "suspend"
                                        ? confirmAction.user.is_active !== false
                                            ? "Pengguna ini akan langsung diblokir dari sistem dan tidak dapat login sampai diaktifkan kembali. Riwayat Audit Trail tetap terjaga."
                                            : "Akses login untuk pengguna ini akan dipulihkan kembali."
                                        : confirmAction.type === "reset_pw"
                                          ? "Sistem akan membuat password sementara acak. Saat pengguna login berikutnya, mereka wajib membuat password pribadi baru."
                                          : "Google Authenticator 2FA pada akun ini akan dicabut paksa agar pengguna dapat login kembali menggunakan password saja."}
                                </p>
                                <div className="flex gap-2.5">
                                    <button
                                        type="button"
                                        disabled={isSecurityBusy}
                                        onClick={() => setConfirmAction(null)}
                                        className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isSecurityBusy}
                                        onClick={executeSecurityAction}
                                        className="flex-[1.5] inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                                    >
                                        {isSecurityBusy && (
                                            <Loader2
                                                size={14}
                                                className="animate-spin"
                                            />
                                        )}
                                        Ya, Lanjutkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL HASIL PASSWORD SEMENTARA 1X PAKAI */}
                {tempPasswordInfo && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0B1120]/85 backdrop-blur-md">
                        <div className="bg-white rounded-[2.25rem] shadow-2xl w-full max-w-md overflow-hidden border border-white">
                            <div className="px-6 py-5 bg-[#0B1120] text-white flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
                                    <KeyRound size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black">
                                        Password Sementara Diterbitkan
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Kirimkan secara privat kepada pegawai
                                        bersangkutan.
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="text-xs text-slate-500 space-y-1">
                                    <p>
                                        Pengguna:{" "}
                                        <strong className="text-slate-800">
                                            {tempPasswordInfo.user_name}
                                        </strong>
                                    </p>
                                    <p>
                                        Email:{" "}
                                        <strong className="text-slate-800">
                                            {tempPasswordInfo.user_email}
                                        </strong>
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5">
                                        Password 1x Pakai
                                    </p>
                                    <p className="text-2xl font-mono font-black text-white tracking-wider select-all">
                                        {tempPasswordInfo.temporary_password}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyTempCredentials(false)
                                        }
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider cursor-pointer"
                                    >
                                        {copiedPw ? (
                                            <Check size={14} />
                                        ) : (
                                            <Copy size={14} />
                                        )}
                                        Salin Password
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyTempCredentials(true)
                                        }
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
                                    >
                                        <Copy size={14} /> Salin Pesan WA
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setTempPasswordInfo(null)}
                                    className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODALS CRUD */}
                <AddModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    satkers={satkers}
                    onSuccess={(msg) => {
                        fetchUsers(currentPage, searchTerm);
                        showToast(msg, "success");
                    }}
                />
                <EditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    satkers={satkers}
                    editData={selectedEditData}
                    onSuccess={(msg) => {
                        fetchUsers(currentPage, searchTerm);
                        showToast(msg, "success");
                    }}
                />
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    isDeleting={isDeleting}
                />
            </div>
        </MainLayout>
    );
}
