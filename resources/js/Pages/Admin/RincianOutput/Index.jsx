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
} from "lucide-react";

import AddRoModal from "./Modals/AddRoModal";
import ProgressModal from "./Modals/ProgressModal";

// Hapus prop authUser, kita ambil sendiri datanya dari dalam
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
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(
            () => setToast({ show: false, message: "", type: "" }),
            3500,
        );
    };

    // 🔥 1. FETCH DATA USER YANG SEDANG LOGIN 🔥
    useEffect(() => {
        axios
            .get("/api/user")
            .then((res) => {
                setAuthUser(res.data);
            })
            .catch((err) => {
                console.error("User belum login atau session habis", err);
            });
    }, []);

    // 🔥 2. FETCH DAFTAR SATKER (JIKA DIA ADMIN) 🔥
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

    // 🔥 3. FETCH DATA TABEL RO (TUNGGU USER LOAD DULU) 🔥
    useEffect(() => {
        if (!authUser) return; // Jangan request kalau belum tahu siapa yg login

        if (authUser.role !== "admin" || selectedSatkerId) {
            fetchData();
        } else {
            setRoData([]);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tahun, selectedSatkerId, authUser]);

    const handleDelete = (id, namaRo) => {
        if (
            window.confirm(
                `Yakin ingin menghapus target RO: ${namaRo}? Semua laporan realisasinya juga akan terhapus!`,
            )
        ) {
            axios
                .delete(`/api/rincian-output/${id}`)
                .then((res) => {
                    showToast(res.data.message, "success");
                    fetchData();
                })
                .catch((err) => {
                    showToast("Gagal menghapus data.", "error");
                    console.error(err);
                });
        }
    };

    const formatSingkat = (angka) => {
        if (!angka || angka === 0) return "Rp 0";
        if (angka >= 1000000000)
            return `Rp ${(angka / 1000000000).toFixed(2)} M`;
        return `Rp ${(angka / 1000000).toFixed(2)} Jt`;
    };

    const filteredData = roData.filter(
        (ro) =>
            ro.nama_ro.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ro.kode_ro.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <MainLayout>
            <div className="space-y-6 text-slate-600 font-sans relative pb-10">
                {toast.show && (
                    <div className="fixed top-6 right-6 z-[99999] animate-in slide-in-from-top-5 fade-in duration-300">
                        <div
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}
                        >
                            {toast.type === "success" ? (
                                <CheckCircle
                                    size={20}
                                    className="text-emerald-500"
                                />
                            ) : (
                                <AlertTriangle
                                    size={20}
                                    className="text-rose-500"
                                />
                            )}
                            <p className="font-bold text-sm">{toast.message}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                <Target size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight leading-tight">
                                Capaian Output (RO)
                            </h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 ml-[76px]">
                            Tracker progress volume fisik dan realisasi anggaran
                            kegiatan (Bobot 25% IKPA).
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full xl:w-auto items-end">
                        {/* Tombol Setup Target Selalu Muncul */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 rounded-2xl text-sm font-black uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
                        >
                            <PlusCircle size={18} /> Setup Target RO
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 flex-1 md:flex-none">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari Kode atau Nama RO..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 text-sm border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 transition-all"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        {authUser?.role === "admin" && (
                            <div className="relative w-full sm:w-72">
                                <select
                                    value={selectedSatkerId}
                                    onChange={(e) =>
                                        setSelectedSatkerId(e.target.value)
                                    }
                                    className="w-full px-4 py-3 text-sm border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 cursor-pointer font-bold text-indigo-700"
                                >
                                    <option value="">
                                        -- Pilih Satuan Kerja --
                                    </option>
                                    {daftarSatker.map((satker) => (
                                        <option
                                            key={satker.id}
                                            value={satker.id}
                                        >
                                            {satker.kode_satker} -{" "}
                                            {satker.nama_satker}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="relative w-full sm:w-36">
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full pl-5 pr-10 py-3 text-sm border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 cursor-pointer font-black text-slate-700"
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
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4 bg-white/50 rounded-3xl border border-slate-100 backdrop-blur-sm">
                        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black text-xs tracking-widest uppercase animate-pulse">
                            Memuat Data Capaian Output...
                        </p>
                    </div>
                ) : authUser?.role === "admin" && !selectedSatkerId ? (
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-sm">
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Box size={48} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">
                            Pilih Satuan Kerja
                        </h3>
                        <p className="text-slate-500 font-medium">
                            Sebagai Admin, silakan pilih Satker pada menu filter
                            di atas untuk melihat detail Rincian Output mereka.
                        </p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={48} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">
                            Belum Ada Target RO
                        </h3>
                        <p className="text-slate-500 font-medium">
                            Satker belum melakukan setup Target Rincian Output
                            (RO) untuk tahun {tahun}.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredData.map((ro) => (
                            <div
                                key={ro.id}
                                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                                {ro.kode_ro}
                                            </span>
                                            <span
                                                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 ${ro.status_kinerja === "Selesai 100%" ? "bg-emerald-100 text-emerald-700" : ro.status_kinerja === "Anomali" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}
                                            >
                                                {ro.status_kinerja ===
                                                "Selesai 100%" ? (
                                                    <CheckCircle2 size={12} />
                                                ) : ro.status_kinerja ===
                                                  "Anomali" ? (
                                                    <AlertTriangle size={12} />
                                                ) : (
                                                    <Activity size={12} />
                                                )}
                                                {ro.status_kinerja}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedRo(ro);
                                                    setShowProgressModal(true);
                                                }}
                                                className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors"
                                                title="Input/Lihat Progress Realisasi"
                                            >
                                                <FileEdit size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        ro.id,
                                                        ro.nama_ro,
                                                    )
                                                }
                                                className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-colors"
                                                title="Hapus Target RO"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 mb-6 leading-tight line-clamp-2">
                                        {ro.nama_ro}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Target Volume
                                            </p>
                                            <p className="text-xl font-black text-slate-800">
                                                {ro.target_volume}{" "}
                                                <span className="text-xs font-bold text-slate-500">
                                                    {ro.satuan}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Pagu Anggaran
                                            </p>
                                            <p className="text-xl font-black text-slate-800">
                                                {formatSingkat(
                                                    ro.pagu_anggaran,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5 bg-slate-900 p-5 rounded-2xl">
                                    <div>
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <TrendingUp size={12} />{" "}
                                                Progress Fisik (RV)
                                            </span>
                                            <span className="text-sm font-black text-white">
                                                {ro.realisasi_volume_kumulatif}{" "}
                                                / {ro.target_volume}{" "}
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    ({ro.persen_volume}%)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2">
                                            <div
                                                className="bg-emerald-500 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(ro.persen_volume, 100)}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <TrendingUp size={12} /> Serapan
                                                Anggaran
                                            </span>
                                            <span className="text-sm font-black text-white">
                                                {formatSingkat(
                                                    ro.realisasi_anggaran_kumulatif,
                                                )}{" "}
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    ({ro.persen_anggaran}%)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2">
                                            <div
                                                className="bg-sky-500 h-2 rounded-full"
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
                        authUser={authUser} // Sekarang data authUser ini tidak akan undefined lagi!
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
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </MainLayout>
    );
}
