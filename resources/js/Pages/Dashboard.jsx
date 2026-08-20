import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../Layouts/MainLayout";

export default function Dashboard() {
    const [satkers, setSatkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tahun, setTahun] = useState("2025");

    useEffect(() => {
        axios
            .get(`/api/dashboard-data?tahun=${tahun}`)
            .then((response) => {
                setSatkers(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Gagal memuat data dashboard:", error);
                setLoading(false);
            });
    }, [tahun]);

    return (
        <MainLayout tahun={tahun}>
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-[#0A192F] mb-4">
                    Rekapitulasi Anggaran Satker
                </h3>

                {loading ? (
                    <p className="text-gray-500">
                        Memuat data dari database...
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Kode Satker
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Nama Satker
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Total Pagu Anggaran
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {satkers.map((satker) => {
                                    const totalPagu = satker.anggarans.reduce(
                                        (acc, curr) => {
                                            return (
                                                acc +
                                                Number(curr.belanja_gaji) +
                                                Number(curr.belanja_barang) +
                                                Number(curr.belanja_modal)
                                            );
                                        },
                                        0,
                                    );

                                    return (
                                        <tr
                                            key={satker.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {satker.kode_satker}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {satker.nama_satker}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0A192F]">
                                                Rp{" "}
                                                {totalPagu.toLocaleString(
                                                    "id-ID",
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
