@php
    $pdfSetting = \App\Models\PdfSetting::current();
    $logoBase64 = $pdfSetting->getLogoBase64();
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Bulanan IKPA Nasional (65 Poin)</title>
    <style>
        @page { size: legal landscape; margin: 10mm 10mm; }
        body { 
            font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; 
            font-size: 7.5px; 
            line-height: 1.3; 
            color: #1e293b; 
            background-color: #ffffff;
        }
        
        /* ==========================================
           KOP SURAT DINAMIS + LOGO (DOMPDF SAFE)
           ========================================== */
        .header-container { width: 100%; border-bottom: 2.5px solid #0f172a; padding-bottom: 8px; margin-bottom: 14px; text-align: center; }
table.kop-table { width: auto !important; margin: 0 auto !important; border-collapse: collapse; border: none !important; }
table.kop-table td { border: none !important; padding: 0 !important; vertical-align: middle; background: transparent !important; }
.kop-logo-cell { width: auto; padding-right: 12px !important; text-align: right !important; }
.kop-logo-img { max-width: 40px; max-height: 40px; width: auto; height: auto; display: block; }
.kop-text-cell { text-align: center !important; padding: 0 !important; }
.kop-text-cell h2 { margin: 0; font-size: 10.5px; font-weight: bold; color: #475569; letter-spacing: 0.8px; text-transform: uppercase; line-height: 1.25; }
.kop-text-cell h1 { margin: 2px 0 0 0; font-size: 15px; font-weight: 900; text-transform: uppercase; color: #0f172a; letter-spacing: 0.4px; line-height: 1.2; }
.kop-alamat { margin: 6px 0 0 0; font-size: 8px; color: #64748b; text-align: center; }
        
        /* ==========================================
           INFO PANEL
           ========================================== */
        .info-panel { 
            width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; 
            border-radius: 6px; padding: 10px; margin-bottom: 12px; display: table; box-sizing: border-box;
        }
        .info-left { display: table-cell; width: 65%; vertical-align: middle; }
        .info-right { display: table-cell; width: 35%; text-align: right; vertical-align: middle; }
        .info-title { font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
        .info-subtitle { font-size: 9px; color: #3b82f6; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        
        /* ==========================================
           TABEL DATA UTAMA (GRID)
           ========================================== */
        .tabel-data { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        .tabel-data th, .tabel-data td { border: 1px solid #cbd5e1; padding: 4px; text-align: center; vertical-align: middle; font-size: 7.5px; }
        
        .bg-navy { background-color: #0f172a; color: #fff; border-color: #0f172a; font-weight: 900; }
        .bg-blue { background-color: #1e3a8a; color: #fff; border-color: #1e3a8a; font-weight: 900; }
        .bg-gray-dark { background-color: #1e293b; color: #e2e8f0; font-weight: bold; font-size: 7px; text-transform: uppercase; }
        .bg-gray-light { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
        .bg-purple { background-color: #4c1d95; color: #fff; border-color: #4c1d95; font-weight: 900; }
        .bg-amber { background-color: #92400e; color: #fff; border-color: #92400e; font-weight: 900; }
        .bg-teal { background-color: #115e59; color: #fff; border-color: #115e59; font-weight: 900; }
        .bg-gold { background-color: #b45309; color: #fff; border-color: #b45309; font-weight: 900; }
        
        .highlight-poin { font-size: 9.5px; font-weight: 900; color: #b45309; background-color: #fef3c7; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }

        .badge { font-weight: 900; padding: 2px 5px; border-radius: 3px; font-size: 7px; text-transform: uppercase; letter-spacing: 0.3px; display: inline-block; }
        .badge-lulus { background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .badge-gagal { background-color: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
        .badge-na { background-color: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
        
        /* ==========================================
           FOOTER & TTD
           ========================================== */
        .ttd-container { width: 100%; margin-top: 22px; page-break-inside: avoid; }
        .ttd-box { width: 32%; float: right; text-align: center; font-size: 9px; color: #0f172a; }
        .ttd-box p { margin: 0 0 3px 0; }
        .ttd-nama { font-weight: 900; text-decoration: underline; margin-top: 48px; font-size: 10px;}
        .clear { clear: both; }
        
        .footer-note { margin-top: 18px; font-size: 7px; color: #94a3b8; text-align: left; font-style: italic; border-top: 1px dashed #cbd5e1; padding-top: 5px; }
    </style>
</head>
<body>
    <!-- KOP SURAT DINAMIS + LOGO -->
    <div class="header-container">
    <table class="kop-table">
        <tr>
            @if($logoBase64)
                <td class="kop-logo-cell">
                    <img src="{{ $logoBase64 }}" alt="Logo Instansi" class="kop-logo-img">
                </td>
            @endif
            <td class="kop-text-cell">
                <h2>{{ $pdfSetting->instansi_baris_1 }}</h2>
                <h1>{{ $pdfSetting->instansi_baris_2 }}</h1>
            </td>
        </tr>
    </table>
    <p class="kop-alamat">{{ $pdfSetting->alamat_kop }}</p>
</div>

    <!-- INFO PANEL -->
    <div class="info-panel">
        <div class="info-left">
            <div class="info-title">LEADERBOARD NASIONAL (SIRA 65 POIN) &amp; TATA KELOLA LINTAS SATKER</div>
            <div class="info-subtitle">TAHUN ANGGARAN {{ $tahun }}</div>
            <div style="margin-top: 5px; font-size: 8.5px; color: #475569; font-weight: bold;">
                Periode Pelaporan s.d. Bulan: <span style="color: #0f172a;">{{ $bulan_teks }} {{ $tahun }} (Triwulan {{ $tw_aktif }})</span>
            </div>
        </div>
        <div class="info-right">
            <div style="font-size: 8px; color: #64748b; font-weight: bold; text-transform: uppercase;">Diterbitkan Pada:</div>
            <div style="font-size: 10px; font-weight: 900; color: #0f172a; margin-bottom: 4px;">{{ $tanggal_cetak }}</div>
            <div style="font-size: 8px; color: #64748b;">Oleh: {{ $dicetak_oleh }}</div>
        </div>
    </div>

    <table class="tabel-data">
        <thead>
            <tr>
                <th rowspan="2" class="bg-navy" style="width: 3%;">Rank</th>
                <th rowspan="2" class="bg-navy" style="width: 13%;">Satuan Kerja</th>
                <th rowspan="2" class="bg-navy" style="width: 7%;">Pagu Efektif (Rp)</th>
                <th rowspan="2" class="bg-navy" style="width: 7%;">Total RPD (Rp)</th>
                <th rowspan="2" class="bg-navy" style="width: 7%;">Total Realisasi (Rp)</th>
                <th rowspan="2" class="bg-navy" style="width: 6%;">Deviasi Nominal</th>
                <th rowspan="2" class="bg-navy" style="width: 4.5%;">% Serap</th>
                <th rowspan="2" class="bg-navy" style="width: 5%;">Dev. Tertimbang</th>
                <th colspan="3" class="bg-blue">Status Target Kemenkeu (TW {{ $tw_aktif }})</th>
                <th rowspan="2" class="bg-navy" style="width: 5.5%;">Hal. III<br><span style="font-size: 6px; font-weight: normal;">(10%)</span></th>
                <th rowspan="2" class="bg-purple" style="width: 5.5%;">Capaian RO<br><span style="font-size: 6px; font-weight: normal;">(25%)</span></th>
                <th rowspan="2" class="bg-amber" style="width: 6%;">Revisi DIPA<br><span style="font-size: 6px; font-weight: normal;">(10%)</span></th>
                <th rowspan="2" class="bg-teal" style="width: 5.5%;">Tata Kelola<br><span style="font-size: 6px; font-weight: normal;">(/100)</span></th>
                <th rowspan="2" class="bg-gold" style="width: 6.5%;">TOTAL POIN<br><span style="font-size: 6px; font-weight: normal;">(Maks 65)</span></th>
            </tr>
            <tr class="bg-gray-dark">
                <th style="width: 4.5%;">51</th>
                <th style="width: 4.5%;">52</th>
                <th style="width: 4.5%;">53</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($laporan as $index => $row)
            @php
                $stat51 = $row['evaluasi_tw']['51']['status'] ?? 'N/A';
                $stat52 = $row['evaluasi_tw']['52']['status'] ?? 'N/A';
                $stat53 = $row['evaluasi_tw']['53']['status'] ?? 'N/A';

                $getBadgeClass = function($status) {
                    if ($status === 'N/A') return 'badge badge-na';
                    if ($status === 'Lulus' || $status === 'Tercapai') return 'badge badge-lulus';
                    return 'badge badge-gagal';
                };
                
                $getBadgeText = function($status) {
                    return $status === 'N/A' ? 'N/A' : strtoupper($status);
                };

                $nilaiRev = $row['evaluasi_tw']['poin']['nilai_revisi_dipa'] ?? 0;
                $freqRev = $row['evaluasi_tw']['poin']['frekuensi_revisi_tetap'] ?? 0;
                $skorTk = $row['tata_kelola']['skor_tata_kelola'] ?? 0;
            @endphp
            <tr style="page-break-inside: avoid;">
                <td class="font-black bg-gray-light" style="font-size: 9px;">#{{ $index + 1 }}</td>
                <td class="text-left">
                    <div class="font-black" style="color: #0f172a; font-size: 8px;">{{ $row['satker']->nama_satker }}</div>
                    <div style="font-weight: bold; font-size: 6.5px; color: #64748b; margin-top: 1px;">DIPA - {{ $row['satker']->kode_satker }}</div>
                </td>
                <td class="text-right font-bold">{{ number_format($row['pagu_efektif'], 0, ',', '.') }}</td>
                <td class="text-right" style="color: #3730a3; font-weight: bold;">{{ number_format($row['total_rpd'], 0, ',', '.') }}</td>
                <td class="text-right" style="color: #065f46; font-weight: bold;">{{ number_format($row['total_realisasi'], 0, ',', '.') }}</td>
                <td class="text-right" style="color: #9f1239; font-weight: bold;">{{ number_format($row['total_deviasi'], 0, ',', '.') }}</td>
                <td class="font-bold">{{ number_format($row['persentase_penyerapan'], 2, ',', '.') }}%</td>
                <td class="font-bold" style="color: #3730a3;">{{ is_numeric($row['deviasi_tertimbang_kumulatif']) ? number_format($row['deviasi_tertimbang_kumulatif'], 2, ',', '.') : '-' }}</td>
                
                <td><span class="{{ $getBadgeClass($stat51) }}">{{ $getBadgeText($stat51) }}</span></td>
                <td><span class="{{ $getBadgeClass($stat52) }}">{{ $getBadgeText($stat52) }}</span></td>
                <td><span class="{{ $getBadgeClass($stat53) }}">{{ $getBadgeText($stat53) }}</span></td>

                <td class="font-black bg-gray-light" style="font-size: 8.5px; color: {{ is_numeric($row['nilai_ikpa']) && $row['nilai_ikpa'] >= 90 ? '#065f46' : '#9f1239' }};">
                    {{ is_numeric($row['nilai_ikpa']) ? number_format($row['nilai_ikpa'], 2, ',', '.') : '-' }}
                </td>

                <td class="font-black" style="font-size: 8.5px; color: #4c1d95; background-color: #f5f3ff;">
                    {{ number_format($row['evaluasi_tw']['poin']['nilai_ro'] ?? 0, 2, ',', '.') }}
                </td>

                <td class="font-black" style="font-size: 8.5px; color: #92400e; background-color: #fffbeb;">
                    {{ number_format($nilaiRev, 2, ',', '.') }}
                    <div style="font-size: 6.5px; font-weight: bold; color: #b45309;">({{ $freqRev }}x Tetap)</div>
                </td>

                <td class="font-black" style="font-size: 8.5px; color: #115e59; background-color: #f0fdfa;">
                    {{ number_format($skorTk, 2, ',', '.') }}
                </td>

                <td class="highlight-poin">
                    {{ number_format($row['evaluasi_tw']['poin']['total_poin'] ?? 0, 2, ',', '.') }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- TANDA TANGAN DINAMIS -->
    <div class="ttd-container">
        <div class="ttd-box">
            <p>{{ $pdfSetting->kota_ttd }}, {{ $tanggal_cetak }}</p>
            <p style="font-weight: bold;">{{ $pdfSetting->jabatan_ttd }}</p>
            <br><br><br><br>
            <p class="ttd-nama">{{ $pdfSetting->nama_pejabat }}</p>
            <p>NIP. {{ $pdfSetting->nip_pejabat }}</p>
        </div>
        <div class="clear"></div>
    </div>
    
    @if(!empty($pdfSetting->catatan_kaki))
    <div class="footer-note">
        * {{ $pdfSetting->catatan_kaki }}
    </div>
    @endif
</body>
</html>