<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Executive Summary - Dashboard SIRA</title>
    <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 10px; line-height: 1.4; color: #1e293b; }
        
        /* KOP SURAT */
        .kop-surat { text-align: center; border-bottom: 3px solid #0f172a; padding-bottom: 8px; margin-bottom: 15px; }
        .kop-surat h1 { margin: 0; font-size: 16px; font-weight: bold; text-transform: uppercase; color: #0f172a; }
        .kop-surat h2 { margin: 0; font-size: 12px; font-weight: bold; color: #334155; }
        .kop-surat p { margin: 3px 0 0 0; font-size: 9px; color: #475569; }
        
        .judul-laporan { text-align: center; margin-bottom: 20px; }
        .judul-laporan h3 { margin: 0; font-size: 14px; font-weight: bold; color: #1e40af; text-transform: uppercase; }
        .judul-laporan p { margin: 4px 0 0 0; font-size: 10px; font-weight: bold; color: #64748b; }
        .judul-satker { margin-top: 4px; font-size: 11px; color: #0f172a; }

        /* GRID CARDS (SUMMARY) */
        .summary-container { width: 100%; margin-bottom: 20px; }
        .summary-card { float: left; width: 18.5%; text-align: center; padding: 10px 0; border: 1px solid #e2e8f0; border-radius: 8px; margin-right: 1.8%; box-sizing: border-box; }
        .summary-card:last-child { margin-right: 0; }
        .summary-card p { margin: 0; font-size: 8px; text-transform: uppercase; font-weight: bold; color: #64748b; }
        .summary-card h4 { margin: 5px 0 0 0; font-size: 12px; font-weight: bold; color: #0f172a; }
        
        .text-green { color: #059669 !important; }
        .text-red { color: #dc2626 !important; }
        .text-blue { color: #2563eb !important; }
        .text-yellow { color: #d97706 !important; }

        /* TABEL UMUM */
        .section-title { font-size: 11px; font-weight: bold; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: center; vertical-align: middle; }
        th { background-color: #f1f5f9; color: #334155; font-size: 9px; text-transform: uppercase; }
        
        /* ANALISIS TW & POIN */
        .tabel-evaluasi th { background-color: #0f172a; color: #ffffff; }
        .tw-header { background-color: #cbd5e1 !important; color: #0f172a !important; font-weight: bold; }
        .badge-lulus { background-color: #d1fae5; color: #065f46; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
        .badge-gagal { background-color: #ffe4e6; color: #be123c; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
        .badge-na { background-color: #f1f5f9; color: #64748b; font-weight: bold; padding: 2px 6px; border-radius: 4px; }

        /* BOX PERHITUNGAN POIN */
        .box-poin { width: 100%; border: 1px solid #0f172a; background-color: #f8fafc; padding: 3px; font-size: 8px; box-sizing: border-box; }
        .box-poin table { width: 100%; border-collapse: collapse; margin: 0; }
        .box-poin th, .box-poin td { padding: 3px 5px; text-align: left; border: none; }
        .box-poin .poin-title { font-weight: bold; color: #1e3a8a; }
        .box-poin .poin-result { font-weight: bold; color: #065f46; text-align: right; font-size: 9px; }
        .box-poin .poin-total { border-top: 1px dashed #94a3b8; font-weight: bold; font-size: 10px; color: #0f172a; padding-top: 5px; }

        /* 🔥 PERBAIKAN GRAFIK CSS MURNI UNTUK DOMPDF 🔥 */
        .chart-container { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 20px; page-break-inside: avoid; }
        .chart-wrapper { width: 100%; height: 120px; border-bottom: 1px solid #94a3b8; position: relative; margin-bottom: 5px; }
        .chart-col { display: inline-block; width: 8%; height: 120px; position: relative; text-align: center; }
        .bar-wrap { position: absolute; bottom: 0; width: 100%; text-align: center; }
        .bar-rpd { display: inline-block; width: 12px; background-color: #6366f1; vertical-align: bottom; }
        .bar-real { display: inline-block; width: 12px; background-color: #10b981; vertical-align: bottom; }
        
        .chart-labels { width: 100%; display: table; }
        .chart-label-col { display: table-cell; width: 8%; text-align: center; font-size: 8px; color: #475569; }
        
        .legend-box { display: inline-block; width: 10px; height: 10px; margin-right: 4px; vertical-align: middle; }

        /* LEADERBOARD */
        .leaderboard-container { width: 100%; display: table; page-break-inside: avoid; }
        .leaderboard-left { display: table-cell; width: 48%; padding-right: 2%; }
        .leaderboard-right { display: table-cell; width: 48%; padding-left: 2%; }
        .table-top th { background-color: #059669; color: white; }
        .table-bottom th { background-color: #be123c; color: white; }
        
        /* FOOTER TTD */
        .ttd-container { width: 100%; margin-top: 30px; page-break-inside: avoid; }
        .ttd-box { width: 35%; float: right; text-align: center; font-size: 10px; }
        .ttd-box p { margin: 0 0 4px 0; }
        .ttd-nama { font-weight: bold; text-decoration: underline; margin-top: 60px; }
        .clear { clear: both; }
        
        .footer-note { margin-top: 50px; font-size: 8px; color: #94a3b8; text-align: left; font-style: italic; }
    </style>
</head>
<body>
    <!-- KOP SURAT -->
    <div class="kop-surat">
        <h2>KEMENTERIAN HUKUM REPUBLIK INDONESIA</h2>
        <h1>KANTOR WILAYAH SULAWESI TENGAH</h1>
        <p>Jalan Dewi Sartika No. 74, Palu Selatan, Kota Palu, Sulawesi Tengah 94114 | Laman: silakum.kemenkumsulteng.cloud/</p>
    </div>

    <!-- JUDUL -->
    <div class="judul-laporan">
        <h3>EXECUTIVE SUMMARY - RAPOR KINERJA ANGGARAN</h3>
        <p>Tahun Anggaran {{ $tahun }} | Posisi Triwulan {{ $tw_aktif }}</p>
        <p class="judul-satker">Satuan Kerja: <strong>{{ $nama_satker }}</strong></p>
    </div>

    <!-- 5 KOTAK RINGKASAN GLOBAL -->
    <div class="summary-container">
        <div class="summary-card" style="background-color: #fef3c7; border-color: #f59e0b;">
            <p style="color: #b45309;">Total Poin SIRA</p>
            <h4 class="text-yellow" style="font-size: 16px;">
                {{ number_format($analisis_tw['poin']['total_poin'], 2, ',', '.') }} 
                <span style="font-size: 9px; color: #b45309;">/ 30 Pts</span>
            </h4>
        </div>
        <div class="summary-card">
            <p>Pagu Efektif</p>
            <h4 class="text-blue">Rp {{ number_format($summary['total_anggaran'], 0, ',', '.') }}</h4>
        </div>
        <div class="summary-card">
            <p>Realisasi</p>
            <h4 class="text-green">Rp {{ number_format($summary['total_realisasi_setahun'], 0, ',', '.') }}</h4>
        </div>
        <div class="summary-card">
            <p>% Serapan</p>
            <h4>{{ number_format($summary['persentase_realisasi'], 2, ',', '.') }}%</h4>
        </div>
        <div class="summary-card" style="margin-right: 0;">
            <p>Nilai IKPA</p>
            <h4 class="{{ $summary['ikpa'] >= 95 ? 'text-green' : ($summary['ikpa'] >= 85 ? 'text-yellow' : 'text-red') }}">
                {{ number_format($summary['ikpa'], 2, ',', '.') }}
            </h4>
        </div>
        <div class="clear"></div>
    </div>

    <!-- 🔥 GRAFIK BATANG HTML MURNI 🔥 -->
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
        <!-- Area Batang -->
        <div class="chart-wrapper">
            @foreach($grafik as $item)
                @php
                    $valRpd = $item['Target_RPD'] ?? 0;
                    $valReal = $is_global ? ($item['Aktual_Realisasi'] ?? 0) : ($item['Total_Realisasi'] ?? 0);

                    // Hitung persentase max 100%
                    $hRpd = min(($valRpd / $maxVal) * 100, 100);
                    $hReal = min(($valReal / $maxVal) * 100, 100);
                    
                    if($valRpd > 0 && $hRpd < 1) $hRpd = 1; 
                    if($valReal > 0 && $hReal < 1) $hReal = 1;
                @endphp
                <div class="chart-col">
                    <div class="bar-wrap">
                        @if($valRpd > 0)
                            <div class="bar-rpd" style="height: {{ $hRpd }}%;" title="RPD: {{ $valRpd }} Jt"></div>
                        @endif
                        @if($valReal > 0)
                            <div class="bar-real" style="height: {{ $hReal }}%;" title="Realisasi: {{ $valReal }} Jt"></div>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
        <!-- Area Teks Label -->
        <div class="chart-labels">
            @foreach($grafik as $item)
                <div class="chart-label-col" style="font-size: 7px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ $is_global ? str_replace('DIPA ', '', $item['name']) : $item['name'] }}
                </div>
            @endforeach
        </div>
        <!-- Legend -->
        <div style="text-align: center; font-size: 9px; font-weight: bold; color: #334155; margin-top: 10px;">
            <span class="legend-box" style="background-color: #6366f1;"></span> Target RPD
            <span class="legend-box" style="background-color: #10b981; margin-left: 15px;"></span> Aktual Realisasi
        </div>
    </div>

    <!-- 🔥 TABEL EVALUASI TARGET KEMENKEU & POIN 🔥 -->
    <div class="section-title">EVALUASI TARGET PENYERAPAN DAN POIN SIRA (TW {{ $tw_aktif }})</div>
    <table class="tabel-evaluasi">
        <thead>
            <tr>
                <th style="width: 10%;">Triwulan</th>
                <th style="width: 20%;">Jenis Belanja</th>
                <th style="width: 12%;">Target (%)</th>
                <th style="width: 12%;">Aktual (%)</th>
                <th style="width: 15%;">Status Kepatuhan</th>
                <th style="width: 31%;">Kalkulasi Poin SIRA</th>
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
                    <td rowspan="3" class="tw-header text-center">TW {{ $tw_aktif }}</td>
                @endif
                <td class="text-left font-bold">{{ $nama }}</td>
                
                @if($analisis_tw[$kode]['status'] === 'N/A')
                    <td colspan="3" style="background-color: #f8fafc;"><span class="badge-na">TIDAK ADA PAGU</span></td>
                @else
                    <td>{{ $analisis_tw[$kode]['target_persen'] }}%</td>
                    <td class="font-bold">{{ number_format($analisis_tw[$kode]['realisasi_persen'], 2, ',', '.') }}%</td>
                    <td>
                        <span class="{{ $analisis_tw[$kode]['status'] == 'Tercapai' || $analisis_tw[$kode]['status'] == 'Lulus' ? 'badge-lulus' : 'badge-gagal' }}">
                            {{ strtoupper($analisis_tw[$kode]['status']) }}
                        </span>
                    </td>
                @endif

                @if($kode == '51')
                    <td rowspan="3" style="padding: 0; vertical-align: top;">
                        <div class="box-poin">
                            <table>
                                <tr>
                                    <td class="poin-title">1. Penyerapan (Maks 100)</td>
                                    <td class="text-right">{{ number_format($poin['nilai_penyerapan'], 2, ',', '.') }}</td>
                                </tr>
                                <tr>
                                    <td style="padding-left: 10px; font-style: italic; color: #64748b;">x Bobot 20%</td>
                                    <td class="poin-result">{{ number_format($poin['tertimbang_penyerapan'], 2, ',', '.') }} pts</td>
                                </tr>
                                <tr>
                                    <td class="poin-title">2. Hal. III DIPA (Maks 100)</td>
                                    <td class="text-right">{{ number_format($poin['ikpa_hal_iii'], 2, ',', '.') }}</td>
                                </tr>
                                <tr>
                                    <td style="padding-left: 10px; font-style: italic; color: #64748b; padding-bottom: 5px;">x Bobot 10%</td>
                                    <td class="poin-result" style="padding-bottom: 5px;">{{ number_format($poin['tertimbang_hal_iii'], 2, ',', '.') }} pts</td>
                                </tr>
                                <tr>
                                    <td class="poin-total">TOTAL POIN SIRA TW {{ $tw_aktif }}</td>
                                    <td class="poin-total text-right" style="color: #b45309; font-size: 11px;">{{ number_format($poin['total_poin'], 2, ',', '.') }} <span style="font-size: 8px;">/ 30</span></td>
                                </tr>
                            </table>
                        </div>
                    </td>
                @endif
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- JIKA GLOBAL (Semua Satker): TAMPILKAN LEADERBOARD POIN SIRA -->
    @if($is_global)
    <div class="section-title" style="margin-top: 15px;">LEADERBOARD KINERJA SATUAN KERJA (BERDASARKAN TOTAL POIN SIRA)</div>
    <div class="leaderboard-container">
        <!-- TOP 3 SATKER -->
        <div class="leaderboard-left">
            <table class="table-top">
                <thead>
                    <tr>
                        <th colspan="3">TOP 3 SATKER TERBAIK</th>
                    </tr>
                    <tr>
                        <th style="width: 15%;">Rank</th>
                        <th style="width: 60%;">Nama Satker</th>
                        <th style="width: 25%;">Poin SIRA</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse(array_slice($satkers, 0, 3) as $index => $s)
                    <tr>
                        <td class="font-bold">#{{ $index + 1 }}</td>
                        <td class="text-left">{{ $s['nama_satker'] }}</td>
                        <td class="font-bold text-green" style="font-size: 10px;">{{ number_format($s['poin_sira'], 2, ',', '.') }} Pts</td>
                    </tr>
                    @empty
                    <tr><td colspan="3">Belum ada data memadai.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- BOTTOM 3 SATKER -->
        <div class="leaderboard-right">
            <table class="table-bottom">
                <thead>
                    <tr>
                        <th colspan="3">3 SATKER TERENDAH</th>
                    </tr>
                    <tr>
                        <th style="width: 15%;">Rank</th>
                        <th style="width: 60%;">Nama Satker</th>
                        <th style="width: 25%;">Poin SIRA</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        // Filter Satker yang punya pagu
                        $filteredSatkers = array_filter($satkers, function($s) { return $s['total_pagu'] > 0; });
                        $filteredSatkers = array_values($filteredSatkers); 
                        $bottoms = array_slice(array_reverse($filteredSatkers), 0, 3);
                        $totalSatkers = count($filteredSatkers);
                    @endphp
                    @forelse($bottoms as $index => $s)
                    <tr>
                        <td class="font-bold">#{{ $totalSatkers - $index }}</td>
                        <td class="text-left">{{ $s['nama_satker'] }}</td>
                        <td class="font-bold text-red" style="font-size: 10px;">{{ number_format($s['poin_sira'], 2, ',', '.') }} Pts</td>
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
            <p>Kepala Kantor Wilayah,</p>
            <br><br><br><br>
            <p class="ttd-nama">Rakhmat Renaldy, S.H., M.H.</p>
            <p>NIP. 197310101996031001</p>
        </div>
        <div class="clear"></div>
    </div>
    
    <div class="footer-note">
        * Dokumen dicetak secara otomatis dari Sistem Informasi Realisasi Anggaran (SIRA) oleh: {{ $dicetak_oleh }}
    </div>
</body>
</html>