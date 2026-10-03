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
    // 🔥 LOGIKA KALKULASI SUMMARY (PERBAIKAN SISA PAGU STATIS & DINAMIS 51, 52, 53)
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

    // 🔥 VARIABEL BARU UNTUK SISA PAGU DI HEADER TABEL 🔥
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
        <MainLayout tahun={tahun}>
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                @keyframes slideOutRight { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(120%) scale(0.9); opacity: 0; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
            `}</style>

            <div className="space-y-6 font-sans text-gray-600 relative overflow-hidden">
                {/* TOAST AREA */}
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

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Input Transaksi
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Kelola Rencana Penarikan Dana (RPD) & Realisasi
                                Anggaran.
                            </p>
                        </div>

                        {/* 🔥 NAVIGASI TAB TRIWULAN (TW) 🔥 */}
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 text-xs font-bold">
                            {["ALL", "I", "II", "III", "IV"].map((tw) => (
                                <button
                                    key={tw}
                                    onClick={() => setSelectedTW(tw)}
                                    className={`px-4 py-2 rounded-lg transition-all ${selectedTW === tw ? "bg-gray-800 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
                                >
                                    {tw === "ALL" ? "Setahun" : `TW ${tw}`}
                                </button>
                            ))}
                        </div>
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

                        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                            {isAdmin && (
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
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700 appearance-none cursor-pointer"
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

                {/* 🔥 CARD SUMMARY 🔥 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {!isAdmin || selectedSatker
                                    ? "Pagu Efektif Satker"
                                    : "Total Pagu Efektif"}
                            </p>
                            <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
                                {formatCurrency(dispPagu)}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${isRPD ? "bg-indigo-50 text-indigo-500" : "bg-blue-50 text-blue-500"}`}
                        >
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Total {isRPD ? "RPD" : "Realisasi"}{" "}
                                {selectedTW !== "ALL"
                                    ? `(TW ${selectedTW})`
                                    : "(Setahun)"}
                            </p>
                            <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
                                {formatCurrency(dispTotalInputTW)}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${dispSisaReal < 0 ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"}`}
                        >
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex flex-col">
                                <span>Sisa Dompet Pagu Efektif</span>
                            </p>
                            <h3
                                className={`text-lg font-extrabold mt-0.5 ${dispSisaReal < 0 ? "text-rose-600" : "text-gray-900"}`}
                            >
                                {formatCurrency(dispSisaReal)}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Serapan {isRPD ? "RPD" : "Realisasi"}{" "}
                                    {selectedTW !== "ALL" && `TW ${selectedTW}`}
                                </p>
                                {!isRPD && (
                                    <p className="text-[10px] font-extrabold text-indigo-500 mt-0.5 tracking-wide">
                                        TARGET KEMENKEU
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <span
                                    className={`text-sm font-extrabold px-2 py-1 rounded-md ${!isRPD && !isTargetAchieved ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                                >
                                    {dispPersen.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-1 relative">
                            {!isRPD && (
                                <div
                                    className="absolute top-0 bottom-0 border-r-2 border-indigo-400 z-10"
                                    style={{ left: "100%" }}
                                ></div>
                            )}
                            <div
                                className={`h-2 rounded-full transition-all duration-1000 ${!isRPD && !isTargetAchieved ? "bg-rose-500" : "bg-emerald-500"}`}
                                style={{
                                    width: `${Math.min(dispPersen, 100)}%`,
                                }}
                            ></div>
                        </div>
                        {!isRPD && (
                            <p
                                className={`text-[10px] font-bold mt-2 text-right ${isTargetAchieved ? "text-emerald-600" : "text-rose-500"}`}
                            >
                                {isTargetAchieved
                                    ? `✅ Memenuhi Target (${formatCurrency(dispTargetIKPARp)})`
                                    : `⚠️ Kurang ${formatCurrency(dispTargetIKPARp - dispTotalInputTW)}`}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3
                            className={`text-sm font-extrabold flex items-center gap-2 ${textAccent}`}
                        >
                            {isRPD ? (
                                <CalendarRange size={18} />
                            ) : (
                                <Receipt size={18} />
                            )}{" "}
                            Daftar{" "}
                            {isRPD
                                ? "Rencana Penarikan Dana (RPD)"
                                : "Realisasi Pengeluaran"}
                            {selectedTW !== "ALL" && (
                                <span className="ml-2 px-2 py-0.5 bg-gray-800 text-white rounded text-[10px]">
                                    Filter: TW {selectedTW}
                                </span>
                            )}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead
                                className={`${lightBg} border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold`}
                            >
                                <tr>
                                    <th className="px-6 py-4 align-top">
                                        Bulan
                                    </th>
                                    <th className="px-6 py-4 align-top">
                                        Satuan Kerja
                                    </th>
                                    {/* 🔥 PILAR UX BARU: SISA PAGU DI HEADER TABEL 🔥 */}
                                    <th className="px-6 py-4 text-right align-top">
                                        <div className="mb-1">
                                            Belanja Gaji (51)
                                        </div>
                                        <div
                                            className={`text-[9px] mt-1 font-bold tracking-wider inline-block px-2 py-0.5 rounded shadow-sm ${dispSisa51 < 0 ? "bg-rose-100 text-rose-600" : "bg-white text-emerald-600 border border-emerald-100"}`}
                                        >
                                            Sisa: {formatCurrency(dispSisa51)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right align-top">
                                        <div className="mb-1">
                                            Belanja Barang (52)
                                        </div>
                                        <div
                                            className={`text-[9px] mt-1 font-bold tracking-wider inline-block px-2 py-0.5 rounded shadow-sm ${dispSisa52 < 0 ? "bg-rose-100 text-rose-600" : "bg-white text-emerald-600 border border-emerald-100"}`}
                                        >
                                            Sisa: {formatCurrency(dispSisa52)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right align-top">
                                        <div className="mb-1">
                                            Belanja Modal (53)
                                        </div>
                                        <div
                                            className={`text-[9px] mt-1 font-bold tracking-wider inline-block px-2 py-0.5 rounded shadow-sm ${dispSisa53 < 0 ? "bg-rose-100 text-rose-600" : "bg-white text-emerald-600 border border-emerald-100"}`}
                                        >
                                            Sisa: {formatCurrency(dispSisa53)}
                                        </div>
                                    </th>
                                    <th
                                        className={`px-6 py-4 text-right align-top ${textAccent}`}
                                    >
                                        Total Transaksi
                                    </th>
                                    <th className="px-6 py-4 text-center align-top">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-center align-top">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="8"
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
                                            colSpan="8"
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
                                                    {namaBulan[item.bulan]}
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
                                                    {item.status ===
                                                        "approved" && (
                                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-[10px] font-black uppercase">
                                                            Disetujui
                                                        </span>
                                                    )}
                                                    {item.status ===
                                                        "rejected" && (
                                                        <div className="flex flex-col items-center">
                                                            <span
                                                                className="bg-rose-100 text-rose-700 px-3 py-1 rounded-md text-[10px] font-black uppercase mb-1 cursor-help"
                                                                title={
                                                                    item.catatan_revisi
                                                                }
                                                            >
                                                                Ditolak
                                                            </span>
                                                            {item.catatan_revisi && (
                                                                <span className="text-[9px] text-rose-500 w-24 truncate">
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
                                                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-[10px] font-black uppercase">
                                                            Menunggu
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
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
                                                                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200"
                                                                    title="Edit Data"
                                                                >
                                                                    <Edit
                                                                        size={
                                                                            16
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
                                                                    className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"
                                                                    title="Hapus Data"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            16
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
                                                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-200 ml-2"
                                                                    title="Setujui Data Ini"
                                                                >
                                                                    <CheckCircle
                                                                        size={
                                                                            16
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
                                                                    className="p-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 border border-orange-200"
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
