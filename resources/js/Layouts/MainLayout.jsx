import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header"; // <-- Import Header

export default function MainLayout({ children, tahun }) {
    // State Sidebar
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

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 50);
    }, []);

    // Watcher untuk merubah ukuran saat di-toggle
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

    return (
        <div className="relative min-h-screen bg-slate-50 text-slate-600 font-sans transition-colors duration-300 overflow-hidden flex">
            {/* SIDEBAR */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                sidebarWidth={sidebarWidth}
                isLoaded={isLoaded}
            />

            {/* AREA KANAN (Header + Konten) */}
            <div
                className={`flex-1 flex flex-col h-screen overflow-hidden relative ${isLoaded ? "transition-all duration-300 ease-in-out" : ""}`}
                style={{ marginLeft: `${sidebarWidth}px` }}
            >
                {/* HEADER COMPONENT (Terpisah) */}
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    tahun={tahun}
                />

                {/* KONTEN UTAMA */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar scroll-smooth">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
