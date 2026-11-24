<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Satker;
use App\Models\RencanaPenarikan;
use App\Models\Realisasi;
use App\Models\RealisasiDetail;
use App\Models\Anggaran;
use App\Models\ActivityLog;
use App\Models\RincianOutput;
use App\Models\RealisasiOutput;
use App\Models\RevisiDipa;
use App\Models\CutOff;
use App\Traits\SiraAnalyticsTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    use SiraAnalyticsTrait;

    // =====================================================================
    // 🧠 HELPER: TARGET TRIWULAN KEMENKEU & RENTANG BULAN
    // =====================================================================
    private function getTargetKemenkeu(string $tw, string $jenisBelanja): int
    {
        $target = [
            '51' => ['I' => 20, 'II' => 50, 'III' => 75, 'IV' => 95], // Belanja Gaji
            '52' => ['I' => 15, 'II' => 50, 'III' => 70, 'IV' => 90], // Belanja Barang
            '53' => ['I' => 10, 'II' => 40, 'III' => 70, 'IV' => 90], // Belanja Modal
        ];
        return $target[$jenisBelanja][$tw] ?? 0;
    }

    private function getBulanTerakhirTw(string $tw): int
    {
        $bulan = ['I' => 3, 'II' => 6, 'III' => 9, 'IV' => 12];
        return $bulan[$tw] ?? 12;
    }

    private function getBulanAwalTw(string $tw): int
    {
        $bulan = ['I' => 1, 'II' => 4, 'III' => 7, 'IV' => 10];
        return $bulan[$tw] ?? 1;
    }

    // =====================================================================
    // 🚀 CORE ENGINE: ANALITIK 65 POIN SIRA + TATA KELOLA INTERNAL
    // =====================================================================
    public function index(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));
            $user = $request->user();
            $isAdmin = $user->role === 'admin';
            $selectedSatkerId = $request->query('satker_id');

            // Deteksi Triwulan Otomatis berdasarkan Bulan Berjalan
            $bulanSaatIni = ($tahun == date('Y')) ? date('n') : 12;
            $currentTw = (int) ceil($bulanSaatIni / 3);
            $angkaKeRomawi = [1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV'];
            $defaultTwStr = $angkaKeRomawi[$currentTw] ?? 'IV';

            $tw = $request->query('tw', $defaultTwStr);
            $bulanMaksimal = $this->getBulanTerakhirTw($tw);
            $bulanAwal = $this->getBulanAwalTw($tw);

            // =========================================================
            // 1. EAGER LOADING DATA SATKER & ANGGARAN (OPTIMASI RAM)
            // =========================================================
            $satkerQuery = Satker::with(['anggarans' => function ($query) use ($tahun) {
                $query->where('tahun', $tahun);
            }]);

            if (!$isAdmin) {
                $satkerQuery->where('kode_satker', $user->kode_satker);
            } else {
                if (!empty($selectedSatkerId)) {
                    $satkerQuery->where('id', $selectedSatkerId);
                }
            }

            $satkers = $satkerQuery->get();
            $satkerIds = $satkers->pluck('id')->toArray();

            $pagu51 = 0;
            $pagu52 = 0;
            $pagu53 = 0;
            $totalAnggaran = 0;

            foreach ($satkers as $satker) {
                $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
                $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

                foreach ($satker->anggarans as $anggaran) {
                    $pagu51 += $isSetjen ? $anggaran->belanja_gaji : 0;
                    $pagu52 += $anggaran->belanja_barang;
                    $pagu53 += $anggaran->belanja_modal;
                    $totalAnggaran += $anggaran->pagu_efektif;
                }
            }

            // =========================================================
            // 2. FETCH SEMUA TRANSAKSI & DATA PENDUKUNG SEKALIGUS
            // =========================================================
            $allRpdRaw = RencanaPenarikan::where('tahun', $tahun)
                ->whereIn('satker_id', $satkerIds)
                ->get();

            $allRealisasiRaw = Realisasi::where('tahun', $tahun)
                ->whereIn('satker_id', $satkerIds)
                ->get();

            // Filter khusus status approved untuk kalkulasi finansial & IKPA
            $semuaRpd = $allRpdRaw->where('status', 'approved')->values();
            $semuaRealisasi = $allRealisasiRaw->where('status', 'approved')->values();

            $allRincianOutputs = RincianOutput::whereIn('satker_id', $satkerIds)
                ->where('tahun', $tahun)
                ->get();

            $allRoIds = $allRincianOutputs->pluck('id');
            $allRealOutputs = RealisasiOutput::whereIn('rincian_output_id', $allRoIds)
                ->where('bulan', '<=', $bulanMaksimal)
                ->get();

            $approvedRealIdsTw = $semuaRealisasi->where('bulan', '<=', $bulanMaksimal)->pluck('id');
            $allLedgerDetails = collect();
            if ($approvedRealIdsTw->isNotEmpty() && $allRoIds->isNotEmpty()) {
                $allLedgerDetails = RealisasiDetail::whereIn('realisasi_id', $approvedRealIdsTw)
                    ->whereIn('rincian_output_id', $allRoIds)
                    ->get();
            }

            $allRevisiDipas = RevisiDipa::where('tahun', $tahun)
                ->whereIn('satker_id', $satkerIds)
                ->get();

            $allCutOffs = CutOff::where('tahun', $tahun)->get();

            // =========================================================
            // 3. GENERATE PAYLOAD GRAFIK DINAMIS
            // =========================================================
            $grafik = [];
            $namaBulan = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

            if (empty($selectedSatkerId) && $isAdmin) {
                foreach ($satkers as $satker) {
                    $rpdSatkerTw = $semuaRpd->where('satker_id', $satker->id)->whereBetween('bulan', [$bulanAwal, $bulanMaksimal])->sum(function ($q) {
                        return $q->belanja_gaji + $q->belanja_barang + $q->belanja_modal;
                    });
                    $realSatkerTw = $semuaRealisasi->where('satker_id', $satker->id)->whereBetween('bulan', [$bulanAwal, $bulanMaksimal])->sum(function ($q) {
                        return $q->belanja_gaji + $q->belanja_barang + $q->belanja_modal;
                    });

                    $grafik[] = [
                        'name' => $satker->kode_satker,
                        'nama_satker' => $satker->nama_satker,
                        'Target_RPD' => round($rpdSatkerTw / 1000000, 2),
                        'Aktual_Realisasi' => round($realSatkerTw / 1000000, 2)
                    ];
                }
            } else {
                for ($i = $bulanAwal; $i <= $bulanMaksimal; $i++) {
                    $rpdBulan = $semuaRpd->where('bulan', $i);
                    $realBulan = $semuaRealisasi->where('bulan', $i);

                    $gaji = $realBulan->sum('belanja_gaji');
                    $barang = $realBulan->sum('belanja_barang');
                    $modal = $realBulan->sum('belanja_modal');
                    $rpdTot = $rpdBulan->sum(function ($q) {
                        return $q->belanja_gaji + $q->belanja_barang + $q->belanja_modal;
                    });

                    $grafik[] = [
                        'name' => $namaBulan[$i],
                        'Target_RPD' => round($rpdTot / 1000000, 2),
                        'Belanja_Gaji' => round($gaji / 1000000, 2),
                        'Belanja_Barang' => round($barang / 1000000, 2),
                        'Belanja_Modal' => round($modal / 1000000, 2),
                        'Total_Realisasi' => round(($gaji + $barang + $modal) / 1000000, 2)
                    ];
                }
            }

            // =========================================================
            // 4. KALKULASI IKPA HAL III AGREGAT (KUMULATIF)
            // =========================================================
            $sumDeviasiTertimbangSeluruhBulan = 0;
            $bulanAdaData = 0;

            for ($i = 1; $i <= $bulanMaksimal; $i++) {
                $rpdBulanIni = $semuaRpd->where('bulan', $i);
                $realisasiBulanIni = $semuaRealisasi->where('bulan', $i);

                $r51_tot = 0;
                $r52_tot = 0;
                $r53_tot = 0;
                $p51_tot = 0;
                $p52_tot = 0;
                $p53_tot = 0;

                foreach ($satkers as $satker) {
                    $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
                    $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

                    $rpdSatker = $rpdBulanIni->where('satker_id', $satker->id)->first();
                    $realSatker = $realisasiBulanIni->where('satker_id', $satker->id)->first();

                    $r51_tot += $isSetjen ? ($rpdSatker ? $rpdSatker->belanja_gaji : 0) : 0;
                    $r52_tot += $rpdSatker ? $rpdSatker->belanja_barang : 0;
                    $r53_tot += $rpdSatker ? $rpdSatker->belanja_modal : 0;

                    $p51_tot += $isSetjen ? ($realSatker ? $realSatker->belanja_gaji : 0) : 0;
                    $p52_tot += $realSatker ? $realSatker->belanja_barang : 0;
                    $p53_tot += $realSatker ? $realSatker->belanja_modal : 0;
                }

                $totRpdBulan = $r51_tot + $r52_tot + $r53_tot;
                $totRealBulan = $p51_tot + $p52_tot + $p53_tot;

                if ($totRpdBulan > 0 || $totRealBulan > 0) {
                    $bulanAdaData++;
                    $hitungPd = function ($rVal, $pVal) {
                        $dev = abs($rVal - $pVal);
                        if ($rVal <= 0) return $pVal > 0 ? 100 : 0;
                        return min(($dev / $rVal) * 100, 100);
                    };

                    $pd51 = $hitungPd($r51_tot, $p51_tot);
                    $pd52 = $hitungPd($r52_tot, $p52_tot);
                    $pd53 = $hitungPd($r53_tot, $p53_tot);

                    $prop51 = $totalAnggaran > 0 ? ($pagu51 / $totalAnggaran) : 0;
                    $prop52 = $totalAnggaran > 0 ? ($pagu52 / $totalAnggaran) : 0;
                    $prop53 = $totalAnggaran > 0 ? ($pagu53 / $totalAnggaran) : 0;

                    $devTertimbangBulanIni = ($pd51 * $prop51) + ($pd52 * $prop52) + ($pd53 * $prop53);
                    $sumDeviasiTertimbangSeluruhBulan += $devTertimbangBulanIni;
                }
            }

            $ikpaGlobalBerjalan = 0;
            if ($bulanAdaData > 0 && $totalAnggaran > 0) {
                $rataKumulatif = $sumDeviasiTertimbangSeluruhBulan / $bulanAdaData;
                $ikpaGlobalBerjalan = $rataKumulatif <= 5 ? 100 : max(0, 100 - $rataKumulatif);
            }

            // =========================================================
            // 5. RINCIAN DATA TOTAL TW & POIN SIRA (MAX 65 POIN)
            // =========================================================
            $rpdsFiltered = $semuaRpd->where('bulan', '<=', $bulanMaksimal);
            $realisasisFiltered = $semuaRealisasi->where('bulan', '<=', $bulanMaksimal);

            $totalRpdTerfilter = $rpdsFiltered->sum(function ($q) use ($satkers) {
                $satker = $satkers->where('id', $q->satker_id)->first();
                $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
                $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');
                return ($isSetjen ? $q->belanja_gaji : 0) + $q->belanja_barang + $q->belanja_modal;
            });

            $realisasi51 = 0;
            $realisasi52 = 0;
            $realisasi53 = 0;
            foreach ($realisasisFiltered as $q) {
                $satker = $satkers->where('id', $q->satker_id)->first();
                $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
                $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

                $realisasi51 += ($isSetjen ? $q->belanja_gaji : 0);
                $realisasi52 += $q->belanja_barang;
                $realisasi53 += $q->belanja_modal;
            }

            $totalRealisasiTerfilter = $realisasi51 + $realisasi52 + $realisasi53;
            $persentaseRealisasiDashboard = $totalAnggaran > 0 ? round(($totalRealisasiTerfilter / $totalAnggaran) * 100, 2) : 0;

            $persenSerap51 = $pagu51 > 0 ? min(($realisasi51 / $pagu51) * 100, 100) : 0;
            $persenSerap52 = $pagu52 > 0 ? min(($realisasi52 / $pagu52) * 100, 100) : 0;
            $persenSerap53 = $pagu53 > 0 ? min(($realisasi53 / $pagu53) * 100, 100) : 0;

            $target51 = $this->getTargetKemenkeu($tw, '51');
            $target52 = $this->getTargetKemenkeu($tw, '52');
            $target53 = $this->getTargetKemenkeu($tw, '53');

            $targetNominal51 = $pagu51 * ($target51 / 100);
            $targetNominal52 = $pagu52 * ($target52 / 100);
            $targetNominal53 = $pagu53 * ($target53 / 100);

            $totalTargetNominalTW = $targetNominal51 + $targetNominal52 + $targetNominal53;
            $totalRealisasiKumulatifTW = $realisasi51 + $realisasi52 + $realisasi53;

            $nilai_penyerapan = 0;
            if ($totalTargetNominalTW > 0 && $totalAnggaran > 0) {
                $nilai_penyerapan = min(100, ($totalRealisasiKumulatifTW / $totalTargetNominalTW) * 100);
            }

            // Penilaian Capaian Rincian Output (RO) Agregat
            $total_pc_global = 0;
            $jumlah_ro_global = $allRincianOutputs->count();
            $nilai_ro_global = 0;

            if ($jumlah_ro_global > 0) {
                foreach ($allRincianOutputs as $roItem) {
                    $volKum = $allRealOutputs->where('rincian_output_id', $roItem->id)->sum('realisasi_volume');
                    $pcItem = $roItem->target_volume > 0 ? ($volKum / $roItem->target_volume) * 100 : 0;
                    $total_pc_global += min($pcItem, 100);
                }
                $nilai_ro_global = $total_pc_global / $jumlah_ro_global;
            }

            // =========================================================
            // 6. TABEL LEADERBOARD SATKER + REVISI DIPA + TATA KELOLA
            // =========================================================
            $t51 = $target51;
            $t52 = $target52;
            $t53 = $target53;

            $sumSkorRevisiDipa = 0;
            $totalFreqRevisiTetap = 0;
            $totalFreqRevisiAll = 0;
            $countSatkerDenganPagu = 0;

            $aggTotalRo = 0;
            $aggRoSehat = 0;
            $aggRoSelesai = 0;
            $aggRoAnomali = 0;
            $sumSkorDisiplin = 0;
            $sumPersenLengkap = 0;
            $aggRpdApproved = 0;
            $aggRealApproved = 0;
            $aggTotalDitolak = 0;
            $aggTotalDraft = 0;
            $aggBulanWajib = 0;
            $sumSkorTataKelola = 0;

            $tabelSatker = $satkers->map(function ($satker) use (
                $tahun,
                $tw,
                $bulanMaksimal,
                $semuaRealisasi,
                $semuaRpd,
                $allRpdRaw,
                $allRealisasiRaw,
                $t51,
                $t52,
                $t53,
                $allRincianOutputs,
                $allRealOutputs,
                $allLedgerDetails,
                $allRevisiDipas,
                $allCutOffs,
                &$sumSkorRevisiDipa,
                &$totalFreqRevisiTetap,
                &$totalFreqRevisiAll,
                &$countSatkerDenganPagu,
                &$aggTotalRo,
                &$aggRoSehat,
                &$aggRoSelesai,
                &$aggRoAnomali,
                &$sumSkorDisiplin,
                &$sumPersenLengkap,
                &$aggRpdApproved,
                &$aggRealApproved,
                &$aggTotalDitolak,
                &$aggTotalDraft,
                &$aggBulanWajib,
                &$sumSkorTataKelola
            ) {
                $paguSatker = 0;
                $p51 = 0;
                $p52 = 0;
                $p53 = 0;
                $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
                $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

                foreach ($satker->anggarans as $anggaran) {
                    $paguSatker += $anggaran->pagu_efektif;
                    $p51 += $isSetjen ? $anggaran->belanja_gaji : 0;
                    $p52 += $anggaran->belanja_barang;
                    $p53 += $anggaran->belanja_modal;
                }

                $hasPagu = ($p51 + $p52 + $p53) > 0 || $paguSatker > 0;

                $realisasiSatker = 0;
                $real51 = 0;
                $real52 = 0;
                $real53 = 0;
                $reals = $semuaRealisasi->where('satker_id', $satker->id)->where('bulan', '<=', $bulanMaksimal);

                foreach ($reals as $q) {
                    $rGaji = $isSetjen ? $q->belanja_gaji : 0;
                    $real51 += $rGaji;
                    $real52 += $q->belanja_barang;
                    $real53 += $q->belanja_modal;
                    $realisasiSatker += ($rGaji + $q->belanja_barang + $q->belanja_modal);
                }

                // 1) Poin Penyerapan (20%)
                $tn51 = $p51 * ($t51 / 100);
                $tn52 = $p52 * ($t52 / 100);
                $tn53 = $p53 * ($t53 / 100);
                $totalTN = $tn51 + $tn52 + $tn53;

                $nilai_penyerapan = 0;
                if ($totalTN > 0 && $paguSatker > 0) {
                    $nilai_penyerapan = min(100, ($realisasiSatker / $totalTN) * 100);
                }

                // 2) IKPA Hal III (10%)
                $rpds = $semuaRpd->where('satker_id', $satker->id)->where('bulan', '<=', $bulanMaksimal);
                $sumDevTertimbang = 0;
                $blnData = 0;

                for ($i = 1; $i <= $bulanMaksimal; $i++) {
                    $rb = $rpds->where('bulan', $i)->first();
                    $pb = $reals->where('bulan', $i)->first();

                    $rG = $isSetjen ? ($rb ? $rb->belanja_gaji : 0) : 0;
                    $rB = $rb ? $rb->belanja_barang : 0;
                    $rM = $rb ? $rb->belanja_modal : 0;

                    $pG = $isSetjen ? ($pb ? $pb->belanja_gaji : 0) : 0;
                    $pB = $pb ? $pb->belanja_barang : 0;
                    $pM = $pb ? $pb->belanja_modal : 0;

                    if (($rG + $rB + $rM) > 0 || ($pG + $pB + $pM) > 0) {
                        $blnData++;
                        $hitungP = function ($rV, $pV) {
                            $d = abs($rV - $pV);
                            if ($rV <= 0) return $pV > 0 ? 100 : 0;
                            return min(($d / $rV) * 100, 100);
                        };

                        $pd51 = $hitungP($rG, $pG);
                        $pd52 = $hitungP($rB, $pB);
                        $pd53 = $hitungP($rM, $pM);

                        $pr51 = $paguSatker > 0 ? ($p51 / $paguSatker) : 0;
                        $pr52 = $paguSatker > 0 ? ($p52 / $paguSatker) : 0;
                        $pr53 = $paguSatker > 0 ? ($p53 / $paguSatker) : 0;

                        $sumDevTertimbang += ($pd51 * $pr51) + ($pd52 * $pr52) + ($pd53 * $pr53);
                    }
                }

                $ikpaSatker = 0;
                if ($blnData > 0 && $paguSatker > 0) {
                    $rataDev = $sumDevTertimbang / $blnData;
                    $ikpaSatker = $rataDev <= 5 ? 100 : max(0, 100 - $rataDev);
                }

                // 3) Capaian Rincian Output RO (25%)
                $satkerRos = $allRincianOutputs->where('satker_id', $satker->id);
                $satkerRoIds = $satkerRos->pluck('id');
                $satkerRealOutputs = $allRealOutputs->whereIn('rincian_output_id', $satkerRoIds);

                $total_pc_satker = 0;
                $jumlah_ro_satker = $satkerRos->count();
                $nilai_ro_satker = 0;

                if ($jumlah_ro_satker > 0) {
                    foreach ($satkerRos as $sRo) {
                        $volKumSatker = $satkerRealOutputs->where('rincian_output_id', $sRo->id)->sum('realisasi_volume');
                        $pcSatker = $sRo->target_volume > 0 ? ($volKumSatker / $sRo->target_volume) * 100 : 0;
                        $total_pc_satker += min($pcSatker, 100);
                    }
                    $nilai_ro_satker = $total_pc_satker / $jumlah_ro_satker;
                }

                // 4) 🔥 Revisi DIPA (10%) & Tata Kelola Internal (Otomatis)
                $revSatker = $this->hitungSkorRevisiDipa((int)$satker->id, $tw, $hasPagu, $allRevisiDipas);

                $satkerRealIds = $reals->pluck('id');
                $satkerLedger = $allLedgerDetails->whereIn('realisasi_id', $satkerRealIds);
                $tkSatker = $this->hitungTataKelolaInternal(
                    (int)$satker->id,
                    $tahun,
                    $bulanMaksimal,
                    $hasPagu,
                    $satkerRos,
                    $satkerRealOutputs,
                    $satkerLedger,
                    $allRpdRaw->where('satker_id', $satker->id),
                    $allRealisasiRaw->where('satker_id', $satker->id),
                    $allCutOffs
                );

                // Akumulasi untuk agregat global
                if ($hasPagu) {
                    $countSatkerDenganPagu++;
                    $sumSkorRevisiDipa += $revSatker['nilai_revisi_dipa'];
                    $totalFreqRevisiTetap += $revSatker['frekuensi_pagu_tetap'];
                    $totalFreqRevisiAll += $revSatker['frekuensi_total'];

                    $aggTotalRo += $tkSatker['kesehatan_ro']['total_ro'];
                    $aggRoSehat += $tkSatker['kesehatan_ro']['ro_sehat'];
                    $aggRoSelesai += $tkSatker['kesehatan_ro']['ro_selesai'];
                    $aggRoAnomali += $tkSatker['kesehatan_ro']['ro_anomali'];

                    $sumSkorDisiplin += $tkSatker['kedisiplinan']['skor'];
                    $sumPersenLengkap += $tkSatker['kedisiplinan']['persen_kelengkapan'];
                    $aggRpdApproved += $tkSatker['kedisiplinan']['rpd_approved'];
                    $aggRealApproved += $tkSatker['kedisiplinan']['realisasi_approved'];
                    $aggTotalDitolak += $tkSatker['kedisiplinan']['total_ditolak'];
                    $aggTotalDraft += $tkSatker['kedisiplinan']['total_draft'];
                    $aggBulanWajib = max($aggBulanWajib, $tkSatker['kedisiplinan']['bulan_wajib_lapor']);
                    $sumSkorTataKelola += $tkSatker['skor_tata_kelola'];
                }

                // HASIL AKHIR: Total Poin SIRA Satker (10% + 20% + 25% + 10% = MAX 65 POIN)
                $poin_sira = round(
                    ($ikpaSatker * 10 / 100) +
                        ($nilai_penyerapan * 20 / 100) +
                        ($nilai_ro_satker * 25 / 100) +
                        $revSatker['tertimbang_revisi_dipa'],
                    2
                );
                $persenSerap = $paguSatker > 0 ? round(($realisasiSatker / $paguSatker) * 100, 2) : 0;

                return [
                    'id' => $satker->id,
                    'kode_satker' => $satker->kode_satker,
                    'nama_satker' => $satker->nama_satker,
                    'total_pagu' => $paguSatker,
                    'total_realisasi' => $realisasiSatker,
                    'persen_serap' => $persenSerap,
                    'nilai_revisi_dipa' => $revSatker['nilai_revisi_dipa'],
                    'tertimbang_revisi_dipa' => $revSatker['tertimbang_revisi_dipa'],
                    'frekuensi_revisi_tetap' => $revSatker['frekuensi_pagu_tetap'],
                    'skor_tata_kelola' => $tkSatker['skor_tata_kelola'],
                    'ro_anomali' => $tkSatker['kesehatan_ro']['ro_anomali'],
                    'skor_kedisiplinan' => $tkSatker['kedisiplinan']['skor'],
                    'poin_sira' => $poin_sira
                ];
            });

            // =========================================================
            // 7. TOTAL POIN SIRA GLOBAL (BOBOT: 10% + 20% + 25% + 10% = 65 POIN)
            // =========================================================
            $nilai_revisi_global = $countSatkerDenganPagu > 0
                ? round($sumSkorRevisiDipa / $countSatkerDenganPagu, 2)
                : 0;

            $tertimbang_hal_iii = round(($ikpaGlobalBerjalan * 10) / 100, 2);
            $tertimbang_penyerapan = round(($nilai_penyerapan * 20) / 100, 2);
            $tertimbang_ro = round(($nilai_ro_global * 25) / 100, 2);
            $tertimbang_revisi_dipa = round(($nilai_revisi_global * 10) / 100, 2);

            $total_poin_sira = round(
                $tertimbang_hal_iii + $tertimbang_penyerapan + $tertimbang_ro + $tertimbang_revisi_dipa,
                2
            );

            $statusRevisiGlobal = $countSatkerDenganPagu === 0
                ? 'N/A'
                : ($nilai_revisi_global >= 100 ? 'Optimal' : ($nilai_revisi_global >= 75 ? 'Waspada' : 'Berlebih'));

            $analisis_tw = [
                '51' => [
                    'target_persen' => $pagu51 > 0 ? $target51 : 0,
                    'realisasi_persen' => round($persenSerap51, 2),
                    'status' => $pagu51 > 0 ? ($persenSerap51 >= $target51 ? 'Tercapai' : 'Gagal') : 'N/A'
                ],
                '52' => [
                    'target_persen' => $pagu52 > 0 ? $target52 : 0,
                    'realisasi_persen' => round($persenSerap52, 2),
                    'status' => $pagu52 > 0 ? ($persenSerap52 >= $target52 ? 'Tercapai' : 'Gagal') : 'N/A'
                ],
                '53' => [
                    'target_persen' => $pagu53 > 0 ? $target53 : 0,
                    'realisasi_persen' => round($persenSerap53, 2),
                    'status' => $pagu53 > 0 ? ($persenSerap53 >= $target53 ? 'Tercapai' : 'Gagal') : 'N/A'
                ],
                'poin' => [
                    'ikpa_hal_iii' => round($ikpaGlobalBerjalan, 2),
                    'nilai_penyerapan' => round($nilai_penyerapan, 2),
                    'nilai_ro' => round($nilai_ro_global, 2),
                    'nilai_revisi_dipa' => $nilai_revisi_global,
                    'tertimbang_hal_iii' => $tertimbang_hal_iii,
                    'tertimbang_penyerapan' => $tertimbang_penyerapan,
                    'tertimbang_ro' => $tertimbang_ro,
                    'tertimbang_revisi_dipa' => $tertimbang_revisi_dipa,
                    'frekuensi_revisi_tetap' => $totalFreqRevisiTetap,
                    'frekuensi_revisi_total' => $totalFreqRevisiAll,
                    'status_revisi' => $statusRevisiGlobal,
                    'total_poin' => $total_poin_sira,
                    'max_poin' => 65
                ]
            ];

            // Agregat Tata Kelola Internal (Fase 2)
            $aggSkorKesehatanRo = $aggTotalRo > 0 ? round(($aggRoSehat / $aggTotalRo) * 100, 2) : 0;
            $aggStatusKesehatanRo = $aggTotalRo === 0
                ? 'Belum Ada RO'
                : ($aggRoAnomali === 0 ? 'Sinkron Optimal' : ($aggSkorKesehatanRo >= 75 ? 'Perlu Sinkronisasi' : 'Anomali Tinggi'));

            $aggSkorDisiplin = $countSatkerDenganPagu > 0 ? round($sumSkorDisiplin / $countSatkerDenganPagu, 2) : 0;
            $aggPersenLengkap = $countSatkerDenganPagu > 0 ? round($sumPersenLengkap / $countSatkerDenganPagu, 2) : 0;
            $aggStatusDisiplin = $countSatkerDenganPagu === 0
                ? 'N/A'
                : ($aggSkorDisiplin >= 85 ? 'Sangat Disiplin' : ($aggSkorDisiplin >= 65 ? 'Disiplin' : ($aggSkorDisiplin > 0 ? 'Perlu Pembinaan' : 'Belum Melapor')));

            $tataKelolaGlobal = [
                'skor_tata_kelola' => $countSatkerDenganPagu > 0 ? round($sumSkorTataKelola / $countSatkerDenganPagu, 2) : 0,
                'kesehatan_ro' => [
                    'skor' => $aggSkorKesehatanRo,
                    'total_ro' => $aggTotalRo,
                    'ro_sehat' => $aggRoSehat,
                    'ro_selesai' => $aggRoSelesai,
                    'ro_anomali' => $aggRoAnomali,
                    'status' => $aggStatusKesehatanRo,
                ],
                'kedisiplinan' => [
                    'skor' => $aggSkorDisiplin,
                    'bulan_wajib_lapor' => $aggBulanWajib,
                    'rpd_approved' => $aggRpdApproved,
                    'realisasi_approved' => $aggRealApproved,
                    'persen_kelengkapan' => $aggPersenLengkap,
                    'total_ditolak' => $aggTotalDitolak,
                    'total_draft' => $aggTotalDraft,
                    'status' => $aggStatusDisiplin,
                ],
            ];

            // =========================================================
            // 8. FINALISASI DATA LEADERBOARD & CCTV
            // =========================================================
            $topSatker = [];
            $bottomSatker = [];
            $miniCCTV = [];

            if ($isAdmin) {
                $sortedSatker = collect($tabelSatker)
                    ->filter(function ($s) {
                        return $s['total_pagu'] > 0;
                    })
                    ->sortByDesc('poin_sira')
                    ->values();

                $topSatker = $sortedSatker->take(3)->values()->toArray();
                $bottomSatker = $sortedSatker->slice(-3)->reverse()->values()->toArray();

                $miniCCTV = ActivityLog::with(['user' => function ($q) {
                    $q->select('id', 'name', 'avatar', 'kode_satker', 'role');
                }])->orderBy('created_at', 'desc')->take(5)->get();
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'tahun' => $tahun,
                    'tw_aktif' => $tw,
                    'is_global' => empty($selectedSatkerId),
                    'last_synced' => Carbon::now()->format('d M Y, H:i:s'),
                    'summary' => [
                        'total_anggaran' => $totalAnggaran,
                        'total_rpd_setahun' => $totalRpdTerfilter,
                        'total_realisasi_setahun' => $totalRealisasiTerfilter,
                        'ikpa' => round($ikpaGlobalBerjalan, 2),
                        'status_kesehatan' => $ikpaGlobalBerjalan >= 95 ? 'Sangat Baik' : ($ikpaGlobalBerjalan >= 85 ? 'Baik' : 'Perlu Evaluasi'),
                        'persentase_realisasi' => $persentaseRealisasiDashboard
                    ],
                    'analisis_tw' => $analisis_tw,
                    'tata_kelola' => $tataKelolaGlobal,
                    'grafik' => $grafik,
                    'tabel_satker' => $tabelSatker,
                    'rincian_belanja' => [
                        'gaji' => $realisasi51,
                        'barang' => $realisasi52,
                        'modal' => $realisasi53
                    ],
                    'leaderboard' => ['top' => $topSatker, 'bottom' => $bottomSatker],
                    'cctv_mini' => $miniCCTV
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // =====================================================================
    // 🖨️ FITUR EKSPORT PDF DASHBOARD (EXECUTIVE SUMMARY)
    // =====================================================================
    public function cetakPdfDashboard(Request $request)
    {
        $response = $this->index($request);
        $dataResponse = json_decode($response->getContent(), true);

        if ($dataResponse['status'] !== 'success') {
            return response()->json(['status' => 'error', 'message' => 'Gagal memuat data PDF'], 500);
        }

        $data = $dataResponse['data'];
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        $satkerId = $request->query('satker_id');
        $isGlobal = $isAdmin && empty($satkerId);

        $namaSatker = 'Nasional (Seluruh Satuan Kerja)';
        if (!$isGlobal && !empty($data['tabel_satker'])) {
            $namaSatker = $data['tabel_satker'][0]['nama_satker'];
        }

        $viewData = [
            'tahun' => $data['tahun'],
            'tw_aktif' => $data['tw_aktif'],
            'summary' => $data['summary'],
            'analisis_tw' => $data['analisis_tw'],
            'tata_kelola' => $data['tata_kelola'] ?? null,
            'rincian_belanja' => $data['rincian_belanja'],
            'satkers' => collect($data['tabel_satker'])
                ->filter(function ($s) {
                    return $s['total_pagu'] > 0;
                })
                ->sortByDesc('poin_sira')
                ->values()
                ->all(),
            'grafik' => $data['grafik'],
            'tanggal_cetak' => date('d M Y'),
            'dicetak_oleh' => $user->name . ' (' . strtoupper($user->role) . ')',
            'is_global' => $isGlobal,
            'nama_satker' => $namaSatker
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.dashboard-summary', $viewData);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("Executive_Summary_SIRA_TW_{$data['tw_aktif']}_{$data['tahun']}.pdf");
    }
}
