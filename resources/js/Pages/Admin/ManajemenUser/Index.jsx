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

    const filteredUsers = useMemo(() => {
        if (roleFilter === "ALL") return users;
        return users.filter((u) => u.role === roleFilter);
    }, [users, roleFilter]);

    const roleStats = useMemo(() => {
        const adminCount = users.filter((u) => u.role === "admin").length;
        const satkerCount = users.filter((u) => u.role !== "admin").length;
        return { adminCount, satkerCount };
    }, [users]);

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
                        className={`fixed top-8 right-8 z-[100] flex items-center p-4 min-w-[320px] max-w-md rounded-2xl border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl ${
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
                                        RBAC Control
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                                    Kelola akun, peran otoritas Admin Kanwil,
                                    dan penugasan Operator Satuan Kerja.
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

                    {/* BARIS FILTER ROLE & PENCARIAN */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                        <div className="inline-flex flex-wrap items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 text-xs font-bold shadow-inner gap-1">
                            <span className="px-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:inline-flex items-center gap-1">
                                <Filter size={11} /> Peran:
                            </span>
                            {[
                                { key: "ALL", label: "Semua Akun" },
                                { key: "admin", label: "Admin Kanwil" },
                                { key: "satker", label: "Operator Satker" },
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

                        <div className="relative w-full md:w-80">
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

                {/* 2. 4 KARTU KPI PENGGUNA */}
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
                            Akun aktif terdaftar
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                Admin Kanwil
                            </p>
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <ShieldCheck size={17} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-indigo-700 tabular-nums">
                            {roleStats.adminCount}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            Pada halaman aktif ini
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">
                                Operator Satker
                            </p>
                            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                <Building size={17} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-teal-700 tabular-nums">
                            {roleStats.satkerCount}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            Pada halaman aktif ini
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
                                        Hak Akses (Role)
                                    </th>
                                    <th className="px-6 py-4">
                                        Otoritas Wilayah
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Tindakan
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
                                                Ubah filter peran atau kata
                                                kunci pencarian.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((item) => {
                                        const isMe = localAuth?.id === item.id;
                                        const satkerObj = satkers.find(
                                            (s) =>
                                                s.kode_satker ===
                                                item.kode_satker,
                                        );

                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-50/90 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3.5">
                                                        <div
                                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-sm overflow-hidden shrink-0 ${
                                                                item.role ===
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
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-extrabold text-slate-900 text-sm">
                                                                    {item.name}
                                                                </span>
                                                                {isMe && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-black uppercase tracking-wider">
                                                                        Anda
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
                                                    {item.role === "admin" ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-indigo-50 text-indigo-700 uppercase tracking-widest border border-indigo-200/80">
                                                            <ShieldAlert
                                                                size={13}
                                                            />{" "}
                                                            Admin Kanwil
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-teal-50 text-teal-700 uppercase tracking-widest border border-teal-200/80">
                                                            <Building
                                                                size={13}
                                                            />{" "}
                                                            Operator Satker
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.role === "admin" ? (
                                                        <span className="text-slate-500 font-bold bg-slate-100 border border-slate-200/70 px-3 py-1 rounded-lg text-xs">
                                                            Akses Global Kanwil
                                                        </span>
                                                    ) : (
                                                        <div className="font-bold text-slate-800 text-xs max-w-[280px] whitespace-normal leading-snug">
                                                            {satkerObj?.nama_satker ||
                                                                "Kode Tidak Valid"}
                                                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono border border-slate-200 font-bold">
                                                                    Kode:{" "}
                                                                    {
                                                                        item.kode_satker
                                                                    }
                                                                </span>
                                                                {satkerObj?.kode_eselon && (
                                                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-mono border border-indigo-100 font-bold">
                                                                        Eselon:{" "}
                                                                        {
                                                                            satkerObj.kode_eselon
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
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
                                                            title="Edit User"
                                                        >
                                                            <Edit
                                                                size={16}
                                                                strokeWidth={
                                                                    2.5
                                                                }
                                                            />
                                                        </button>
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
                                                            className="p-2 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-rose-500 disabled:cursor-not-allowed cursor-pointer"
                                                            title={
                                                                isMe
                                                                    ? "Tidak bisa menghapus akun sendiri"
                                                                    : "Hapus User"
                                                            }
                                                        >
                                                            <Trash2
                                                                size={16}
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

                {/* MODALS */}
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
