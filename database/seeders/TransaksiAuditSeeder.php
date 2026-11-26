<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Anggaran;
use App\Models\Realisasi;
use App\Models\RencanaPenarikan;
use App\Models\RincianOutput;
use App\Models\Satker;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TransaksiAuditSeeder extends Seeder
{
    public function run(): void
    {
        $tahun = 2026;
        $satkers = Satker::all()->keyBy('kode_satker');
        $anggarans = Anggaran::where('tahun', $tahun)->get()->keyBy('satker_id');
        $rosBySatker = RincianOutput::where('tahun', $tahun)->get()->groupBy('satker_id');

        // Bobot distribusi RPD 12 bulan (total = 1.00 = 100% Pagu Efektif)
        $rpdWeights = [
            1 => 0.06,
            2 => 0.07,
            3 => 0.09,
            4 => 0.09,
            5 => 0.10,
            6 => 0.11,
            7 => 0.09,
            8 => 0.09,
            9 => 0.10,
            10 => 0.08,
            11 => 0.07,
            12 => 0.05,
        ];

        // Profil performa per Satker agar Leaderboard 65 Poin tampak realistis & bertingkat
        $profiles = [
            '692028' => [ // Rank #1 — Grade A (~61 pts)
                'real_ratio' => 0.99,
                'nov_status' => 'approved',
                'reject_month' => null,
            ],
            '692029' => [ // Rank #2 — Grade A/B+ (~57 pts)
                'real_ratio' => 0.96,
                'nov_status' => 'approved',
                'reject_month' => null,
            ],
            '692030' => [ // Rank #3 — Grade B (~52 pts)
                'real_ratio' => 0.92,
                'nov_status' => 'draft', // Siap demo Bulk Approval
                'reject_month' => null,
            ],
            '692031' => [ // Rank #4 — Grade B-/C+ (~47 pts)
                'real_ratio' => 0.87,
                'nov_status' => 'draft', // Siap demo Bulk Approval
                'reject_month' => null,
            ],
            '692032' => [ // Rank #5 — Grade C (~42 pts)
                'real_ratio' => 0.82,
                'nov_status' => 'draft', // Siap demo Bulk Approval
                'reject_month' => 10, // Demo status Ditolak + Catatan Revisi
            ],
            '692033' => [ // Rank #6 — Zona Atensi (~36 pts)
                'real_ratio' => 0.72,
                'nov_status' => 'draft', // Siap demo Bulk Approval
                'reject_month' => null,
            ],
        ];

        $uraianBarang = [
            'Belanja Operasional Perkantoran & Pemeliharaan Sarana',
            'Belanja Perjalanan Dinas Pembinaan & Monitoring Wilayah',
            'Belanja Bahan Rapat, Konsumsi & Dokumentasi Kegiatan',
            'Belanja Jasa Profesi Narasumber & Sosialisasi Hukum',
        ];

        foreach ($profiles as $kode => $prof) {
            $satker = $satkers[$kode] ?? null;
            if (!$satker) {
                continue;
            }
            $anggaran = $anggarans[$satker->id] ?? null;
            if (!$anggaran) {
                continue;
            }

            $effGaji = max(0, $anggaran->belanja_gaji - $anggaran->blokir_gaji);
            $effBarang = max(0, $anggaran->belanja_barang - $anggaran->blokir_barang);
            $effModal = max(0, $anggaran->belanja_modal - $anggaran->blokir_modal);
            $satkerRos = $rosBySatker[$satker->id] ?? collect();
            $primaryRo = $satkerRos->first();
            $secondaryRo = $satkerRos->skip(1)->first() ?? $primaryRo;
            $thirdRo = $satkerRos->skip(2)->first() ?? $primaryRo;

            // =================================================================
            // 1. RENCANA PENARIKAN DANA (RPD) — 12 BULAN
            // =================================================================
            for ($bulan = 1; $bulan <= 12; $bulan++) {
                $w = $rpdWeights[$bulan];
                $rpdGaji = $effGaji > 0 ? round(($effGaji * $w) / 1000) * 1000 : 0;
                $rpdBarang = $effBarang > 0 ? round(($effBarang * $w) / 1000) * 1000 : 0;
                $rpdModal = $effModal > 0 ? round(($effModal * $w) / 1000) * 1000 : 0;

                // Bulan 12 pada satker berstatus draft dibiarkan draft untuk demo Verifikasi Massal RPD
                $rpdStatus = ($bulan === 12 && $prof['nov_status'] === 'draft') ? 'draft' : 'approved';

                RencanaPenarikan::updateOrCreate(
                    [
                        'satker_id' => $satker->id,
                        'tahun' => $tahun,
                        'bulan' => $bulan,
                    ],
                    [
                        'belanja_gaji' => $rpdGaji,
                        'belanja_barang' => $rpdBarang,
                        'belanja_modal' => $rpdModal,
                        'status' => $rpdStatus,
                        'catatan_revisi' => null,
                    ]
                );

                // =============================================================
                // 2. REALISASI AKTUAL + RINCIAN DETAIL TERHUBUNG RO (BULAN 1-11)
                // =============================================================
                if ($bulan > 11) {
                    continue;
                }

                // Sedikit variasi bulanan alami agar deviasi realistis
                $jitter = (($bulan % 3) - 1) * 0.015;
                $ratio = max(0.55, min(1.02, $prof['real_ratio'] + $jitter));

                $realGaji = $rpdGaji > 0 ? round(($rpdGaji * min(1.0, $ratio + 0.01)) / 1000) * 1000 : 0;
                $realBarang = $rpdBarang > 0 ? round(($rpdBarang * $ratio) / 1000) * 1000 : 0;
                $realModal = $rpdModal > 0 ? round(($rpdModal * $ratio) / 1000) * 1000 : 0;

                $statusReal = 'approved';
                $catatanRevisi = null;

                if ($bulan === 11) {
                    $statusReal = $prof['nov_status'];
                } elseif ($prof['reject_month'] === $bulan) {
                    $statusReal = 'rejected';
                    $catatanRevisi = 'Mohon lampirkan kesesuaian kode RO pada belanja bantuan hukum dan cek ulang nominal kuitansi.';
                }

                $realisasi = Realisasi::updateOrCreate(
                    [
                        'satker_id' => $satker->id,
                        'tahun' => $tahun,
                        'bulan' => $bulan,
                    ],
                    [
                        'belanja_gaji' => $realGaji,
                        'belanja_barang' => $realBarang,
                        'belanja_modal' => $realModal,
                        'status' => $statusReal,
                        'catatan_revisi' => $catatanRevisi,
                    ]
                );

                // Reset & isi rincian transaksi yang terhubung ke RO
                $realisasi->details()->delete();

                if ($realGaji > 0) {
                    $realisasi->details()->create([
                        'rincian_output_id' => $primaryRo?->id,
                        'jenis_belanja' => 'gaji',
                        'uraian' => "Pembayaran Gaji Induk, Tunjangan Kinerja & Uang Makan Pegawai Bulan {$bulan}",
                        'nominal' => $realGaji,
                    ]);
                }

                if ($realBarang > 0) {
                    $porsi1 = round(($realBarang * 0.60) / 1000) * 1000;
                    $porsi2 = $realBarang - $porsi1;

                    $realisasi->details()->create([
                        'rincian_output_id' => $primaryRo?->id,
                        'jenis_belanja' => 'barang',
                        'uraian' => $uraianBarang[$bulan % count($uraianBarang)] . " (Bulan {$bulan})",
                        'nominal' => $porsi1,
                    ]);

                    if ($porsi2 > 0) {
                        $realisasi->details()->create([
                            'rincian_output_id' => $secondaryRo?->id,
                            'jenis_belanja' => 'barang',
                            'uraian' => "Pelaksanaan Program Teknis & Layanan Publik Wilayah (Bulan {$bulan})",
                            'nominal' => $porsi2,
                        ]);
                    }
                }

                if ($realModal > 0) {
                    $realisasi->details()->create([
                        'rincian_output_id' => ($kode === '692028' ? $secondaryRo?->id : $thirdRo?->id),
                        'jenis_belanja' => 'modal',
                        'uraian' => "Pengadaan Peralatan, Mesin & Perangkat TI Penunjang Layanan (Termin {$bulan})",
                        'nominal' => $realModal,
                    ]);
                }
            }
        }

        // =====================================================================
        // 3. REKAMAN HISTORIS AUDIT TRAIL (CCTV SISTEM)
        // =====================================================================
        $admin = User::where('email', 'admin@kemenkum.go.id')->first();
        $verifikator = User::where('email', 'verifikator@kemenkum.go.id')->first();
        $opSetjen = User::where('email', 'setjen@kemenkum.go.id')->first();
        $opAhu = User::where('email', 'ahu@kemenkum.go.id')->first();
        $opKi = User::where('email', 'ki@kemenkum.go.id')->first();
        $opBphn = User::where('email', 'bphn@kemenkum.go.id')->first();

        $logs = [
            [$admin?->id, 'CREATE', 'MASTER ANGGARAN', 'Menginput Master Pagu DIPA TA 2026 untuk 6 Satuan Kerja Kanwil Kemenkum Sulawesi Tengah.', '10.14.22.10', 12],
            [$admin?->id, 'UPDATE', 'PENGATURAN PDF', 'Memperbarui Kop Surat & Pejabat Penanda Tangan PDF menjadi Hendrik Pagiling, S.H., M.H.', '10.14.22.10', 10],
            [$opSetjen?->id, 'CREATE', 'TARGET RO', 'Mendaftarkan 3 Target Rincian Output (RO) DIPA SETJEN TA 2026.', '10.14.22.41', 9],
            [$opAhu?->id, 'CREATE', 'IMPOR EXCEL RPD', 'Mengimpor RPD Excel Tahun 2026 untuk DIPA AHU (12 bulan baru ditambahkan).', '10.14.22.52', 8],
            [$verifikator?->id, 'UPDATE', 'VERIFIKASI MASSAL RPD', 'Otoritas Pusat MENGESAHKAN MASSAL 12 data RPD milik: DIPA SETJEN, DIPA AHU.', '10.14.22.14', 7],
            [$opKi?->id, 'CREATE', 'TRANSAKSI REALISASI', 'Mengajukan draf Realisasi Bulan 11 Tahun 2026 untuk DIPA KI terhubung ke 2 Rincian Output.', '10.14.22.63', 6],
            [$opBphn?->id, 'UPDATE', 'TRANSAKSI REALISASI', 'Merevisi rincian Realisasi Bulan 10 Tahun 2026 milik DIPA BPHN.', '10.14.22.74', 5],
            [$verifikator?->id, 'UPDATE', 'VERIFIKASI REALISASI', 'Otoritas Pusat MENOLAK data Realisasi Bulan 10 Tahun 2026 milik DIPA BPHN untuk perbaikan kode RO.', '10.14.22.14', 4],
            [$admin?->id, 'CREATE', 'REVISI DIPA', 'Mencatat Revisi DIPA kategori Pagu Tetap (REV-03) untuk DIPA BSK pada Triwulan III.', '10.14.22.10', 3],
            [$admin?->id, 'UPDATE', 'PERIODE CUT-OFF', 'Mengunci periode tutup buku bulan Januari s.d. Oktober TA 2026.', '10.14.22.10', 2],
            [$admin?->id, 'CREATE', 'MANAJEMEN PENGGUNA', 'Membuat akun baru Operator Baru SETJEN dengan kebijakan wajib ganti password saat login pertama.', '10.14.22.10', 1],
            [$admin?->id, 'UPDATE', 'OTORITAS AKSES', 'Admin MENONAKTIFKAN (SUSPEND) akun Eks Operator Mutasi (nonaktif@kemenkum.go.id).', '10.14.22.10', 0],
        ];

        foreach ($logs as [$userId, $action, $module, $desc, $ip, $daysAgo]) {
            $ts = Carbon::now()->subDays($daysAgo)->subHours(rand(1, 5));
            ActivityLog::create([
                'user_id' => $userId,
                'action' => $action,
                'module' => $module,
                'description' => $desc,
                'ip_address' => $ip,
                'created_at' => $ts,
                'updated_at' => $ts,
            ]);
        }
    }
}
