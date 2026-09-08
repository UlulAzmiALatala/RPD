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
    CalendarRange,
    Receipt,
    Wallet,
    TrendingUp,
    AlertCircle,
    Filter,
} from "lucide-react";

import AddRpdModal from "./Modals/AddRpdModal";
import EditRpdModal from "./Modals/EditRpdModal";
import AddRealisasiModal from "./Modals/AddRealisasiModal";
import EditRealisasiModal from "./Modals/EditRealisasiModal";
import DeleteModal from "./Modals/DeleteModal";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

const Pagination = ({ meta, onPageChange, accentColor }) => {
    if (!meta || meta.total === 0) return null;
    const { current_page, last_page, from, to, total } = meta;
    const getPageNumbers = () => {
        let pages = [];
        let start = Math.max(1, current_page - 2),
            end = Math.min(last_page, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };
    return (
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <p className="text-sm text-gray-500">
                Menampilkan <span className="font-bold">{from || 0}</span> -{" "}
                <span className="font-bold">{to || 0}</span> dari{" "}
                <span className="font-bold">{total}</span>
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                    <ChevronLeft size={18} />
                </button>
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold shadow-sm border ${current_page === page ? `${accentColor} text-white` : "bg-white text-gray-600 hover:bg-gray-50"}`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default function IndexTransaksi() {
    const [activeTab, setActiveTab] = useState("rpd");
    const [data, setData] = useState([]);
    const [satkers, setSatkers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    // States untuk Filter
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSatker, setSelectedSatker] = useState("");
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());

    const [summary, setSummary] = useState({
        global: {
            pagu_efektif: 0,
            total_rpd: 0,
            total_realisasi: 0,
            sisa_pagu_rpd: 0,
            sisa_pagu_realisasi: 0,
            persentase_rpd: 0,
            persentase_realisasi: 0,
        },
        per_satker: {},
    });

    // Modal & Toast States
    const [isAddRpdOpen, setIsAddRpdOpen] = useState(false);
    const [isEditRpdOpen, setIsEditRpdOpen] = useState(false);
    const [isAddRealOpen, setIsAddRealOpen] = useState(false);
    const [isEditRealOpen, setIsEditRealOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
        isExiting: false,
    });
    const toastTimeout = useRef(null),
        exitTimeout = useRef(null);

    const showToast = (message, type = "success") => {
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        if (exitTimeout.current) clearTimeout(exitTimeout.current);
        setToast({ show: true, message, type, isExiting: false });
        exitTimeout.current = setTimeout(
            () => setToast((prev) => ({ ...prev, isExiting: true })),
            3500,
        );
        toastTimeout.current = setTimeout(
            () => setToast({ show: false }),
            4000,
        );
    };

    const fetchSummary = async () => {
        try {
            const res = await axios.get(
                `/api/transaksi/summary?tahun=${tahun}`,
            );
            setSummary(res.data.data);
        } catch (err) {
            console.error("Gagal load summary", err);
        }
    };

    useEffect(() => {
        axios
            .get(`/api/dashboard-data?tahun=${tahun}`)
            .then((res) => setSatkers(res.data.data.tabel_satker))
            .catch((err) => console.log(err));
        fetchSummary();
    }, [tahun]);

    const fetchData = async (page = 1, search = "", satker = "") => {
        setLoading(true);
        try {
            const endpoint =
                activeTab === "rpd"
                    ? "/api/transaksi/rpd"
                    : "/api/transaksi/realisasi";
            const res = await axios.get(
                `${endpoint}?page=${page}&search=${search}&tahun=${tahun}&satker_id=${satker}`,
            );
            setData(res.data.data);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
                from: res.data.from,
                to: res.data.to,
            });
        } catch (err) {
            showToast("Gagal memuat data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(
            () => fetchData(currentPage, searchTerm, selectedSatker),
            500,
        );
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, selectedSatker, activeTab, tahun]);

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const endpoint =
                activeTab === "rpd"
                    ? `/api/transaksi/rpd/${deleteId}`
                    : `/api/transaksi/realisasi/${deleteId}`;
            const res = await axios.delete(endpoint);
            showToast(res.data.message, "success");
            fetchData(currentPage, searchTerm, selectedSatker);
            fetchSummary();
            setIsDeleteOpen(false);
        } catch (err) {
            showToast("Gagal menghapus data.", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSuccess = (msg) => {
        fetchData(currentPage, searchTerm, selectedSatker);
        fetchSummary();
        showToast(msg, "success");
    };

    const isRPD = activeTab === "rpd";
    const accentColor = isRPD
        ? "bg-indigo-600 border-indigo-600"
        : "bg-blue-600 border-blue-600";
    const lightBg = isRPD ? "bg-indigo-50/50" : "bg-blue-50/50";
    const textAccent = isRPD ? "text-indigo-600" : "text-blue-600";

    // --- LOGIKA SMART CARDS DINAMIS (Global vs Per-Satker) ---
    let dispPagu = 0,
        dispTotalRpd = 0,
        dispTotalReal = 0;

    if (selectedSatker && summary.per_satker[selectedSatker]) {
        // Jika filter Satker aktif, ambil data khusus Satker tersebut
        const s = summary.per_satker[selectedSatker];
        dispPagu = s.pagu_efektif;
        dispTotalRpd = s.total_rpd;
        dispTotalReal = s.total_realisasi;
    } else {
        // Jika tidak difilter, tampilkan data Global
        dispPagu = summary.global.pagu_efektif;
        dispTotalRpd = summary.global.total_rpd;
        dispTotalReal = summary.global.total_realisasi;
    }

    const dispTotalInput = isRPD ? dispTotalRpd : dispTotalReal;
    const dispSisa = dispPagu - dispTotalInput;
    const dispPersen = dispPagu > 0 ? (dispTotalInput / dispPagu) * 100 : 0;

    // --- LOGIKA TARGET TRIWULAN (Dinamis berdasarkan bulan saat ini) ---
    const currentMonth = new Date().getMonth() + 1;
    let currentTW = "I";
    let targetTW = 20;
    if (currentMonth > 3) {
        currentTW = "II";
        targetTW = 50;
    }
    if (currentMonth > 6) {
        currentTW = "III";
        targetTW = 75;
    }
    if (currentMonth > 9) {
        currentTW = "IV";
        targetTW = 100;
    }

    const isTargetAchieved = dispPersen >= targetTW;

    return (
        <MainLayout tahun={tahun}>
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
                        className={`fixed top-24 right-10 z-[100] flex items-center p-4 min-w-[320px] rounded-xl border backdrop-blur-md ${toast.isExiting ? "toast-exit" : "toast-enter"} ${toast.type === "success" ? "bg-[#0A192F]/90 border-green-500/50 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "bg-[#0A192F]/90 border-red-500/50 text-white"}`}
                    >
                        <div
                            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full border ${toast.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
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
                                {toast.type === "success" ? "Sukses" : "Error"}
                            </h4>
                            <p className="text-sm font-medium text-gray-200 mt-0.5">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* Header & Tabs */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Input Transaksi
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Kelola Rencana Penarikan Dana (RPD) & Realisasi
                            Anggaran.
                        </p>
                    </div>

                    <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex w-full xl:w-auto bg-gray-50 p-1 rounded-xl border border-gray-200">
                            <button
                                onClick={() => {
                                    setActiveTab("rpd");
                                    setCurrentPage(1);
                                }}
                                className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${isRPD ? "bg-white text-indigo-600 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <CalendarRange size={16} /> RPD
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab("realisasi");
                                    setCurrentPage(1);
                                }}
                                className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${!isRPD ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <Receipt size={16} /> Realisasi
                            </button>
                        </div>

                        {/* --- FILTER & SEARCH BAR BARU --- */}
                        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                            {/* Filter Satker */}
                            <div className="relative w-full md:w-56">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Filter className="w-4 h-4 text-gray-400" />
                                </div>
                                <select
                                    value={selectedSatker}
                                    onChange={(e) => {
                                        setSelectedSatker(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700 appearance-none"
                                >
                                    <option value="">
                                        Semua Satker (Global)
                                    </option>
                                    {satkers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.kode_satker} - {s.nama_satker}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-56">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari Uraian..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <button
                                onClick={() =>
                                    isRPD
                                        ? setIsAddRpdOpen(true)
                                        : setIsAddRealOpen(true)
                                }
                                className={`flex items-center justify-center gap-2 px-5 py-2.5 ${accentColor} text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-all w-full md:w-auto`}
                            >
                                <Plus size={18} /> Tambah
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- SMART CARDS SUMMARY (Bisa Berubah Sesuai Filter Satker!) --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Card 1: Pagu Efektif */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {selectedSatker
                                    ? "Pagu Satker"
                                    : "Total Pagu Efektif"}
                            </p>
                            <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
                                {formatCurrency(dispPagu)}
                            </h3>
                        </div>
                    </div>
                    {/* Card 2: Total Input */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${isRPD ? "bg-indigo-50 text-indigo-500" : "bg-blue-50 text-blue-500"}`}
                        >
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Total {isRPD ? "RPD" : "Realisasi"}
                            </p>
                            <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
                                {formatCurrency(dispTotalInput)}
                            </h3>
                        </div>
                    </div>
                    {/* Card 3: Sisa Pagu */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${dispSisa < 0 ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"}`}
                        >
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Sisa Pagu ({isRPD ? "RPD" : "Real"})
                            </p>
                            <h3
                                className={`text-lg font-extrabold mt-0.5 ${dispSisa < 0 ? "text-rose-600" : "text-gray-900"}`}
                            >
                                {formatCurrency(dispSisa)}
                            </h3>
                        </div>
                    </div>
                    {/* Card 4: Progress & Triwulan (BARU!) */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Serapan {isRPD ? "RPD" : "Realisasi"}
                                </p>
                                {!isRPD && (
                                    <p className="text-[10px] font-extrabold text-indigo-500 mt-0.5 tracking-wide">
                                        TARGET TW {currentTW} : {targetTW}%
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <span
                                    className={`text-sm font-extrabold px-2 py-1 rounded-md ${!isRPD && !isTargetAchieved ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                                >
                                    {dispPersen.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                            <div
                                className={`h-2 rounded-full transition-all duration-1000 ${!isRPD && !isTargetAchieved ? "bg-rose-500" : "bg-emerald-500"}`}
                                style={{
                                    width: `${Math.min(dispPersen, 100)}%`,
                                }}
                            ></div>
                        </div>
                        {/* Peringatan Triwulan */}
                        {!isRPD && (
                            <p
                                className={`text-[10px] font-bold mt-2 text-right ${isTargetAchieved ? "text-emerald-600" : "text-rose-500"}`}
                            >
                                {isTargetAchieved
                                    ? "✅ Target TW Terpenuhi"
                                    : "⚠️ Belum memenuhi target TW"}
                            </p>
                        )}
                    </div>
                </div>

                {/* Tabel Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3
                            className={`text-sm font-extrabold flex items-center gap-2 ${textAccent}`}
                        >
                            {isRPD ? (
                                <CalendarRange size={18} />
                            ) : (
                                <Receipt size={18} />
                            )}
                            Daftar{" "}
                            {isRPD
                                ? "Rencana Penarikan Dana (RPD)"
                                : "Realisasi Pengeluaran"}
                        </h3>
                        {selectedSatker && (
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                Filter Aktif
                            </span>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead
                                className={`${lightBg} border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold`}
                            >
                                <tr>
                                    <th className="px-6 py-4">Bulan</th>
                                    <th className="px-6 py-4">Satuan Kerja</th>
                                    <th className="px-6 py-4 text-right">
                                        Belanja Gaji
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        Belanja Barang
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        Belanja Modal
                                    </th>
                                    <th
                                        className={`px-6 py-4 text-right ${textAccent}`}
                                    >
                                        Total
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
                                            colSpan="7"
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                            <p className="mt-2 text-sm text-gray-400">
                                                Memuat data...
                                            </p>
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-6 py-12 text-center text-gray-400 italic"
                                        >
                                            Belum ada data transaksi ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item) => {
                                        const total =
                                            Number(item.belanja_gaji) +
                                            Number(item.belanja_barang) +
                                            Number(item.belanja_modal);
                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-gray-50/50 transition-colors group"
                                            >
                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    {namaBulan[item.bulan - 1]}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">
                                                        {
                                                            item.satker
                                                                ?.nama_satker
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {
                                                            item.satker
                                                                ?.kode_satker
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">
                                                    {formatCurrency(
                                                        item.belanja_gaji,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">
                                                    {formatCurrency(
                                                        item.belanja_barang,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">
                                                    {formatCurrency(
                                                        item.belanja_modal,
                                                    )}
                                                </td>
                                                <td
                                                    className={`px-6 py-4 text-right font-extrabold ${lightBg} ${textAccent}`}
                                                >
                                                    {formatCurrency(total)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedData(
                                                                    item,
                                                                );
                                                                isRPD
                                                                    ? setIsEditRpdOpen(
                                                                          true,
                                                                      )
                                                                    : setIsEditRealOpen(
                                                                          true,
                                                                      );
                                                            }}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeleteId(
                                                                    item.id,
                                                                );
                                                                setIsDeleteOpen(
                                                                    true,
                                                                );
                                                            }}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"
                                                        >
                                                            <Trash2 size={16} />
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
                        onPageChange={setCurrentPage}
                        accentColor={accentColor}
                    />
                </div>

                <AddRpdModal
                    isOpen={isAddRpdOpen}
                    onClose={() => setIsAddRpdOpen(false)}
                    satkers={satkers}
                    defaultTahun={tahun}
                    onSuccess={handleSuccess}
                    satkerSummary={summary.per_satker}
                />
                <EditRpdModal
                    isOpen={isEditRpdOpen}
                    onClose={() => setIsEditRpdOpen(false)}
                    satkers={satkers}
                    editData={selectedData}
                    onSuccess={handleSuccess}
                    satkerSummary={summary.per_satker}
                />
                <AddRealisasiModal
                    isOpen={isAddRealOpen}
                    onClose={() => setIsAddRealOpen(false)}
                    satkers={satkers}
                    defaultTahun={tahun}
                    onSuccess={handleSuccess}
                    satkerSummary={summary.per_satker}
                />
                <EditRealisasiModal
                    isOpen={isEditRealOpen}
                    onClose={() => setIsEditRealOpen(false)}
                    satkers={satkers}
                    editData={selectedData}
                    onSuccess={handleSuccess}
                    satkerSummary={summary.per_satker}
                />
                <DeleteModal
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    isDeleting={isDeleting}
                    onConfirm={confirmDelete}
                    title={`Hapus Data ${isRPD ? "RPD" : "Realisasi"}`}
                />
            </div>
        </MainLayout>
    );
}
