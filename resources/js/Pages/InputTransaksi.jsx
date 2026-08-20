import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../Layouts/MainLayout";

export default function InputTransaksi() {
    const [activeTab, setActiveTab] = useState("rpd");

    // State baru untuk mode Edit
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        satker_id: "",
        tahun: new Date().getFullYear().toString(),
        bulan: "",
        belanja_gaji: "",
        belanja_barang: "",
        belanja_modal: "",
    });

    const [satkers, setSatkers] = useState([]);
    const [riwayatData, setRiwayatData] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        axios
            .get(`/api/dashboard-data?tahun=${formData.tahun}`)
            .then((response) => setSatkers(response.data.data))
            .catch((error) => console.error("Gagal memuat satker", error));
    }, [formData.tahun]);

    const fetchRiwayat = (tahun, jenisTab) => {
        const endpoint =
            jenisTab === "rpd"
                ? "/api/transaksi/rpd"
                : "/api/transaksi/realisasi";
        axios
            .get(`${endpoint}?tahun=${tahun}`)
            .then((response) => setRiwayatData(response.data.data))
            .catch((error) =>
                console.error(`Gagal memuat riwayat ${jenisTab}`, error),
            );
    };

    useEffect(() => {
        fetchRiwayat(formData.tahun, activeTab);
    }, [formData.tahun, activeTab]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        resetForm(); // Reset form & edit mode saat pindah tab
    };

    const resetForm = () => {
        setMessage({ type: "", text: "" });
        setEditMode(false);
        setEditId(null);
        setFormData((prev) => ({
            ...prev,
            bulan: "",
            belanja_gaji: "",
            belanja_barang: "",
            belanja_modal: "",
        }));
    };

    // Fungsi saat tombol Edit di tabel diklik
    const handleEdit = (item) => {
        setEditMode(true);
        setEditId(item.id);
        setFormData({
            satker_id: item.satker_id,
            tahun: item.tahun,
            bulan: item.bulan,
            belanja_gaji: item.belanja_gaji,
            belanja_barang: item.belanja_barang,
            belanja_modal: item.belanja_modal,
        });
        window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll otomatis ke atas
    };

    // Fungsi saat tombol Hapus diklik
    const handleDelete = (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?"))
            return;

        const endpoint =
            activeTab === "rpd"
                ? `/api/transaksi/rpd/${id}`
                : `/api/transaksi/realisasi/${id}`;

        axios
            .delete(endpoint)
            .then((response) => {
                setMessage({ type: "success", text: response.data.message });
                fetchRiwayat(formData.tahun, activeTab);
                if (editId === id) resetForm(); // Batal edit jika yang dihapus sedang diedit
            })
            .catch(() =>
                setMessage({ type: "error", text: "Gagal menghapus data." }),
            );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: "", text: "" });

        const baseUrl =
            activeTab === "rpd"
                ? "/api/transaksi/rpd"
                : "/api/transaksi/realisasi";

        // Jika mode edit gunakan PUT + id, jika tidak POST
        const request = editMode
            ? axios.put(`${baseUrl}/${editId}`, formData)
            : axios.post(baseUrl, formData);

        request
            .then((response) => {
                setMessage({ type: "success", text: response.data.message });
                resetForm();
                fetchRiwayat(formData.tahun, activeTab);
            })
            .catch((error) => {
                if (error.response && error.response.status === 422) {
                    setMessage({
                        type: "error",
                        text: "Pastikan semua kolom diisi dengan benar.",
                    });
                } else if (error.response && error.response.status === 409) {
                    setMessage({
                        type: "error",
                        text: error.response.data.message,
                    });
                } else {
                    setMessage({
                        type: "error",
                        text: "Terjadi kesalahan sistem.",
                    });
                }
            })
            .finally(() => setIsSubmitting(false));
    };

    const namaBulan = (bulan) => {
        const nama = [
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
        return nama[bulan];
    };

    return (
        <MainLayout tahun={formData.tahun}>
            <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                    <button
                        onClick={() => handleTabChange("rpd")}
                        className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${activeTab === "rpd" ? "bg-[#0A192F] text-yellow-400 shadow" : "text-gray-500 hover:text-[#0A192F] hover:bg-gray-50"}`}
                    >
                        Input Rencana Penarikan Dana (RPD)
                    </button>
                    <button
                        onClick={() => handleTabChange("realisasi")}
                        className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${activeTab === "realisasi" ? "bg-[#0A192F] text-yellow-400 shadow" : "text-gray-500 hover:text-[#0A192F] hover:bg-gray-50"}`}
                    >
                        Input Realisasi Anggaran
                    </button>
                </div>

                <div
                    className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${activeTab === "rpd" ? "border-blue-500" : "border-green-500"}`}
                >
                    <div className="mb-6 border-b pb-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-[#0A192F]">
                                {editMode ? "Edit" : "Form Input"}{" "}
                                {activeTab === "rpd" ? "RPD" : "Realisasi"}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {editMode
                                    ? "Perbarui nominal transaksi yang sudah ada."
                                    : `Masukkan data ${activeTab === "rpd" ? "rencana penarikan" : "realisasi aktual"} dana bulanan.`}
                            </p>
                        </div>
                        {editMode && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Mode Edit Aktif
                            </span>
                        )}
                    </div>

                    {message.text && (
                        <div
                            className={`p-4 mb-6 rounded-md ${message.type === "success" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"} border`}
                        >
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-md border border-gray-100">
                            <div className="col-span-1 md:col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Satuan Kerja{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="satker_id"
                                    value={formData.satker_id}
                                    onChange={handleChange}
                                    required
                                    disabled={editMode}
                                    className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 border disabled:bg-gray-200"
                                >
                                    <option value="">-- Pilih Satker --</option>
                                    {satkers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.kode_satker} - {s.nama_satker}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tahun{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="tahun"
                                    value={formData.tahun}
                                    onChange={handleChange}
                                    required
                                    disabled={editMode}
                                    className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 border disabled:bg-gray-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Bulan{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="bulan"
                                    value={formData.bulan}
                                    onChange={handleChange}
                                    required
                                    disabled={editMode}
                                    className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 border disabled:bg-gray-200"
                                >
                                    <option value="">-- Pilih Bulan --</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {namaBulan(i + 1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {["gaji", "barang", "modal"].map((jenis) => (
                                <div key={jenis}>
                                    <label className="block text-sm font-semibold text-[#0A192F] mb-2 capitalize">
                                        Belanja {jenis}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            name={`belanja_${jenis}`}
                                            value={formData[`belanja_${jenis}`]}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className={`w-full pl-10 border-gray-300 rounded-md shadow-sm py-2 border focus:ring-2 ${activeTab === "rpd" ? "focus:ring-blue-400" : "focus:ring-green-400"}`}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t gap-3">
                            {editMode && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2.5 rounded-md font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                                >
                                    Batal Edit
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-2.5 rounded-md font-bold transition-colors shadow-sm ${
                                    isSubmitting
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : activeTab === "rpd"
                                          ? "bg-blue-600 text-white hover:bg-blue-700"
                                          : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                            >
                                {isSubmitting
                                    ? "Menyimpan..."
                                    : editMode
                                      ? "Update Data"
                                      : `Simpan ${activeTab === "rpd" ? "RPD" : "Realisasi"}`}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-[#0A192F] mb-4">
                        Riwayat {activeTab === "rpd" ? "RPD" : "Realisasi"}{" "}
                        Tahun {formData.tahun}
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
                                                {namaBulan(item.bulan)}
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
                                                            handleEdit(item)
                                                        }
                                                        className="text-indigo-600 hover:text-indigo-900 font-semibold bg-indigo-50 px-3 py-1 rounded hover:bg-indigo-100 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id,
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900 font-semibold bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition-colors"
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
                                            Belum ada data untuk tahun ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
