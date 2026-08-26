import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../Layouts/MainLayout";

export default function InputAnggaran() {
    const [formData, setFormData] = useState({
        satker_id: "",
        tahun: new Date().getFullYear().toString(),
        belanja_gaji: "",
        belanja_barang: "",
        belanja_modal: "",
        pagu_blokir: "",
    });

    const [satkers, setSatkers] = useState([]);
    const [riwayatAnggaran, setRiwayatAnggaran] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Ambil daftar Satker
    useEffect(() => {
        axios
            .get(`/api/dashboard-data?tahun=${formData.tahun}`)
            .then((response) => setSatkers(response.data.data.tabel_satker))
            .catch((error) => console.error("Gagal memuat satker", error));
    }, [formData.tahun]);

    // Fungsi fetch riwayat anggaran
    const fetchRiwayat = (tahun) => {
        axios
            .get(`/api/anggaran?tahun=${tahun}`)
            .then((response) => setRiwayatAnggaran(response.data.data))
            .catch((error) =>
                console.error("Gagal memuat riwayat anggaran", error),
            );
    };

    useEffect(() => {
        fetchRiwayat(formData.tahun);
    }, [formData.tahun]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: "", text: "" });

        axios
            .post("/api/anggaran", formData)
            .then((response) => {
                setMessage({ type: "success", text: response.data.message });
                setFormData((prev) => ({
                    ...prev,
                    belanja_gaji: "",
                    belanja_barang: "",
                    belanja_modal: "",
                    pagu_blokir: "",
                }));
                fetchRiwayat(formData.tahun);
            })
            .catch((error) => {
                setMessage({
                    type: "error",
                    text:
                        error.response?.data?.message ||
                        "Terjadi kesalahan sistem.",
                });
            })
            .finally(() => setIsSubmitting(false));
    };

    // Helper Kalkulasi Live
    const hitungTotalPagu = () => {
        return (
            Number(formData.belanja_gaji) +
            Number(formData.belanja_barang) +
            Number(formData.belanja_modal)
        );
    };

    const hitungPaguEfektif = () => {
        return hitungTotalPagu() - Number(formData.pagu_blokir);
    };

    const formatRp = (angka) => {
        return new Intl.NumberFormat("id-ID").format(angka || 0);
    };

    return (
        <MainLayout tahun={formData.tahun}>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* --- FORM SECTION --- */}
                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-600">
                    <div className="mb-6 border-b pb-4">
                        <h2 className="text-2xl font-bold text-[#0A192F]">
                            Master Pagu Anggaran Satker
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Masukkan alokasi Pagu Anggaran awal untuk
                            masing-masing Satker beserta Pagu Blokir (jika ada).
                        </p>
                    </div>

                    {message.text && (
                        <div
                            className={`p-4 mb-6 rounded-md ${message.type === "success" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}
                        >
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Baris 1: Satker & Tahun */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md border border-gray-100">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Satuan Kerja{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="satker_id"
                                    value={formData.satker_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 border focus:ring-2 focus:ring-purple-500"
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
                                    Tahun Anggaran{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="tahun"
                                    value={formData.tahun}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 border focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* Baris 2: Input Belanja */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                                            className="w-full pl-10 border-gray-300 rounded-md shadow-sm py-2 border focus:ring-2 focus:ring-blue-400"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            ))}
                            {/* Input Pagu Blokir */}
                            <div>
                                <label className="block text-sm font-semibold text-red-600 mb-2">
                                    Pagu Blokir
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        name="pagu_blokir"
                                        value={formData.pagu_blokir}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full pl-10 border-red-300 rounded-md shadow-sm py-2 border focus:ring-2 focus:ring-red-400 bg-red-50"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* LIVE PREVIEW KALKULASI */}
                        <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 flex flex-col md:flex-row justify-between items-center shadow-inner">
                            <div className="mb-2 md:mb-0">
                                <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                                    Total Pagu Anggaran
                                </p>
                                <p className="text-2xl font-black text-[#0A192F]">
                                    Rp {formatRp(hitungTotalPagu())}
                                </p>
                            </div>
                            <div className="text-xl font-bold text-gray-400 hidden md:block">
                                -
                            </div>
                            <div className="mb-2 md:mb-0 text-center">
                                <p className="text-sm text-red-500 font-medium uppercase tracking-wide">
                                    Pagu Blokir
                                </p>
                                <p className="text-xl font-bold text-red-600">
                                    Rp {formatRp(formData.pagu_blokir)}
                                </p>
                            </div>
                            <div className="text-xl font-bold text-gray-400 hidden md:block">
                                =
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-green-700 font-medium uppercase tracking-wide">
                                    Pagu Efektif
                                </p>
                                <p className="text-2xl font-black text-green-600">
                                    Rp {formatRp(hitungPaguEfektif())}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-2.5 rounded-md font-bold transition-colors shadow-sm ${
                                    isSubmitting
                                        ? "bg-gray-300 text-gray-500"
                                        : "bg-purple-600 text-white hover:bg-purple-700"
                                }`}
                            >
                                {isSubmitting
                                    ? "Menyimpan..."
                                    : "Simpan Pagu Anggaran"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- TABEL RIWAYAT SECTION --- */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-[#0A192F] mb-4">
                        Daftar Pagu Anggaran Tahun {formData.tahun}
                    </h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-purple-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-[#0A192F] uppercase">
                                        Satker
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-[#0A192F] uppercase">
                                        Total Pagu
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-red-600 uppercase">
                                        Pagu Blokir
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-green-700 uppercase">
                                        Pagu Efektif
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {riwayatAnggaran.length > 0 ? (
                                    riwayatAnggaran.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {item.satker?.nama_satker}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0A192F] font-semibold text-right">
                                                Rp {formatRp(item.total_pagu)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium text-right">
                                                Rp {formatRp(item.pagu_blokir)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold text-right">
                                                Rp {formatRp(item.pagu_efektif)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50"
                                        >
                                            Belum ada data pagu anggaran.
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
