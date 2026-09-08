import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Save, Loader2, UserCog, ShieldAlert, Building } from "lucide-react";

export default function EditModal({
    isOpen,
    onClose,
    onSuccess,
    satkers,
    editData,
}) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "", // Dikosongkan, hanya diisi kalau mau ubah password
        role: "satker",
        kode_satker: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (isOpen && editData) {
            setFormData({
                name: editData.name || "",
                email: editData.email || "",
                password: "", // Selalu reset password kosong saat modal dibuka
                role: editData.role || "satker",
                kode_satker: editData.kode_satker || "",
            });
            setErrorMsg("");
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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
            const response = await axios.put(
                `/api/users/${editData.id}`,
                formData,
            );
            onSuccess(
                response.data.message || "Data Pengguna berhasil diperbarui!",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <UserCog size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">
                                Edit Data Pengguna
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Perbarui informasi akun sistem.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/30 flex-1">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                            {errorMsg}
                        </div>
                    )}

                    <form
                        id="editUserForm"
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Nama Lengkap{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full border-gray-300 rounded-xl shadow-sm py-2.5 px-4 border focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Alamat Email{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full border-gray-300 rounded-xl shadow-sm py-2.5 px-4 border focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Password Baru{" "}
                                    <span className="text-gray-400 font-normal ml-1">
                                        (Opsional)
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleFormChange}
                                    minLength="6"
                                    placeholder="Isi untuk ubah sandi"
                                    className="w-full border-gray-300 rounded-xl shadow-sm py-2.5 px-4 border focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                                />
                            </div>

                            <div className="md:col-span-2 mt-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Hak Akses (Role){" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label
                                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.role === "admin" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-200"}`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={formData.role === "admin"}
                                            onChange={handleFormChange}
                                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                        />
                                        <div>
                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                <ShieldAlert
                                                    size={16}
                                                    className="text-purple-500"
                                                />{" "}
                                                Admin Kanwil
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Akses penuh ke semua data
                                            </div>
                                        </div>
                                    </label>
                                    <label
                                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.role === "satker" ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-teal-200"}`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="satker"
                                            checked={formData.role === "satker"}
                                            onChange={handleFormChange}
                                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                                        />
                                        <div>
                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                <Building
                                                    size={16}
                                                    className="text-teal-500"
                                                />{" "}
                                                Satuan Kerja
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Akses khusus data satker
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {formData.role === "satker" && (
                                <div className="md:col-span-2 p-4 bg-teal-50/50 border border-teal-100 rounded-xl mt-2 animate-in fade-in duration-300">
                                    <label className="block text-sm font-bold text-teal-800 mb-2">
                                        Pilih Satuan Kerja{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="kode_satker"
                                        value={formData.kode_satker}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full border-teal-200 rounded-xl shadow-sm py-2.5 px-4 border focus:ring-2 focus:ring-teal-500 text-sm bg-white font-medium text-slate-700"
                                    >
                                        <option value="">
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
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="editUserForm"
                        disabled={isSubmitting}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-md ${isSubmitting ? "bg-amber-400 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-600 hover:shadow-lg"}`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}{" "}
                        Update Pengguna
                    </button>
                </div>
            </div>
        </div>
    );
}
