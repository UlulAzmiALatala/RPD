import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <p className="text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-bold text-gray-900">{from || 0}</span>{" "}
                sampai{" "}
                <span className="font-bold text-gray-900">{to || 0}</span> dari{" "}
                <span className="font-bold text-gray-900">{total}</span> rekaman
                aktivitas
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

export default function IndexLogAktivitas({ authUser }) {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // Indikator visual untuk efek "Real-time polling"
    const [isPolling, setIsPolling] = useState(false);

    // Fungsi Fetch Data
    // showLoading = true (saat pertama load/pindah page), false (saat auto-refresh background)
    const fetchLogs = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        else setIsPolling(true);

        try {
            const response = await axios.get(
                `/api/activity-logs?page=${currentPage}&search=${searchTerm}`,
            );
            setLogs(response.data.data);
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
            setTimeout(() => setIsPolling(false), 1000); // Tahan efek muter bentar biar kelihatan keren
        }
    };

    // UseEffect Utama: Load data & Set Auto-Refresh (Polling)
    useEffect(() => {
        fetchLogs(true); // Load pertama kali pakai loading besar

        // SENJATA RAHASIA: Auto-refresh setiap 10 detik di background!
        const interval = setInterval(() => {
            fetchLogs(false); // Update data diem-diem tanpa loading besar
        }, 10000);

        return () => clearInterval(interval); // Bersihkan interval saat komponen dibongkar
    }, [currentPage, searchTerm]);

    // Format Tanggal Keren
    const formatTime = (dateString) => {
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

    // Warna Badge Berdasarkan Aksi
    const getActionBadge = (action) => {
        switch (action) {
            case "CREATE":
                return (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-widest border border-emerald-200">
                        Menambah
                    </span>
                );
            case "UPDATE":
                return (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-100 text-amber-700 uppercase tracking-widest border border-amber-200">
                        Mengubah
                    </span>
                );
            case "DELETE":
                return (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-red-100 text-red-700 uppercase tracking-widest border border-red-200">
                        Menghapus
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-gray-100 text-gray-700 uppercase tracking-widest border border-gray-200">
                        {action}
                    </span>
                );
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6 font-sans text-gray-600 relative overflow-hidden">
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-800 text-emerald-400 rounded-xl hidden md:flex shadow-lg shadow-slate-200">
                            <Activity size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                    Log Aktivitas (CCTV)
                                </h2>
                                {/* Indikator Live */}
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg">
                                    <span
                                        className={`w-2 h-2 rounded-full bg-emerald-500 ${isPolling ? "animate-ping" : ""}`}
                                    ></span>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                        Live Sync
                                    </span>
                                    {isPolling && (
                                        <RefreshCw
                                            size={10}
                                            className="text-emerald-500 animate-spin ml-1"
                                        />
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Pantau seluruh pergerakan, perubahan data, dan
                                aktivitas pengguna secara *real-time*.
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Cari nama, satker, atau aktivitas..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all text-sm shadow-sm"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>

                {/* Tabel Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-gray-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} /> Waktu
                                        </div>
                                    </th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <User size={14} /> Pelaku (User)
                                        </div>
                                    </th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Server size={14} /> Modul & Aksi
                                        </div>
                                    </th>
                                    <th className="px-6 py-4">
                                        Deskripsi Aktivitas
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
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-500 border-t-transparent"></div>
                                            <p className="mt-2 text-sm text-gray-400">
                                                Menyinkronkan rekaman CCTV...
                                            </p>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-12 text-center text-gray-400 italic"
                                        >
                                            Belum ada log aktivitas yang
                                            terekam.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-slate-50/70 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                                                    {formatTime(log.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.user ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
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
                                                            <div className="font-bold text-gray-900 text-xs">
                                                                {log.user.name}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">
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
                                                    <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded font-bold">
                                                        <ShieldAlert
                                                            size={12}
                                                        />{" "}
                                                        Sistem / User Dihapus
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {log.module}
                                                    </span>
                                                    {getActionBadge(log.action)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-normal min-w-[300px]">
                                                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                                    {log.description}
                                                </p>
                                                {log.ip_address && (
                                                    <p className="text-[9px] text-gray-400 mt-1 font-mono">
                                                        IP: {log.ip_address}
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
