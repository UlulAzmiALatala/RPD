import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function MainLayout({ children, tahun }) {
    const [authUser, setAuthUser] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(
        localStorage.getItem("sidebarOpen") === null
            ? true
            : localStorage.getItem("sidebarOpen") === "true",
    );

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

    useEffect(() => {
        axios
            .get("/api/user")
            .then((response) => {
                setAuthUser(response.data);
                setTimeout(() => setIsAuthenticating(false), 300);
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

    if (isAuthenticating) {
        return (
            <div className="min-h-screen bg-[#040814] flex items-center justify-center font-sans relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
                <div className="bg-[#0A1128]/80 backdrop-blur-2xl p-10 md:p-14 rounded-[3rem] border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-8 relative z-10 max-w-sm w-full mx-4 text-center">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 w-24 h-24 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                        <div className="w-20 h-20 bg-[#040814] border border-slate-800 rounded-[1.5rem] flex items-center justify-center relative z-10 shadow-inner">
                            <Loader2
                                size={36}
                                className="text-indigo-400 animate-spin"
                                strokeWidth={2.5}
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-black text-xl tracking-tight mb-2">
                            SIRA Enterprise
                        </h3>
                        <p className="text-indigo-400/80 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                            Otentikasi Kredensial
                        </p>
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
                            <ShieldCheck
                                size={14}
                                className="text-emerald-500"
                            />{" "}
                            Memverifikasi sesi aman...
                        </div>
                    </div>
                    <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full w-1/2 rounded-full animate-[progress_1.5s_ease-in-out_infinite]"></div>
                    </div>
                </div>
                <style>{`@keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
            </div>
        );
    }

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

    return (
        <div
            className={`relative min-h-screen bg-[#f8fafc] text-slate-700 font-sans flex overflow-x-hidden ${
                isResizing ? "select-none cursor-col-resize" : ""
            }`}
        >
            {/* =====================================================================
                ANIMASI EFEK ROKET & CAHAYA (DIKEMBALIKAN & DIOPTIMALKAN)
            ===================================================================== */}
            <style>{`
                @keyframes roket-lintas {
                    0% { transform: translateX(110vw); }
                    100% { transform: translateX(-30vw); }
                }
                @keyframes roket-gelombang {
                    0% { transform: translateY(-100px); }
                    100% { transform: translateY(100px); }
                }
                @keyframes roket-melingkar {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[30%] w-[120px] h-[120px] animate-[roket-lintas_15s_linear_infinite]">
                    <div className="w-full h-full animate-[roket-gelombang_4s_ease-in-out_infinite_alternate]">
                        <div className="relative w-full h-full animate-[roket-melingkar_2s_linear_infinite]">
                            {/* Cahaya Biru */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full blur-xl opacity-70 shadow-[80px_0_60px_15px_rgba(59,130,246,0.3)]"></div>
                                <div className="absolute top-1 left-1 w-6 h-6 bg-cyan-300 rounded-full blur-md opacity-80"></div>
                            </div>
                            {/* Cahaya Kuning */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                                <div className="w-8 h-8 bg-yellow-500 rounded-full blur-xl opacity-70 shadow-[80px_0_60px_15px_rgba(234,179,8,0.3)]"></div>
                                <div className="absolute top-1 left-1 w-6 h-6 bg-amber-400 rounded-full blur-md opacity-80"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* GLOWING AMBIENT DASAR */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 via-blue-50/10 to-transparent pointer-events-none z-0"></div>

            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-[#0B1120]/60 z-40 backdrop-blur-sm transition-opacity"
                ></div>
            )}

            {/* SIDEBAR WRAPPER (DENGAN TRANSISI 300MS YANG NGEBUT) */}
            <div
                className={`${
                    isMobile
                        ? "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out"
                        : "relative z-20 shrink-0"
                } ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
                style={{
                    width: isMobile ? "280px" : `${sidebarWidth}px`,
                    willChange: "width",
                    transition:
                        isLoaded && !isResizing
                            ? "width 300ms cubic-bezier(0.25, 1, 0.5, 1)"
                            : "none",
                }}
            >
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    sidebarWidth={isMobile ? 280 : sidebarWidth}
                    isLoaded={isLoaded}
                    authUser={authUser}
                    setSidebarOpen={setSidebarOpen}
                />
            </div>

            {/* RESIZER BAR */}
            {!isMobile && sidebarOpen && (
                <div
                    onMouseDown={startResizing}
                    className="w-1.5 h-screen bg-transparent hover:bg-indigo-500/30 hover:shadow-[0_0_10px_rgba(99,102,241,0.5)] cursor-col-resize absolute z-35 transition-all"
                    style={{ left: `${sidebarWidth - 2}px` }}
                ></div>
            )}

            {/* MAIN CONTENT AREA (DENGAN TRANSISI 300MS YANG NGEBUT) */}
            <div
                className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0"
                style={{
                    willChange: "margin-left",
                    transition:
                        isLoaded && !isResizing
                            ? "margin-left 300ms cubic-bezier(0.25, 1, 0.5, 1)"
                            : "none",
                }}
            >
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    tahun={tahun}
                    authUser={authUser}
                />

                <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar scroll-smooth">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
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
