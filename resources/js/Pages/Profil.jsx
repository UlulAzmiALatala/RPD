import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import MainLayout from "../Layouts/MainLayout";
import {
    Camera,
    Save,
    Loader2,
    User,
    Mail,
    Phone,
    Hash,
    ShieldCheck,
    CheckCircle,
    XCircle,
} from "lucide-react";

export default function Profil() {
    // 1. STATE UNTUK MENAMPUNG DATA ASLI DARI DATABASE
    const [userData, setUserData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        nip: "",
        no_hp: "",
        password: "",
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
        isExiting: false,
    });
    const toastTimeout = useRef(null);
    const exitTimeout = useRef(null);
    const fileInputRef = useRef(null);

    // 2. FETCH DATA PROFIL SECARA MANDIRI SAAT HALAMAN DIBUKA
    useEffect(() => {
        axios
            .get("/api/user")
            .then((response) => {
                const user = response.data;
                setUserData(user);

                // Isi form dengan data yang ditarik dari database
                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    nip: user.nip || "",
                    no_hp: user.no_hp || "",
                    password: "",
                });

                // Set foto profil jika ada
                if (user.avatar) {
                    setAvatarPreview(`/storage/${user.avatar}`);
                }

                setIsLoadingData(false);
            })
            .catch((error) => {
                console.error("Gagal mengambil profil:", error);
                setIsLoadingData(false);
            });
    }, []);

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

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast("Ukuran gambar maksimal 2MB!", "error");
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("nip", formData.nip || "");
        data.append("no_hp", formData.no_hp || "");
        if (formData.password) data.append("password", formData.password);
        if (avatarFile) data.append("avatar", avatarFile);

        try {
            const response = await axios.post("/api/profile", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            showToast(response.data.message, "success");
            // Reload ringan untuk update Header secara otomatis
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            showToast(
                error.response?.data?.message || "Gagal memperbarui profil.",
                "error",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. LOGIKA UNTUK MENAMPILKAN INISIAL NAMA
    const initial = userData?.name
        ? userData.name.charAt(0).toUpperCase()
        : "U";

    return (
        <MainLayout>
            <style>{`
                @keyframes slideInRight { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
                @keyframes slideOutRight { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(120%) scale(0.9); opacity: 0; } }
                .toast-enter { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .toast-exit { animation: slideOutRight 0.4s ease-in forwards; }
            `}</style>

            <div className="max-w-4xl mx-auto space-y-6 font-sans text-gray-600 relative">
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
                                {toast.type === "success" ? "Sukses" : "Error"}
                            </h4>
                            <p className="text-sm font-medium text-gray-200 mt-0.5">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Profil Saya
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola informasi data diri dan keamanan akun Anda.
                    </p>
                </div>

                {isLoadingData ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-3"></div>
                        <p className="text-sm text-gray-500">
                            Memuat data profil Anda...
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease-out]">
                        <form onSubmit={handleSubmit}>
                            {/* Area Foto Header Profil */}
                            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                                <div className="absolute -bottom-12 left-8 flex items-end gap-5">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full border-4 border-white bg-indigo-100 overflow-hidden shadow-md flex items-center justify-center text-indigo-500 font-black text-3xl">
                                            {avatarPreview ? (
                                                <img
                                                    src={avatarPreview}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                initial
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm hover:bg-indigo-700 transition-colors"
                                        >
                                            <Camera size={14} />
                                        </button>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="pb-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-white/90 text-indigo-700 uppercase tracking-widest shadow-sm">
                                            <ShieldCheck size={14} />{" "}
                                            {userData?.role === "admin"
                                                ? "Admin Kanwil"
                                                : "Operator Satker"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="px-8 pt-20 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Nama Lengkap{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Email{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        NIP{" "}
                                        <span className="text-gray-400 font-normal ml-1">
                                            (Opsional)
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Hash className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="nip"
                                            value={formData.nip}
                                            onChange={handleFormChange}
                                            placeholder="Masukkan NIP Anda"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        No. HP / WhatsApp{" "}
                                        <span className="text-gray-400 font-normal ml-1">
                                            (Opsional)
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="no_hp"
                                            value={formData.no_hp}
                                            onChange={handleFormChange}
                                            placeholder="Contoh: 081234567890"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ganti Password{" "}
                                        <span className="text-gray-400 font-normal ml-1">
                                            (Kosongkan jika tidak ingin diubah)
                                        </span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleFormChange}
                                        minLength="6"
                                        placeholder="Masukkan password baru..."
                                        className="w-full md:w-1/2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-md ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"}`}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}{" "}
                                    Simpan Profil
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
