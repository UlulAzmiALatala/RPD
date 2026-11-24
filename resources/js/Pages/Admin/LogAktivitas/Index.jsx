import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import MainLayout from "../../../Layouts/MainLayout";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Activity,
    Clock,
    User,
    Server,
    ShieldAlert,
    RefreshCw,
    FileSpreadsheet,
    Pause,
    Play,
    PlusCircle,
    Edit3,
    Trash2,
    Globe,
    Loader2,
    Filter,
} from "lucide-react";

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
                rekaman aktivitas
            </p>
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
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
                                ? "bg-gradient-to-br from-slate-800 to-slate-950 text-emerald-400 border-slate-800 shadow-slate-300"
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
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                >
                    <ChevronRight size={16} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default function IndexLogAktivitas({ authUser }) {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);

    const [autoSync, setAutoSync] = useState(true);
    const [isPolling, setIsPolling] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const fetchLogs = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        else setIsPolling(true);

        try {
            const response = await axios.get(
                `/api/activity-logs?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`,
            );
            setLogs(response.data.data || []);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                from: response.data.from,
                to: response.data.to,
            });
        } catch (err) {
            console.error("Gagal memuat log aktivitas", err);
        } finally {
            setLoading(false);
            setTimeout(() => setIsPolling(false), 700);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchLogs(true);
        }, 300);

        return () => clearTimeout(debounce);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm]);

    useEffect(() => {
        if (!autoSync) return;
        const interval = setInterval(() => {
            fetchLogs(false);
        }, 10000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoSync, currentPage, searchTerm]);

    const formatTime = (dateString) => {
        if (!dateString) return "-";
        const options = {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        };
        return new Date(dateString).toLocaleDateString("id-ID", options);
    };

    const filteredLogs = useMemo(() => {
        if (actionFilter === "ALL") return logs;
        return logs.filter(
            (l) => (l.action || "").toUpperCase() === actionFilter,
        );
    }, [logs, actionFilter]);

    const pageStats = useMemo(() => {
        const creates = logs.filter((l) => l.action === "CREATE").length;
        const updates = logs.filter((l) => l.action === "UPDATE").length;
        const deletes = logs.filter((l) => l.action === "DELETE").length;
        return { creates, updates, deletes };
    }, [logs]);

    // Export Excel Bukti Dukung Audit Trail (Tarik hingga 10 halaman sesuai pencarian aktif)
    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const maxPages = Math.min(pagination.last_page || 1, 10);
            const requests = [];
            for (let p = 1; p <= maxPages; p++) {
                requests.push(
                    axios.get(
                        `/api/activity-logs?page=${p}&search=${encodeURIComponent(searchTerm)}`,
                    ),
                );
            }

            const responses = await Promise.all(requests);
            let allRows = responses.flatMap((r) => r.data.data || []);

            if (actionFilter !== "ALL") {
                allRows = allRows.filter(
                    (l) => (l.action || "").toUpperCase() === actionFilter,
                );
            }

            const aoa = [
                ["REKAMAN AUDIT TRAIL (CCTV SISTEM) — SIRA 2.0"],
                ["Kantor Wilayah Kementerian Hukum Sulawesi Tengah"],
                [
                    `Tanggal Unduh: ${new Date().toLocaleString("id-ID")} WITA`,
                    `Filter Aksi: ${actionFilter}`,
                    `Kata Kunci: ${searchTerm || "-"}`,
                ],
                [],
                [
                    "No",
                    "Waktu (WITA)",
                    "Nama Pengguna",
                    "Peran / Satker",
                    "Modul",
                    "Aksi",
                    "Deskripsi Aktivitas",
                    "Alamat IP",
                ],
            ];

            allRows.forEach((log, idx) => {
                aoa.push([
                    idx + 1,
                    formatTime(log.created_at),
                    log.user?.name || "Sistem / User Dihapus",
                    log.user
                        ? log.user.role === "admin"
                            ? "Admin Kanwil"
                            : log.user.kode_satker || "Satker"
                        : "-",
                    log.module || "-",
                    log.action || "-",
                    log.description || "-",
                    log.ip_address || "-",
                ]);
            });

            const ws = XLSX.utils.aoa_to_sheet(aoa);
            ws["!cols"] = [
                { wch: 5 },
                { wch: 24 },
                { wch: 24 },
                { wch: 16 },
                { wch: 22 },
                { wch: 12 },
                { wch: 65 },
                { wch: 16 },
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Audit_Trail_CCTV");
            const stamp = new Date().toISOString().split("T")[0];
            XLSX.writeFile(wb, `Audit_Trail_CCTV_SIRA_${stamp}.xlsx`);
        } catch (err) {
            console.error("Gagal ekspor log aktivitas:", err);
        } finally {
            setIsExporting(false);
        }
    };

    const getActionBadge = (action) => {
        switch (action) {
            case "CREATE":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-wider border border-emerald-200">
                        <PlusCircle size={11} /> Menambah
                    </span>
                );
            case "UPDATE":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-100 text-amber-700 uppercase tracking-wider border border-amber-200">
                        <Edit3 size={11} /> Mengubah
                    </span>
                );
            case "DELETE":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-100 text-rose-700 uppercase tracking-wider border border-rose-200">
                        <Trash2 size={11} /> Menghapus
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-700 uppercase tracking-wider border border-slate-200">
                        {action}
                    </span>
                );
        }
    };

    return (
        <MainLayout
            authUser={authUser}
            tahun={new Date().getFullYear().toString()}
        >
            <style>{`
                .glass-card { background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
                .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>

            <div className="space-y-6 font-sans text-slate-700 relative min-h-screen pb-10">
                <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none -z-10"></div>

                {/* 1. HERO CCTV COMMAND BAR */}
                <div className="glass-card p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 relative z-10 space-y-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="p-3.5 bg-gradient-to-br from-slate-900 via-[#0B1120] to-emerald-950 text-emerald-400 rounded-2xl shadow-[0_10px_24px_rgba(15,23,42,0.3)] border border-emerald-500/30 shrink-0">
                                <Activity size={26} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                                        Audit Trail (CCTV)
                                    </h2>
                                    <div
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                                            autoSync
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : "bg-slate-100 text-slate-500 border-slate-200"
                                        }`}
                                    >
                                        <span
                                            className={`w-2 h-2 rounded-full ${
                                                autoSync
                                                    ? `bg-emerald-500 ${isPolling ? "animate-ping" : ""}`
                                                    : "bg-slate-400"
                                            }`}
                                        ></span>
                                        <span>
                                            {autoSync
                                                ? "Live Sync 10s"
                                                : "Paused"}
                                        </span>
                                        {isPolling && (
                                            <RefreshCw
                                                size={10}
                                                className="animate-spin ml-0.5"
                                            />
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                                    Rekam jejak seluruh perubahan data,
                                    verifikasi, dan otorisasi pengguna secara
                                    real-time.
                                </p>
                            </div>
                        </div>

                        {/* TOMBOL KONTROL CCTV + EXPORT EXCEL */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setAutoSync((prev) => !prev)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    autoSync
                                        ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                }`}
                                title={
                                    autoSync
                                        ? "Jeda auto-refresh 10 detik"
                                        : "Lanjutkan auto-refresh 10 detik"
                                }
                            >
                                {autoSync ? (
                                    <Pause size={14} />
                                ) : (
                                    <Play size={14} />
                                )}
                                <span>{autoSync ? "Jeda" : "Lanjutkan"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fetchLogs(false)}
                                className="p-2.5 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 rounded-xl shadow-sm transition-all cursor-pointer"
                                title="Segarkan Log Sekarang"
                            >
                                <RefreshCw
                                    size={16}
                                    className={isPolling ? "animate-spin" : ""}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={handleExportExcel}
                                disabled={isExporting || logs.length === 0}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_8px_18px_rgba(16,185,129,0.25)] transition-all disabled:opacity-50 cursor-pointer"
                                title="Unduh bukti dukung Audit Trail (.xlsx)"
                            >
                                {isExporting ? (
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <FileSpreadsheet size={15} />
                                )}
                                <span>
                                    {isExporting
                                        ? "Menyiapkan..."
                                        : "Export Excel"}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="h-px w-full bg-slate-200/70"></div>

                    {/* BARIS FILTER AKSI & PENCARIAN */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                        <div className="inline-flex flex-wrap items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 text-xs font-bold shadow-inner gap-1">
                            <span className="px-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:inline-flex items-center gap-1">
                                <Filter size={11} /> Aksi:
                            </span>
                            {[
                                { key: "ALL", label: "Semua" },
                                { key: "CREATE", label: "Menambah" },
                                { key: "UPDATE", label: "Mengubah" },
                                { key: "DELETE", label: "Menghapus" },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setActionFilter(item.key)}
                                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                                        actionFilter === item.key
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
                                placeholder="Cari nama, modul, satker, atau aktivitas..."
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

                {/* 2. 4 KARTU RINGKASAN AUDIT */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Total Rekaman
                            </p>
                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
                                <Activity size={16} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tabular-nums">
                            {pagination.total || 0}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            Seluruh log sesuai pencarian
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                Aksi Create
                            </p>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <PlusCircle size={16} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-emerald-700 tabular-nums">
                            {pageStats.creates}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            Pada halaman aktif ini
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                Aksi Update
                            </p>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Edit3 size={16} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-amber-700 tabular-nums">
                            {pageStats.updates}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            Revisi &amp; verifikasi data
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.75rem] border border-white shadow-sm flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                                Aksi Delete
                            </p>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Trash2 size={16} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-rose-600 tabular-nums">
                            {pageStats.deletes}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            Penghapusan data tercatat
                        </p>
                    </div>
                </div>

                {/* 3. TABEL REKAMAN CCTV */}
                <div className="glass-card rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden relative z-10">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#0B1120] text-slate-300 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Clock
                                                size={13}
                                                className="text-emerald-400"
                                            />{" "}
                                            Waktu (WITA)
                                        </div>
                                    </th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <User
                                                size={13}
                                                className="text-indigo-400"
                                            />{" "}
                                            Pelaku (User)
                                        </div>
                                    </th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Server
                                                size={13}
                                                className="text-amber-400"
                                            />{" "}
                                            Modul &amp; Aksi
                                        </div>
                                    </th>
                                    <th className="px-6 py-4">
                                        Deskripsi Aktivitas &amp; Jejak IP
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
                                            <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-slate-300 border-t-slate-900"></div>
                                            <p className="mt-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                Menyinkronkan Rekaman CCTV...
                                            </p>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                <ShieldAlert size={28} />
                                            </div>
                                            <p className="text-sm font-black text-slate-600">
                                                Tidak ada rekaman aktivitas yang
                                                cocok.
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Coba ubah filter aksi atau kata
                                                kunci pencarian.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-slate-50/90 transition-colors"
                                        >
                                            <td className="px-6 py-4 align-top">
                                                <div className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg inline-block">
                                                    {formatTime(log.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                {log.user ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm overflow-hidden shrink-0">
                                                            {log.user.avatar ? (
                                                                <img
                                                                    src={`/storage/${log.user.avatar}`}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                log.user.name
                                                                    .charAt(0)
                                                                    .toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-extrabold text-slate-900 text-xs">
                                                                {log.user.name}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">
                                                                {log.user
                                                                    .role ===
                                                                "admin"
                                                                    ? "Admin Kanwil"
                                                                    : log.user
                                                                          .kode_satker}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg font-bold">
                                                        <ShieldAlert
                                                            size={13}
                                                        />{" "}
                                                        Sistem / User Dihapus
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className="text-xs font-black text-slate-800 tracking-wide">
                                                        {log.module}
                                                    </span>
                                                    {getActionBadge(log.action)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top whitespace-normal min-w-[320px]">
                                                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                                                    {log.description}
                                                </p>
                                                {log.ip_address && (
                                                    <p className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1.5 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70">
                                                        <Globe size={10} /> IP:{" "}
                                                        {log.ip_address}
                                                    </p>
                                                )}
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
            </div>
        </MainLayout>
    );
}
