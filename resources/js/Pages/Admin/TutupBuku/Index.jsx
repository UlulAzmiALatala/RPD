import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MainLayout from "../../../Layouts/MainLayout";
import {
    Lock,
    Unlock,
    ShieldCheck,
    Calendar,
    CheckCircle,
    XCircle,
    Loader2,
} from "lucide-react";

export default function IndexTutupBuku({ authUser }) {
    const [tahun, setTahun] = useState(new Date().getFullYear());
    const [cutOffs, setCutOffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingBulan, setProcessingBulan] = useState(null);

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
        isExiting: false,
    });
    const toastTimeout = useRef(null);
    const exitTimeout = useRef(null);

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

    const fetchCutOffs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/cut-offs?tahun=${tahun}`);
            setCutOffs(response.data.data);
        } catch (err) {
            showToast("Gagal memuat data Tutup Buku.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCutOffs();
    }, [tahun]);

    const handleToggle = async (bulan, currentStatus) => {
        setProcessingBulan(bulan);
        try {
            const response = await axios.post("/api/cut-offs/toggle", {
                tahun: tahun,
                bulan: bulan,
                is_closed: !currentStatus,
            });

            showToast(response.data.message, "success");

            // Update state lokal tanpa perlu fetch ulang semua
            setCutOffs((prev) =>
                prev.map((item) =>
                    item.bulan === bulan
                        ? { ...item, is_closed: !currentStatus }
                        : item,
                ),
            );
        } catch (err) {
            showToast(
                err.response?.data?.message || "Terjadi kesalahan sistem.",
                "error",
            );
        } finally {
            setProcessingBulan(null);
        }
    };

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
                        className={`fixed top-24 right-10 z-[100] flex items-center p-4 min-w-[320px] rounded-xl border backdrop-blur-md ${toast.isExiting ? "toast-exit" : "toast-enter"} ${toast.type === "success" ? "bg-[#0A192F]/90 border-green-500/50 text-white" : "bg-[#0A192F]/90 border-red-500/50 text-white"}`}
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

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl hidden md:flex shadow-inner">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Kunci Periode (Tutup Buku)
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Kunci akses input/edit transaksi pada bulan yang
                                sudah diaudit.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
                        <Calendar size={18} className="text-slate-400 ml-2" />
                        <select
                            value={tahun}
                            onChange={(e) => setTahun(parseInt(e.target.value))}
                            className="bg-transparent border-none text-slate-700 font-bold focus:ring-0 py-2 pr-8 cursor-pointer w-full md:w-auto"
                        >
                            {[...Array(5)].map((_, i) => {
                                const yr = new Date().getFullYear() - 2 + i;
                                return (
                                    <option key={yr} value={yr}>
                                        Tahun {yr}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Grid 12 Bulan */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                        <p className="text-gray-500 font-medium">
                            Memuat status periode...
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {cutOffs.map((item) => (
                            <div
                                key={item.bulan}
                                className={`relative p-5 rounded-2xl border transition-all duration-300 ${item.is_closed ? "bg-red-50/50 border-red-200 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]" : "bg-white border-gray-200 shadow-sm hover:shadow-md"}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                            Bulan ke-{item.bulan}
                                        </div>
                                        <h3
                                            className={`text-lg font-extrabold ${item.is_closed ? "text-red-900" : "text-slate-800"}`}
                                        >
                                            {namaBulan[item.bulan - 1]}
                                        </h3>
                                    </div>
                                    <div
                                        className={`p-2 rounded-lg ${item.is_closed ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}
                                    >
                                        {item.is_closed ? (
                                            <Lock size={20} />
                                        ) : (
                                            <Unlock size={20} />
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100/50">
                                    <button
                                        onClick={() =>
                                            handleToggle(
                                                item.bulan,
                                                item.is_closed,
                                            )
                                        }
                                        disabled={
                                            processingBulan === item.bulan
                                        }
                                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                            processingBulan === item.bulan
                                                ? "bg-gray-100 text-gray-400 cursor-wait"
                                                : item.is_closed
                                                  ? "bg-white border border-red-200 text-red-600 hover:bg-red-50"
                                                  : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200"
                                        }`}
                                    >
                                        {processingBulan === item.bulan ? (
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : item.is_closed ? (
                                            <>Buka Kunci</>
                                        ) : (
                                            <>Kunci Bulan Ini</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
