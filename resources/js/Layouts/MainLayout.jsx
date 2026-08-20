import React from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";

export default function MainLayout({ children, tahun }) {
    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header tahun={tahun} />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
