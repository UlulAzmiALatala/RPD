<?php

namespace App\Traits;

use Illuminate\Support\Collection;

trait SiraAnalyticsTrait
{
    /**
     * Menghitung Skor IKPA Indikator Revisi DIPA (Bobot 10% -> Maks 10 Poin).
     * Standar Kemenkeu: Revisi Pagu Tetap <= 1x per Triwulan = 100.
     * Jika > 1x dalam 1 TW, skor TW = 100 / frekuensi.
     * Revisi Pagu Berubah tidak memengaruhi pengurangan skor.
     */
    protected function hitungSkorRevisiDipa(
        int $satkerId,
        string $twAktif,
        bool $hasPagu,
        Collection $allRevisiDipas
    ): array {
        $twList = ['I', 'II', 'III', 'IV'];
        $maxIdx = array_search($twAktif, $twList, true);
        $maxIdx = $maxIdx === false ? 3 : $maxIdx;

        $revisiSatker = $allRevisiDipas->where('satker_id', $satkerId);
        $frekuensiTotal = $revisiSatker->count();
        $frekuensiPaguTetapKumulatif = 0;

        $perTw = [];
        $sumSkorTw = 0;

        for ($i = 0; $i <= $maxIdx; $i++) {
            $twKode = $twList[$i];
            $freqTetap = $revisiSatker
                ->where('triwulan', $twKode)
                ->where('jenis_revisi', 'pagu_tetap')
                ->count();

            $freqBerubah = $revisiSatker
                ->where('triwulan', $twKode)
                ->where('jenis_revisi', 'pagu_berubah')
                ->count();

            $frekuensiPaguTetapKumulatif += $freqTetap;

            $skorTw = 0;
            if ($hasPagu) {
                $skorTw = $freqTetap <= 1 ? 100 : round(100 / $freqTetap, 2);
            }

            $sumSkorTw += $skorTw;
            $perTw[$twKode] = [
                'pagu_tetap' => $freqTetap,
                'pagu_berubah' => $freqBerubah,
                'skor' => $skorTw,
            ];
        }

        $nilaiRevisiDipa = $hasPagu ? round($sumSkorTw / ($maxIdx + 1), 2) : 0;
        $tertimbangRevisiDipa = round(($nilaiRevisiDipa * 10) / 100, 2);

        return [
            'nilai_revisi_dipa' => $nilaiRevisiDipa,
            'tertimbang_revisi_dipa' => $tertimbangRevisiDipa,
            'frekuensi_pagu_tetap' => $frekuensiPaguTetapKumulatif,
            'frekuensi_total' => $frekuensiTotal,
            'status' => !$hasPagu
                ? 'N/A'
                : ($nilaiRevisiDipa >= 100 ? 'Optimal' : ($nilaiRevisiDipa >= 75 ? 'Waspada' : 'Berlebih')),
            'per_tw' => $perTw,
        ];
    }

    /**
     * Menghitung Indeks Tata Kelola Internal (Otomatis, 0 Input Tambahan):
     * 1. Skor Kesehatan Sinkronisasi RO (mendeteksi Anomali Fisik tertinggal > 15% dari serapan)
     * 2. Indeks Kedisiplinan Pelaporan (kelengkapan approved s.d. bulan wajib lapor & rasio nol penolakan)
     */
    protected function hitungTataKelolaInternal(
        int $satkerId,
        int|string $tahun,
        int $bulanAkhirTw,
        bool $hasPagu,
        Collection $roSatker,
        Collection $realOutputs,
        Collection $ledgerDetails,
        Collection $rpdSatker,
        Collection $realisasiSatker,
        Collection $cutOffs
    ): array {
        // -------------------------------------------------------------
        // A. SKOR KESEHATAN SINKRONISASI RO
        // -------------------------------------------------------------
        $totalRo = $roSatker->count();
        $roAnomali = 0;
        $roSelesai = 0;

        if ($totalRo > 0) {
            foreach ($roSatker as $ro) {
                $volKum = $realOutputs
                    ->where('rincian_output_id', $ro->id)
                    ->where('bulan', '<=', $bulanAkhirTw)
                    ->sum('realisasi_volume');

                $serapanKum = $ledgerDetails
                    ->where('rincian_output_id', $ro->id)
                    ->sum('nominal');

                $pc = $ro->target_volume > 0 ? ($volKum / $ro->target_volume) * 100 : 0;
                $persenAnggaran = $ro->pagu_anggaran > 0 ? ($serapanKum / $ro->pagu_anggaran) * 100 : 0;

                if ($pc >= 100) {
                    $roSelesai++;
                } elseif ($pc < ($persenAnggaran - 15)) {
                    $roAnomali++;
                }
            }
        }

        $roSehat = max(0, $totalRo - $roAnomali);
        $skorKesehatanRo = $totalRo > 0 ? round(($roSehat / $totalRo) * 100, 2) : 0;

        $statusKesehatanRo = 'Belum Ada RO';
        if ($totalRo > 0) {
            if ($roAnomali === 0) {
                $statusKesehatanRo = 'Sinkron Optimal';
            } elseif ($skorKesehatanRo >= 75) {
                $statusKesehatanRo = 'Perlu Sinkronisasi';
            } else {
                $statusKesehatanRo = 'Anomali Tinggi';
            }
        }

        // -------------------------------------------------------------
        // B. INDEKS KEDISIPLINAN PELAPORAN (OTOMATIS DARI LEDGER & CUT-OFF)
        // -------------------------------------------------------------
        $tahunInt = (int) $tahun;
        $tahunSekarang = (int) date('Y');
        $bulanSekarang = $tahunInt < $tahunSekarang
            ? 12
            : ($tahunInt === $tahunSekarang ? (int) date('n') : 0);

        // Bulan yang sudah dikunci Cut-Off pada rentang TW aktif
        $closedMonthsCount = $cutOffs
            ->where('is_closed', true)
            ->where('bulan', '<=', $bulanAkhirTw)
            ->count();

        $bulanWajibLapor = max(min($bulanAkhirTw, $bulanSekarang), $closedMonthsCount);

        $rpdPeriod = $rpdSatker->where('bulan', '<=', $bulanAkhirTw);
        $realPeriod = $realisasiSatker->where('bulan', '<=', $bulanAkhirTw);

        $rpdApprovedMonths = $rpdPeriod->where('status', 'approved')->pluck('bulan')->unique()->count();
        $realApprovedMonths = $realPeriod->where('status', 'approved')->pluck('bulan')->unique()->count();

        $totalDitolak = $rpdPeriod->where('status', 'rejected')->count()
            + $realPeriod->where('status', 'rejected')->count();

        $totalDraft = $rpdPeriod->where('status', 'draft')->count()
            + $realPeriod->where('status', 'draft')->count();

        $skorKedisiplinan = 0;
        $persenKelengkapan = 0;

        if ($hasPagu && $bulanWajibLapor > 0) {
            $targetDokumen = $bulanWajibLapor * 2; // RPD + Realisasi per bulan
            $dokumenDisetujui = min($targetDokumen, $rpdApprovedMonths + $realApprovedMonths);
            $persenKelengkapan = round(($dokumenDisetujui / $targetDokumen) * 100, 2);

            if (($rpdPeriod->count() + $realPeriod->count()) > 0) {
                // Penalti kualitas 15 poin tiap dokumen yang berstatus ditolak (rejected)
                $skorKualitas = max(0, 100 - ($totalDitolak * 15));
                $skorKedisiplinan = round(($persenKelengkapan * 0.65) + ($skorKualitas * 0.35), 2);
            }
        }

        $statusDisiplin = 'Belum Melapor';
        if (!$hasPagu) {
            $statusDisiplin = 'N/A';
        } elseif ($skorKedisiplinan >= 85) {
            $statusDisiplin = 'Sangat Disiplin';
        } elseif ($skorKedisiplinan >= 65) {
            $statusDisiplin = 'Disiplin';
        } elseif ($skorKedisiplinan > 0) {
            $statusDisiplin = 'Perlu Pembinaan';
        }

        // Skor Gabungan Tata Kelola Internal (Skala 100)
        $skorTataKelola = 0;
        if ($hasPagu) {
            $skorTataKelola = $totalRo > 0
                ? round(($skorKesehatanRo + $skorKedisiplinan) / 2, 2)
                : $skorKedisiplinan;
        }

        return [
            'skor_tata_kelola' => $skorTataKelola,
            'kesehatan_ro' => [
                'skor' => $skorKesehatanRo,
                'total_ro' => $totalRo,
                'ro_sehat' => $roSehat,
                'ro_selesai' => $roSelesai,
                'ro_anomali' => $roAnomali,
                'status' => $statusKesehatanRo,
            ],
            'kedisiplinan' => [
                'skor' => $skorKedisiplinan,
                'bulan_wajib_lapor' => $bulanWajibLapor,
                'rpd_approved' => $rpdApprovedMonths,
                'realisasi_approved' => $realApprovedMonths,
                'persen_kelengkapan' => $persenKelengkapan,
                'total_ditolak' => $totalDitolak,
                'total_draft' => $totalDraft,
                'status' => $statusDisiplin,
            ],
        ];
    }
}
