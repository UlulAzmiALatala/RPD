<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Executive Summary - Dashboard SIRA</title>
    <style>
        /* ==========================================
           PREMIUM PRINT SETTINGS & TYPOGRAPHY
           ========================================== */
        @page { size: A4 portrait; margin: 14mm; }
        body { 
            font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; 
            font-size: 10px; 
            line-height: 1.45; 
            color: #1e293b; 
            background-color: #ffffff;
        }
        
        /* ==========================================
           KOP SURAT & HEADER
           ========================================== */
        .header-container { width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 16px; display: table; }
        .header-text { display: table-cell; width: 100%; text-align: center; vertical-align: middle; }
        .header-text h1 { margin: 0; font-size: 17px; font-weight: 900; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px; }
        .header-text h2 { margin: 2px 0 0 0; font-size: 11px; font-weight: bold; color: #475569; letter-spacing: 1px; }
        .header-text p { margin: 4px 0 0 0; font-size: 8px; color: #64748b; }
        
        .judul-laporan { text-align: center; margin-bottom: 18px; background-color: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .judul-laporan h3 { margin: 0; font-size: 13px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
        .judul-laporan p.subtitle { margin: 3px 0 0 0; font-size: 9.5px; font-weight: bold; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; }
        .judul-satker { margin-top: 5px; font-size: 11px; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 5px; }

        /* ==========================================
           GRID CARDS (5 PILAR SUMMARY)
           ========================================== */
        .summary-container { width: 100%; margin-bottom: 18px; }
        .summary-card { float: left; width: 18.8%; text-align: center; padding: 10px 5px; border: 1px solid #e2e8f0; border-radius: 8px; margin-right: 1.5%; box-sizing: border-box; background-color: #ffffff; height: 64px; }
        .summary-card:last-child { margin-right: 0; }
        
        .card-dark { background-color: #0f172a; border-color: #0f172a; color: #ffffff; }
        .card-dark p { color: #94a3b8 !important; }
        .card-dark h4 { color: #f59e0b !important; }

        .summary-card p { margin: 0; font-size: 6.8px; text-transform: uppercase; font-weight: bold; color: #64748b; letter-spacing: 0.4px; }
        .summary-card h4 { margin: 5px 0 0 0; font-size: 13px; font-weight: 900; color: #0f172a; }
        
        .badge-serapan { font-size: 6.8px; margin-top: 4px; color: #059669; background: #d1fae5; display: inline-block; padding: 2px 5px; border-radius: 4px; font-weight: bold; border: 1px solid #a7f3d0; }

        .text-green { color: #059669 !important; }
        .text-red { color: #e11d48 !important; }
        .text-blue { color: #2563eb !important; }
        .text-yellow { color: #d97706 !important; }
        .text-purple { color: #7e22ce !important; }
        .text-teal { color: #0f766e !important; }

        /* ==========================================
           TABEL & BADGE PREMIUM
           ========================================== */
        .section-title { font-size: 9.5px; font-weight: 900; color: #0f172a; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: center; vertical-align: middle; }
        th { background-color: #f1f5f9; color: #334155; font-size: 8px; text-transform: uppercase; font-weight: 900; letter-spacing: 0.4px; }
        td { font-size: 9.5px; color: #1e293b; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        
        .tabel-evaluasi th { background-color: #0f172a; color: #ffffff; border-color: #0f172a; }
        .tw-header { background-color: #f8fafc !important; color: #0f172a !important; font-weight: 900; font-size: 13px; }
        
        .badge { font-weight: 900; padding: 2px 7px; border-radius: 4px; font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.4px; display: inline-block; }
        .badge-lulus { background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .badge-gagal { background-color: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
        .badge-na { background-color: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }

        /* Breakdown Perhitungan Poin (Invoice Style) */
        .box-poin { width: 100%; background-color: #ffffff; padding: 4px; font-size: 8.5px; box-sizing: border-box; }
        .box-poin table { width: 100%; border-collapse: collapse; margin: 0; }
        .box-poin th, .box-poin td { padding: 2.5px 5px; text-align: left; border: none; }
        .box-poin .poin-title { font-weight: bold; color: #334155; font-size: 8.5px; }
        .box-poin .poin-result { font-weight: 900; color: #0f172a; text-align: right; font-size: 9px; }
        .box-poin .poin-multiplier { padding-left: 10px; font-style: italic; color: #64748b; font-size: 7.5px; }
        .box-poin .poin-total { border-top: 2px solid #0f172a; font-weight: 900; font-size: 10px; color: #0f172a; padding-top: 6px; margin-top: 3px; }

        /* Tata Kelola Table */
        .tk-table th { background-color: #0f766e; color: #ffffff; border-color: #0f766e; }

        /* ==========================================
           GRAFIK DOMPDF HTML MURNI
           ========================================== */
        .chart-container { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 18px; page-break-inside: avoid; background-color: #f8fafc; }
        .chart-wrapper { width: 100%; height: 125px; border-bottom: 2px solid #cbd5e1; position: relative; margin-bottom: 6px; }
        .chart-col { display: inline-block; width: 8%; height: 125px; position: relative; text-align: center; }
        .bar-wrap { position: absolute; bottom: 0; width: 100%; text-align: center; }
        .bar-rpd { display: inline-block; width: 11px; background-color: #4f46e5; vertical-align: bottom; border-top-left-radius: 2px; border-top-right-radius: 2px; }
        .bar-real { display: inline-block; width: 11px; background-color: #10b981; vertical-align: bottom; border-top-left-radius: 2px; border-top-right-radius: 2px; }
        
        .chart-labels { width: 100%; display: table; }
        .chart-label-col { display: table-cell; width: 8%; text-align: center; font-size: 7px; color: #475569; font-weight: bold; }
        .legend-box { display: inline-block; width: 9px; height: 9px; margin-right: 4px; vertical-align: middle; border-radius: 2px; }

        /* ==========================================
           LEADERBOARD
           ========================================== */
        .leaderboard-container { width: 100%; display: table; page-break-inside: avoid; }
        .leaderboard-left { display: table-cell; width: 48%; padding-right: 2%; }
        .leaderboard-right { display: table-cell; width: 48%; padding-left: 2%; }
        .table-top th { background-color: #10b981; color: white; border-color: #059669; }
        .table-bottom th { background-color: #e11d48; color: white; border-color: #be123c; }
        
        /* ==========================================
           FOOTER & TTD
           ========================================== */
        .ttd-container { width: 100%; margin-top: 28px; page-break-inside: avoid; }
        .ttd-box { width: 36%; float: right; text-align: center; font-size: 9.5px; color: #0f172a; }
        .ttd-box p { margin: 0 0 3px 0; }
        .ttd-nama { font-weight: 900; text-decoration: underline; margin-top: 60px; font-size: 10.5px; }
        .clear { clear: both; }
        
        .footer-note { margin-top: 25px; font-size: 7.5px; color: #94a3b8; text-align: left; font-style: italic; border-top: 1px dashed #cbd5e1; padding-top: 6px; }
    </style>
</head>
<body>
    <!-- KOP SURAT -->
    <div class="header-container">
        <div class="header-text">
            <h2>KEMENTERIAN HUKUM REPUBLIK INDONESIA</h2>
            <h1>KANTOR WILAYAH SULAWESI TENGAH</h1>
            <p>Jalan Dewi Sartika No. 74, Palu Selatan, Kota Palu, Sulawesi Tengah 94114 | Laman: silakum.kemenkumsulteng.cloud</p>
        </div>
    </div>

    <!-- JUDUL -->
    <div class="judul-laporan">
        <h3>EXECUTIVE SUMMARY - RAPOR KINERJA ANGGARAN (SKALA 65 POIN)</h3>
        <p class="subtitle">TAHUN ANGGARAN {{ $tahun }} | POSISI TRIWULAN {{ $tw_aktif }}</p>
        <p class="judul-satker">Lokus Pemantauan: <strong>{{ strtoupper($nama_satker) }}</strong></p>
    </div>

    <!-- 5 KOTAK RINGKASAN GLOBAL (65 POIN) -->
    <div class="summary-container">
        <div class="summary-card card-dark">
            <p>Total Poin SIRA</p>
            <h4>
                {{ number_format($analisis_tw['poin']['total_poin'] ?? 0, 2, ',', '.') }} 
                <span style="font-size: 8.5px; color: #94a3b8;">/ 65</span>
            </h4>
        </div>
        <div class="summary-card">
            <p>Pagu Anggaran</p>
            <h4 class="text-blue">Rp {{ number_format(($summary['total_anggaran'] ?? 0) / 1000000, 0, ',', '.') }} Jt</h4>
        </div>
        <div class="summary-card">
            <p>Aktual Realisasi</p>
            <h4 class="text-green">Rp {{ number_format(($summary['total_realisasi_setahun'] ?? 0) / 1000000, 0, ',', '.') }} Jt</h4>
            <div class="badge-serapan">SERAPAN: {{ number_format($summary['persentase_realisasi'] ?? 0, 2, ',', '.') }}%</div>
        </div>
        <div class="summary-card">
            <p>Nilai IKPA (Hal III)</p>
            <h4 class="{{ ($summary['ikpa'] ?? 0) >= 95 ? 'text-green' : (($summary['ikpa'] ?? 0) >= 85 ? 'text-yellow' : 'text-red') }}">
                {{ number_format($summary['ikpa'] ?? 0, 2, ',', '.') }}
            </h4>
        </div>
        <div class="summary-card">
            <p>Capaian Output RO</p>
            <h4 class="text-purple">
                {{ number_format($analisis_tw['poin']['nilai_ro'] ?? 0, 2, ',', '.') }}%
            </h4>
        </div>
        <div class="clear"></div>
    </div>

    <!-- GRAFIK BATANG HTML MURNI -->
    @php
        $maxVal = 1;
        foreach($grafik as $item) {
            $rpd = $item['Target_RPD'] ?? 0;
            $real = $is_global ? ($item['Aktual_Realisasi'] ?? 0) : ($item['Total_Realisasi'] ?? 0);
            if($rpd > $maxVal) $maxVal = $rpd;
            if($real > $maxVal) $maxVal = $real;
        }
    @endphp

    <div class="section-title">GRAFIK PENYERAPAN ANGGARAN (DALAM JUTA RUPIAH)</div>
    <div class="chart-container">
        <div class="chart-wrapper">
            @foreach($grafik as $item)
                @php
                    $valRpd = $item['Target_RPD'] ?? 0;
                    $valReal = $is_global ? ($item['Aktual_Realisasi'] ?? 0) : ($item['Total_Realisasi'] ?? 0);
                    $hRpd = min(($valRpd / $maxVal) * 100, 100);
                    $hReal = min(($valReal / $maxVal) * 100, 100);
                    if($valRpd > 0 && $hRpd < 1) $hRpd = 1; 
                    if($valReal > 0 && $hReal < 1) $hReal = 1;
                @endphp
                <div class="chart-col">
                    <div class="bar-wrap">
                        @if($valRpd > 0)
                            <div class="bar-rpd" style="height: {{ $hRpd }}%;"></div>
                        @endif
                        @if($valReal > 0)
                            <div class="bar-real" style="height: {{ $hReal }}%;"></div>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
        <div class="chart-labels">
            @foreach($grafik as $item)
                <div class="chart-label-col" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ $is_global ? str_replace('DIPA ', '', $item['name']) : $item['name'] }}
                </div>
            @endforeach
        </div>
        <div style="text-align: center; font-size: 7.5px; font-weight: 900; color: #475569; margin-top: 10px; text-transform: uppercase;">
            <span class="legend-box" style="background-color: #4f46e5;"></span> Target RPD Halaman III
            <span class="legend-box" style="background-color: #10b981; margin-left: 14px;"></span> Aktual Realisasi
        </div>
    </div>

    <!-- TABEL EVALUASI TARGET KEMENKEU & KALKULASI 65 POIN -->
    <div class="section-title">EVALUASI KEPATUHAN TARGET DAN KALKULASI POIN SIRA (TW {{ $tw_aktif }})</div>
    <table class="tabel-evaluasi">
        <thead>
            <tr>
                <th style="width: 9%;">Periode</th>
                <th style="width: 19%;">Jenis Belanja</th>
                <th style="width: 11%;">Target (%)</th>
                <th style="width: 11%;">Aktual (%)</th>
                <th style="width: 14%;">Status</th>
                <th style="width: 36%;">Kalkulasi Poin SIRA (Maks 65 Pts)</th>
            </tr>
        </thead>
        <tbody>
            @php 
                $poin = $analisis_tw['poin'];
                $belanjas = [
                    '51' => 'Belanja Pegawai (51)',
                    '52' => 'Belanja Barang (52)',
                    '53' => 'Belanja Modal (53)'
                ];
            @endphp
            
            @foreach($belanjas as $kode => $nama)
            <tr>
                @if($kode == '51')
                    <td rowspan="3" class="tw-header">TW<br/>{{ $tw_aktif }}</td>
                @endif
                <td class="text-left" style="font-weight: 900; color: #1e293b;">{{ $nama }}</td>
                
                @if($analisis_tw[$kode]['status'] === 'N/A')
                    <td colspan="3" style="background-color: #f8fafc;"><span class="badge badge-na">TIDAK ADA PAGU</span></td>
                @else
                    <td style="color: #64748b; font-weight: 900;">{{ $analisis_tw[$kode]['target_persen'] }}%</td>
                    <td style="font-weight: 900;" class="{{ $analisis_tw[$kode]['status'] == 'Tercapai' || $analisis_tw[$kode]['status'] == 'Lulus' ? 'text-green' : 'text-red' }}">
                        {{ number_format($analisis_tw[$kode]['realisasi_persen'], 2, ',', '.') }}%
                    </td>
                    <td>
                        <span class="badge {{ $analisis_tw[$kode]['status'] == 'Tercapai' || $analisis_tw[$kode]['status'] == 'Lulus' ? 'badge-lulus' : 'badge-gagal' }}">
                            {{ strtoupper($analisis_tw[$kode]['status']) }}
                        </span>
                    </td>
                @endif

                @if($kode == '51')
                    <td rowspan="3" style="padding: 0; vertical-align: top; background-color: #ffffff;">
                        <div class="box-poin">
                            <table>
                                <tr>
                                    <td class="poin-title text-green">1. Penyerapan (Maks 100)</td>
                                    <td class="poin-result">{{ number_format($poin['nilai_penyerapan'] ?? 0, 2, ',', '.') }}</td>
                                </tr>
                                <tr>
                                    <td class="poin-multiplier">x Bobot 20%</td>
                                    <td class="poin-result text-green">{{ number_format($poin['tertimbang_penyerapan'] ?? 0, 2, ',', '.') }} pts</td>
                                </tr>
                                <tr>
                                    <td class="poin-title text-blue">2. Hal. III DIPA (Maks 100)</td>
                                    <td class="poin-result">{{ number_format($poin['ikpa_hal_iii'] ?? 0, 2, ',', '.') }}</td>
                                </tr>
                                <tr>
                                    <td class="poin-multiplier">x Bobot 10%</td>
                                    <td class="poin-result text-blue">{{ number_format($poin['tertimbang_hal_iii'] ?? 0, 2, ',', '.') }} pts</td>
                                </tr>
                                <tr>
                                    <td class="poin-title text-purple">3. Output RO (Maks 100)</td>
                                    <td class="poin-result">{{ number_format($poin['nilai_ro'] ?? 0, 2, ',', '.') }}</td>
                                </tr>
                                <tr>
                                    <td class="poin-multiplier">x Bobot 25%</td>
                                    <td class="poin-result text-purple">{{ number_format($poin['tertimbang_ro'] ?? 0, 2, ',', '.') }} pts</td>
                                </tr>
                                <tr>
                                    <td class="poin-title text-yellow">4. Revisi DIPA ({{ $poin['frekuensi_revisi_tetap'] ?? 0 }}x Tetap)</td>
                                    <td class="poin-result">{{ number_format($poin['nilai_revisi_dipa'] ?? 0, 2, ',', '.') }}</td>
                                </tr>
                                <tr>
                                    <td class="poin-multiplier">x Bobot 10%</td>
                                    <td class="poin-result text-yellow">{{ number_format($poin['tertimbang_revisi_dipa'] ?? 0, 2, ',', '.') }} pts</td>
                                </tr>
                                <tr>
                                    <td class="poin-total">TOTAL POIN SIRA TW {{ $tw_aktif }}</td>
                                    <td class="poin-total text-right text-yellow" style="font-size: 12px;">{{ number_format($poin['total_poin'] ?? 0, 2, ',', '.') }} <span style="font-size: 8px; color: #94a3b8;">/ 65</span></td>
                                </tr>
                            </table>
                        </div>
                    </td>
                @endif
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- RINGKASAN INDEKS TATA KELOLA INTERNAL (FASE 2) -->
    @if(!empty($tata_kelola))
    <div style="page-break-inside: avoid;">
        <div class="section-title">INDEKS TATA KELOLA INTERNAL KANWIL (OTOMATIS)</div>
        <table class="tk-table">
            <thead>
                <tr>
                    <th style="width: 34%;">Kesehatan Sinkronisasi RO</th>
                    <th style="width: 38%;">Indeks Kedisiplinan Pelaporan</th>
                    <th style="width: 28%;">Skor Tata Kelola Gabungan</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="text-purple" style="font-size: 13px; font-weight: 900;">
                            {{ number_format($tata_kelola['kesehatan_ro']['skor'] ?? 0, 2, ',', '.') }}%
                        </div>
                        <div style="font-size: 8px; color: #475569; margin-top: 2px;">
                            {{ $tata_kelola['kesehatan_ro']['ro_sehat'] ?? 0 }}/{{ $tata_kelola['kesehatan_ro']['total_ro'] ?? 0 }} RO Sinkron • 
                            <strong class="{{ ($tata_kelola['kesehatan_ro']['ro_anomali'] ?? 0) > 0 ? 'text-red' : 'text-green' }}">
                                {{ $tata_kelola['kesehatan_ro']['ro_anomali'] ?? 0 }} Anomali Fisik
                            </strong>
                        </div>
                        <div style="font-size: 7.5px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-top: 2px;">
                            Status: {{ $tata_kelola['kesehatan_ro']['status'] ?? '-' }}
                        </div>
                    </td>
                    <td>
                        <div class="text-teal" style="font-size: 13px; font-weight: 900;">
                            {{ number_format($tata_kelola['kedisiplinan']['skor'] ?? 0, 2, ',', '.') }} / 100
                        </div>
                        <div style="font-size: 8px; color: #475569; margin-top: 2px;">
                            Kelengkapan: <strong>{{ number_format($tata_kelola['kedisiplinan']['persen_kelengkapan'] ?? 0, 2, ',', '.') }}%</strong> • 
                            Draft: {{ $tata_kelola['kedisiplinan']['total_draft'] ?? 0 }} • 
                            Ditolak: {{ $tata_kelola['kedisiplinan']['total_ditolak'] ?? 0 }}
                        </div>
                        <div style="font-size: 7.5px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-top: 2px;">
                            Status: {{ $tata_kelola['kedisiplinan']['status'] ?? '-' }}
                        </div>
                    </td>
                    <td style="background-color: #f0fdfa;">
                        <div class="text-teal" style="font-size: 16px; font-weight: 900;">
                            {{ number_format($tata_kelola['skor_tata_kelola'] ?? 0, 2, ',', '.') }}
                            <span style="font-size: 9px; color: #64748b;">/ 100</span>
                        </div>
                        <div style="font-size: 7.5px; color: #0f766e; font-weight: bold; margin-top: 2px;">
                            Monitoring Internal Non-IKPA
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    @endif

    <!-- LEADERBOARD POIN SIRA (KHUSUS GLOBAL) -->
    @if($is_global)
    <div class="section-title" style="margin-top: 15px;">LEADERBOARD KINERJA SATUAN KERJA (SKALA 65 POIN SIRA)</div>
    <div class="leaderboard-container">
        <div class="leaderboard-left">
            <table class="table-top">
                <thead>
                    <tr>
                        <th colspan="3">TOP 3 SATKER TERBAIK (ZONA JUARA)</th>
                    </tr>
                    <tr>
                        <th style="width: 16%;">Rank</th>
                        <th style="width: 58%;">Nama Satker</th>
                        <th style="width: 26%;">Poin (/65)</th>
                    </tr>
                </thead>
                <tbody style="background-color: #f8fafc;">
                    @forelse(array_slice($satkers, 0, 3) as $index => $s)
                    <tr>
                        <td class="font-bold" style="font-size: 11px; {{ $index == 0 ? 'color: #d97706;' : ($index == 1 ? 'color: #64748b;' : 'color: #b45309;') }}">
                            #{{ $index + 1 }}
                        </td>
                        <td class="text-left" style="font-weight: {{ $index == 0 ? '900' : 'bold' }}; color: #0f172a;">{{ $s['nama_satker'] }}</td>
                        <td class="font-bold text-green" style="font-size: 10.5px;">{{ number_format($s['poin_sira'], 2, ',', '.') }}</td>
                    </tr>
                    @empty
                    <tr><td colspan="3">Belum ada data memadai.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="leaderboard-right">
            <table class="table-bottom">
                <thead>
                    <tr>
                        <th colspan="3">3 SATKER TERBAWAH (ZONA ATENSI)</th>
                    </tr>
                    <tr>
                        <th style="width: 16%;">Rank</th>
                        <th style="width: 58%;">Nama Satker</th>
                        <th style="width: 26%;">Poin (/65)</th>
                    </tr>
                </thead>
                <tbody style="background-color: #fff1f2;">
                    @php
                        $filteredSatkers = array_filter($satkers, function($s) { return $s['total_pagu'] > 0; });
                        $filteredSatkers = array_values($filteredSatkers); 
                        $bottoms = array_slice(array_reverse($filteredSatkers), 0, 3);
                        $totalSatkers = count($filteredSatkers);
                    @endphp
                    @forelse($bottoms as $index => $s)
                    <tr>
                        <td style="font-weight: 900; color: #e11d48; font-size: 10.5px;">#{{ $totalSatkers - $index }}</td>
                        <td class="text-left" style="font-weight: bold; color: #0f172a;">{{ $s['nama_satker'] }}</td>
                        <td class="font-bold text-red" style="font-size: 10.5px;">{{ number_format($s['poin_sira'], 2, ',', '.') }}</td>
                    </tr>
                    @empty
                    <tr><td colspan="3">Belum ada data memadai.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @endif

    <!-- TANDA TANGAN -->
    <div class="ttd-container">
        <div class="ttd-box">
            <p>Palu, {{ $tanggal_cetak }}</p>
            <p style="font-weight: bold;">Kepala Kantor Wilayah,</p>
            <br><br><br><br>
            <p class="ttd-nama">Rakhmat Renaldy, S.H., M.H.</p>
            <p>NIP. 197310101996031001</p>
        </div>
        <div class="clear"></div>
    </div>
    
    <div class="footer-note">
        * Dokumen ini digenerate secara otomatis oleh Sistem Informasi Realisasi Anggaran (SIRA) versi 2.0 (Skala 65 Poin). Dicetak oleh: {{ $dicetak_oleh }}
    </div>
</body>
</html>