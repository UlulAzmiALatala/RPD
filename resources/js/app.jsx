import "./bootstrap";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Pages Auth
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";

// Import Polisi Lalu Lintas (Pengganti Dashboard Lama)
import DashboardIndex from "./Pages/DashboardIndex";

// Import Pages Master, Transaksi & Laporan
import IndexTransaksi from "./Pages/Admin/Transaksi/Index";
import IndexAnggaran from "./Pages/Admin/Anggaran/Index";
import LaporanRealisasi from "./Pages/Admin/Laporan/LaporanRealisasi";
import LaporanBulanan from "./Pages/Admin/Laporan/LaporanBulanan";

// 🔥 Import Page Capaian Output (RO) 🔥
import RincianOutputIndex from "./Pages/Admin/RincianOutput/Index";

// Import Page Manajemen User
import IndexUser from "./Pages/Admin/ManajemenUser/Index";

// Import Page Profil
import Profil from "./Pages/Profil";

// Import Page Log Aktivitas
import IndexLogAktivitas from "./Pages/Admin/LogAktivitas/Index";

// Import Page Tutup Buku
import IndexTutupBuku from "./Pages/Admin/TutupBuku/Index";

const rootElement = document.getElementById("app");
if (rootElement) {
    const root = createRoot(rootElement);

    root.render(
        <BrowserRouter>
            <Routes>
                {/* --- AUTHENTICATION ROUTES --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* --- DASHBOARD ROUTES --- */}
                {/* Route ini mengarah ke DashboardIndex (Polisi Lalu Lintas) */}
                <Route path="/dashboard" element={<DashboardIndex />} />

                <Route
                    path="/dashboard/input-anggaran"
                    element={<IndexAnggaran />}
                />
                <Route
                    path="/dashboard/input-transaksi"
                    element={<IndexTransaksi />}
                />

                {/* 🔥 Route Halaman Rincian Output (RO) 🔥 */}
                <Route
                    path="/dashboard/rincian-output"
                    element={<RincianOutputIndex />}
                />

                <Route
                    path="/dashboard/laporan-realisasi"
                    element={<LaporanRealisasi />}
                />
                <Route
                    path="/dashboard/laporan-bulanan"
                    element={<LaporanBulanan />}
                />

                <Route
                    path="/dashboard/tutup-buku"
                    element={<IndexTutupBuku />}
                />

                {/* Route Manajemen User */}
                <Route
                    path="/dashboard/manajemen-user"
                    element={<IndexUser />}
                />

                {/* Route Profil Saya */}
                <Route path="/dashboard/profil" element={<Profil />} />

                {/* Route Log Aktivitas */}
                <Route
                    path="/dashboard/log-aktivitas"
                    element={<IndexLogAktivitas />}
                />

                {/* --- REDIRECTS --- */}
                {/* Jika buka root domain, arahkan ke dashboard (nanti dicek auth-nya) */}
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />

                {/* Jika URL ngawur, arahkan ke login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>,
    );
}
