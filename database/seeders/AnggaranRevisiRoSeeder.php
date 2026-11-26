<?php

namespace Database\Seeders;

use App\Models\Anggaran;
use App\Models\RealisasiOutput;
use App\Models\RevisiDipa;
use App\Models\RincianOutput;
use App\Models\Satker;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class AnggaranRevisiRoSeeder extends Seeder
{
    public function run(): void
    {
        $tahun = 2026;
        $adminId = User::where('role', 'admin')->value('id');
        $satkers = Satker::all()->keyBy('kode_satker');

        // Deteksi otomatis tipe kolom triwulan (angka 1-4 atau romawi I-IV)
        $twColType = Schema::getColumnType('revisi_dipas', 'triwulan');
        $isNumericTw = in_array(strtolower($twColType), ['integer', 'tinyint', 'smallint', 'bigint', 'int']);
        $formatTw = fn(int $num) => $isNumericTw ? $num : ['', 'I', 'II', 'III', 'IV'][$num];

        // =====================================================================
        // 1. MASTER PAGU DIPA & BLOKIR PER SATKER (TA 2026)
        // Hanya DIPA SETJEN (692028) yang memiliki Belanja Pegawai (51)
        // =====================================================================
        $paguConfigs = [
            '692028' => [ // SETJEN — Pagu besar, profil Grade A
                'gaji' => 14500000000,
                'b_gaji' => 0,
                'barang' => 5200000000,
                'b_barang' => 150000000,
                'modal' => 1200000000,
                'b_modal' => 50000000,
            ],
            '692029' => [ // AHU — Profil Grade A/B+
                'gaji' => 0,
                'b_gaji' => 0,
                'barang' => 2400000000,
                'b_barang' => 80000000,
                'modal' => 350000000,
                'b_modal' => 0,
            ],
            '692030' => [ // KI — Profil Grade B (1 Anomali RO)
                'gaji' => 0,
                'b_gaji' => 0,
                'barang' => 1850000000,
                'b_barang' => 50000000,
                'modal' => 250000000,
                'b_modal' => 0,
            ],
            '692031' => [ // PP — Profil Grade B-/C+ (2x Revisi Tetap)
                'gaji' => 0,
                'b_gaji' => 0,
                'barang' => 1600000000,
                'b_barang' => 60000000,
                'modal' => 0,
                'b_modal' => 0,
            ],
            '692032' => [ // BPHN — Profil Grade C (1 Anomali + 1 Rejected)
                'gaji' => 0,
                'b_gaji' => 0,
                'barang' => 1950000000,
                'b_barang' => 100000000,
                'modal' => 200000000,
                'b_modal' => 20000000,
            ],
            '692033' => [ // BSK — Zona Atensi (3x Revisi Tetap + Serapan rendah)
                'gaji' => 0,
                'b_gaji' => 0,
                'barang' => 1150000000,
                'b_barang' => 50000000,
                'modal' => 150000000,
                'b_modal' => 0,
            ],
        ];

        $anggaranMap = [];
        foreach ($paguConfigs as $kode => $cfg) {
            $satker = $satkers[$kode] ?? null;
            if (!$satker) {
                continue;
            }

            $totalPagu = $cfg['gaji'] + $cfg['barang'] + $cfg['modal'];
            $paguBlokir = $cfg['b_gaji'] + $cfg['b_barang'] + $cfg['b_modal'];
            $paguEfektif = $totalPagu - $paguBlokir;

            $anggaranMap[$kode] = Anggaran::updateOrCreate(
                ['satker_id' => $satker->id, 'tahun' => $tahun],
                [
                    'belanja_gaji' => $cfg['gaji'],
                    'belanja_barang' => $cfg['barang'],
                    'belanja_modal' => $cfg['modal'],
                    'blokir_gaji' => $cfg['b_gaji'],
                    'blokir_barang' => $cfg['b_barang'],
                    'blokir_modal' => $cfg['b_modal'],
                    'total_pagu' => $totalPagu,
                    'pagu_blokir' => $paguBlokir,
                    'pagu_efektif' => $paguEfektif,
                ]
            );
        }

        // =====================================================================
        // 2. RIWAYAT REVISI DIPA (MEMPENGARUHI POIN 10% REVISI DIPA)
        // =====================================================================
        $revisiList = [
            // SETJEN: 1x Pagu Tetap di TW II (Nilai sempurna 100) + 1x Pagu Berubah (tidak penalti)
            ['kode' => '692028', 'tw' => 2, 'tgl' => '2026-05-12', 'no' => 'SP-DIPA-013.01.2.692028/REV-01', 'jenis' => 'pagu_tetap', 'ket' => 'Pergeseran akun pemeliharaan gedung dan pengadaan perangkat jaringan kantor.'],
            ['kode' => '692028', 'tw' => 3, 'tgl' => '2026-08-19', 'no' => 'SP-DIPA-013.01.2.692028/REV-02', 'jenis' => 'pagu_berubah', 'ket' => 'Penambahan pagu tunjangan kinerja pegawai sesuai ketetapan pusat.'],

            // AHU: 1x Pagu Tetap di TW III (Nilai 100)
            ['kode' => '692029', 'tw' => 3, 'tgl' => '2026-07-22', 'no' => 'SP-DIPA-013.03.2.692029/REV-01', 'jenis' => 'pagu_tetap', 'ket' => 'Penyesuaian rincian perjalanan dinas pembinaan notaris di kabupaten.'],

            // KI: 1x Pagu Tetap di TW II
            ['kode' => '692030', 'tw' => 2, 'tgl' => '2026-06-08', 'no' => 'SP-DIPA-013.06.2.692030/REV-01', 'jenis' => 'pagu_tetap', 'ket' => 'Revisi detail kegiatan Mobile IP Clinic dan sosialisasi merek UMKM.'],

            // PP: 2x Pagu Tetap di TW III (Penalti frekuensi revisi > 1x)
            ['kode' => '692031', 'tw' => 3, 'tgl' => '2026-07-14', 'no' => 'SP-DIPA-013.02.2.692031/REV-01', 'jenis' => 'pagu_tetap', 'ket' => 'Pergeseran honorarium tim harmonisasi Raperda Provinsi.'],
            ['kode' => '692031', 'tw' => 3, 'tgl' => '2026-09-10', 'no' => 'SP-DIPA-013.02.2.692031/REV-02', 'jenis' => 'pagu_tetap', 'ket' => 'Revisi ulang komponen konsumsi rapat fasilitasi produk hukum daerah.'],

            // BPHN: 1x Pagu Tetap di TW I & 1x di TW III
            ['kode' => '692032', 'tw' => 1, 'tgl' => '2026-03-04', 'no' => 'SP-DIPA-013.10.2.692032/REV-01', 'jenis' => 'pagu_tetap', 'ket' => 'Penyesuaian alokasi verifikasi Organisasi Bantuan Hukum (OBH).'],
            ['kode' => '692032', 'tw' => 3, 'tgl' => '2026-08-25', 'no' => 'SP-DIPA-013.10.2.692032/REV-02', 'jenis' => 'pagu_tetap', 'ket' => 'Pergeseran belanja bahan penyuluhan hukum desa sadar hukum.'],

            // BSK: 3x Pagu Tetap (Zona Atensi)
            ['kode' => '692033', 'tw' => 2, 'tgl' => '2026-04-20', 'no' => 'SP-DIPA-013.11.2.692033/REV-01', 'jenis' => 'pagu_tetap', 'ket' => 'Revisi akun FGD analisis evaluasi kebijakan hukum wilayah.'],
            ['kode' => '692033', 'tw' => 3, 'tgl' => '2026-07-28', 'no' => 'SP-DIPA-013.11.2.692033/REV-02', 'jenis' => 'pagu_tetap', 'ket' => 'Pergeseran komponen survei Indeks Persepsi Kualitas Pelayanan.'],
            ['kode' => '692033', 'tw' => 3, 'tgl' => '2026-09-18', 'no' => 'SP-DIPA-013.11.2.692033/REV-03', 'jenis' => 'pagu_tetap', 'ket' => 'Revisi halaman III dan pergeseran belanja perjalanan dinas kajian.'],
        ];

        foreach ($revisiList as $rev) {
            $ang = $anggaranMap[$rev['kode']] ?? null;
            if (!$ang) {
                continue;
            }

            $paguSesudah = $rev['jenis'] === 'pagu_berubah'
                ? $ang->total_pagu
                : $ang->total_pagu;
            $paguSebelum = $rev['jenis'] === 'pagu_berubah'
                ? max(0, $ang->total_pagu - 350000000)
                : $ang->total_pagu;

            RevisiDipa::create([
                'anggaran_id' => $ang->id,
                'satker_id' => $ang->satker_id,
                'tahun' => $tahun,
                'triwulan' => $formatTw($rev['tw']),
                'tanggal_revisi' => $rev['tgl'],
                'nomor_revisi' => $rev['no'],
                'jenis_revisi' => $rev['jenis'],
                'pagu_sebelum' => $paguSebelum,
                'pagu_sesudah' => $paguSesudah,
                'keterangan' => $rev['ket'],
                'created_by' => $adminId,
            ]);
        }

        // =====================================================================
        // 3. TARGET RINCIAN OUTPUT (RO) & PROGRES FISIK BULANAN
        // mode: 'selesai' (100%), 'sehat' (~85-92%), 'anomali' (~42% fisik vs ~80% uang)
        // =====================================================================
        $roConfigs = [
            '692028' => [
                ['kode' => '4258.EBA.994', 'nama' => 'Layanan Perkantoran & Dukungan Operasional Kanwil', 'satuan' => 'Bulan Layanan', 'target' => 12, 'pagu' => 17200000000, 'mode' => 'sehat'],
                ['kode' => '4258.EBB.951', 'nama' => 'Sarana & Prasarana Perangkat Pengolah Data Internal', 'satuan' => 'Unit', 'target' => 25, 'pagu' => 1150000000, 'mode' => 'selesai'],
                ['kode' => '4258.EBA.962', 'nama' => 'Layanan Manajemen Keuangan, BMN & Zona Integritas', 'satuan' => 'Dokumen', 'target' => 24, 'pagu' => 1800000000, 'mode' => 'sehat'],
            ],
            '692029' => [
                ['kode' => '4261.BMA.001', 'nama' => 'Layanan Pembinaan & Pengawasan Notaris Wilayah', 'satuan' => 'Layanan', 'target' => 60, 'pagu' => 1450000000, 'mode' => 'sehat'],
                ['kode' => '4261.BMA.004', 'nama' => 'Sosialisasi Perseroan Perorangan & Apostille', 'satuan' => 'Kegiatan', 'target' => 12, 'pagu' => 1100000000, 'mode' => 'selesai'],
            ],
            '692030' => [
                ['kode' => '4264.BMA.002', 'nama' => 'Mobile Intellectual Property Clinic (MIC) Sulteng', 'satuan' => 'Layanan', 'target' => 80, 'pagu' => 1150000000, 'mode' => 'sehat'],
                ['kode' => '4264.QMA.005', 'nama' => 'Pendaftaran Kekayaan Intelektual Komunal & UMKM', 'satuan' => 'Permohonan', 'target' => 100, 'pagu' => 850000000, 'mode' => 'anomali'],
            ],
            '692031' => [
                ['kode' => '4259.PMA.001', 'nama' => 'Harmonisasi Rancangan Peraturan Daerah (Raperda)', 'satuan' => 'Raperda', 'target' => 40, 'pagu' => 920000000, 'mode' => 'sehat'],
                ['kode' => '4259.PMA.003', 'nama' => 'Fasilitasi Perancangan Produk Hukum Kabupaten/Kota', 'satuan' => 'Dokumen', 'target' => 30, 'pagu' => 600000000, 'mode' => 'sehat'],
            ],
            '692032' => [
                ['kode' => '4268.QMA.001', 'nama' => 'Pemberian Bantuan Hukum Litigasi & Non-Litigasi', 'satuan' => 'Perkara', 'target' => 120, 'pagu' => 1250000000, 'mode' => 'anomali'],
                ['kode' => '4268.BMA.002', 'nama' => 'Pembinaan Desa/Kelurahan Sadar Hukum', 'satuan' => 'Desa', 'target' => 30, 'pagu' => 700000000, 'mode' => 'sehat'],
            ],
            '692033' => [
                ['kode' => '4270.ABA.001', 'nama' => 'Analisis & Evaluasi Kebijakan Hukum Daerah', 'satuan' => 'Rekomendasi', 'target' => 10, 'pagu' => 680000000, 'mode' => 'anomali'],
                ['kode' => '4270.ABA.003', 'nama' => 'Survei Indeks Persepsi Kualitas Pelayanan Hukum', 'satuan' => 'Laporan', 'target' => 12, 'pagu' => 520000000, 'mode' => 'sehat'],
            ],
        ];

        foreach ($roConfigs as $kode => $ros) {
            $satker = $satkers[$kode] ?? null;
            if (!$satker) {
                continue;
            }

            foreach ($ros as $roCfg) {
                $ro = RincianOutput::updateOrCreate(
                    [
                        'satker_id' => $satker->id,
                        'tahun' => $tahun,
                        'kode_ro' => $roCfg['kode'],
                    ],
                    [
                        'nama_ro' => $roCfg['nama'],
                        'satuan' => $roCfg['satuan'],
                        'target_volume' => $roCfg['target'],
                        'pagu_anggaran' => $roCfg['pagu'],
                    ]
                );

                // Tentukan rasio capaian fisik kumulatif s.d. bulan 10 (Oktober)
                $targetRatio = match ($roCfg['mode']) {
                    'selesai' => 1.00,
                    'anomali' => 0.42, // Sengaja tertinggal jauh dari serapan anggaran (~78%)
                    default => 0.88,
                };

                $totalVolTarget = round($roCfg['target'] * $targetRatio, 2);
                $monthlyVol = round($totalVolTarget / 10, 2);
                $accumVol = 0;

                for ($bulan = 1; $bulan <= 10; $bulan++) {
                    // Bulan ke-10 menutup pembulatan agar total pas
                    $volBulanIni = ($bulan === 10)
                        ? max(0, round($totalVolTarget - $accumVol, 2))
                        : $monthlyVol;
                    $accumVol += $volBulanIni;

                    $progressPct = $roCfg['target'] > 0
                        ? min(100, round(($accumVol / $roCfg['target']) * 100, 2))
                        : 0;

                    $keterangan = match ($roCfg['mode']) {
                        'selesai' => $bulan === 10
                            ? 'Target output tercapai 100% sesuai jadwal pengadaan.'
                            : 'Pelaksanaan fisik berjalan sesuai linimasa.',
                        'anomali' => 'Menunggu kelengkapan berita acara serah terima & laporan lapangan dari tim daerah.',
                        default => 'Progres volume fisik terealisasi lancar sesuai rencana triwulan.',
                    };

                    RealisasiOutput::updateOrCreate(
                        [
                            'rincian_output_id' => $ro->id,
                            'bulan' => $bulan,
                        ],
                        [
                            'realisasi_volume' => $volBulanIni,
                            'realisasi_anggaran' => round(($roCfg['pagu'] * 0.08), 0),
                            'progress_capaian' => $progressPct,
                            'keterangan' => $keterangan,
                        ]
                    );
                }
            }
        }
    }
}
