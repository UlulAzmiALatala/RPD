import "./bootstrap";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Pages (Sudah disesuaikan dengan struktur folder baru)
import Dashboard from "./Pages/Dashboard";
import IndexTransaksi from "./Pages/Admin/Transaksi/Index";
import IndexAnggaran from "./Pages/Admin/Anggaran/Index";
import LaporanRealisasi from "./Pages/Admin/Laporan/LaporanRealisasi";
import LaporanBulanan from "./Pages/Admin/Laporan/LaporanBulanan";

const rootElement = document.getElementById("app");
if (rootElement) {
    const root = createRoot(rootElement);

    root.render(
        <BrowserRouter basename="/dashboard">
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/input-anggaran" element={<IndexAnggaran />} />
                <Route path="/input-transaksi" element={<IndexTransaksi />} />
                <Route
                    path="/laporan-realisasi"
                    element={<LaporanRealisasi />}
                />
                <Route path="/laporan-bulanan" element={<LaporanBulanan />} />

                {/* Redirect jika route tidak ditemukan */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>,
    );
}
