import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
    const location = useLocation(); // Untuk mengecek halaman aktif

    // Fungsi kecil untuk menentukan style menu aktif
    const getLinkClass = (path) => {
        return location.pathname === path
            ? "block px-4 py-2 rounded bg-yellow-400 text-[#0A192F] font-bold shadow-sm"
            : "block px-4 py-2 rounded hover:bg-gray-800 text-gray-300 font-medium transition-colors";
    };

    return (
        <aside className="w-64 bg-[#0A192F] text-white flex flex-col min-h-screen shadow-xl z-10">
            <div className="p-6 text-xl font-black tracking-wider border-b border-gray-800 text-yellow-400 flex items-center gap-3">
                <span>KEMENKUM</span>
            </div>
            <nav className="flex-1 p-4 space-y-2 mt-4">
                <Link to="/" className={getLinkClass("/")}>
                    Dashboard
                </Link>
                <Link
                    to="/input-transaksi"
                    className={getLinkClass("/input-transaksi")}
                >
                    Input Transaksi
                </Link>
                <a
                    href="#"
                    className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300 font-medium transition-colors"
                >
                    Laporan Bulanan
                </a>
                <Link
                    to="/laporan-realisasi"
                    className={getLinkClass("/laporan-realisasi")}
                >
                    Laporan Realisasi per Satker
                </Link>
            </nav>
        </aside>
    );
}
