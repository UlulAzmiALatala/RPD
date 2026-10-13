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
                setTimeout(() => setIsAuthenticating(false), 500);
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
            className={`relative min-h-screen bg-[#f8fafc] text-slate-700 font-sans transition-colors duration-300 overflow-hidden flex ${isResizing ? "select-none cursor-col-resize" : ""}`}
        >
            {/* =====================================================================
                ANIMASI CUSTOM: ROKET CAHAYA BIRU KUNING (CHALLENGE ACCEPTED) 🔥
            ===================================================================== */}
            <style>{`
                @keyframes roket-lintas {
                    0% { transform: translateX(110vw); }
                    100% { transform: translateX(-30vw); }
                }
                @keyframes roket-gelombang {
                    0% { transform: translateY(-150px); }
                    100% { transform: translateY(150px); }
                }
                @keyframes roket-melingkar {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Pembungkus 1: Lintas dari Kanan ke Kiri (durasi 12 detik) */}
                <div className="absolute top-[40%] w-[150px] h-[150px] animate-[roket-lintas_12s_linear_infinite]">
                    {/* Pembungkus 2: Gelombang Naik Turun (durasi 3 detik) */}
                    <div className="w-full h-full animate-[roket-gelombang_3s_ease-in-out_infinite_alternate]">
                        {/* Pembungkus 3: Melingkar/Berputar terus menerus (durasi 1 detik) */}
                        <div className="relative w-full h-full animate-[roket-melingkar_1s_linear_infinite]">
                            {/* 💙 CAHAYA BIRU 💙 */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2">
                                <div className="w-10 h-10 bg-blue-500 rounded-full blur-xl opacity-80 shadow-[100px_0_80px_20px_rgba(59,130,246,0.4)]"></div>
                                <div className="absolute top-1 left-1 w-8 h-8 bg-cyan-300 rounded-full blur-md opacity-90 shadow-[0_0_20px_10px_rgba(34,211,238,0.8)]"></div>
                                <div className="absolute top-3 left-3 w-4 h-4 bg-white rounded-full blur-[2px]"></div>
                            </div>

                            {/* 💛 CAHAYA KUNING 💛 */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                                <div className="w-10 h-10 bg-yellow-500 rounded-full blur-xl opacity-80 shadow-[100px_0_80px_20px_rgba(234,179,8,0.4)]"></div>
                                <div className="absolute top-1 left-1 w-8 h-8 bg-amber-400 rounded-full blur-md opacity-90 shadow-[0_0_20px_10px_rgba(251,191,36,0.8)]"></div>
                                <div className="absolute top-3 left-3 w-4 h-4 bg-white rounded-full blur-[2px]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* GLOWING AMBIENT DASAR */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50/60 via-blue-50/20 to-transparent pointer-events-none z-0"></div>

            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-[#0B1120]/60 z-40 backdrop-blur-sm transition-opacity"
                ></div>
            )}

            <div
                className={`${isMobile ? "fixed inset-y-0 left-0 z-50 transition-transform duration-500 ease-out" : "relative z-20"} ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
            >
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    sidebarWidth={isMobile ? 280 : sidebarWidth}
                    isLoaded={isLoaded}
                    authUser={authUser}
                    setSidebarOpen={setSidebarOpen}
                />
            </div>

            {!isMobile && sidebarOpen && (
                <div
                    onMouseDown={startResizing}
                    className="w-1.5 h-screen bg-transparent hover:bg-indigo-500/30 hover:shadow-[0_0_10px_rgba(99,102,241,0.5)] cursor-col-resize absolute z-30 transition-all duration-200 delay-100"
                    style={{ left: `${sidebarWidth - 2}px` }}
                ></div>
            )}

            <div
                className={`flex-1 flex flex-col h-screen overflow-hidden relative ${isLoaded && !isResizing ? "transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" : ""}`}
                style={{ marginLeft: isMobile ? "0px" : `${sidebarWidth}px` }}
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
