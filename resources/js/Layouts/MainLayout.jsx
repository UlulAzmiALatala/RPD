import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";

export default function MainLayout({ children, tahun }) {
    const [authUser, setAuthUser] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(true);

    const [sidebarOpen, setSidebarOpen] = useState(
        localStorage.getItem("sidebarOpen") === null
            ? true
            : localStorage.getItem("sidebarOpen") === "true",
    );
    const [sidebarWidth, setSidebarWidth] = useState(
        sidebarOpen
            ? parseInt(localStorage.getItem("sidebarWidth")) || 288
            : 80,
    );
    const [isLoaded, setIsLoaded] = useState(false);

    // =========================================================================
    // 1. FETCH DATA USER
    // =========================================================================
    useEffect(() => {
        axios
            .get("/api/user")
            .then((response) => {
                setAuthUser(response.data);
                setIsAuthenticating(false);
            })
            .catch((error) => {
                console.error("Belum login atau sesi habis:", error);
                window.location.href = "/login";
            });

        setTimeout(() => setIsLoaded(true), 50);
    }, []);

    useEffect(() => {
        localStorage.setItem("sidebarOpen", sidebarOpen);
        if (!sidebarOpen) {
            setSidebarWidth(80);
        } else {
            setSidebarWidth(
                parseInt(localStorage.getItem("sidebarWidth")) || 288,
            );
        }
    }, [sidebarOpen]);

    // =========================================================================
    // 2. LAYAR LOADING AWAL
    // =========================================================================
    if (isAuthenticating) {
        return (
            <div className="min-h-screen bg-[#0B1120] flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="w-12 h-12 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin relative z-10"></div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-indigo-400 font-bold tracking-[0.2em] uppercase text-sm">
                            Otentikasi Sistem
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">
                            Memverifikasi kredensial...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // 3. PATROLI JALUR TIKUS TINGKAT DEWA
    // =========================================================================
    const isAdmin = authUser?.role === "admin";
    const currentPath = window.location.pathname;

    const restrictedPaths = [
        "/dashboard/input-anggaran",
        "/dashboard/laporan-bulanan",
        "/dashboard/laporan-realisasi",
        "/dashboard/manajemen-user",
        "/dashboard/log-aktivitas",
    ];

    // Jika BUKAN Admin dan mencoba mengakses URL terlarang
    if (!isAdmin && restrictedPaths.includes(currentPath)) {
        window.location.replace("/dashboard");
        return null;
    }

    // =========================================================================
    // 4. RENDER LAYOUT UTAMA
    // =========================================================================
    return (
        <div className="relative min-h-screen bg-slate-50 text-slate-600 font-sans transition-colors duration-300 overflow-hidden flex">
            <Sidebar
                sidebarOpen={sidebarOpen}
                sidebarWidth={sidebarWidth}
                isLoaded={isLoaded}
                authUser={authUser}
            />

            <div
                className={`flex-1 flex flex-col h-screen overflow-hidden relative ${isLoaded ? "transition-all duration-300 ease-in-out" : ""}`}
                style={{ marginLeft: `${sidebarWidth}px` }}
            >
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    tahun={tahun}
                    authUser={authUser}
                />

                <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar scroll-smooth">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        {React.Children.map(children, (child) => {
                            if (
                                React.isValidElement(child) &&
                                typeof child.type === "function"
                            ) {
                                return React.cloneElement(child, { authUser });
                            }
                            return child;
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
}
