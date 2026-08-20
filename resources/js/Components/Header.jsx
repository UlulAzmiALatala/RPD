import React from 'react';

export default function Header({ tahun }) {
    return (
        <header className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-[#0A192F]">Dashboard Pengelolaan Anggaran & RPD</h1>
            <div className="flex items-center space-x-3">
                <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                    Tahun Anggaran: {tahun}
                </span>
            </div>
        </header>
    );
}