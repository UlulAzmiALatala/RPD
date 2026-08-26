import "./bootstrap";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Pages
import Dashboard from "./Pages/Dashboard";
import IndexTransaksi from "./Pages/Admin/Transaksi/Index";
import LaporanRealisasi from "./Pages/LaporanRealisasi";
import InputAnggaran from "./Pages/InputAnggaran";
import LaporanBulanan from "./Pages/Admin/Laporan/LaporanBulanan"; // <-- Import Halaman Baru

const rootElement = document.getElementById("app");
if (rootElement) {
    const root = createRoot(rootElement);

    root.render(
        <BrowserRouter basename="/dashboard">
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/input-anggaran" element={<InputAnggaran />} />
                <Route path="/input-transaksi" element={<IndexTransaksi />} />
                <Route
                    path="/laporan-realisasi"
                    element={<LaporanRealisasi />}
                />

                {/* Route Laporan Bulanan Baru */}
                <Route path="/laporan-bulanan" element={<LaporanBulanan />} />

                {/* Tambahkan Route Ini */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>,
    );
}
