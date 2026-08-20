import "./bootstrap";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Pages
import Dashboard from "./Pages/Dashboard";
import InputTransaksi from "./Pages/InputTransaksi";
import LaporanRealisasi from "./Pages/LaporanRealisasi"; // Tambahkan Import Ini

const rootElement = document.getElementById("app");
if (rootElement) {
    const root = createRoot(rootElement);

    root.render(
        <BrowserRouter basename="/dashboard">
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/input-transaksi" element={<InputTransaksi />} />
                <Route
                    path="/laporan-realisasi"
                    element={<LaporanRealisasi />}
                />{" "}
                {/* Tambahkan Route Ini */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>,
    );
}
