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
    Info,
    Database,
    ShieldAlert,
    Wallet,
    Lock,
} from "lucide-react";

// Import Modals
import AddModal from "./Modals/AddModal";
import EditModal from "./Modals/EditModal";
import DeleteModal from "./Modals/DeleteModal";

// Helper Format Uang
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Komponen Paginasi Premium
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
        <div className="px-6 py-5 border-t border-slate-100/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/30 backdrop-blur-sm rounded-b-[2.5rem]">
            <p className="text-sm text-slate-500 font-medium">
                Menampilkan{" "}
                <span className="font-extrabold text-slate-800">
                    {from || 0}
                </span>{" "}
                sampai{" "}
                <span className="font-extrabold text-slate-800">{to || 0}</span>{" "}
                dari{" "}
                <span className="font-extrabold text-slate-800">{total}</span>{" "}
                data
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2.5 rounded-xl border border-slate-200/60 text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all outline-none"
                >
                    <ChevronLeft size={18} strokeWidth={2.5} />
                </button>
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-black transition-all duration-300 shadow-sm border outline-none ${current_page === page ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] border-indigo-500 hover:-translate-y-0.5" : "bg-white text-slate-600 border-slate-200/60 hover:bg-slate-50"}`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-2.5 rounded-xl border border-slate-200/60 text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all outline-none"
                >
                    <ChevronRight size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default function IndexAnggaran() {
    const [anggarans, setAnggarans] = useState([]);
    const [satkers, setSatkers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());

    // State Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditData, setSelectedEditData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    useEffect(() => {
        axios
            .get(`/api/dashboard-data?tahun=${tahun}`)
            .then((response) => setSatkers(response.data.data.tabel_satker))
            .catch((error) => console.error("Gagal memuat satker", error));
    }, [tahun]);

    const fetchAnggarans = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/api/anggaran?page=${page}&search=${search}`,
            );
            if (response.data.data) {
                setAnggarans(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                });
            }
        } catch (err) {
            showToast("Gagal memuat data anggaran.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(
            () => fetchAnggarans(currentPage, searchTerm),
            500,
        );
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination.last_page || 1))
            setCurrentPage(newPage);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await axios.delete(
                `/api/anggaran/${selectedDeleteId}`,
            );
            showToast(
                response.data.message || "Data berhasil dihapus!",
                "success",
            );
            fetchAnggarans(currentPage, searchTerm);
            setIsDeleteModalOpen(false);
        } catch (err) {
            showToast("Gagal menghapus data anggaran.", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <MainLayout tahun={tahun}>
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                @keyframes slideOutRight { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(120%) scale(0.9); opacity: 0; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
                .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

            <div className="space-y-6 font-sans text-slate-700 relative overflow-hidden min-h-screen pb-10">
                {/* --- AMBIENT BACKGROUND GLOW --- */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10"></div>
                <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

                {/* --- TOAST NOTIFICATION PREMIUM --- */}
                {toast.show && (
                    <div
                        className={`fixed top-8 right-8 z-[100] flex items-center p-4 min-w-[340px] rounded-2xl border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl ${toast.isExiting ? "toast-exit" : "toast-enter"} ${toast.type === "success" ? "bg-[#0A192F]/95 border-emerald-500/30" : "bg-[#0A192F]/95 border-rose-500/30"}`}
                    >
                        <div
                            className={`relative flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border ${toast.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}
                        >
                            {toast.type === "success" ? (
                                <CheckCircle className="w-6 h-6" />
                            ) : (
                                <XCircle className="w-6 h-6" />
                            )}
                        </div>
                        <div className="ml-4">
                            <h4
                                className={`text-[10px] font-black tracking-widest uppercase ${toast.type === "success" ? "text-emerald-400" : "text-rose-400"}`}
                            >
                                {toast.type === "success"
                                    ? "System Success"
                                    : "System Error"}
                            </h4>
                            <p className="text-sm font-semibold text-slate-200 mt-0.5 leading-snug">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* --- HEADER & CONTROLS (GLASSMORPHISM) --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/70 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-[#0f172a] to-slate-700 text-white rounded-2xl shadow-[0_10px_20px_rgba(15,23,42,0.3)]">
                            <Database size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                Master Anggaran
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                Kelola data pagu DIPA per Satuan Kerja di sini.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Search className="w-4 h-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari Satker atau Tahun..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-11 pr-4 py-3.5 bg-white/90 backdrop-blur border border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-semibold shadow-sm outline-none placeholder:font-normal"
                            />
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-br from-indigo-600 to-blue-700 text-white font-black rounded-2xl shadow-[0_8px_16px_rgba(79,70,229,0.25)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto outline-none"
                        >
                            <Plus size={18} strokeWidth={2.5} /> Tambah Data
                        </button>
                    </div>
                </div>

                {/* --- TABLE CONTENT (PREMIUM GRID) --- */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden relative z-10">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase text-slate-500 font-black tracking-widest sticky top-0 z-20 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-5 align-middle">
                                        Tahun
                                    </th>
                                    <th className="px-6 py-5 align-middle">
                                        Satuan Kerja
                                    </th>
                                    <th className="px-6 py-5 text-right align-middle text-indigo-600">
                                        Total Pagu (Kotor)
                                    </th>
                                    <th className="px-6 py-5 text-right align-middle text-rose-500">
                                        Pagu Blokir
                                    </th>
                                    <th className="px-6 py-5 text-right align-middle text-emerald-600">
                                        Pagu Efektif
                                    </th>
                                    <th className="px-6 py-5 text-center align-middle">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-20 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent shadow-md"></div>
                                            <p className="mt-4 text-sm font-bold text-slate-400 tracking-wider uppercase">
                                                Memuat Basis Data...
                                            </p>
                                        </td>
                                    </tr>
                                ) : anggarans.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-20 text-center"
                                        >
                                            <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <Database
                                                    size={32}
                                                    className="text-slate-400"
                                                />
                                            </div>
                                            <p className="text-base font-bold text-slate-500">
                                                Belum ada data anggaran.
                                            </p>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Silakan tambahkan pagu DIPA
                                                Satker terlebih dahulu.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    anggarans.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50/80 transition-colors duration-200 group"
                                        >
                                            <td className="px-6 py-5 font-black text-slate-800 text-base">
                                                {item.tahun}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-extrabold text-slate-800 text-sm">
                                                    {item.satker?.nama_satker}
                                                </div>
                                                <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">
                                                    DIPA -{" "}
                                                    {item.satker?.kode_satker}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right font-black text-indigo-700 bg-indigo-50/10">
                                                {formatCurrency(
                                                    item.total_pagu || 0,
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right font-bold text-rose-600 bg-rose-50/20 relative">
                                                <div className="flex items-center justify-end gap-2 group/tooltip cursor-help">
                                                    {item.pagu_blokir > 0 && (
                                                        <ShieldAlert
                                                            size={14}
                                                            className="text-rose-400"
                                                            strokeWidth={2.5}
                                                        />
                                                    )}
                                                    <span>
                                                        {formatCurrency(
                                                            item.pagu_blokir ||
                                                                0,
                                                        )}
                                                    </span>

                                                    {/* ADVANCED TOOLTIP BLOKIR */}
                                                    {item.pagu_blokir > 0 && (
                                                        <div className="absolute bottom-full mb-3 right-5 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-50 w-56 text-left opacity-0 translate-y-2 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 transition-all duration-300">
                                                            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900/95 border-b border-r border-slate-700 rotate-45"></div>
                                                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-slate-700 pb-2 mb-3 flex items-center gap-1.5">
                                                                <Lock
                                                                    size={12}
                                                                />{" "}
                                                                Rincian Blokir
                                                            </p>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center text-xs">
                                                                    <span className="text-slate-400 font-bold">
                                                                        51 -
                                                                        Pegawai:
                                                                    </span>
                                                                    <span className="font-mono font-black">
                                                                        {formatCurrency(
                                                                            item.blokir_gaji ||
                                                                                0,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-xs">
                                                                    <span className="text-slate-400 font-bold">
                                                                        52 -
                                                                        Barang:
                                                                    </span>
                                                                    <span className="font-mono font-black">
                                                                        {formatCurrency(
                                                                            item.blokir_barang ||
                                                                                0,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-xs">
                                                                    <span className="text-slate-400 font-bold">
                                                                        53 -
                                                                        Modal:
                                                                    </span>
                                                                    <span className="font-mono font-black">
                                                                        {formatCurrency(
                                                                            item.blokir_modal ||
                                                                                0,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right font-black text-emerald-600 bg-emerald-50/10 text-[15px]">
                                                {formatCurrency(
                                                    item.pagu_efektif || 0,
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-all duration-300">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEditData(
                                                                item,
                                                            );
                                                            setIsEditModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                        title="Edit Data"
                                                        className="p-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 hover:scale-110 transition-all shadow-sm border border-indigo-100 outline-none"
                                                    >
                                                        <Edit
                                                            size={16}
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
                                                        title="Hapus Data"
                                                        className="p-2 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white hover:scale-110 transition-all shadow-sm border border-rose-100 outline-none"
                                                    >
                                                        <Trash2
                                                            size={16}
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
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Modals Rendering */}
                <AddModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    satkers={satkers}
                    defaultTahun={tahun}
                    onSuccess={(msg) => {
                        fetchAnggarans(currentPage, searchTerm);
                        showToast(msg, "success");
                    }}
                />
                <EditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    satkers={satkers}
                    editData={selectedEditData}
                    onSuccess={(msg) => {
                        fetchAnggarans(currentPage, searchTerm);
                        showToast(msg, "success");
                    }}
                />
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    isDeleting={isDeleting}
                    onConfirm={confirmDelete}
                    title="Hapus Master Anggaran"
                />
            </div>
        </MainLayout>
    );
}
