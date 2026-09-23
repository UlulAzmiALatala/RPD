import React, { useState } from "react";
import axios from "axios";
import {
    X,
    Save,
    Target,
    Hash,
    FileType,
    CheckSquare,
    DollarSign,
    AlertTriangle,
    Building2,
} from "lucide-react";

// 🔥 TERIMA PROP authUser dan daftarSatker DARI INDEX 🔥
export default function AddRoModal({
    onClose,
    onSuccess,
    satkerId,
    tahun,
    authUser,
    daftarSatker,
}) {
    const [formData, setFormData] = useState({
        satker_id: satkerId || "", // Inisialisasi otomatis jika admin sudah milih di filter luar
        kode_ro: "",
        nama_ro: "",
        satuan: "",
        target_volume: "",
        pagu_anggaran: "",
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMsg) setErrorMsg("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const payload = {
            ...formData,
            tahun: tahun,
        };

        axios
            .post("/api/rincian-output", payload)
            .then((res) => {
                onSuccess(res.data.message);
            })
            .catch((err) => {
                setErrorMsg(
                    err.response?.data?.message ||
                        "Terjadi kesalahan sistem saat menyimpan data.",
                );
                setLoading(false);
            });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Target size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 text-lg">
                                Setup Target RO
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Tahun Anggaran {tahun}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertTriangle
                                size={18}
                                className="text-rose-500 mt-0.5 shrink-0"
                            />
                            <p className="text-sm font-bold text-rose-700">
                                {errorMsg}
                            </p>
                        </div>
                    )}

                    <form
                        id="form-add-ro"
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* 🔥 KHUSUS ADMIN: TAMPILKAN DROPDOWN PILIH SATKER 🔥 */}
                        {authUser?.role === "admin" && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-2">
                                <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                    <Building2
                                        size={14}
                                        className="text-indigo-400"
                                    />{" "}
                                    Pilih Satuan Kerja
                                </label>
                                <select
                                    required
                                    name="satker_id"
                                    value={formData.satker_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                >
                                    <option value="">-- Pilih Satker --</option>
                                    {daftarSatker?.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.kode_satker} - {s.nama_satker}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                    <Hash
                                        size={14}
                                        className="text-indigo-400"
                                    />{" "}
                                    Kode RO
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="kode_ro"
                                    placeholder="Misal: 4258.EBA.962"
                                    value={formData.kode_ro}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                    <CheckSquare
                                        size={14}
                                        className="text-indigo-400"
                                    />{" "}
                                    Satuan
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="satuan"
                                    placeholder="Misal: Layanan / Orang"
                                    value={formData.satuan}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                <FileType
                                    size={14}
                                    className="text-indigo-400"
                                />{" "}
                                Nama Rincian Output
                            </label>
                            <input
                                required
                                type="text"
                                name="nama_ro"
                                placeholder="Misal: Pembinaan Narapidana"
                                value={formData.nama_ro}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                    <Target
                                        size={14}
                                        className="text-indigo-600"
                                    />{" "}
                                    Target Volume
                                </label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    name="target_volume"
                                    placeholder="Contoh: 50"
                                    value={formData.target_volume}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-lg font-black text-indigo-700 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                    <DollarSign
                                        size={14}
                                        className="text-emerald-500"
                                    />{" "}
                                    Pagu Anggaran (Rp)
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    name="pagu_anggaran"
                                    placeholder="Contoh: 150000000"
                                    value={formData.pagu_anggaran}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-lg font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="form-add-ro"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                    >
                        <Save size={16} />{" "}
                        {loading ? "Menyimpan..." : "Simpan Target"}
                    </button>
                </div>
            </div>
        </div>
    );
}
