import React from 'react';

export default function Sidebar() {
    return (
        <aside className="w-64 bg-[#0A192F] text-white flex flex-col min-h-screen">
            <div className="p-5 text-lg font-bold border-b border-gray-800 text-yellow-400">
                RPD KEMENKUM
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <a href="#" className="block px-4 py-2 rounded bg-yellow-400 text-[#0A192F] font-semibold">Dashboard</a>
                <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300">Input Transaksi</a>
                <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300">Laporan Bulanan</a>
                <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300">Laporan Realisasi</a>
            </nav>
        </aside>
    );
}