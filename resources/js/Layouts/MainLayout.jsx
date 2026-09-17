import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";

export default function MainLayout({ children, tahun }) {
    const [authUser, setAuthUser] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(
        localStorage.getItem("sidebarOpen") === null
            ? true
            : localStorage.getItem("sidebarOpen") === "true",
    );

    // 🔥 KUNCI LEBAR MINIMAL 260px AGAR TIDAK TABRAKAN DENGAN KONTEN
    const [sidebarWidth, setSidebarWidth] = useState(
        sidebarOpen
            ? Math.max(
                  260,
                  parseInt(localStorage.getItem("sidebarWidth")) || 288,
              )
            : 80,
    );
    const [isLoaded, setIsLoaded] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    // =========================================================================
    // 1. DETEKSI UKURAN LAYAR (RESPONSIVE MOBILE CHECK)
    // =========================================================================
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // =========================================================================
    // 2. FETCH DATA USER
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
        if (!isMobile) {
            localStorage.setItem("sidebarOpen", sidebarOpen);
            if (!sidebarOpen) {
                setSidebarWidth(80);
            } else {
                const savedWidth =
                    parseInt(localStorage.getItem("sidebarWidth")) || 288;
                setSidebarWidth(Math.max(260, savedWidth));
            }
        }
    }, [sidebarOpen, isMobile]);

    // =========================================================================
    // 3. FITUR RESIZABLE SIDEBAR (DENGAN BATAS AMAN MINIMAL 260px)
    // =========================================================================
    const startResizing = useCallback(() => {
        if (!isMobile && sidebarOpen) {
            setIsResizing(true);
        }
    }, [isMobile, sidebarOpen]);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent) => {
            if (isResizing && !isMobile) {
                const newWidth = mouseMoveEvent.clientX;
                // 🔥 KUNCI BATAS MINIMAL 260px DAN MAKSIMAL 450px
                if (newWidth >= 260 && newWidth <= 450) {
                    setSidebarWidth(newWidth);
                    localStorage.setItem("sidebarWidth", newWidth);
                }
            }
        },
        [isResizing, isMobile],
    );

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    // =========================================================================
    // 4. LAYAR LOADING AWAL
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
    // 5. PATROLI JALUR TIKUS TINGKAT DEWA
    // =========================================================================
    const isAdmin = authUser?.role === "admin";
    const currentPath = window.location.pathname;

    const restrictedPaths = [
        "/dashboard/input-anggaran",
        "/dashboard/laporan-bulanan",
        "/dashboard/laporan-realisasi",
        "/dashboard/manajemen-user",
        "/dashboard/log-aktivitas",
        "/dashboard/tutup-buku",
    ];

    if (!isAdmin && restrictedPaths.includes(currentPath)) {
        window.location.replace("/dashboard");
        return null;
    }

    // =========================================================================
    // 6. RENDER LAYOUT UTAMA
    // =========================================================================
    return (
        <div
            className={`relative min-h-screen bg-slate-50 text-slate-600 font-sans transition-colors duration-300 overflow-hidden flex ${isResizing ? "select-none cursor-col-resize" : ""}`}
        >
            {/* OVERLAY GELAP DI HP */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-sm transition-opacity"
                ></div>
            )}

            {/* SIDEBAR UTAMA */}
            <div
                className={`${isMobile ? "fixed inset-y-0 left-0 z-50 transition-transform duration-300" : "relative"} ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
            >
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    sidebarWidth={isMobile ? 280 : sidebarWidth}
                    isLoaded={isLoaded}
                    authUser={authUser}
                    setSidebarOpen={setSidebarOpen}
                />
            </div>

            {/* GARIS PEMBATAS INTERAKTIF (DRAG TO RESIZE) */}
            {!isMobile && sidebarOpen && (
                <div
                    onMouseDown={startResizing}
                    className="w-1.5 h-screen bg-transparent hover:bg-indigo-500/50 cursor-col-resize absolute z-30 transition-colors"
                    style={{ left: `${sidebarWidth}px` }}
                    title="Seret untuk mengatur lebar sidebar"
                ></div>
            )}

            {/* KONTEN UTAMA */}
            <div
                className={`flex-1 flex flex-col h-screen overflow-hidden relative ${isLoaded && !isResizing ? "transition-all duration-300 ease-in-out" : ""}`}
                style={{ marginLeft: isMobile ? "0px" : `${sidebarWidth}px` }}
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
