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
    ShieldAlert,
    Target,
    ChevronDown,
    ChevronUp,
    Layers,
    FileSpreadsheet,
    SlidersHorizontal,
    Calendar,
    CheckSquare,
    Loader2,
    X,
    Send,
    AlertTriangle,
} from "lucide-react";

import AddRpdModal from "./Modals/AddRpdModal";
import EditRpdModal from "./Modals/EditRpdModal";
import AddRealisasiModal from "./Modals/AddRealisasiModal";
import EditRealisasiModal from "./Modals/EditRealisasiModal";
import DeleteModal from "./Modals/DeleteModal";
import RejectModal from "./Modals/RejectModal";
import ImportExcelModal from "./Modals/ImportExcelModal";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount || 0);

const namaBulan = [
    "",
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
        let start = Math.max(1, current_page - 2);
        let end = Math.min(last_page, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const activeBg = accentColor.includes("indigo")
        ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] border-indigo-500"
        : "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] border-blue-500";

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
                data
            </p>
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 hover:shadow-sm disabled:opacity-40 transition-all cursor-pointer"
                >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                {getPageNumbers().map((page) => (
                    <button
                        type="button"
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all duration-200 shadow-sm border cursor-pointer ${
                            current_page === page
                                ? `${activeBg}`
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 hover:shadow-sm disabled:opacity-40 transition-all cursor-pointer"
                >
                    <ChevronRight size={16} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default function IndexTransaksi({ authUser }) {
    const [activeTab, setActiveTab] = useState("rpd");
    const [selectedTW, setSelectedTW] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [data, setData] = useState([]);
    const [satkers, setSatkers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSatker, setSelectedSatker] = useState("");
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());

    const [localAuth, setLocalAuth] = useState(authUser);
    const [summary, setSummary] = useState({ global: {}, per_satker: {} });
    const [expandedRows, setExpandedRows] = useState([]);

    // State Verifikasi Massal (Bulk Approval / Rejection)
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [isBulkRejectOpen, setIsBulkRejectOpen] = useState(false);
    const [bulkRejectNote, setBulkRejectNote] = useState("");

    // State Modals
    const [isAddRpdOpen, setIsAddRpdOpen] = useState(false);
    const [isEditRpdOpen, setIsEditRpdOpen] = useState(false);
    const [isAddRealOpen, setIsAddRealOpen] = useState(false);
    const [isEditRealOpen, setIsEditRealOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectData, setRejectData] = useState(null);

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

    const toggleRow = (id) => {
        setExpandedRows((prev) =>
            prev.includes(id)
                ? prev.filter((rowId) => rowId !== id)
                : [...prev, id],
        );
    };

    const toggleSelectId = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const allVisibleSelected =
        data.length > 0 && data.every((row) => selectedIds.includes(row.id));

    const toggleSelectAll = () => {
        if (allVisibleSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map((row) => row.id));
        }
    };

    useEffect(() => {
        if (!localAuth) {
            axios
                .get("/api/user")
                .then((res) => setLocalAuth(res.data))
                .catch((err) => console.log(err));
        } else {
            setLocalAuth(authUser);
        }
    }, [authUser]);

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
            .get("/api/users")
            .then((res) => {
                if (res.data.satkers) setSatkers(res.data.satkers);
            })
            .catch((err) => console.log(err));
        fetchSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tahun]);

    const fetchData = async (page = 1, search = "", satker = "") => {
        if (!localAuth || satkers.length === 0) return;
        setLoading(true);
        try {
            let actualSatker = satker;
            if (localAuth.role !== "admin") {
                const mySatker = satkers.find(
                    (s) => s.kode_satker === localAuth.kode_satker,
                );
                if (mySatker) actualSatker = mySatker.id;
                else {
                    setLoading(false);
                    return;
                }
            }

            const endpoint =
                activeTab === "rpd"
                    ? "/api/transaksi/rpd"
                    : "/api/transaksi/realisasi";
            const params = new URLSearchParams({
                page: String(page),
                search: search || "",
                tahun: String(tahun),
                satker_id: actualSatker ? String(actualSatker) : "",
            });
            if (selectedTW !== "ALL") params.append("tw", selectedTW);
            if (selectedStatus) params.append("status", selectedStatus);

            const res = await axios.get(`${endpoint}?${params.toString()}`);
            setData(res.data.data || []);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
                from: res.data.from,
                to: res.data.to,
            });
            setExpandedRows([]);
            setSelectedIds([]);
        } catch (err) {
            showToast("Gagal memuat data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(
            () => fetchData(currentPage, searchTerm, selectedSatker),
            350,
        );
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentPage,
        searchTerm,
        selectedSatker,
        selectedStatus,
        activeTab,
        selectedTW,
        tahun,
        localAuth,
        satkers,
    ]);

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

    const handleApprove = async (id, status) => {
        try {
            const endpoint =
                activeTab === "rpd"
                    ? `/api/transaksi/rpd/${id}/approve`
                    : `/api/transaksi/realisasi/${id}/approve`;
            const res = await axios.put(endpoint, {
                status,
                catatan_revisi: null,
            });
            showToast(res.data.message, "success");
            fetchData(currentPage, searchTerm, selectedSatker);
            fetchSummary();
        } catch (err) {
            showToast(err.response?.data?.message || "Gagal", "error");
        }
    };

    const handleRejectSubmit = async (id, catatan) => {
        try {
            const endpoint =
                activeTab === "rpd"
                    ? `/api/transaksi/rpd/${id}/approve`
                    : `/api/transaksi/realisasi/${id}/approve`;
            const res = await axios.put(endpoint, {
                status: "rejected",
                catatan_revisi: catatan,
            });
            showToast(res.data.message, "success");
            fetchData(currentPage, searchTerm, selectedSatker);
            fetchSummary();
        } catch (err) {
            showToast("Gagal menolak data.", "error");
        }
    };

    // Handler Verifikasi Massal (Approve / Reject)
    const handleBulkAction = async (status, catatan = null) => {
        if (selectedIds.length === 0) return;
        setIsBulkProcessing(true);
        try {
            const endpoint =
                activeTab === "rpd"
                    ? "/api/transaksi/rpd/bulk-approve"
                    : "/api/transaksi/realisasi/bulk-approve";
            const res = await axios.post(endpoint, {
                ids: selectedIds,
                status,
                catatan_revisi: status === "rejected" ? catatan : null,
            });
            showToast(
                res.data.message || "Verifikasi massal selesai!",
                "success",
            );
            setSelectedIds([]);
            setIsBulkRejectOpen(false);
            setBulkRejectNote("");
            fetchData(currentPage, searchTerm, selectedSatker);
            fetchSummary();
        } catch (err) {
            showToast(
                err.response?.data?.message ||
                    "Verifikasi massal gagal diproses.",
                "error",
            );
        } finally {
            setIsBulkProcessing(false);
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
    const lightBg = isRPD ? "bg-indigo-50/60" : "bg-blue-50/60";
    const textAccent = isRPD ? "text-indigo-600" : "text-blue-600";
    const isAdmin = localAuth?.role === "admin";

    const getMonthsInTW = (tw) => {
        if (tw === "I") return [1, 2, 3];
        if (tw === "II") return [4, 5, 6];
        if (tw === "III") return [7, 8, 9];
        if (tw === "IV") return [10, 11, 12];
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    };

    const getTargetTW = (tw) => {
        if (tw === "I") return { gaji: 20, barang: 15, modal: 10 };
        if (tw === "II") return { gaji: 50, barang: 50, modal: 40 };
        if (tw === "III") return { gaji: 75, barang: 70, modal: 70 };
        return { gaji: 95, barang: 90, modal: 90 };
    };

    let dispPagu = 0,
        dispTotalInputTW = 0,
        dispTotalInputALL = 0,
        dispTargetIKPARp = 0;
    let dispSisa51 = 0,
        dispSisa52 = 0,
        dispSisa53 = 0;

    const calculateSatkerMetrics = (satkerData) => {
        const paguGajiEfektif =
            (satkerData.pagu_gaji || 0) - (satkerData.blokir_gaji || 0);
        const paguBarangEfektif =
            (satkerData.pagu_barang || 0) - (satkerData.blokir_barang || 0);
        const paguModalEfektif =
            (satkerData.pagu_modal || 0) - (satkerData.blokir_modal || 0);

        const targetPct = getTargetTW(selectedTW);
        const finalTargetGaji = Math.min(
            satkerData.pagu_gaji * (targetPct.gaji / 100),
            paguGajiEfektif,
        );
        const finalTargetBarang = Math.min(
            satkerData.pagu_barang * (targetPct.barang / 100),
            paguBarangEfektif,
        );
        const finalTargetModal = Math.min(
            satkerData.pagu_modal * (targetPct.modal / 100),
            paguModalEfektif,
        );

        let inputTW = 0,
            inputALL = 0,
            inputAll51 = 0,
            inputAll52 = 0,
            inputAll53 = 0;

        for (let m = 1; m <= 12; m++) {
            if (satkerData.bulanan[m]) {
                const detail = isRPD
                    ? satkerData.bulanan[m].rpd_detail
                    : satkerData.bulanan[m].real_detail;
                const b51 = detail?.gaji || 0;
                const b52 = detail?.barang || 0;
                const b53 = detail?.modal || 0;
                const totalBulanIni = b51 + b52 + b53;

                inputALL += totalBulanIni;
                inputAll51 += b51;
                inputAll52 += b52;
                inputAll53 += b53;

                if (getMonthsInTW(selectedTW).includes(m))
                    inputTW += totalBulanIni;
            }
        }

        return {
            paguEfektif: paguGajiEfektif + paguBarangEfektif + paguModalEfektif,
            totalInputTW: inputTW,
            totalInputALL: inputALL,
            totalTarget: finalTargetGaji + finalTargetBarang + finalTargetModal,
            sisa51: paguGajiEfektif - inputAll51,
            sisa52: paguBarangEfektif - inputAll52,
            sisa53: paguModalEfektif - inputAll53,
        };
    };

    if (!isAdmin && localAuth?.kode_satker) {
        const mySatker = satkers.find(
            (s) => s.kode_satker === localAuth.kode_satker,
        );
        if (mySatker && summary.per_satker?.[mySatker.id]) {
            const m = calculateSatkerMetrics(summary.per_satker[mySatker.id]);
            dispPagu = m.paguEfektif;
            dispTotalInputTW = m.totalInputTW;
            dispTotalInputALL = m.totalInputALL;
            dispTargetIKPARp = m.totalTarget;
            dispSisa51 = m.sisa51;
            dispSisa52 = m.sisa52;
            dispSisa53 = m.sisa53;
        }
    } else if (
        isAdmin &&
        selectedSatker &&
        summary.per_satker?.[selectedSatker]
    ) {
        const m = calculateSatkerMetrics(summary.per_satker[selectedSatker]);
        dispPagu = m.paguEfektif;
        dispTotalInputTW = m.totalInputTW;
        dispTotalInputALL = m.totalInputALL;
        dispTargetIKPARp = m.totalTarget;
        dispSisa51 = m.sisa51;
        dispSisa52 = m.sisa52;
        dispSisa53 = m.sisa53;
    } else if (summary.per_satker) {
        Object.values(summary.per_satker).forEach((s) => {
            const m = calculateSatkerMetrics(s);
            dispPagu += m.paguEfektif;
            dispTotalInputTW += m.totalInputTW;
            dispTotalInputALL += m.totalInputALL;
            dispTargetIKPARp += m.totalTarget;
            dispSisa51 += m.sisa51;
            dispSisa52 += m.sisa52;
            dispSisa53 += m.sisa53;
        });
    }

    const dispSisaReal = dispPagu - dispTotalInputALL;
    const dispPersen =
        dispTargetIKPARp > 0 ? (dispTotalInputTW / dispTargetIKPARp) * 100 : 0;
    const isTargetAchieved = dispTotalInputTW >= dispTargetIKPARp;

    const totalCols = 8 + (isAdmin ? 1 : 0) + (!isRPD ? 1 : 0);

    return (
        <MainLayout authUser={authUser} tahun={tahun}>
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                @keyframes slideOutRight { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(120%) scale(0.9); opacity: 0; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
                .glass-card { background: rgba(255, 255, 255, 0.78); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
                .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

            <div className="space-y-6 font-sans text-slate-600 relative min-h-screen pb-10">
                <div
                    className={`absolute top-0 left-0 w-full h-80 transition-colors duration-700 pointer-events-none -z-10 ${
                        isRPD
                            ? "bg-gradient-to-b from-indigo-500/10 to-transparent"
                            : "bg-gradient-to-b from-blue-500/10 to-transparent"
                    }`}
                ></div>

                {/* TOAST */}
                {toast.show && (
                    <div
                        className={`fixed top-8 right-8 z-[100] flex items-center p-4 min-w-[320px] max-w-md rounded-2xl border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl ${
                            toast.isExiting ? "toast-exit" : "toast-enter"
                        } ${toast.type === "success" ? "bg-[#0A192F]/95 border-emerald-500/30" : "bg-[#0A192F]/95 border-rose-500/30"}`}
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
                                className={`text-[10px] font-black tracking-widest uppercase ${toast.type === "success" ? "text-emerald-400" : "text-rose-400"}`}
                            >
                                {toast.type === "success" ? "Sukses" : "Gagal"}
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
                            <div
                                className={`p-3.5 text-white rounded-2xl shadow-lg shrink-0 flex items-center justify-center transition-colors duration-500 ${
                                    isRPD
                                        ? "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/30"
                                        : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
                                }`}
                            >
                                {isRPD ? (
                                    <CalendarRange
                                        size={24}
                                        strokeWidth={2.5}
                                    />
                                ) : (
                                    <Receipt size={24} strokeWidth={2.5} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                                    Ledger Transaksi
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                                    Kelola Rencana Penarikan Dana (RPD),
                                    Realisasi Anggaran, Impor Excel &amp;
                                    Verifikasi Massal.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsImportOpen(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-xs sm:text-sm rounded-2xl border border-emerald-200/90 shadow-sm transition-all duration-200 whitespace-nowrap cursor-pointer hover:-translate-y-0.5"
                            >
                                <FileSpreadsheet size={17} strokeWidth={2.5} />
                                <span>Impor Excel</span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    isRPD
                                        ? setIsAddRpdOpen(true)
                                        : setIsAddRealOpen(true)
                                }
                                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all duration-200 whitespace-nowrap cursor-pointer hover:-translate-y-0.5 ${
                                    isRPD
                                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-500/25"
                                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25"
                                }`}
                            >
                                <Plus size={17} strokeWidth={2.5} />
                                <span>
                                    Tambah {isRPD ? "RPD" : "Realisasi"}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="h-px w-full bg-slate-200/70"></div>

                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div className="inline-flex w-full sm:w-auto bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70 shadow-inner">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("rpd");
                                    setCurrentPage(1);
                                }}
                                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap cursor-pointer ${
                                    isRPD
                                        ? "bg-white text-indigo-600 shadow-sm border border-indigo-100"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                <CalendarRange size={16} strokeWidth={2.5} />
                                <span>RPD Halaman III</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("realisasi");
                                    setCurrentPage(1);
                                }}
                                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap cursor-pointer ${
                                    !isRPD
                                        ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                <Receipt size={16} strokeWidth={2.5} />
                                <span>Aktual Realisasi</span>
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="flex flex-1 sm:flex-none bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 text-xs font-bold shadow-inner overflow-x-auto">
                                {["ALL", "I", "II", "III", "IV"].map((tw) => (
                                    <button
                                        type="button"
                                        key={tw}
                                        onClick={() => {
                                            setSelectedTW(tw);
                                            setCurrentPage(1);
                                        }}
                                        className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                                            selectedTW === tw
                                                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        {tw === "ALL" ? "Setahun" : `TW ${tw}`}
                                    </button>
                                ))}
                            </div>

                            <div className="relative shrink-0">
                                <Calendar
                                    size={14}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none"
                                />
                                <select
                                    value={tahun}
                                    onChange={(e) => {
                                        setTahun(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 cursor-pointer appearance-none"
                                >
                                    {[...Array(5)].map((_, i) => {
                                        const yr =
                                            new Date().getFullYear() - 2 + i;
                                        return (
                                            <option key={yr} value={yr}>
                                                T.A {yr}
                                            </option>
                                        );
                                    })}
                                </select>
                                <ChevronDown
                                    size={14}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. 4 KARTU KPI SUMMARY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                {!isAdmin || selectedSatker
                                    ? "Pagu Efektif Satker"
                                    : "Total Pagu Efektif"}
                            </p>
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                <Wallet size={18} strokeWidth={2.2} />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h3
                                title={formatCurrency(dispPagu)}
                                className="text-lg 2xl:text-xl font-black text-slate-900 tracking-tight tabular-nums truncate"
                            >
                                {formatCurrency(dispPagu)}
                            </h3>
                            <p className="text-[10px] font-semibold text-slate-400 mt-1">
                                Plafon aktif Tahun Anggaran {tahun}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                Total {isRPD ? "RPD" : "Realisasi"}{" "}
                                {selectedTW !== "ALL"
                                    ? `(TW ${selectedTW})`
                                    : "(Setahun)"}
                            </p>
                            <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isRPD ? "bg-indigo-50 text-indigo-600" : "bg-blue-50 text-blue-600"}`}
                            >
                                <TrendingUp size={18} strokeWidth={2.2} />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h3
                                title={formatCurrency(dispTotalInputTW)}
                                className={`text-lg 2xl:text-xl font-black tracking-tight tabular-nums truncate ${isRPD ? "text-indigo-700" : "text-blue-700"}`}
                            >
                                {formatCurrency(dispTotalInputTW)}
                            </h3>
                            <p className="text-[10px] font-semibold text-slate-400 mt-1">
                                Akumulasi status Disetujui (Approved)
                            </p>
                        </div>
                    </div>

                    <div
                        className={`bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border transition-all flex flex-col justify-between gap-3 min-w-0 ${
                            dispSisaReal < 0
                                ? "border-rose-200 shadow-[0_0_25px_rgba(225,29,72,0.12)]"
                                : "border-white shadow-sm hover:shadow-md"
                        }`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <p
                                className={`text-[10px] font-black uppercase tracking-widest truncate ${dispSisaReal < 0 ? "text-rose-500" : "text-slate-400"}`}
                            >
                                Sisa Dompet Pagu
                            </p>
                            <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${dispSisaReal < 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
                            >
                                {dispSisaReal < 0 ? (
                                    <ShieldAlert size={18} strokeWidth={2.2} />
                                ) : (
                                    <AlertCircle size={18} strokeWidth={2.2} />
                                )}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h3
                                title={formatCurrency(dispSisaReal)}
                                className={`text-lg 2xl:text-xl font-black tracking-tight tabular-nums truncate ${dispSisaReal < 0 ? "text-rose-600" : "text-emerald-700"}`}
                            >
                                {formatCurrency(dispSisaReal)}
                            </h3>
                            <p className="text-[10px] font-semibold text-slate-400 mt-1">
                                {dispSisaReal < 0
                                    ? "Melebihi batas pagu efektif!"
                                    : "Saldo efektif masih tersedia"}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                    Serapan {isRPD ? "RPD" : "Realisasi"}{" "}
                                    {selectedTW !== "ALL" && `TW ${selectedTW}`}
                                </p>
                                {!isRPD && (
                                    <p className="text-[9px] font-extrabold text-blue-500 mt-0.5 tracking-wider flex items-center gap-1">
                                        <Target size={10} /> TARGET KEMENKEU
                                    </p>
                                )}
                            </div>
                            <span
                                className={`text-xs font-black px-2.5 py-1 rounded-xl shrink-0 tabular-nums ${
                                    !isRPD && !isTargetAchieved
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-emerald-100 text-emerald-700"
                                }`}
                            >
                                {dispPersen.toFixed(1)}%
                            </span>
                        </div>
                        <div>
                            <div className="w-full bg-slate-200/80 rounded-full h-2.5 relative shadow-inner overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                        !isRPD && !isTargetAchieved
                                            ? "bg-gradient-to-r from-rose-400 to-rose-500"
                                            : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                                    }`}
                                    style={{
                                        width: `${Math.min(dispPersen, 100)}%`,
                                    }}
                                ></div>
                            </div>
                            <p
                                className={`text-[10px] font-bold mt-2 truncate flex items-center gap-1 ${
                                    !isRPD
                                        ? isTargetAchieved
                                            ? "text-emerald-600"
                                            : "text-rose-500"
                                        : "text-slate-400"
                                }`}
                            >
                                {!isRPD ? (
                                    isTargetAchieved ? (
                                        <>
                                            <CheckCircle
                                                size={11}
                                                className="shrink-0"
                                            />
                                            <span className="truncate">
                                                Lulus Target (
                                                {formatCurrency(
                                                    dispTargetIKPARp,
                                                )}
                                                )
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle
                                                size={11}
                                                className="shrink-0"
                                            />
                                            <span className="truncate">
                                                Kurang{" "}
                                                {formatCurrency(
                                                    dispTargetIKPARp -
                                                        dispTotalInputTW,
                                                )}
                                            </span>
                                        </>
                                    )
                                ) : (
                                    <span className="truncate">
                                        Acuan Target:{" "}
                                        {formatCurrency(dispTargetIKPARp)}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. DATA TABLE CARD + BULK ACTION BAR */}
                <div className="glass-card rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden relative z-10">
                    {/* Header Tabel + Filter Strip */}
                    <div className="p-5 sm:px-6 border-b border-slate-100 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span
                                className={`p-2 rounded-xl shrink-0 ${isRPD ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600"}`}
                            >
                                {isRPD ? (
                                    <CalendarRange
                                        size={18}
                                        strokeWidth={2.5}
                                    />
                                ) : (
                                    <Receipt size={18} strokeWidth={2.5} />
                                )}
                            </span>
                            <div className="min-w-0">
                                <h3
                                    className={`text-xs sm:text-sm font-black uppercase tracking-wider truncate ${textAccent}`}
                                >
                                    Daftar{" "}
                                    {isRPD
                                        ? "Rencana Penarikan Dana (RPD)"
                                        : "Realisasi Pengeluaran & Kaitan RO"}
                                </h3>
                                <p className="text-[11px] font-medium text-slate-400">
                                    Periode:{" "}
                                    <strong className="text-slate-600">
                                        {selectedTW === "ALL"
                                            ? `Setahun (${tahun})`
                                            : `Triwulan ${selectedTW} (${tahun})`}
                                    </strong>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto lg:min-w-[540px]">
                            {isAdmin ? (
                                <div className="relative">
                                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                        value={selectedSatker}
                                        onChange={(e) => {
                                            setSelectedSatker(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none cursor-pointer shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 truncate"
                                    >
                                        <option value="">
                                            Semua Satker (Global)
                                        </option>
                                        {satkers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.kode_satker} -{" "}
                                                {s.nama_satker}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={14}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                    />
                                </div>
                            ) : (
                                <div className="hidden sm:block"></div>
                            )}

                            <div className="relative">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none cursor-pointer shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="approved">Disetujui</option>
                                    <option value="draft">Menunggu</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                                <ChevronDown
                                    size={14}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                />
                            </div>

                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Cari Satker..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 placeholder:font-normal"
                                />
                            </div>
                        </div>
                    </div>

                    {/* BULK APPROVAL ACTION BAR (KHUSUS ADMIN SAAT ADA DATA DICENTANG) */}
                    {isAdmin && selectedIds.length > 0 && (
                        <div className="px-6 py-3.5 bg-gradient-to-r from-[#0B1120] via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                                    <CheckSquare size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-black tracking-wide">
                                        {selectedIds.length} Data{" "}
                                        {isRPD ? "RPD" : "Realisasi"} Terpilih
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-semibold">
                                        Pilih aksi verifikasi massal untuk
                                        memproses seluruh baris terpilih
                                        sekaligus.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    disabled={isBulkProcessing}
                                    onClick={() => handleBulkAction("approved")}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isBulkProcessing ? (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <CheckCircle
                                            size={14}
                                            strokeWidth={2.5}
                                        />
                                    )}
                                    Setujui Terpilih ({selectedIds.length})
                                </button>
                                <button
                                    type="button"
                                    disabled={isBulkProcessing}
                                    onClick={() => setIsBulkRejectOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    <XCircle size={14} strokeWidth={2.5} />
                                    Tolak Terpilih
                                </button>
                                <button
                                    type="button"
                                    disabled={isBulkProcessing}
                                    onClick={() => setSelectedIds([])}
                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                                >
                                    <X size={14} /> Batal
                                </button>
                            </div>
                        </div>
                    )}

                    {/* DATA TABLE */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead
                                className={`${lightBg} border-b border-slate-200/70 text-[10px] uppercase text-slate-500 font-black tracking-wider`}
                            >
                                <tr>
                                    {isAdmin && (
                                        <th className="px-4 py-4 w-10 text-center align-middle">
                                            <input
                                                type="checkbox"
                                                checked={allVisibleSelected}
                                                onChange={toggleSelectAll}
                                                disabled={data.length === 0}
                                                title="Pilih semua baris di halaman ini"
                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </th>
                                    )}
                                    {!isRPD && (
                                        <th className="px-3 py-4 w-10 text-center"></th>
                                    )}
                                    <th className="px-4 py-4 align-top">
                                        Bulan
                                    </th>
                                    <th className="px-4 py-4 align-top">
                                        Satuan Kerja
                                    </th>
                                    <th className="px-4 py-4 text-right align-top">
                                        <div className="mb-1.5 text-slate-700">
                                            Belanja Pegawai (51)
                                        </div>
                                        <div
                                            className={`text-[9px] font-bold tracking-normal tabular-nums inline-block px-2 py-0.5 rounded-md border ${
                                                dispSisa51 < 0
                                                    ? "bg-rose-50 text-rose-600 border-rose-200"
                                                    : "bg-white text-emerald-600 border-emerald-200/80"
                                            }`}
                                        >
                                            Sisa: {formatCurrency(dispSisa51)}
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-right align-top">
                                        <div className="mb-1.5 text-slate-700">
                                            Belanja Barang (52)
                                        </div>
                                        <div
                                            className={`text-[9px] font-bold tracking-normal tabular-nums inline-block px-2 py-0.5 rounded-md border ${
                                                dispSisa52 < 0
                                                    ? "bg-rose-50 text-rose-600 border-rose-200"
                                                    : "bg-white text-emerald-600 border-emerald-200/80"
                                            }`}
                                        >
                                            Sisa: {formatCurrency(dispSisa52)}
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-right align-top">
                                        <div className="mb-1.5 text-slate-700">
                                            Belanja Modal (53)
                                        </div>
                                        <div
                                            className={`text-[9px] font-bold tracking-normal tabular-nums inline-block px-2 py-0.5 rounded-md border ${
                                                dispSisa53 < 0
                                                    ? "bg-rose-50 text-rose-600 border-rose-200"
                                                    : "bg-white text-emerald-600 border-emerald-200/80"
                                            }`}
                                        >
                                            Sisa: {formatCurrency(dispSisa53)}
                                        </div>
                                    </th>
                                    <th
                                        className={`px-4 py-4 text-right align-top ${textAccent}`}
                                    >
                                        Total Transaksi
                                    </th>
                                    <th className="px-4 py-4 text-center align-top">
                                        Status
                                    </th>
                                    <th className="px-4 py-4 text-center align-top">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={totalCols}
                                            className="px-6 py-20 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent shadow-md"></div>
                                            <p className="mt-4 text-xs font-black text-slate-400 tracking-widest uppercase">
                                                Mengambil Data Ledger...
                                            </p>
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={totalCols}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                                                {isRPD ? (
                                                    <CalendarRange size={28} />
                                                ) : (
                                                    <Receipt size={28} />
                                                )}
                                            </div>
                                            <p className="text-base font-black text-slate-700">
                                                Belum ada data{" "}
                                                {isRPD ? "RPD" : "Realisasi"}{" "}
                                                ditemukan
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium mt-1 mb-5">
                                                Tambahkan data baru secara
                                                manual atau impor rekap Excel
                                                sekaligus.
                                            </p>
                                            <div className="inline-flex flex-wrap items-center justify-center gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIsImportOpen(true)
                                                    }
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                                                >
                                                    <FileSpreadsheet
                                                        size={14}
                                                    />{" "}
                                                    Impor Excel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        isRPD
                                                            ? setIsAddRpdOpen(
                                                                  true,
                                                              )
                                                            : setIsAddRealOpen(
                                                                  true,
                                                              )
                                                    }
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer ${
                                                        isRPD
                                                            ? "bg-indigo-600 hover:bg-indigo-700"
                                                            : "bg-blue-600 hover:bg-blue-700"
                                                    }`}
                                                >
                                                    <Plus size={14} /> Tambah
                                                    Data
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item) => {
                                        const total =
                                            Number(item.belanja_gaji) +
                                            Number(item.belanja_barang) +
                                            Number(item.belanja_modal);
                                        const isExpanded =
                                            expandedRows.includes(item.id);
                                        const isChecked = selectedIds.includes(
                                            item.id,
                                        );

                                        return (
                                            <React.Fragment key={item.id}>
                                                <tr
                                                    className={`hover:bg-slate-50/90 transition-colors duration-150 group ${
                                                        isChecked
                                                            ? "bg-indigo-50/50"
                                                            : isExpanded
                                                              ? "bg-blue-50/40"
                                                              : ""
                                                    }`}
                                                >
                                                    {isAdmin && (
                                                        <td className="px-4 py-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    isChecked
                                                                }
                                                                onChange={() =>
                                                                    toggleSelectId(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                            />
                                                        </td>
                                                    )}

                                                    {!isRPD && (
                                                        <td className="px-3 py-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleRow(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className={`p-1.5 rounded-lg border shadow-sm transition-all cursor-pointer focus:outline-none ${
                                                                    isExpanded
                                                                        ? "bg-blue-600 border-blue-600 text-white"
                                                                        : "bg-white border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300"
                                                                }`}
                                                                title="Lihat Rincian RO"
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronUp
                                                                        size={
                                                                            15
                                                                        }
                                                                        strokeWidth={
                                                                            3
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <ChevronDown
                                                                        size={
                                                                            15
                                                                        }
                                                                        strokeWidth={
                                                                            3
                                                                        }
                                                                    />
                                                                )}
                                                            </button>
                                                        </td>
                                                    )}

                                                    <td className="px-4 py-4 font-black text-slate-800 text-sm">
                                                        {namaBulan[item.bulan]}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="font-extrabold text-slate-800 text-xs sm:text-sm max-w-[200px] truncate">
                                                            {
                                                                item.satker
                                                                    ?.nama_satker
                                                            }
                                                        </div>
                                                        <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-0.5">
                                                            {
                                                                item.satker
                                                                    ?.kode_satker
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-bold text-slate-600 tabular-nums text-xs sm:text-sm">
                                                        {formatCurrency(
                                                            item.belanja_gaji,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-bold text-slate-600 tabular-nums text-xs sm:text-sm">
                                                        {formatCurrency(
                                                            item.belanja_barang,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-bold text-slate-600 tabular-nums text-xs sm:text-sm">
                                                        {formatCurrency(
                                                            item.belanja_modal,
                                                        )}
                                                    </td>
                                                    <td
                                                        className={`px-4 py-4 text-right font-black tabular-nums text-sm ${lightBg} ${textAccent}`}
                                                    >
                                                        {formatCurrency(total)}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {item.status ===
                                                            "approved" && (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                                                                Disetujui
                                                            </span>
                                                        )}
                                                        {item.status ===
                                                            "rejected" && (
                                                            <div className="flex flex-col items-center">
                                                                <span
                                                                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black uppercase tracking-wider mb-1 cursor-help"
                                                                    title={
                                                                        item.catatan_revisi
                                                                    }
                                                                >
                                                                    Ditolak
                                                                </span>
                                                                {item.catatan_revisi && (
                                                                    <span className="text-[9px] text-rose-500 max-w-[110px] truncate font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                                                        "
                                                                        {
                                                                            item.catatan_revisi
                                                                        }
                                                                        "
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {(!item.status ||
                                                            item.status ===
                                                                "draft") && (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
                                                                Menunggu
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {(item.status !==
                                                                "approved" ||
                                                                isAdmin) && (
                                                                <>
                                                                    <button
                                                                        type="button"
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
                                                                        className="p-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all shadow-sm border border-indigo-100 cursor-pointer"
                                                                        title="Edit Data"
                                                                    >
                                                                        <Edit
                                                                            size={
                                                                                15
                                                                            }
                                                                            strokeWidth={
                                                                                2.5
                                                                            }
                                                                        />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setDeleteId(
                                                                                item.id,
                                                                            );
                                                                            setIsDeleteOpen(
                                                                                true,
                                                                            );
                                                                        }}
                                                                        className="p-2 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 cursor-pointer"
                                                                        title="Hapus Data"
                                                                    >
                                                                        <Trash2
                                                                            size={
                                                                                15
                                                                            }
                                                                            strokeWidth={
                                                                                2.5
                                                                            }
                                                                        />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {isAdmin &&
                                                                item.status !==
                                                                    "approved" && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleApprove(
                                                                                item.id,
                                                                                "approved",
                                                                            )
                                                                        }
                                                                        className="p-2 bg-white text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100 cursor-pointer"
                                                                        title="Setujui Data Ini"
                                                                    >
                                                                        <CheckCircle
                                                                            size={
                                                                                15
                                                                            }
                                                                            strokeWidth={
                                                                                2.5
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                            {isAdmin &&
                                                                item.status !==
                                                                    "rejected" && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setRejectData(
                                                                                item,
                                                                            );
                                                                            setIsRejectOpen(
                                                                                true,
                                                                            );
                                                                        }}
                                                                        className="p-2 bg-white text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm border border-amber-100 cursor-pointer"
                                                                        title={
                                                                            item.status ===
                                                                            "approved"
                                                                                ? "Cabut Persetujuan"
                                                                                : "Tolak Data Ini"
                                                                        }
                                                                    >
                                                                        <XCircle
                                                                            size={
                                                                                15
                                                                            }
                                                                            strokeWidth={
                                                                                2.5
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {!isRPD && isExpanded && (
                                                    <tr className="bg-slate-50/90 border-b border-slate-200">
                                                        <td
                                                            colSpan={totalCols}
                                                            className="p-5 whitespace-normal"
                                                        >
                                                            <div className="bg-white rounded-2xl border border-slate-200 shadow-inner p-5">
                                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                                                    <Layers
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="text-blue-500"
                                                                    />
                                                                    Keterlacakan
                                                                    Transaksi
                                                                    &amp;
                                                                    Rincian
                                                                    Output (RO)
                                                                </h4>
                                                                <div className="grid grid-cols-1 gap-2.5">
                                                                    {item.details &&
                                                                    item.details
                                                                        .length >
                                                                        0 ? (
                                                                        item.details.map(
                                                                            (
                                                                                detail,
                                                                                idx,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        detail.id ||
                                                                                        idx
                                                                                    }
                                                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                                                                                >
                                                                                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                                                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-[11px] text-slate-500 border border-slate-200 shrink-0">
                                                                                            {detail.jenis_belanja ===
                                                                                            "gaji"
                                                                                                ? "51"
                                                                                                : detail.jenis_belanja ===
                                                                                                    "barang"
                                                                                                  ? "52"
                                                                                                  : "53"}
                                                                                        </div>
                                                                                        <div className="min-w-0">
                                                                                            <p className="text-sm font-bold text-slate-800 leading-snug">
                                                                                                {
                                                                                                    detail.uraian
                                                                                                }
                                                                                            </p>
                                                                                            {detail.rincian_output ? (
                                                                                                <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-md text-[10px] font-bold">
                                                                                                    <Target
                                                                                                        size={
                                                                                                            10
                                                                                                        }
                                                                                                        className="text-indigo-500 shrink-0"
                                                                                                    />
                                                                                                    <span>
                                                                                                        RO:
                                                                                                        [
                                                                                                        {
                                                                                                            detail
                                                                                                                .rincian_output
                                                                                                                .kode_ro
                                                                                                        }
                                                                                                        ]{" "}
                                                                                                        {
                                                                                                            detail
                                                                                                                .rincian_output
                                                                                                                .nama_ro
                                                                                                        }
                                                                                                    </span>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="inline-flex items-center mt-1.5 px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-md text-[10px] font-bold">
                                                                                                    Tanpa
                                                                                                    Rincian
                                                                                                    Output
                                                                                                    (Umum)
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="sm:text-right pl-13 sm:pl-0 shrink-0">
                                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                                            Nominal
                                                                                        </p>
                                                                                        <p className="text-sm font-black text-slate-800 font-mono tabular-nums">
                                                                                            {formatCurrency(
                                                                                                detail.nominal,
                                                                                            )}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )
                                                                    ) : (
                                                                        <div className="text-center p-4 text-slate-400 text-xs font-bold">
                                                                            Tidak
                                                                            ada
                                                                            rincian
                                                                            transaksi.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
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

                {/* MODAL TOLAK MASSAL */}
                {isBulkRejectOpen && (
                    <div className="fixed top-0 left-0 w-screen h-screen z-[120] flex items-center justify-center p-4 bg-[#0B1120]/80 backdrop-blur-md">
                        <div className="bg-white rounded-[2.25rem] shadow-2xl w-full max-w-md overflow-hidden border border-white">
                            <div className="px-6 py-5 border-b border-slate-100 bg-rose-50/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-sm">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">
                                            Tolak Massal ({selectedIds.length}{" "}
                                            Data)
                                        </h3>
                                        <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                                            Verifikasi{" "}
                                            {isRPD ? "RPD" : "Realisasi"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsBulkRejectOpen(false)}
                                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!bulkRejectNote.trim()) return;
                                    handleBulkAction(
                                        "rejected",
                                        bulkRejectNote.trim(),
                                    );
                                }}
                                className="p-6 space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-black text-slate-700 mb-1.5">
                                        Catatan Penolakan / Revisi Massal{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows="4"
                                        required
                                        value={bulkRejectNote}
                                        onChange={(e) =>
                                            setBulkRejectNote(e.target.value)
                                        }
                                        placeholder="Catatan ini akan diterapkan dan dikirim ke seluruh Satker yang datanya terpilih..."
                                        className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 resize-none"
                                    />
                                </div>
                                <div className="flex gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsBulkRejectOpen(false)
                                        }
                                        disabled={isBulkProcessing}
                                        className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            isBulkProcessing ||
                                            !bulkRejectNote.trim()
                                        }
                                        className="flex-[1.6] inline-flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isBulkProcessing ? (
                                            <Loader2
                                                size={15}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Send size={15} />
                                        )}
                                        Tolak {selectedIds.length} Data
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODALS */}
                <AddRpdModal
                    isOpen={isAddRpdOpen}
                    onClose={() => setIsAddRpdOpen(false)}
                    satkers={satkers}
                    defaultTahun={tahun}
                    onSuccess={handleSuccess}
                    satkerSummary={summary.per_satker}
                    localAuth={localAuth}
                />
                <EditRpdModal
                    isOpen={isEditRpdOpen}
                    onClose={() => setIsEditRpdOpen(false)}
                    satkers={satkers}
                    editData={selectedData}
                    onSuccess={handleSuccess}
                    satkerSummary={summary.per_satker}
                    localAuth={localAuth}
                />
                <AddRealisasiModal
                    isOpen={isAddRealOpen}
                    onClose={() => setIsAddRealOpen(false)}
                    satkers={satkers}
                    defaultTahun={tahun}
                    onSuccess={handleSuccess}
                    satkerSummary={summary.per_satker}
                    localAuth={localAuth}
                />
                <EditRealisasiModal
                    isOpen={isEditRealOpen}
                    onClose={() => setIsEditRealOpen(false)}
                    satkers={satkers}
                    editData={selectedData}
                    onSuccess={handleSuccess}
                    satkerSummary={summary.per_satker}
                    localAuth={localAuth}
                />
                <ImportExcelModal
                    isOpen={isImportOpen}
                    onClose={() => setIsImportOpen(false)}
                    onSuccess={handleSuccess}
                    activeTab={activeTab}
                    satkers={satkers}
                    defaultTahun={tahun}
                    localAuth={localAuth}
                />
                <DeleteModal
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    isDeleting={isDeleting}
                    onConfirm={confirmDelete}
                    title={`Hapus Data ${isRPD ? "RPD" : "Realisasi"}`}
                />
                <RejectModal
                    isOpen={isRejectOpen}
                    onClose={() => setIsRejectOpen(false)}
                    data={rejectData}
                    onConfirm={handleRejectSubmit}
                />
            </div>
        </MainLayout>
    );
}
