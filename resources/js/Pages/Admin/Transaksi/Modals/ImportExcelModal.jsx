import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import {
    X,
    FileSpreadsheet,
    UploadCloud,
    Download,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    Loader2,
    Layers,
    Trash2,
    Info,
    Sparkles,
    Lock,
} from "lucide-react";

const NAMA_BULAN = [
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

const parseBulan = (val) => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "number" && val >= 1 && val <= 12)
        return Math.floor(val);

    const str = String(val).trim().toLowerCase();
    const asNum = parseInt(str, 10);
    if (!isNaN(asNum) && asNum >= 1 && asNum <= 12 && /^\d+$/.test(str)) {
        return asNum;
    }

    const map = {
        jan: 1,
        januari: 1,
        january: 1,
        feb: 2,
        februari: 2,
        february: 2,
        mar: 3,
        maret: 3,
        march: 3,
        apr: 4,
        april: 4,
        mei: 5,
        may: 5,
        jun: 6,
        juni: 6,
        june: 6,
        jul: 7,
        juli: 7,
        july: 7,
        agu: 8,
        ags: 8,
        agustus: 8,
        aug: 8,
        august: 8,
        sep: 9,
        sept: 9,
        september: 9,
        okt: 10,
        oktober: 10,
        oct: 10,
        october: 10,
        nov: 11,
        november: 11,
        des: 12,
        desember: 12,
        dec: 12,
        december: 12,
    };

    return map[str] || null;
};

const parseNominal = (val) => {
    if (val === null || val === undefined || val === "") return 0;
    if (typeof val === "number") return Math.max(0, Math.round(val));
    const cleaned = String(val)
        .replace(/rp/gi, "")
        .replace(/\s+/g, "")
        .replace(/\./g, "")
        .replace(/,00$/, "")
        .replace(/,/g, "");
    const num = Number(cleaned);
    return isNaN(num) ? 0 : Math.max(0, Math.round(num));
};

const parseJenisBelanja = (val) => {
    if (!val) return null;
    const str = String(val).trim().toLowerCase();
    if (str.includes("51") || str.includes("gaji") || str.includes("pegawai"))
        return "gaji";
    if (str.includes("52") || str.includes("barang")) return "barang";
    if (str.includes("53") || str.includes("modal")) return "modal";
    return null;
};

const normalizeKey = (key) =>
    String(key || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

const pickField = (rowObj, candidates) => {
    const entries = Object.entries(rowObj);
    for (const candidate of candidates) {
        const found = entries.find(([k]) =>
            normalizeKey(k).includes(candidate),
        );
        if (found !== undefined) return found[1];
    }
    return "";
};

export default function ImportExcelModal({
    isOpen,
    onClose,
    onSuccess,
    activeTab,
    satkers = [],
    defaultTahun,
    localAuth,
}) {
    const isRPD = activeTab === "rpd";
    const isAdmin = localAuth?.role === "admin";
    const fileInputRef = useRef(null);

    const [mounted, setMounted] = useState(false);
    const [satkerId, setSatkerId] = useState("");
    const [tahun, setTahun] = useState(
        defaultTahun || new Date().getFullYear().toString(),
    );
    const [mode, setMode] = useState("skip");
    const [fileName, setFileName] = useState("");
    const [rawRows, setRawRows] = useState([]);
    const [roList, setRoList] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        setMounted(true);
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTahun(defaultTahun || new Date().getFullYear().toString());
            setErrorMsg("");
            setFileName("");
            setRawRows([]);
            if (!isAdmin && localAuth?.kode_satker && satkers.length > 0) {
                const mySatker = satkers.find(
                    (s) => s.kode_satker === localAuth.kode_satker,
                );
                if (mySatker) setSatkerId(mySatker.id.toString());
            }
        }
    }, [isOpen, defaultTahun, isAdmin, localAuth, satkers, activeTab]);

    // Tarik daftar RO untuk auto-matching Kode RO saat impor Realisasi
    useEffect(() => {
        if (isOpen && !isRPD && satkerId && tahun) {
            axios
                .get("/api/rincian-output", {
                    params: { satker_id: satkerId, tahun },
                })
                .then((res) => {
                    const list = res.data.data || res.data;
                    setRoList(Array.isArray(list) ? list : []);
                })
                .catch(() => setRoList([]));
        } else {
            setRoList([]);
        }
    }, [isOpen, isRPD, satkerId, tahun]);

    const selectedSatker = satkers.find(
        (s) => s.id?.toString() === satkerId?.toString(),
    );
    const namaSatkerUpper = (selectedSatker?.nama_satker || "").toUpperCase();
    const isSetjen =
        namaSatkerUpper.includes("SETJEN") ||
        namaSatkerUpper.includes("SEKRETARIAT JENDERAL") ||
        selectedSatker?.kode_satker === "692028";

    const roMapByKode = useMemo(() => {
        const map = {};
        roList.forEach((ro) => {
            if (ro.kode_ro) {
                map[String(ro.kode_ro).trim().toUpperCase()] = ro;
            }
        });
        return map;
    }, [roList]);

    // Validasi setiap baris hasil parsing Excel
    const parsedRows = useMemo(() => {
        return rawRows.map((row, index) => {
            const errors = [];
            if (isRPD) {
                const bulan = parseBulan(
                    pickField(row, ["bulan", "bln", "month"]),
                );
                const belanja_gaji = parseNominal(
                    pickField(row, ["gaji", "pegawai", "51"]),
                );
                const belanja_barang = parseNominal(
                    pickField(row, ["barang", "52"]),
                );
                const belanja_modal = parseNominal(
                    pickField(row, ["modal", "53"]),
                );

                if (!bulan)
                    errors.push("Bulan tidak valid (isi 1-12 atau nama bulan)");
                if (satkerId && !isSetjen && belanja_gaji > 0) {
                    errors.push(
                        "Non-Setjen tidak boleh mengisi Belanja Pegawai (51)",
                    );
                }
                if (belanja_gaji + belanja_barang + belanja_modal <= 0) {
                    errors.push("Total nominal bulan ini Rp 0");
                }

                return {
                    _rowNum: index + 2,
                    bulan,
                    belanja_gaji,
                    belanja_barang,
                    belanja_modal,
                    total: belanja_gaji + belanja_barang + belanja_modal,
                    errors,
                    isValid: errors.length === 0,
                };
            } else {
                const bulan = parseBulan(
                    pickField(row, ["bulan", "bln", "month"]),
                );
                const jenis_belanja = parseJenisBelanja(
                    pickField(row, ["jenis", "akun", "belanja", "kodebelanja"]),
                );
                const uraian = String(
                    pickField(row, [
                        "uraian",
                        "keterangan",
                        "deskripsi",
                        "transaksi",
                    ]) || "",
                ).trim();
                const nominal = parseNominal(
                    pickField(row, [
                        "nominal",
                        "jumlah",
                        "nilai",
                        "realisasi",
                        "rupiah",
                    ]),
                );
                const kode_ro = String(
                    pickField(row, ["kodero", "ro", "output"]) || "",
                )
                    .trim()
                    .toUpperCase();

                const matchedRo = kode_ro ? roMapByKode[kode_ro] || null : null;

                if (!bulan) errors.push("Bulan tidak valid");
                if (!jenis_belanja)
                    errors.push(
                        "Jenis belanja tidak valid (isi 51/52/53 atau gaji/barang/modal)",
                    );
                if (
                    satkerId &&
                    !isSetjen &&
                    jenis_belanja === "gaji" &&
                    nominal > 0
                ) {
                    errors.push(
                        "Non-Setjen dilarang input Belanja Pegawai (51)",
                    );
                }
                if (!uraian) errors.push("Uraian transaksi wajib diisi");
                if (nominal <= 0) errors.push("Nominal harus lebih dari 0");

                return {
                    _rowNum: index + 2,
                    bulan,
                    jenis_belanja,
                    uraian,
                    nominal,
                    kode_ro,
                    matchedRo,
                    rincian_output_id: matchedRo ? matchedRo.id : null,
                    errors,
                    isValid: errors.length === 0,
                };
            }
        });
    }, [rawRows, isRPD, satkerId, isSetjen, roMapByKode]);

    const validRows = useMemo(
        () => parsedRows.filter((r) => r.isValid),
        [parsedRows],
    );
    const invalidRows = useMemo(
        () => parsedRows.filter((r) => !r.isValid),
        [parsedRows],
    );
    const totalPreviewNominal = useMemo(
        () =>
            validRows.reduce(
                (acc, r) => acc + (isRPD ? r.total : r.nominal),
                0,
            ),
        [validRows, isRPD],
    );

    if (!isOpen || !mounted) return null;

    const formatRp = (val) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(val || 0);

    const handleDownloadTemplate = () => {
        let aoa = [];
        if (isRPD) {
            aoa = [
                [
                    "Bulan",
                    "Belanja_Gaji_51",
                    "Belanja_Barang_52",
                    "Belanja_Modal_53",
                ],
                [1, isSetjen ? 450000000 : 0, 125000000, 50000000],
                [2, isSetjen ? 450000000 : 0, 150000000, 75000000],
                [3, isSetjen ? 450000000 : 0, 200000000, 100000000],
            ];
        } else {
            const sampleKodeRo = roList[0]?.kode_ro || "";
            aoa = [
                ["Bulan", "Jenis_Belanja", "Uraian", "Nominal", "Kode_RO"],
                [
                    1,
                    "52",
                    "Belanja ATK dan Bahan Operasional Perkantoran",
                    15500000,
                    sampleKodeRo,
                ],
                [
                    1,
                    "52",
                    "Perjalanan Dinas Koordinasi Wilayah",
                    22000000,
                    sampleKodeRo,
                ],
                [
                    2,
                    "53",
                    "Pengadaan Perangkat Komputer & Jaringan",
                    48000000,
                    sampleKodeRo,
                ],
            ];
        }

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        ws["!cols"] = isRPD
            ? [{ wch: 12 }, { wch: 22 }, { wch: 22 }, { wch: 22 }]
            : [{ wch: 10 }, { wch: 16 }, { wch: 45 }, { wch: 18 }, { wch: 18 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            wb,
            ws,
            isRPD ? "Template_RPD" : "Template_Realisasi",
        );
        XLSX.writeFile(
            wb,
            `Template_Import_${isRPD ? "RPD" : "Realisasi"}_SIRA_${tahun}.xlsx`,
        );
    };

    const processFile = (file) => {
        if (!file) return;
        setErrorMsg("");
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, {
                    defval: "",
                });

                if (!json || json.length === 0) {
                    setErrorMsg(
                        "File Excel kosong atau format header tidak terbaca. Gunakan Template Resmi untuk memastikan struktur kolom.",
                    );
                    setRawRows([]);
                    return;
                }
                setRawRows(json);
            } catch (err) {
                setErrorMsg(
                    "Gagal membaca file Excel. Pastikan file berformat .xlsx, .xls, atau .csv yang valid.",
                );
                setRawRows([]);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        processFile(file);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        processFile(file);
    };

    const handleImportSubmit = async () => {
        if (!satkerId) {
            setErrorMsg("Silakan pilih Satuan Kerja terlebih dahulu.");
            return;
        }
        if (validRows.length === 0) {
            setErrorMsg("Tidak ada baris valid untuk diimpor.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            const endpoint = isRPD
                ? "/api/transaksi/rpd/import"
                : "/api/transaksi/realisasi/import";

            const payloadRows = isRPD
                ? validRows.map((r) => ({
                      bulan: r.bulan,
                      belanja_gaji: r.belanja_gaji,
                      belanja_barang: r.belanja_barang,
                      belanja_modal: r.belanja_modal,
                  }))
                : validRows.map((r) => ({
                      bulan: r.bulan,
                      jenis_belanja: r.jenis_belanja,
                      uraian: r.uraian,
                      nominal: r.nominal,
                      kode_ro: r.kode_ro || null,
                      rincian_output_id: r.rincian_output_id || null,
                  }));

            const res = await axios.post(endpoint, {
                satker_id: satkerId,
                tahun: Number(tahun),
                mode,
                rows: payloadRows,
            });

            onSuccess(res.data.message || "Impor Excel berhasil!");
            onClose();
        } catch (err) {
            setErrorMsg(
                err.response?.data?.message ||
                    "Terjadi kesalahan saat mengimpor data ke server.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-5xl overflow-hidden border border-white flex flex-col max-h-[94vh] animate-in zoom-in-95 fade-in duration-300 relative">
                {/* HEADER */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-100 bg-slate-50/40 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-[0_8px_16px_rgba(16,185,129,0.25)]">
                            <FileSpreadsheet size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                    Smart Excel Importer
                                </h2>
                                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
                                    {isRPD ? "Mode RPD" : "Mode Realisasi"}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                Unggah rekap Excel SAKTI/OMSPAN tanpa input
                                manual satu per satu.
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

                {/* BODY */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6 bg-white/50">
                    {errorMsg && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold text-rose-800">
                                {errorMsg}
                            </p>
                        </div>
                    )}

                    {/* KONFIGURASI TARGET IMPOR */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/90 p-5 rounded-[2rem] border border-slate-200/70 shadow-inner">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                Satuan Kerja Tujuan *
                            </label>
                            <select
                                value={satkerId}
                                onChange={(e) => setSatkerId(e.target.value)}
                                disabled={!isAdmin}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                            >
                                <option value="" disabled>
                                    -- Pilih Satuan Kerja --
                                </option>
                                {satkers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.kode_satker} - {s.nama_satker}
                                    </option>
                                ))}
                            </select>
                            {satkerId && !isSetjen && (
                                <p className="text-[10px] font-bold text-amber-600 mt-1.5 ml-1 flex items-center gap-1">
                                    <Lock size={11} /> Non-Setjen: Belanja
                                    Pegawai (51) otomatis divalidasi 0.
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                Tahun Anggaran *
                            </label>
                            <input
                                type="number"
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                min="2020"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                Jika Bulan Sudah Ada
                            </label>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                            >
                                <option value="skip">Lewati (Aman)</option>
                                <option value="overwrite">
                                    Timpa & Reset Draft
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* BANNER TEMPLATE 1 KLIK + DROPZONE */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="bg-gradient-to-br from-slate-900 to-[#0B1120] text-white p-6 rounded-[2rem] border border-slate-800 flex flex-col justify-between gap-4 shadow-lg">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-3">
                                    <Sparkles size={12} /> Langkah 1
                                </div>
                                <h3 className="text-lg font-black tracking-tight">
                                    Unduh Format Template
                                </h3>
                                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                    {isRPD
                                        ? "Format kolom: Bulan (1-12), Belanja_Gaji_51, Belanja_Barang_52, Belanja_Modal_53."
                                        : "Format kolom: Bulan, Jenis_Belanja (51/52/53), Uraian, Nominal, dan Kode_RO (opsional, otomatis terhubung ke RO)."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
                            >
                                <Download size={16} strokeWidth={2.5} /> Unduh
                                Template .XLSX
                            </button>
                        </div>

                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`lg:col-span-2 p-8 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                isDragging
                                    ? "border-emerald-500 bg-emerald-50/70 scale-[1.01]"
                                    : "border-slate-300 bg-slate-50/60 hover:border-emerald-400 hover:bg-emerald-50/30"
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
                                <UploadCloud size={32} strokeWidth={2} />
                            </div>
                            <h4 className="text-base font-black text-slate-800">
                                {fileName
                                    ? `File terpilih: ${fileName}`
                                    : "Tarik & Lepas File Excel di Sini"}
                            </h4>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                                atau klik untuk memilih file (.xlsx, .xls, .csv)
                            </p>
                            {fileName && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFileName("");
                                        setRawRows([]);
                                    }}
                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white text-[11px] font-black transition-colors border border-rose-200"
                                >
                                    <Trash2 size={13} /> Hapus File
                                </button>
                            )}
                        </div>
                    </div>

                    {/* PREVIEW TABEL VALIDASI */}
                    {parsedRows.length > 0 && (
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                                        Pratinjau Data ({parsedRows.length}{" "}
                                        Baris)
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-200 flex items-center gap-1">
                                        <CheckCircle2 size={12} />{" "}
                                        {validRows.length} Siap Impor
                                    </span>
                                    {invalidRows.length > 0 && (
                                        <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest border border-rose-200 flex items-center gap-1">
                                            <AlertTriangle size={12} />{" "}
                                            {invalidRows.length} Bermasalah
                                            (Diabaikan)
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs font-black text-emerald-700">
                                    Total Valid: {formatRp(totalPreviewNominal)}
                                </div>
                            </div>

                            <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
                                <table className="w-full text-left text-xs whitespace-nowrap">
                                    <thead className="bg-[#0A192F] text-slate-300 text-[10px] uppercase font-black tracking-widest sticky top-0 z-10">
                                        {isRPD ? (
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Baris
                                                </th>
                                                <th className="px-4 py-3">
                                                    Bulan
                                                </th>
                                                <th className="px-4 py-3 text-right">
                                                    Pegawai (51)
                                                </th>
                                                <th className="px-4 py-3 text-right">
                                                    Barang (52)
                                                </th>
                                                <th className="px-4 py-3 text-right">
                                                    Modal (53)
                                                </th>
                                                <th className="px-4 py-3 text-right">
                                                    Total
                                                </th>
                                                <th className="px-4 py-3">
                                                    Status Validasi
                                                </th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Baris
                                                </th>
                                                <th className="px-4 py-3">
                                                    Bulan
                                                </th>
                                                <th className="px-4 py-3">
                                                    Akun
                                                </th>
                                                <th className="px-4 py-3">
                                                    Uraian Transaksi
                                                </th>
                                                <th className="px-4 py-3">
                                                    Kaitan RO
                                                </th>
                                                <th className="px-4 py-3 text-right">
                                                    Nominal
                                                </th>
                                                <th className="px-4 py-3">
                                                    Status Validasi
                                                </th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {parsedRows.map((row) => (
                                            <tr
                                                key={row._rowNum}
                                                className={
                                                    row.isValid
                                                        ? "hover:bg-slate-50"
                                                        : "bg-rose-50/60"
                                                }
                                            >
                                                <td className="px-4 py-3 font-mono font-bold text-slate-400">
                                                    #{row._rowNum}
                                                </td>
                                                <td className="px-4 py-3 font-black text-slate-800">
                                                    {row.bulan
                                                        ? NAMA_BULAN[row.bulan]
                                                        : "-"}
                                                </td>

                                                {isRPD ? (
                                                    <>
                                                        <td className="px-4 py-3 text-right font-mono font-semibold">
                                                            {formatRp(
                                                                row.belanja_gaji,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-semibold">
                                                            {formatRp(
                                                                row.belanja_barang,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-semibold">
                                                            {formatRp(
                                                                row.belanja_modal,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-black text-indigo-700">
                                                            {formatRp(
                                                                row.total,
                                                            )}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-4 py-3 font-black uppercase">
                                                            {row.jenis_belanja ===
                                                            "gaji"
                                                                ? "51 - Gaji"
                                                                : row.jenis_belanja ===
                                                                    "barang"
                                                                  ? "52 - Barang"
                                                                  : row.jenis_belanja ===
                                                                      "modal"
                                                                    ? "53 - Modal"
                                                                    : "-"}
                                                        </td>
                                                        <td className="px-4 py-3 font-bold text-slate-800 max-w-[260px] truncate">
                                                            {row.uraian || "-"}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {row.matchedRo ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-black text-[10px]">
                                                                    <Layers
                                                                        size={
                                                                            10
                                                                        }
                                                                    />{" "}
                                                                    {
                                                                        row
                                                                            .matchedRo
                                                                            .kode_ro
                                                                    }
                                                                </span>
                                                            ) : row.kode_ro ? (
                                                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">
                                                                    {
                                                                        row.kode_ro
                                                                    }{" "}
                                                                    (Belum
                                                                    terdaftar)
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400">
                                                                    Umum
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-black text-emerald-700">
                                                            {formatRp(
                                                                row.nominal,
                                                            )}
                                                        </td>
                                                    </>
                                                )}

                                                <td className="px-4 py-3">
                                                    {row.isValid ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 font-black text-[10px] uppercase">
                                                            <CheckCircle2
                                                                size={13}
                                                            />{" "}
                                                            Valid
                                                        </span>
                                                    ) : (
                                                        <span className="text-rose-600 font-bold text-[11px]">
                                                            {row.errors.join(
                                                                "; ",
                                                            )}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-5 py-3 bg-indigo-50/60 border-t border-indigo-100 flex items-center gap-2 text-[11px] font-semibold text-indigo-800">
                                <Info size={14} className="shrink-0" />
                                Seluruh data hasil impor masuk berstatus{" "}
                                <strong>Draft</strong> untuk melewati verifikasi
                                Admin Kanwil & validasi Tutup Buku (Cut-Off).
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-6 md:px-8 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="text-xs font-bold text-slate-500">
                        Siap memproses{" "}
                        <span className="text-emerald-600 font-black">
                            {validRows.length} baris valid
                        </span>{" "}
                        ke database.
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleImportSubmit}
                            disabled={
                                isSubmitting ||
                                validRows.length === 0 ||
                                !satkerId
                            }
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-white transition-all ${
                                isSubmitting ||
                                validRows.length === 0 ||
                                !satkerId
                                    ? "bg-slate-300 cursor-not-allowed"
                                    : "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-[0_8px_16px_rgba(16,185,129,0.25)] hover:-translate-y-0.5"
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />{" "}
                                    Mengimpor...
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={18} strokeWidth={2.5} />{" "}
                                    Jalankan Impor ({validRows.length})
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
