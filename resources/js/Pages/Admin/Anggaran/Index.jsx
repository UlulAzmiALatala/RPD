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

// Komponen Paginasi
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
                <span className="font-bold text-gray-900">{total}</span> data
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
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all shadow-sm border ${current_page === page ? "bg-blue-600 text-white border-blue-600 shadow-blue-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
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

    // Ambil Data Satker untuk Dropdown Modal
    useEffect(() => {
        axios
            .get(`/api/dashboard-data?tahun=${tahun}`)
            .then((response) => setSatkers(response.data.data.tabel_satker))
            .catch((error) => console.error("Gagal memuat satker", error));
    }, [tahun]);

    // Ambil Data Anggaran
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
            {/* Animasi Toast */}
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
                        className={`fixed top-24 right-10 z-[100] flex items-center p-4 min-w-[320px] rounded-xl border backdrop-blur-md ${toast.isExiting ? "toast-exit" : "toast-enter"} ${
                            toast.type === "success"
                                ? "bg-[#0A192F]/90 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] text-white"
                                : "bg-[#0A192F]/90 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-white"
                        }`}
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
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Master Anggaran
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Kelola data pagu anggaran per Satuan Kerja.
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Cari Satker atau Tahun..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm shadow-sm"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0A192F] hover:bg-[#051024] text-yellow-400 font-bold rounded-xl shadow-md transition-colors w-full md:w-auto"
                        >
                            <Plus size={18} /> Tambah Data
                        </button>
                    </div>
                </div>

                {/* Tabel Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Tahun</th>
                                    <th className="px-6 py-4">Satuan Kerja</th>
                                    <th className="px-6 py-4 text-right">
                                        Total Pagu
                                    </th>
                                    <th className="px-6 py-4 text-right text-red-500">
                                        Pagu Blokir
                                    </th>
                                    <th className="px-6 py-4 text-right text-green-600">
                                        Pagu Efektif
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                            <p className="mt-2 text-sm text-gray-400">
                                                Memuat data anggaran...
                                            </p>
                                        </td>
                                    </tr>
                                ) : anggarans.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-12 text-center text-gray-400 italic"
                                        >
                                            Belum ada data anggaran.
                                        </td>
                                    </tr>
                                ) : (
                                    anggarans.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-blue-50/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {item.tahun}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">
                                                    {item.satker?.nama_satker}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Kode:{" "}
                                                    {item.satker?.kode_satker}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                {formatCurrency(
                                                    Number(item.belanja_gaji) +
                                                        Number(
                                                            item.belanja_barang,
                                                        ) +
                                                        Number(
                                                            item.belanja_modal,
                                                        ),
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-red-500 bg-red-50/30">
                                                {formatCurrency(
                                                    item.pagu_blokir || 0,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-extrabold text-green-700 bg-green-50/30">
                                                {formatCurrency(
                                                    item.pagu_efektif || 0,
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
                                                        title="Edit"
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm border border-blue-200"
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
                                                        title="Hapus"
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition shadow-sm border border-red-200"
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
                />
            </div>
        </MainLayout>
    );
}
