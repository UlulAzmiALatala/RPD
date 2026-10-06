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
    Activity,
    ShieldAlert,
    Target,
} from "lucide-react";

import AddRpdModal from "./Modals/AddRpdModal";
import EditRpdModal from "./Modals/EditRpdModal";
import AddRealisasiModal from "./Modals/AddRealisasiModal";
import EditRealisasiModal from "./Modals/EditRealisasiModal";
import DeleteModal from "./Modals/DeleteModal";
import RejectModal from "./Modals/RejectModal";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);

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

// ==========================================
// KOMPONEN PAGINATION PREMIUM
// ==========================================
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

    // Tentukan gradien berdasarkan accentColor (RPD = Indigo, Realisasi = Emerald/Blue)
    const activeBg = accentColor.includes("indigo")
        ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] border-indigo-500"
        : "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] border-blue-500";

    return (
        <div className="px-6 py-5 border-t border-slate-100/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/30 backdrop-blur-sm rounded-b-[2rem]">
            <p className="text-sm text-slate-500 font-medium">
                Menampilkan{" "}
                <span className="font-extrabold text-slate-800">
                    {from || 0}
                </span>{" "}
                -{" "}
                <span className="font-extrabold text-slate-800">{to || 0}</span>{" "}
                dari{" "}
                <span className="font-extrabold text-slate-800">{total}</span>
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
                                ? `${activeBg} hover:-translate-y-0.5`
                                : "bg-white text-slate-600 border-slate-200/60 hover:bg-slate-50"
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

export default function IndexTransaksi({ authUser }) {
    const [activeTab, setActiveTab] = useState("rpd");
    const [selectedTW, setSelectedTW] = useState("ALL");
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

    // State Modals
    const [isAddRpdOpen, setIsAddRpdOpen] = useState(false);
    const [isEditRpdOpen, setIsEditRpdOpen] = useState(false);
    const [isAddRealOpen, setIsAddRealOpen] = useState(false);
    const [isEditRealOpen, setIsEditRealOpen] = useState(false);
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
            () => setToast({ show: false }),
            4000,
        );
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
            let url = `${endpoint}?page=${page}&search=${search}&tahun=${tahun}&satker_id=${actualSatker}`;
            if (selectedTW !== "ALL") url += `&tw=${selectedTW}`;

            const res = await axios.get(url);
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
    }, [
        currentPage,
        searchTerm,
        selectedSatker,
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
            showToast("Gagal", "error");
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
    const isAdmin = localAuth?.role === "admin";

    // =========================================================================
    // 🔥 LOGIKA KALKULASI SUMMARY
    // =========================================================================
    const getMonthsInTW = (tw) => {
        if (tw === "I") return [1, 2, 3];
        if (tw === "II") return [4, 5, 6];
        if (tw === "III") return [7, 8, 9];
        if (tw === "IV") return [10, 11, 12];
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // ALL
    };

    const getTargetTW = (tw) => {
        if (tw === "I") return { gaji: 20, barang: 15, modal: 10 };
        if (tw === "II") return { gaji: 50, barang: 50, modal: 40 };
        if (tw === "III") return { gaji: 75, barang: 70, modal: 70 };
        return { gaji: 95, barang: 90, modal: 90 }; // ALL atau IV
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
        const targetKemenkeuGaji =
            satkerData.pagu_gaji * (targetPct.gaji / 100);
        const targetKemenkeuBarang =
            satkerData.pagu_barang * (targetPct.barang / 100);
        const targetKemenkeuModal =
            satkerData.pagu_modal * (targetPct.modal / 100);

        const finalTargetGaji = Math.min(targetKemenkeuGaji, paguGajiEfektif);
        const finalTargetBarang = Math.min(
            targetKemenkeuBarang,
            paguBarangEfektif,
        );
        const finalTargetModal = Math.min(
            targetKemenkeuModal,
            paguModalEfektif,
        );

        let inputTW = 0,
            inputALL = 0;
        let inputAll51 = 0,
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

                if (getMonthsInTW(selectedTW).includes(m)) {
                    inputTW += totalBulanIni;
                }
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
            const metrics = calculateSatkerMetrics(
                summary.per_satker[mySatker.id],
            );
            dispPagu = metrics.paguEfektif;
            dispTotalInputTW = metrics.totalInputTW;
            dispTotalInputALL = metrics.totalInputALL;
            dispTargetIKPARp = metrics.totalTarget;
            dispSisa51 = metrics.sisa51;
            dispSisa52 = metrics.sisa52;
            dispSisa53 = metrics.sisa53;
        }
    } else if (
        isAdmin &&
        selectedSatker &&
        summary.per_satker?.[selectedSatker]
    ) {
        const metrics = calculateSatkerMetrics(
            summary.per_satker[selectedSatker],
        );
        dispPagu = metrics.paguEfektif;
        dispTotalInputTW = metrics.totalInputTW;
        dispTotalInputALL = metrics.totalInputALL;
        dispTargetIKPARp = metrics.totalTarget;
        dispSisa51 = metrics.sisa51;
        dispSisa52 = metrics.sisa52;
        dispSisa53 = metrics.sisa53;
    } else if (summary.per_satker) {
        Object.values(summary.per_satker).forEach((s) => {
            const metrics = calculateSatkerMetrics(s);
            dispPagu += metrics.paguEfektif;
            dispTotalInputTW += metrics.totalInputTW;
            dispTotalInputALL += metrics.totalInputALL;
            dispTargetIKPARp += metrics.totalTarget;
            dispSisa51 += metrics.sisa51;
            dispSisa52 += metrics.sisa52;
            dispSisa53 += metrics.sisa53;
        });
    }

    const dispSisaReal = dispPagu - dispTotalInputALL;
    const dispPersen =
        dispTargetIKPARp > 0 ? (dispTotalInputTW / dispTargetIKPARp) * 100 : 0;
    const isTargetAchieved = dispTotalInputTW >= dispTargetIKPARp;

    return (
        <MainLayout authUser={authUser} tahun={tahun}>
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

            <div className="space-y-6 font-sans text-slate-600 relative overflow-hidden min-h-screen pb-10">
                {/* --- AMBIENT BACKGROUND GLOW --- */}
                <div
                    className={`absolute top-0 left-0 w-full h-96 transition-colors duration-700 pointer-events-none -z-10 ${isRPD ? "bg-gradient-to-b from-indigo-500/10 to-transparent" : "bg-gradient-to-b from-blue-500/10 to-transparent"}`}
                ></div>
                <div
                    className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-[100px] transition-colors duration-700 pointer-events-none -z-10 ${isRPD ? "bg-purple-500/10" : "bg-emerald-500/10"}`}
                ></div>

                {/* --- TOAST NOTIFICATION PREMIUM --- */}
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
                                {toast.type === "success" ? "Sukses" : "Gagal"}
                            </h4>
                            <p className="text-sm font-semibold text-slate-200 mt-0.5 leading-snug">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* --- HEADER & CONTROL PANEL (GLASSMORPHISM) --- */}
                <div className="glass-card p-6 md:p-8 rounded-[2rem] shadow-sm border border-white/60 relative overflow-hidden z-10 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div
                                className={`p-3.5 text-white rounded-2xl shadow-lg transition-colors duration-500 ${isRPD ? "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/30" : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"}`}
                            >
                                {isRPD ? (
                                    <CalendarRange
                                        size={28}
                                        strokeWidth={2.5}
                                    />
                                ) : (
                                    <Receipt size={28} strokeWidth={2.5} />
                                )}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    Ledger Transaksi
                                </h2>
                                <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
                                    Kelola Rencana Penarikan Dana (RPD) &
                                    Realisasi Anggaran.
                                </p>
                            </div>
                        </div>

                        {/* NAVIGASI TAB TRIWULAN (PILL STYLE) */}
                        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 text-xs font-bold shadow-inner">
                            {["ALL", "I", "II", "III", "IV"].map((tw) => (
                                <button
                                    key={tw}
                                    onClick={() => setSelectedTW(tw)}
                                    className={`px-5 py-2.5 rounded-xl transition-all duration-300 ${
                                        selectedTW === tw
                                            ? "bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.1)] scale-105 border border-slate-100"
                                            : "text-slate-500 hover:bg-slate-200/50"
                                    }`}
                                >
                                    {tw === "ALL" ? "Setahun" : `TW ${tw}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px w-full bg-slate-200/60 my-2"></div>

                    <div className="flex flex-col xl:flex-row justify-between items-center gap-5">
                        {/* TOGGLE RPD VS REALISASI (SEGMENTED CONTROL) */}
                        <div className="flex w-full xl:w-auto bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner relative">
                            <button
                                onClick={() => {
                                    setActiveTab("rpd");
                                    setCurrentPage(1);
                                }}
                                className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 z-10 ${
                                    isRPD
                                        ? "text-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.15)] bg-white border border-indigo-100 scale-105"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                }`}
                            >
                                <CalendarRange size={18} strokeWidth={2.5} />{" "}
                                RPD Halaman III
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab("realisasi");
                                    setCurrentPage(1);
                                }}
                                className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 z-10 ${
                                    !isRPD
                                        ? "text-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.15)] bg-white border border-blue-100 scale-105"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                }`}
                            >
                                <Receipt size={18} strokeWidth={2.5} /> Aktual
                                Realisasi
                            </button>
                        </div>

                        {/* FILTER & SEARCH */}
                        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                            {isAdmin && (
                                <div className="relative w-full md:w-56">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <Filter className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <select
                                        value={selectedSatker}
                                        onChange={(e) => {
                                            setSelectedSatker(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-slate-200/50 text-sm font-bold text-slate-700 appearance-none cursor-pointer shadow-sm outline-none transition-all"
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
                                </div>
                            )}

                            <div className="relative w-full md:w-56">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Search className="w-4 h-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari Uraian..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-slate-200/50 text-sm font-semibold shadow-sm outline-none transition-all placeholder:font-normal"
                                />
                            </div>

                            <button
                                onClick={() =>
                                    isRPD
                                        ? setIsAddRpdOpen(true)
                                        : setIsAddRealOpen(true)
                                }
                                className={`flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 w-full md:w-auto hover:-translate-y-1 ${
                                    isRPD
                                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 hover:shadow-indigo-500/40"
                                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:shadow-blue-500/40"
                                }`}
                            >
                                <Plus size={18} strokeWidth={2.5} /> Tambah Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* 🔥 CARD SUMMARY (DYNAMIC GLOW) 🔥 */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 relative z-10">
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex items-center gap-5 group">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <Wallet size={26} strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {!isAdmin || selectedSatker
                                    ? "Pagu Efektif Satker"
                                    : "Total Pagu Efektif"}
                            </p>
                            <h3 className="text-xl font-black text-slate-800 mt-1 tracking-tight">
                                {formatCurrency(dispPagu)}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex items-center gap-5 group">
                        <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 ${isRPD ? "bg-indigo-50 text-indigo-500" : "bg-blue-50 text-blue-500"}`}
                        >
                            <TrendingUp size={26} strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Total Input {isRPD ? "RPD" : "Realisasi"}{" "}
                                {selectedTW !== "ALL"
                                    ? `(TW ${selectedTW})`
                                    : "(Setahun)"}
                            </p>
                            <h3 className="text-xl font-black text-slate-800 mt-1 tracking-tight">
                                {formatCurrency(dispTotalInputTW)}
                            </h3>
                        </div>
                    </div>

                    <div
                        className={`bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 transition-all flex items-center gap-5 group ${dispSisaReal < 0 ? "shadow-[0_0_30px_rgba(225,29,72,0.15)] border-rose-200" : "shadow-sm hover:shadow-lg"}`}
                    >
                        <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 ${dispSisaReal < 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-50 text-emerald-500"}`}
                        >
                            {dispSisaReal < 0 ? (
                                <ShieldAlert size={26} strokeWidth={2} />
                            ) : (
                                <AlertCircle size={26} strokeWidth={2} />
                            )}
                        </div>
                        <div>
                            <p
                                className={`text-[10px] font-black uppercase tracking-widest ${dispSisaReal < 0 ? "text-rose-400" : "text-slate-400"}`}
                            >
                                Sisa Dompet Pagu
                            </p>
                            <h3
                                className={`text-xl font-black mt-1 tracking-tight ${dispSisaReal < 0 ? "text-rose-600" : "text-slate-800"}`}
                            >
                                {formatCurrency(dispSisaReal)}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-center relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Serapan {isRPD ? "RPD" : "Realisasi"}{" "}
                                    {selectedTW !== "ALL" && `TW ${selectedTW}`}
                                </p>
                                {!isRPD && (
                                    <p className="text-[9px] font-extrabold text-blue-500 mt-0.5 tracking-widest flex items-center gap-1">
                                        <Target size={10} /> TARGET KEMENKEU
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <span
                                    className={`text-sm font-black px-2.5 py-1 rounded-lg shadow-sm ${!isRPD && !isTargetAchieved ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                                >
                                    {dispPersen.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-200/80 rounded-full h-2.5 mt-1 relative shadow-inner overflow-hidden">
                            {!isRPD && (
                                <div
                                    className="absolute top-0 bottom-0 border-r-2 border-slate-800 z-10 shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                                    style={{ left: "100%" }}
                                ></div>
                            )}
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${!isRPD && !isTargetAchieved ? "bg-gradient-to-r from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.8)]" : "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"}`}
                                style={{
                                    width: `${Math.min(dispPersen, 100)}%`,
                                }}
                            ></div>
                        </div>
                        {!isRPD && (
                            <p
                                className={`text-[10px] font-black mt-3 text-right flex items-center justify-end gap-1 ${isTargetAchieved ? "text-emerald-600" : "text-rose-500"}`}
                            >
                                {isTargetAchieved ? (
                                    <>
                                        <CheckCircle size={12} /> Memenuhi
                                        Target (
                                        {formatCurrency(dispTargetIKPARp)})
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={12} /> Kurang{" "}
                                        {formatCurrency(
                                            dispTargetIKPARp - dispTotalInputTW,
                                        )}
                                    </>
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {/* 🔥 TABEL LEDGER FUTURISTIK 🔥 */}
                <div className="glass-card rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden relative z-10">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm flex justify-between items-center">
                        <h3
                            className={`text-sm font-black flex items-center gap-2 ${textAccent} uppercase tracking-widest`}
                        >
                            {isRPD ? (
                                <CalendarRange size={20} strokeWidth={2.5} />
                            ) : (
                                <Receipt size={20} strokeWidth={2.5} />
                            )}
                            Daftar{" "}
                            {isRPD
                                ? "Rencana Penarikan Dana (RPD)"
                                : "Realisasi Pengeluaran"}
                            {selectedTW !== "ALL" && (
                                <span className="ml-2 px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[9px] shadow-sm">
                                    Filter: TW {selectedTW}
                                </span>
                            )}
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead
                                className={`${lightBg} border-b border-slate-100 text-[10px] uppercase text-slate-500 font-black tracking-widest`}
                            >
                                <tr>
                                    <th className="px-6 py-5 align-top">
                                        Bulan
                                    </th>
                                    <th className="px-6 py-5 align-top">
                                        Satuan Kerja
                                    </th>
                                    <th className="px-6 py-5 text-right align-top">
                                        <div className="mb-2 text-slate-700">
                                            Belanja Pegawai (51)
                                        </div>
                                        <div
                                            className={`text-[9px] font-bold tracking-wider inline-block px-2.5 py-1 rounded-lg shadow-sm border ${dispSisa51 < 0 ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white text-emerald-600 border-emerald-100"}`}
                                        >
                                            Sisa: {formatCurrency(dispSisa51)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-5 text-right align-top">
                                        <div className="mb-2 text-slate-700">
                                            Belanja Barang (52)
                                        </div>
                                        <div
                                            className={`text-[9px] font-bold tracking-wider inline-block px-2.5 py-1 rounded-lg shadow-sm border ${dispSisa52 < 0 ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white text-emerald-600 border-emerald-100"}`}
                                        >
                                            Sisa: {formatCurrency(dispSisa52)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-5 text-right align-top">
                                        <div className="mb-2 text-slate-700">
                                            Belanja Modal (53)
                                        </div>
                                        <div
                                            className={`text-[9px] font-bold tracking-wider inline-block px-2.5 py-1 rounded-lg shadow-sm border ${dispSisa53 < 0 ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white text-emerald-600 border-emerald-100"}`}
                                        >
                                            Sisa: {formatCurrency(dispSisa53)}
                                        </div>
                                    </th>
                                    <th
                                        className={`px-6 py-5 text-right align-top ${textAccent}`}
                                    >
                                        Total Transaksi
                                    </th>
                                    <th className="px-6 py-5 text-center align-top">
                                        Status
                                    </th>
                                    <th className="px-6 py-5 text-center align-top">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-6 py-20 text-center"
                                        >
                                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent shadow-md"></div>
                                            <p className="mt-4 text-sm font-bold text-slate-400 tracking-wider">
                                                MENGAMBIL DATA LEDGER...
                                            </p>
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-6 py-20 text-center"
                                        >
                                            <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                {isRPD ? (
                                                    <CalendarRange
                                                        size={32}
                                                        className="text-slate-400"
                                                    />
                                                ) : (
                                                    <Receipt
                                                        size={32}
                                                        className="text-slate-400"
                                                    />
                                                )}
                                            </div>
                                            <p className="text-base font-bold text-slate-500">
                                                Belum ada data transaksi
                                                ditemukan.
                                            </p>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Ganti filter triwulan atau klik
                                                tombol Tambah Data.
                                            </p>
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
                                                className="hover:bg-slate-50/80 transition-colors duration-200 group"
                                            >
                                                <td className="px-6 py-5 font-black text-slate-800 text-base">
                                                    {namaBulan[item.bulan]}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="font-extrabold text-slate-800 text-sm max-w-[200px] truncate">
                                                        {
                                                            item.satker
                                                                ?.nama_satker
                                                        }
                                                    </div>
                                                    <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">
                                                        {
                                                            item.satker
                                                                ?.kode_satker
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right font-bold text-slate-600">
                                                    {formatCurrency(
                                                        item.belanja_gaji,
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right font-bold text-slate-600">
                                                    {formatCurrency(
                                                        item.belanja_barang,
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right font-bold text-slate-600">
                                                    {formatCurrency(
                                                        item.belanja_modal,
                                                    )}
                                                </td>
                                                <td
                                                    className={`px-6 py-5 text-right font-black text-base ${lightBg} ${textAccent}`}
                                                >
                                                    {formatCurrency(total)}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    {item.status ===
                                                        "approved" && (
                                                        <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                            Disetujui
                                                        </span>
                                                    )}
                                                    {item.status ===
                                                        "rejected" && (
                                                        <div className="flex flex-col items-center">
                                                            <span
                                                                className="bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest mb-1.5 shadow-sm cursor-help"
                                                                title={
                                                                    item.catatan_revisi
                                                                }
                                                            >
                                                                Ditolak
                                                            </span>
                                                            {item.catatan_revisi && (
                                                                <span className="text-[9px] text-rose-500 w-28 truncate font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
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
                                                        <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                            Menunggu
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-all duration-300">
                                                        {(item.status !==
                                                            "approved" ||
                                                            isAdmin) && (
                                                            <>
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
                                                                    className="p-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 hover:scale-110 transition-all shadow-sm border border-indigo-100"
                                                                    title="Edit Data"
                                                                >
                                                                    <Edit
                                                                        size={
                                                                            16
                                                                        }
                                                                        strokeWidth={
                                                                            2.5
                                                                        }
                                                                    />
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
                                                                    className="p-2 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white hover:scale-110 transition-all shadow-sm border border-rose-100"
                                                                    title="Hapus Data"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            16
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
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            item.id,
                                                                            "approved",
                                                                        )
                                                                    }
                                                                    className="p-2 bg-white text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white hover:scale-110 transition-all shadow-sm border border-emerald-100 ml-1"
                                                                    title="Setujui Data Ini"
                                                                >
                                                                    <CheckCircle
                                                                        size={
                                                                            16
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
                                                                    onClick={() => {
                                                                        setRejectData(
                                                                            item,
                                                                        );
                                                                        setIsRejectOpen(
                                                                            true,
                                                                        );
                                                                    }}
                                                                    className="p-2 bg-white text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white hover:scale-110 transition-all shadow-sm border border-amber-100"
                                                                    title={
                                                                        item.status ===
                                                                        "approved"
                                                                            ? "Cabut Persetujuan"
                                                                            : "Tolak Data Ini"
                                                                    }
                                                                >
                                                                    <XCircle
                                                                        size={
                                                                            16
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
