import "./bootstrap";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Guards
import { GuestRoute, ProtectedRoute } from "./Components/AuthGuard";

// Pages Auth
import Login from "./Pages/Auth/Login";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ForceChangePassword from "./Pages/Auth/ForceChangePassword";

// Polisi Lalu Lintas Dashboard
import DashboardIndex from "./Pages/DashboardIndex";

// Pages Master, Transaksi & Laporan
import IndexTransaksi from "./Pages/Admin/Transaksi/Index";
import IndexAnggaran from "./Pages/Admin/Anggaran/Index";
import LaporanRealisasi from "./Pages/Admin/Laporan/LaporanRealisasi";
import LaporanBulanan from "./Pages/Admin/Laporan/LaporanBulanan";
import RincianOutputIndex from "./Pages/Admin/RincianOutput/Index";

// Pages Tata Kelola & Profil
import IndexUser from "./Pages/Admin/ManajemenUser/Index";
import Profil from "./Pages/Profil";
import IndexLogAktivitas from "./Pages/Admin/LogAktivitas/Index";
import IndexTutupBuku from "./Pages/Admin/TutupBuku/Index";
import IndexPengaturanPdf from "./Pages/Admin/PengaturanPdf/Index";

const rootElement = document.getElementById("app");
if (rootElement) {
    const root = createRoot(rootElement);

    root.render(
        <BrowserRouter>
            <Routes>
                {/* --- AUTHENTICATION ROUTES --- */}
                <Route
                    path="/login"
                    element={
                        <GuestRoute>
                            <Login />
                        </GuestRoute>
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                        <GuestRoute>
                            <ForgotPassword />
                        </GuestRoute>
                    }
                />
                <Route
                    path="/ganti-password-wajib"
                    element={
                        <ProtectedRoute allowForceChange>
                            <ForceChangePassword />
                        </ProtectedRoute>
                    }
                />
                {/* Registrasi publik ditutup total */}
                <Route
                    path="/register"
                    element={<Navigate to="/login" replace />}
                />

                {/* --- DASHBOARD ROUTES (ADMIN & SATKER) --- */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardIndex />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/input-transaksi"
                    element={
                        <ProtectedRoute>
                            <IndexTransaksi />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/input-ro"
                    element={
                        <ProtectedRoute>
                            <RincianOutputIndex />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/laporan-realisasi"
                    element={
                        <ProtectedRoute>
                            <LaporanRealisasi />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/profil"
                    element={
                        <ProtectedRoute>
                            <Profil />
                        </ProtectedRoute>
                    }
                />

                {/* --- DASHBOARD ROUTES KHUSUS ADMIN KANWIL (ROLE GUARD) --- */}
                <Route
                    path="/dashboard/input-anggaran"
                    element={
                        <ProtectedRoute requireAdmin>
                            <IndexAnggaran />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/laporan-bulanan"
                    element={
                        <ProtectedRoute requireAdmin>
                            <LaporanBulanan />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/tutup-buku"
                    element={
                        <ProtectedRoute requireAdmin>
                            <IndexTutupBuku />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/manajemen-user"
                    element={
                        <ProtectedRoute requireAdmin>
                            <IndexUser />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/pengaturan-pdf"
                    element={
                        <ProtectedRoute requireAdmin>
                            <IndexPengaturanPdf />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/log-aktivitas"
                    element={
                        <ProtectedRoute requireAdmin>
                            <IndexLogAktivitas />
                        </ProtectedRoute>
                    }
                />

                {/* --- REDIRECTS --- */}
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>,
    );
}
