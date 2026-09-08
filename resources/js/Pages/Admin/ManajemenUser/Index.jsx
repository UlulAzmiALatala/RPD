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
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <p className="text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-bold text-gray-900">{from || 0}</span>{" "}
                sampai{" "}
                <span className="font-bold text-gray-900">{to || 0}</span> dari{" "}
                <span className="font-bold text-gray-900">{total}</span>{" "}
                pengguna
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all shadow-sm border ${current_page === page ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default function IndexUser({ authUser }) {
    const [users, setUsers] = useState([]);
    const [satkers, setSatkers] = useState([]); // Buat dilempar ke modal
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // State Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditData, setSelectedEditData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    // State Toast Futuristik
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
        <MainLayout>
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                @keyframes slideOutRight { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(120%) scale(0.9); opacity: 0; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
            `}</style>

            <div className="space-y-6 font-sans text-gray-600 relative overflow-hidden">
                {/* TOAST NOTIFICATION */}
                {toast.show && (
                    <div
                        className={`fixed top-24 right-10 z-[100] flex items-center p-4 min-w-[320px] rounded-xl border backdrop-blur-md ${toast.isExiting ? "toast-exit" : "toast-enter"} ${toast.type === "success" ? "bg-[#0A192F]/90 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] text-white" : "bg-[#0A192F]/90 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-white"}`}
                    >
                        <div
                            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full border ${toast.type === "success" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                        >
                            {toast.type === "success" ? (
                                <CheckCircle className="w-6 h-6" />
                            ) : (
                                <XCircle className="w-6 h-6" />
                            )}
                        </div>
                        <div className="ml-4">
                            <h4
                                className={`text-xs font-bold tracking-widest uppercase ${toast.type === "success" ? "text-green-400" : "text-red-400"}`}
                            >
                                {toast.type === "success"
                                    ? "System Success"
                                    : "System Error"}
                            </h4>
                            <p className="text-sm font-medium text-gray-200 mt-0.5">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl hidden md:flex">
                            <Users size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Manajemen Pengguna
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Kelola akses akun Admin Kanwil dan Operator
                                Satker.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Cari Nama, Email, atau Kode..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm shadow-sm"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors w-full md:w-auto"
                        >
                            <Plus size={18} /> Tambah Akun
                        </button>
                    </div>
                </div>

                {/* Tabel Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-gray-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">
                                        Profil Pengguna
                                    </th>
                                    <th className="px-6 py-4">
                                        Hak Akses (Role)
                                    </th>
                                    <th className="px-6 py-4">Satuan Kerja</th>
                                    <th className="px-6 py-4 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                                            <p className="mt-2 text-sm text-gray-400">
                                                Memuat data pengguna...
                                            </p>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-12 text-center text-gray-400 italic"
                                        >
                                            Belum ada data pengguna ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${item.role === "admin" ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-emerald-400 to-teal-500"}`}
                                                    >
                                                        {item.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {item.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.role === "admin" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-purple-100 text-purple-700 uppercase tracking-widest border border-purple-200">
                                                        <ShieldAlert
                                                            size={14}
                                                        />{" "}
                                                        Admin Kanwil
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-teal-100 text-teal-700 uppercase tracking-widest border border-teal-200">
                                                        <Building size={14} />{" "}
                                                        Operator Satker
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.role === "admin" ? (
                                                    <span className="text-gray-400 font-medium italic">
                                                        - Akses Global -
                                                    </span>
                                                ) : (
                                                    <div className="font-medium text-slate-700">
                                                        {satkers.find(
                                                            (s) =>
                                                                s.kode_satker ===
                                                                item.kode_satker,
                                                        )?.nama_satker ||
                                                            "Kode Tidak Valid"}
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono border border-slate-200">
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
                                                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-mono border border-indigo-100 font-bold">
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
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEditData(
                                                                item,
                                                            );
                                                            setIsEditModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm border border-blue-200"
                                                        title="Edit User"
                                                    >
                                                        <Edit size={16} />
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
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition shadow-sm border border-red-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title={
                                                            authUser?.id ===
                                                            item.id
                                                                ? "Tidak bisa hapus akun sendiri"
                                                                : "Hapus User"
                                                        }
                                                    >
                                                        <Trash2 size={16} />
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
