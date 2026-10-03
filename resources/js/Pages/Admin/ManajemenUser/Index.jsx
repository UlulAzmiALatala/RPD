import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

import AddModal from "./Modals/AddModal";
import EditModal from "./Modals/EditModal";
import DeleteModal from "./Modals/DeleteModal";

// ==========================================
// KOMPONEN PAGINATION PREMIUM
// ==========================================
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
        <div className="px-6 py-5 border-t border-slate-100/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/30 backdrop-blur-sm rounded-b-3xl">
            <p className="text-sm text-slate-500 font-medium">
                Menampilkan{" "}
                <span className="font-extrabold text-slate-800">
                    {from || 0}
                </span>{" "}
                sampai{" "}
                <span className="font-extrabold text-slate-800">{to || 0}</span>{" "}
                dari{" "}
                <span className="font-extrabold text-slate-800">{total}</span>{" "}
                pengguna
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2 rounded-xl border border-slate-200/60 text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all"
                >
                    <ChevronLeft size={18} strokeWidth={2.5} />
                </button>
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-black transition-all duration-300 shadow-sm border ${
                            current_page === page
                                ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-indigo-500 shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
                                : "bg-white text-slate-600 border-slate-200/60 hover:bg-slate-50 hover:text-indigo-600"
                        }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-2 rounded-xl border border-slate-200/60 text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all"
                >
                    <ChevronRight size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default function IndexUser({ authUser }) {
    const [users, setUsers] = useState([]);
    const [satkers, setSatkers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditData, setSelectedEditData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

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

    const fetchUsers = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/api/users?page=${page}&search=${search}`,
            );
            setUsers(response.data.data.data);
            setSatkers(response.data.satkers);
            setPagination({
                current_page: response.data.data.current_page,
                last_page: response.data.data.last_page,
                total: response.data.data.total,
                from: response.data.data.from,
                to: response.data.data.to,
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
            500,
        );
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    const confirmDelete = async () => {
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
        }
    };

    return (
        <MainLayout authUser={authUser}>
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                @keyframes slideOutRight { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(120%) scale(0.9); opacity: 0; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }
            `}</style>

            <div className="space-y-8 font-sans text-slate-600 relative overflow-hidden min-h-screen pb-10">
                {/* TOAST NOTIFICATION PREMIUM */}
                {toast.show && (
                    <div
                        className={`fixed top-8 right-8 z-[100] flex items-center p-4 min-w-[340px] rounded-2xl border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl ${toast.isExiting ? "toast-exit" : "toast-enter"} ${toast.type === "success" ? "bg-[#0A192F]/95 border-emerald-500/30" : "bg-[#0A192F]/95 border-rose-500/30"}`}
                    >
                        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                            <div
                                className={`absolute -top-10 -right-10 w-32 h-32 opacity-20 blur-2xl rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
                            ></div>
                        </div>
                        <div
                            className={`relative flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border ${toast.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}
                        >
                            {toast.type === "success" ? (
                                <CheckCircle className="w-6 h-6" />
                            ) : (
                                <XCircle className="w-6 h-6" />
                            )}
                        </div>
                        <div className="ml-4 relative">
                            <h4
                                className={`text-[10px] font-black tracking-widest uppercase ${toast.type === "success" ? "text-emerald-400" : "text-rose-400"}`}
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

                {/* HEADER SECTION - ENTERPRISE GRADE */}
                <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 glass-card p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 overflow-hidden">
                    {/* Background Orbs */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="p-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.2)] border border-indigo-400/30 hidden md:flex">
                            <Users size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                                Manajemen Pengguna
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-1.5 flex items-center gap-2">
                                <ShieldAlert
                                    size={16}
                                    className="text-indigo-500"
                                />
                                Kelola otorisasi akses Admin Kanwil & Operator
                                Satker.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto relative z-10">
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Cari Nama, Email, atau Kode Satker..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-slate-200/80 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-slate-700 shadow-sm backdrop-blur-sm"
                            />
                            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 w-full md:w-auto overflow-hidden group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <Plus size={20} strokeWidth={3} /> Tambah Akun
                        </button>
                    </div>
                </div>

                {/* TABEL CONTENT PREMIUM */}
                <div className="glass-card rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 overflow-hidden relative z-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/50 border-b border-slate-200/60 backdrop-blur-sm">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] uppercase text-slate-500 font-extrabold tracking-[0.15em]">
                                        Profil Pengguna
                                    </th>
                                    <th className="px-8 py-5 text-[10px] uppercase text-slate-500 font-extrabold tracking-[0.15em]">
                                        Hak Akses (Role)
                                    </th>
                                    <th className="px-8 py-5 text-[10px] uppercase text-slate-500 font-extrabold tracking-[0.15em]">
                                        Otoritas Wilayah
                                    </th>
                                    <th className="px-8 py-5 text-[10px] uppercase text-slate-500 font-extrabold tracking-[0.15em] text-center">
                                        Tindakan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-8 py-20 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent shadow-md"></div>
                                            <p className="mt-4 text-sm font-bold text-slate-400">
                                                Memuat matriks pengguna...
                                            </p>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-8 py-20 text-center"
                                        >
                                            <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <Users
                                                    size={32}
                                                    className="text-slate-400"
                                                />
                                            </div>
                                            <p className="text-base font-bold text-slate-500">
                                                Tidak ada pengguna ditemukan.
                                            </p>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Coba gunakan kata kunci
                                                pencarian yang lain.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-white/60 transition-colors duration-200 group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md ${
                                                            item.role ===
                                                            "admin"
                                                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20"
                                                                : "bg-gradient-to-br from-teal-400 to-emerald-500 shadow-teal-500/20"
                                                        }`}
                                                    >
                                                        {item.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-slate-800 text-base">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs font-semibold text-slate-400">
                                                            {item.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {item.role === "admin" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-indigo-50 text-indigo-700 uppercase tracking-widest border border-indigo-200/60 shadow-sm">
                                                        <ShieldAlert
                                                            size={14}
                                                        />{" "}
                                                        Admin Kanwil
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-teal-50 text-teal-700 uppercase tracking-widest border border-teal-200/60 shadow-sm">
                                                        <Building size={14} />{" "}
                                                        Operator Satker
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                {item.role === "admin" ? (
                                                    <span className="text-slate-400 font-bold italic bg-slate-100 px-3 py-1 rounded-lg text-xs">
                                                        - Akses Global Tanpa
                                                        Batas -
                                                    </span>
                                                ) : (
                                                    <div className="font-bold text-slate-700 max-w-[280px] whitespace-normal leading-snug">
                                                        {satkers.find(
                                                            (s) =>
                                                                s.kode_satker ===
                                                                item.kode_satker,
                                                        )?.nama_satker ||
                                                            "Kode Tidak Valid"}
                                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono border border-slate-200 font-bold">
                                                                Kode:{" "}
                                                                {
                                                                    item.kode_satker
                                                                }
                                                            </span>
                                                            {satkers.find(
                                                                (s) =>
                                                                    s.kode_satker ===
                                                                    item.kode_satker,
                                                            )?.kode_eselon && (
                                                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-mono border border-indigo-100 font-bold">
                                                                    Eselon:{" "}
                                                                    {
                                                                        satkers.find(
                                                                            (
                                                                                s,
                                                                            ) =>
                                                                                s.kode_satker ===
                                                                                item.kode_satker,
                                                                        )
                                                                            ?.kode_eselon
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex justify-center gap-3 opacity-60 group-hover:opacity-100 transition-all duration-300">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEditData(
                                                                item,
                                                            );
                                                            setIsEditModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="p-2.5 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 hover:scale-110 transition-all shadow-sm border border-indigo-100"
                                                        title="Edit User"
                                                    >
                                                        <Edit
                                                            size={18}
                                                            strokeWidth={2.5}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDeleteId(
                                                                item.id,
                                                            );
                                                            setIsDeleteModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                        disabled={
                                                            authUser?.id ===
                                                            item.id
                                                        }
                                                        className="p-2.5 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white hover:scale-110 transition-all shadow-sm border border-rose-100 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-rose-500 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                                        title={
                                                            authUser?.id ===
                                                            item.id
                                                                ? "Tidak bisa hapus akun sendiri"
                                                                : "Hapus User"
                                                        }
                                                    >
                                                        <Trash2
                                                            size={18}
                                                            strokeWidth={2.5}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        meta={pagination}
                        onPageChange={(p) => setCurrentPage(p)}
                    />
                </div>

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
                />
            </div>
        </MainLayout>
    );
}
