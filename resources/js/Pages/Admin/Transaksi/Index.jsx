import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MainLayout from "../../../Layouts/MainLayout";
import AddModal from "./Modals/AddModal";
import EditModal from "./Modals/EditModal";
import DeleteModal from "./Modals/DeleteModal";

export default function Index() {
    const [activeTab, setActiveTab] = useState("rpd");
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [satkers, setSatkers] = useState([]);
    const [riwayatData, setRiwayatData] = useState([]);

    // State Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditData, setSelectedEditData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State & Ref untuk Animasi Toast
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
        isExiting: false,
    });
    const toastTimeout = useRef(null);
    const exitTimeout = useRef(null);

    const showToast = (message, type = "success") => {
        // Bersihkan timer sebelumnya jika user spam klik
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        if (exitTimeout.current) clearTimeout(exitTimeout.current);

        // Tampilkan toast dengan animasi masuk
        setToast({ show: true, message, type, isExiting: false });

        // Trigger animasi keluar setelah 3.5 detik
        exitTimeout.current = setTimeout(() => {
            setToast((prev) => ({ ...prev, isExiting: true }));
        }, 3500);

        // Hapus elemen sepenuhnya dari DOM setelah 4 detik
        toastTimeout.current = setTimeout(() => {
            setToast({
                show: false,
                message: "",
                type: "success",
                isExiting: false,
            });
        }, 4000);
    };

    useEffect(() => {
        axios
            .get(`/api/dashboard-data?tahun=${tahun}`)
            .then((response) => setSatkers(response.data.data.tabel_satker))
            .catch((error) => console.error("Gagal memuat satker", error));
    }, [tahun]);

    const fetchRiwayat = () => {
        const endpoint =
            activeTab === "rpd"
                ? "/api/transaksi/rpd"
                : "/api/transaksi/realisasi";
        axios
            .get(`${endpoint}?tahun=${tahun}`)
            .then((response) => setRiwayatData(response.data.data))
            .catch((error) =>
                console.error(`Gagal memuat riwayat ${activeTab}`, error),
            );
    };

    useEffect(() => {
        fetchRiwayat();
    }, [tahun, activeTab]);

    const handleTabChange = (tab) => setActiveTab(tab);

    const handleOpenEdit = (item) => {
        setSelectedEditData(item);
        setIsEditModalOpen(true);
    };

    const handleOpenDelete = (id) => {
        setSelectedDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setIsDeleting(true);
        const endpoint =
            activeTab === "rpd"
                ? `/api/transaksi/rpd/${selectedDeleteId}`
                : `/api/transaksi/realisasi/${selectedDeleteId}`;

        axios
            .delete(endpoint)
            .then((response) => {
                showToast(response.data.message, "success");
                fetchRiwayat();
                setIsDeleteModalOpen(false);
            })
            .catch(() => {
                showToast("Gagal menghapus data.", "error");
            })
            .finally(() => setIsDeleting(false));
    };

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

    return (
        <MainLayout tahun={tahun}>
            {/* INJECT CUSTOM KEYFRAMES UNTUK ANIMASI */}
            <style>{`
                @keyframes slideInRight {
                    0% { transform: translateX(120%) scale(0.9); opacity: 0; }
                    100% { transform: translateX(0) scale(1); opacity: 1; }
                }
                @keyframes slideOutRight {
                    0% { transform: translateX(0) scale(1); opacity: 1; }
                    100% { transform: translateX(120%) scale(0.9); opacity: 0; }
                }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
            `}</style>

            <div className="space-y-6 max-w-7xl mx-auto relative overflow-hidden">
                {/* --- TOAST NOTIFICATION DENGAN ANIMASI --- */}
                {toast.show && (
                    <div
                        className={`fixed top-10 right-10 z-[100] flex items-center p-4 min-w-[320px] rounded-xl border backdrop-blur-md ${toast.isExiting ? "toast-exit" : "toast-enter"} ${
                            toast.type === "success"
                                ? "bg-[#0A192F]/90 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] text-white"
                                : "bg-[#0A192F]/90 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-white"
                        }`}
                    >
                        <div
                            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full border ${
                                toast.type === "success"
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : "bg-red-500/20 text-red-400 border-red-500/30"
                            }`}
                        >
                            {toast.type === "success" ? (
                                <svg
                                    className="w-6 h-6 drop-shadow-md"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                        d="M5 13l4 4L19 7"
                                    ></path>
                                </svg>
                            ) : (
                                <svg
                                    className="w-6 h-6 drop-shadow-md"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                        d="M6 18L18 6M6 6l12 12"
                                    ></path>
                                </svg>
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
                        <div
                            className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${toast.type === "success" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,1)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]"}`}
                        ></div>
                    </div>
                )}

                {/* --- TAB NAVIGATION & TOMBOL TAMBAH --- */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                        <button
                            onClick={() => handleTabChange("rpd")}
                            className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === "rpd" ? "bg-[#0A192F] text-yellow-400 shadow" : "text-gray-500 hover:text-[#0A192F]"}`}
                        >
                            Data RPD
                        </button>
                        <button
                            onClick={() => handleTabChange("realisasi")}
                            className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === "realisasi" ? "bg-[#0A192F] text-yellow-400 shadow" : "text-gray-500 hover:text-[#0A192F]"}`}
                        >
                            Data Realisasi
                        </button>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className={`px-6 py-2.5 rounded-md font-bold text-white shadow-md transition-all ${activeTab === "rpd" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
                    >
                        + Tambah Data{" "}
                        {activeTab === "rpd" ? "RPD" : "Realisasi"}
                    </button>
                </div>

                {/* --- TABEL DATA --- */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-[#0A192F] mb-6">
                        Riwayat{" "}
                        {activeTab === "rpd"
                            ? "Rencana Penarikan Dana"
                            : "Realisasi Anggaran"}
                    </h3>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead
                                className={
                                    activeTab === "rpd"
                                        ? "bg-blue-50"
                                        : "bg-green-50"
                                }
                            >
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0A192F] uppercase">
                                        Bulan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0A192F] uppercase">
                                        Satker
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-[#0A192F] uppercase">
                                        Belanja Gaji
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-[#0A192F] uppercase">
                                        Belanja Barang
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-[#0A192F] uppercase">
                                        Belanja Modal
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-[#0A192F] uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {riwayatData.length > 0 ? (
                                    riwayatData.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {namaBulan[item.bulan]}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {item.satker?.nama_satker}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                                Rp{" "}
                                                {Number(
                                                    item.belanja_gaji,
                                                ).toLocaleString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                                Rp{" "}
                                                {Number(
                                                    item.belanja_barang,
                                                ).toLocaleString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                                Rp{" "}
                                                {Number(
                                                    item.belanja_modal,
                                                ).toLocaleString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleOpenEdit(item)
                                                        }
                                                        className="text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded hover:bg-indigo-100 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleOpenDelete(
                                                                item.id,
                                                            )
                                                        }
                                                        className="text-red-600 font-semibold bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition-colors"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50"
                                        >
                                            Belum ada data.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Render Modals */}
                <AddModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={(msg) => {
                        fetchRiwayat();
                        showToast(msg || "Data berhasil disimpan!", "success");
                    }}
                    activeTab={activeTab}
                    satkers={satkers}
                    defaultTahun={tahun}
                />

                <EditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={(msg) => {
                        fetchRiwayat();
                        showToast(msg || "Data berhasil diupdate!", "success");
                    }}
                    activeTab={activeTab}
                    satkers={satkers}
                    editData={selectedEditData}
                />

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    isDeleting={isDeleting}
                />
            </div>
        </MainLayout>
    );
}
