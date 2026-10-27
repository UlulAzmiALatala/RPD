import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../../../Layouts/MainLayout";
import {
    Target,
    Activity,
    PlusCircle,
    Search,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Box,
    Trash2,
    FileEdit,
    CheckCircle,
    RefreshCcw,
} from "lucide-react";

import AddRoModal from "./Modals/AddRoModal";
import ProgressModal from "./Modals/ProgressModal";
import DeleteModal from "./Modals/DeleteModal";

export default function RincianOutputIndex() {
    const [authUser, setAuthUser] = useState(null);
    const [roData, setRoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [daftarSatker, setDaftarSatker] = useState([]);
    const [selectedSatkerId, setSelectedSatkerId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [selectedRo, setSelectedRo] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(
            () => setToast({ show: false, message: "", type: "" }),
            4000,
        );
    };

    useEffect(() => {
        axios
            .get("/api/user")
            .then((res) => setAuthUser(res.data))
            .catch((err) => console.error("User belum login", err));
    }, []);

    useEffect(() => {
        if (authUser?.role === "admin") {
            axios
                .get("/api/users")
                .then((res) => {
                    if (res.data.satkers) setDaftarSatker(res.data.satkers);
                })
                .catch((err) => console.error("Gagal memuat list satker", err));
        }
    }, [authUser]);

    const fetchData = () => {
        setLoading(true);
        const queryParams = new URLSearchParams({ tahun });
        if (selectedSatkerId) queryParams.append("satker_id", selectedSatkerId);

        axios
            .get(`/api/rincian-output?${queryParams.toString()}`)
            .then((response) => {
                setRoData(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Gagal memuat data RO:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (!authUser) return;
        if (authUser.role !== "admin" || selectedSatkerId) {
            fetchData();
        } else {
            setRoData([]);
            setLoading(false);
        }
    }, [tahun, selectedSatkerId, authUser]);

    const confirmDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        axios
            .delete(`/api/rincian-output/${itemToDelete.id}`)
            .then((res) => {
                showToast(res.data.message, "success");
                fetchData();
                setShowDeleteModal(false);
                setItemToDelete(null);
            })
            .catch((err) => {
                showToast("Gagal menghapus data.", "error");
                console.error(err);
            })
            .finally(() => setIsDeleting(false));
    };

    const formatSingkat = (angka) => {
        if (!angka || angka === 0) return "Rp 0";
        if (angka >= 1000000000)
            return `Rp ${(angka / 1000000000).toFixed(2)} M`;
        return `Rp ${(angka / 1000000).toFixed(2)} Jt`;
    };

    const formatCurrencyFull = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

    const filteredData = roData.filter(
        (ro) =>
            ro.nama_ro.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ro.kode_ro.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <MainLayout authUser={authUser} tahun={tahun}>
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}</style>

            <div className="space-y-6 font-sans text-slate-700 relative overflow-hidden min-h-screen pb-10">
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

                {toast.show && (
                    <div
                        className={`fixed top-8 right-8 z-[100] flex items-center p-4 min-w-[340px] rounded-2xl border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl toast-enter ${toast.type === "success" ? "bg-[#0A192F]/95 border-emerald-500/30" : "bg-[#0A192F]/95 border-rose-500/30"}`}
                    >
                        <div
                            className={`relative flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border ${toast.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}
                        >
                            {toast.type === "success" ? (
                                <CheckCircle className="w-6 h-6" />
                            ) : (
                                <AlertTriangle className="w-6 h-6" />
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

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white/70 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                    <div className="flex-1 min-w-[300px] relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] border border-indigo-400/30">
                                <Target size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 tracking-tight leading-tight">
                                    Capaian Output (RO)
                                </h2>
                                <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
                                    Tracker progress volume fisik dan realisasi
                                    anggaran otomatis.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full xl:w-auto items-end relative z-10">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-black rounded-2xl shadow-[0_8px_16px_rgba(79,70,229,0.25)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto outline-none"
                        >
                            <PlusCircle size={18} strokeWidth={2.5} /> Setup
                            Target RO
                        </button>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white flex flex-col md:flex-row gap-4 items-center justify-between relative z-10">
                    <div className="relative w-full md:w-96 flex-1 md:flex-none">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari Kode atau Nama RO..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-5 py-3.5 text-sm border-slate-200/80 rounded-2xl bg-white/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-700 transition-all outline-none placeholder:font-normal"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        {authUser?.role === "admin" && (
                            <select
                                value={selectedSatkerId}
                                onChange={(e) =>
                                    setSelectedSatkerId(e.target.value)
                                }
                                className="w-full sm:w-72 px-5 py-3.5 text-sm border-slate-200/80 rounded-2xl bg-white/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer font-bold text-indigo-700 outline-none transition-all"
                            >
                                <option value="">
                                    -- Pilih Satuan Kerja --
                                </option>
                                {daftarSatker.map((satker) => (
                                    <option key={satker.id} value={satker.id}>
                                        {satker.kode_satker} -{" "}
                                        {satker.nama_satker}
                                    </option>
                                ))}
                            </select>
                        )}
                        <select
                            value={tahun}
                            onChange={(e) => setTahun(e.target.value)}
                            className="w-full sm:w-40 px-5 py-3.5 text-sm border-slate-200/80 rounded-2xl bg-white/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer font-black text-slate-700 outline-none transition-all"
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

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-5 bg-white/60 rounded-[2.5rem] border border-white backdrop-blur-xl shadow-sm relative z-10">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-lg"></div>
                        <p className="text-slate-500 font-black text-xs tracking-widest uppercase animate-pulse">
                            Menyinkronkan Data Rincian Output...
                        </p>
                    </div>
                ) : authUser?.role === "admin" && !selectedSatkerId ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-14 text-center shadow-sm relative z-10">
                        <div className="w-28 h-28 bg-indigo-50/80 text-indigo-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-indigo-100/50">
                            <Box size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                            Pilih Satuan Kerja
                        </h3>
                        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                            Sebagai Admin Pusat, silakan pilih Satker pada menu
                            filter di atas untuk melihat detail Rincian Output
                            (RO) mereka secara spesifik.
                        </p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-14 text-center shadow-sm relative z-10">
                        <div className="w-28 h-28 bg-slate-50/80 text-slate-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100/50">
                            <AlertTriangle size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                            Belum Ada Target RO
                        </h3>
                        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                            Satker ini belum melakukan setup Target Rincian
                            Output (RO) untuk tahun anggaran {tahun}.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                        {filteredData.map((ro) => (
                            <div
                                key={ro.id}
                                className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3.5 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200/60 shadow-sm">
                                                {ro.kode_ro}
                                            </span>
                                            <span
                                                className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border flex items-center gap-1.5 shadow-sm transition-colors ${ro.status_kinerja === "Selesai 100%" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ro.status_kinerja === "Anomali Fisik" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}
                                            >
                                                {ro.status_kinerja ===
                                                "Selesai 100%" ? (
                                                    <CheckCircle2 size={14} />
                                                ) : ro.status_kinerja ===
                                                  "Anomali Fisik" ? (
                                                    <AlertTriangle size={14} />
                                                ) : (
                                                    <Activity size={14} />
                                                )}
                                                {ro.status_kinerja}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setSelectedRo(ro);
                                                    setShowProgressModal(true);
                                                }}
                                                className="p-2.5 bg-white text-indigo-600 hover:bg-indigo-50 hover:scale-110 rounded-xl transition-all shadow-sm border border-indigo-100 outline-none"
                                                title="Update Capaian Volume Fisik"
                                            >
                                                <FileEdit
                                                    size={16}
                                                    strokeWidth={2.5}
                                                />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setItemToDelete(ro);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2.5 bg-white text-rose-500 hover:bg-rose-500 hover:text-white hover:scale-110 rounded-xl transition-all shadow-sm border border-rose-100 outline-none"
                                                title="Hapus"
                                            >
                                                <Trash2
                                                    size={16}
                                                    strokeWidth={2.5}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <h3
                                        className="text-xl font-black text-slate-900 mb-6 leading-snug line-clamp-2 pr-4"
                                        title={ro.nama_ro}
                                    >
                                        {ro.nama_ro}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-5 mb-6">
                                        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 shadow-inner group-hover:border-indigo-100 transition-colors">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Target
                                                    size={12}
                                                    className="text-indigo-400"
                                                />{" "}
                                                Target Volume
                                            </p>
                                            <p className="text-2xl font-black text-slate-800 tracking-tight">
                                                {ro.target_volume}{" "}
                                                <span className="text-xs font-bold text-slate-500 tracking-normal">
                                                    {ro.satuan}
                                                </span>
                                            </p>
                                        </div>
                                        <div
                                            className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 shadow-inner group-hover:border-sky-100 transition-colors cursor-help"
                                            title={formatCurrencyFull(
                                                ro.pagu_anggaran,
                                            )}
                                        >
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Box
                                                    size={12}
                                                    className="text-sky-400"
                                                />{" "}
                                                Pagu Anggaran
                                            </p>
                                            <p className="text-xl font-black text-slate-800 tracking-tight mt-1">
                                                {formatSingkat(
                                                    ro.pagu_anggaran,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 bg-[#0A192F] p-6 rounded-[2rem] shadow-inner border border-slate-800 relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                                    {/* PROGRESS VOLUME FISIK (INPUT MANUAL) */}
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <TrendingUp size={14} />{" "}
                                                Progress Fisik (Volume)
                                            </span>
                                            <span className="text-base font-black text-white tracking-tight">
                                                {ro.realisasi_volume_kumulatif}{" "}
                                                / {ro.target_volume}{" "}
                                                <span className="text-[10px] font-bold text-slate-400 tracking-widest ml-1">
                                                    ({ro.persen_volume}%)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-800/80 rounded-full h-2.5 border border-slate-700 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                                                style={{
                                                    width: `${Math.min(ro.persen_volume, 100)}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* PROGRESS KEUANGAN (AUTO SYNC LEDGER) */}
                                    <div className="relative z-10 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <RefreshCcw
                                                    size={12}
                                                    className="animate-spin text-sky-500"
                                                    style={{
                                                        animationDuration: "3s",
                                                    }}
                                                />{" "}
                                                Serapan Anggaran
                                            </span>
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700">
                                                Live Sync Ledger
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end mb-2">
                                            <span
                                                className="text-sm font-black text-white tracking-tight cursor-help"
                                                title={formatCurrencyFull(
                                                    ro.realisasi_anggaran_kumulatif,
                                                )}
                                            >
                                                {formatSingkat(
                                                    ro.realisasi_anggaran_kumulatif,
                                                )}{" "}
                                                <span className="text-[10px] font-bold text-slate-400 tracking-widest ml-1">
                                                    dari{" "}
                                                    {formatSingkat(
                                                        ro.pagu_anggaran,
                                                    )}
                                                </span>
                                            </span>
                                            <span className="text-[10px] font-black text-sky-400 tracking-widest ml-1">
                                                ({ro.persen_anggaran}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-800/80 rounded-full h-2.5 border border-slate-700 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-all duration-1000"
                                                style={{
                                                    width: `${Math.min(ro.persen_anggaran, 100)}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showAddModal && (
                    <AddRoModal
                        onClose={() => setShowAddModal(false)}
                        onSuccess={(msg) => {
                            setShowAddModal(false);
                            showToast(msg, "success");
                            fetchData();
                        }}
                        satkerId={selectedSatkerId || ""}
                        tahun={tahun}
                        authUser={authUser}
                        daftarSatker={daftarSatker}
                    />
                )}
                {showProgressModal && selectedRo && (
                    <ProgressModal
                        ro={selectedRo}
                        onClose={() => {
                            setShowProgressModal(false);
                            setSelectedRo(null);
                        }}
                        onSuccess={(msg) => {
                            setShowProgressModal(false);
                            setSelectedRo(null);
                            showToast(msg, "success");
                            fetchData();
                        }}
                    />
                )}
                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setItemToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    isDeleting={isDeleting}
                    itemName={itemToDelete?.nama_ro}
                />
            </div>
        </MainLayout>
    );
}
