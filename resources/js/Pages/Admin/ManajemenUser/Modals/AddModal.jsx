import React, { useState } from "react";
import axios from "axios";
import {
    X,
    Save,
    Loader2,
    UserPlus,
    ShieldAlert,
    Building,
    CheckCircle2,
} from "lucide-react";

export default function AddModal({ isOpen, onClose, onSuccess, satkers }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "satker", // Default Satker agar lebih aman
        kode_satker: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen) return null;

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            // Jika role diubah ke admin, kosongkan kode satker
            ...(name === "role" && value === "admin"
                ? { kode_satker: "" }
                : {}),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.role === "satker" && !formData.kode_satker) {
            setErrorMsg("Pilih Satuan Kerja untuk akun Operator!");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            const response = await axios.post("/api/users", formData);
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "satker",
                kode_satker: "",
            });
            onSuccess(
                response.data.message || "Pengguna berhasil ditambahkan!",
            );
            onClose();
        } catch (error) {
            setErrorMsg(
                error.response?.data?.message || "Terjadi kesalahan sistem.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden border border-white flex flex-col max-h-[95vh] animate-in zoom-in-95 fade-in duration-300">
                {/* HEADER MODAL */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-[0_8px_16px_rgba(99,102,241,0.2)]">
                            <UserPlus size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                Tambah Pengguna Baru
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                Buat kredensial akses ke ekosistem SIRA
                                Kemenkum.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors relative z-10"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* BODY MODAL */}
                <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1 relative">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <XCircle
                                className="text-rose-500 shrink-0 mt-0.5"
                                size={20}
                            />
                            <div>
                                <h4 className="text-sm font-bold text-rose-800">
                                    Gagal Memproses
                                </h4>
                                <p className="text-sm text-rose-600 font-medium mt-0.5">
                                    {errorMsg}
                                </p>
                            </div>
                        </div>
                    )}

                    <form
                        id="addUserForm"
                        onSubmit={handleSubmit}
                        className="space-y-6 relative z-10"
                    >
                        {/* SECTION: DATA PROFIL */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    Nama Lengkap{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Masukkan nama lengkap pengguna..."
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl py-3.5 px-4 font-semibold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    Alamat Email{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="contoh@kemenkumham.go.id"
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl py-3.5 px-4 font-semibold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    Password Akses{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleFormChange}
                                    required
                                    minLength="6"
                                    placeholder="Minimal 6 karakter"
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl py-3.5 px-4 font-semibold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>

                            {/* SECTION: HAK AKSES */}
                            <div className="md:col-span-2 pt-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
                                    Hak Akses (Role){" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* CARD ADMIN */}
                                    <label
                                        className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                                            formData.role === "admin"
                                                ? "border-indigo-500 bg-indigo-50/50 shadow-[0_4px_20px_-5px_rgba(99,102,241,0.2)]"
                                                : "border-slate-200 hover:border-indigo-200 bg-white"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={formData.role === "admin"}
                                            onChange={handleFormChange}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center justify-between mb-2">
                                            <div
                                                className={`p-2 rounded-xl ${formData.role === "admin" ? "bg-indigo-500 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-400"}`}
                                            >
                                                <ShieldAlert
                                                    size={20}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                            {formData.role === "admin" && (
                                                <CheckCircle2
                                                    size={24}
                                                    className="text-indigo-500"
                                                />
                                            )}
                                        </div>
                                        <div className="font-extrabold text-slate-800 text-lg">
                                            Admin Kanwil
                                        </div>
                                        <div className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                                            Akses tanpa batas ke seluruh data
                                            satker dan pengaturan sistem.
                                        </div>
                                    </label>

                                    {/* CARD SATKER */}
                                    <label
                                        className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                                            formData.role === "satker"
                                                ? "border-teal-500 bg-teal-50/50 shadow-[0_4px_20px_-5px_rgba(20,184,166,0.2)]"
                                                : "border-slate-200 hover:border-teal-200 bg-white"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="satker"
                                            checked={formData.role === "satker"}
                                            onChange={handleFormChange}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center justify-between mb-2">
                                            <div
                                                className={`p-2 rounded-xl ${formData.role === "satker" ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "bg-slate-100 text-slate-400"}`}
                                            >
                                                <Building
                                                    size={20}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                            {formData.role === "satker" && (
                                                <CheckCircle2
                                                    size={24}
                                                    className="text-teal-500"
                                                />
                                            )}
                                        </div>
                                        <div className="font-extrabold text-slate-800 text-lg">
                                            Operator Satker
                                        </div>
                                        <div className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                                            Akses eksklusif untuk pelaporan
                                            transaksi spesifik satu wilayah.
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* SECTION: DROP DOWN SATKER (ANIMATED) */}
                            {formData.role === "satker" && (
                                <div className="md:col-span-2 p-5 bg-gradient-to-br from-teal-50/80 to-white border border-teal-100 rounded-2xl mt-2 animate-in slide-in-from-top-4 fade-in duration-300 shadow-sm">
                                    <label className="block text-xs font-black text-teal-800 uppercase tracking-widest mb-2 ml-1">
                                        Pilih Satuan Kerja{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="kode_satker"
                                            value={formData.kode_satker}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full bg-white border border-teal-200 rounded-xl shadow-sm py-3.5 pl-4 pr-10 font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="" disabled>
                                                -- Pilih Satker yang Dikelola --
                                            </option>
                                            {satkers.map((s) => (
                                                <option
                                                    key={s.id}
                                                    value={s.kode_satker}
                                                >
                                                    {s.kode_satker} -{" "}
                                                    {s.nama_satker}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-teal-500">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-medium text-teal-600/80 mt-2 ml-1 flex items-center gap-1.5">
                                        <Building size={12} /> Akun ini hanya
                                        dapat melihat dan mengisi data satker
                                        yang dipilih di atas.
                                    </p>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* FOOTER MODAL */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 relative z-20">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-all"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="addUserForm"
                        disabled={isSubmitting}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white transition-all duration-300 ${
                            isSubmitting
                                ? "bg-slate-400 cursor-not-allowed shadow-none"
                                : "bg-indigo-600 hover:bg-indigo-700 shadow-[0_8px_16px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
                        }`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" strokeWidth={2.5} />
                        )}{" "}
                        Simpan Pengguna
                    </button>
                </div>
            </div>
        </div>
    );
}
