import React, { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import MainLayout from "../Layouts/MainLayout";

const DashboardAdmin = lazy(() => import("./Admin/Dashboard"));
const DashboardSatker = lazy(() => import("./Satker/Dashboard"));

const DashboardContent = ({ authUser }) => {
    const LoadingState = () => (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-sm">Menyiapkan ruang kerja Anda...</p>
        </div>
    );

    return (
        <Suspense fallback={<LoadingState />}>
            {authUser?.role === "admin" ? (
                <DashboardAdmin authUser={authUser} />
            ) : (
                <DashboardSatker authUser={authUser} />
            )}
        </Suspense>
    );
};

export default function DashboardIndex() {
    return (
        <MainLayout>
            <DashboardContent />
        </MainLayout>
    );
}
