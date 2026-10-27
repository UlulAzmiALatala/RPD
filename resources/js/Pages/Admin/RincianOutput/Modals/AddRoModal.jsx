import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
    Loader2,
    Wallet,
    Info,
} from "lucide-react";

export default function AddRoModal({
    onClose,
    onSuccess,
    satkerId,
    tahun,
    authUser,
    daftarSatker,
    satkerSummary,
}) {
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        satker_id: satkerId || "",
        kode_ro: "",
        nama_ro: "",
        satuan: "",
        target_volume: "",
        pagu_anggaran: "",
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // State untuk menampung total pagu dan total RO yang sudah terdaftar
    const [satkerPaguInfo, setSatkerPaguInfo] = useState({
        totalPagu: 0,
        teralokasi: 0,
    });

    useEffect(() => {
        setMounted(true);
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const isOpen = true;

    // 🔥 AMBIL INFORMASI PAGU & ALOKASI RO SAAT SATKER DIPILIH
    useEffect(() => {
        if (formData.satker_id && tahun) {
            axios
                .get(`/api/rincian-output`, {
                    params: { satker_id: formData.satker_id, tahun: tahun },
                })
                .then((res) => {
                    const roList = res.data.data || [];
                    // Hitung total pagu yang sudah teralokasi ke RO lain
                    const totalTeralokasi = roList.reduce(
                        (sum, item) => sum + Number(item.pagu_anggaran || 0),
                        0,
                    );

                    // Ambil data pagu efektif satker dari ringkasan atau endpoint anggaran
                    axios
                        .get(`/api/anggaran?tahun=${tahun}`)
                        .then((angRes) => {
                            // Cari pagu satker yang bersangkutan
                            const listAnggaran =
                                angRes.data.data || angRes.data;
                            // Sesuaikan dengan struktur endpoint anggaran Anda, atau ambil dari satkerSummary jika ada
                            const targetAnggaran = Array.isArray(listAnggaran)
                                ? listAnggaran.find(
                                      (a) =>
                                          a.satker_id.toString() ===
                                          formData.satker_id.toString(),
                                  )
                                : null;

                            const paguEfektifSatker = targetAnggaran
                                ? Number(targetAnggaran.pagu_efektif || 0)
                                : 0;

                            setSatkerPaguInfo({
                                totalPagu: paguEfektifSatker,
                                teralokasi: totalTeralokasi,
                            });
                        })
                        .catch(() => {
                            setSatkerPaguInfo({
                                totalPagu: 0,
                                teralokasi: totalTeralokasi,
                            });
                        });
                })
                .catch((err) =>
                    console.error("Gagal menghitung alokasi RO:", err),
                );
        } else {
            setSatkerPaguInfo({ totalPagu: 0, teralokasi: 0 });
        }
    }, [formData.satker_id, tahun]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount || 0);

    const sisaPaguSatker = satkerPaguInfo.totalPagu - satkerPaguInfo.teralokasi;
    const inputPaguRo = Number(formData.pagu_anggaran || 0);
    const isExceeding = sisaPaguSatker > 0 && inputPaguRo > sisaPaguSatker;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMsg) setErrorMsg("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isExceeding) {
            setErrorMsg(
                "Pagu Rincian Output (RO) ini melebihi Sisa Pagu Induk Satuan Kerja!",
            );
            return;
        }

        setLoading(true);
        setErrorMsg("");

        const payload = { ...formData, tahun: tahun };

        axios
            .post("/api/rincian-output", payload)
            .then((res) => onSuccess(res.data.message))
            .catch((err) => {
                setErrorMsg(
                    err.response?.data?.message ||
                        "Terjadi kesalahan sistem saat menyimpan data.",
                );
                setLoading(false);
            });
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden border border-white/60 flex flex-col max-h-[95vh] animate-in zoom-in-95 fade-in duration-300 relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-100/60 bg-slate-50/30 shrink-0 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-[0_8px_16px_rgba(79,70,229,0.25)]">
                            <Target size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                Setup Target RO
                            </h3>
                            <p className="text-sm font-medium text-slate-500 mt-0.5 uppercase tracking-widest">
                                Tahun Anggaran {tahun}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors outline-none"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 relative z-10">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
                            <AlertTriangle
                                size={20}
                                className="text-rose-500 mt-0.5 shrink-0"
                            />
                            <p className="text-sm font-bold text-rose-800">
                                {errorMsg}
                            </p>
                        </div>
                    )}

                    {/* 🔥 SECTION INFORMASI SISA PAGU SATKER (HUD) */}
                    {formData.satker_id && satkerPaguInfo.totalPagu > 0 && (
                        <div className="mb-6 p-5 bg-gradient-to-br from-slate-900 to-[#0A192F] text-white rounded-[2rem] shadow-md border border-slate-800 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3">
                                <Wallet size={14} /> Ringkasan Pagu Satker &
                                Alokasi RO
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        Total Pagu Dipa
                                    </span>
                                    <p className="text-sm font-black text-white">
                                        {formatCurrency(
                                            satkerPaguInfo.totalPagu,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        Sudah Teralokasi RO Lain
                                    </span>
                                    <p className="text-sm font-black text-amber-400">
                                        {formatCurrency(
                                            satkerPaguInfo.teralokasi,
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                    Sisa Pagu Bisa Dibagi:
                                </span>
                                <span
                                    className={`text-base font-black font-mono ${sisaPaguSatker < 0 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}
                                >
                                    {formatCurrency(sisaPaguSatker)}
                                </span>
                            </div>
                        </div>
                    )}

                    <form
                        id="form-add-ro"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {authUser?.role === "admin" && (
                            <div className="p-5 bg-slate-50/80 border border-slate-200/60 rounded-[2rem] shadow-inner mb-2">
                                <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
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
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-indigo-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none cursor-pointer transition-all"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
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
                                    className="w-full px-5 py-3.5 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:font-normal"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
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
                                    className="w-full px-5 py-3.5 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:font-normal"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
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
                                className="w-full px-5 py-3.5 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:font-normal"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-indigo-50/50 border border-indigo-100 rounded-[2rem]">
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    <Target
                                        size={14}
                                        className="text-indigo-500"
                                    />{" "}
                                    Target Volume
                                </label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    name="target_volume"
                                    placeholder="Contoh: 50.5"
                                    value={formData.target_volume}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-white border border-indigo-200 rounded-2xl text-lg font-black text-indigo-700 shadow-sm focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all placeholder:font-normal"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
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
                                    max={
                                        sisaPaguSatker > 0
                                            ? sisaPaguSatker
                                            : undefined
                                    }
                                    name="pagu_anggaran"
                                    placeholder="Contoh: 150000000"
                                    value={formData.pagu_anggaran}
                                    onChange={handleChange}
                                    className={`w-full px-5 py-3.5 bg-white border rounded-2xl text-lg font-black shadow-sm focus:ring-4 outline-none transition-all placeholder:font-normal ${isExceeding ? "border-rose-300 text-rose-600 focus:ring-rose-500/20" : "border-emerald-200 text-emerald-700 focus:ring-emerald-500/20"}`}
                                />
                                {isExceeding && (
                                    <p className="text-[9px] font-bold text-rose-500 mt-1.5 ml-1">
                                        Melebihi sisa pagu efektif!
                                    </p>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 md:px-8 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 relative z-20">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-3.5 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors outline-none"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="form-add-ro"
                        disabled={loading || isExceeding}
                        className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white transition-all duration-300 outline-none ${loading || isExceeding ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-[0_8px_16px_rgba(79,70,229,0.25)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5"}`}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save size={18} strokeWidth={2.5} />
                        )}{" "}
                        Simpan Target
                    </button>
                </div>
            </div>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>
        </div>,
        document.body,
    );
}
