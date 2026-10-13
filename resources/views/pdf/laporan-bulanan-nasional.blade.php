<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Bulanan IKPA Nasional</title>
    <style>
        /* ==========================================
           PREMIUM PRINT SETTINGS & TYPOGRAPHY
           ========================================== */
        @page { size: legal landscape; margin: 10mm 12mm; }
        body { 
            font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; 
            font-size: 8px; 
            line-height: 1.3; 
            color: #1e293b; 
            background-color: #ffffff;
        }
        
        /* ==========================================
           KOP SURAT & HEADER
           ========================================== */
        .header-container { width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; text-align: center; }
        .header-container h1 { margin: 0; font-size: 14px; font-weight: 900; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px; }
        .header-container h2 { margin: 2px 0 0 0; font-size: 10px; font-weight: bold; color: #475569; letter-spacing: 1px; }
        .header-container p { margin: 4px 0 0 0; font-size: 8px; color: #64748b; }
        
        /* ==========================================
           INFO PANEL (INVOICE STYLE)
           ========================================== */
        .info-panel { 
            width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; 
            border-radius: 6px; padding: 10px; margin-bottom: 15px; display: table; box-sizing: border-box;
        }
        .info-left { display: table-cell; width: 60%; vertical-align: middle; }
        .info-right { display: table-cell; width: 40%; text-align: right; vertical-align: middle; }
        .info-title { font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
        .info-subtitle { font-size: 9px; color: #3b82f6; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        
        /* ==========================================
           TABEL DATA UTAMA (GRID)
           ========================================== */
        .tabel-data { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .tabel-data th, .tabel-data td { border: 1px solid #cbd5e1; padding: 5px; text-align: center; vertical-align: middle; font-size: 8px; }
        
        .bg-navy { background-color: #0f172a; color: #fff; border-color: #0f172a; font-weight: 900; }
        .bg-blue { background-color: #1e3a8a; color: #fff; border-color: #1e3a8a; font-weight: 900; }
        .bg-gray-dark { background-color: #1e293b; color: #e2e8f0; font-weight: bold; font-size: 7.5px; text-transform: uppercase; }
        .bg-gray-light { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
        .bg-purple { background-color: #4c1d95; color: #fff; border-color: #4c1d95; font-weight: 900; }
        .bg-gold { background-color: #b45309; color: #fff; border-color: #b45309; font-weight: 900; }
        
        .highlight-poin { font-size: 10px; font-weight: 900; color: #b45309; background-color: #fef3c7; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }

        /* Badges */
        .badge { font-weight: 900; padding: 3px 6px; border-radius: 4px; font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
        .badge-lulus { background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .badge-gagal { background-color: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
        .badge-na { background-color: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
        
        /* ==========================================
           FOOTER & TTD
           ========================================== */
        .ttd-container { width: 100%; margin-top: 25px; page-break-inside: avoid; }
        .ttd-box { width: 30%; float: right; text-align: center; font-size: 9px; color: #0f172a; }
        .ttd-box p { margin: 0 0 3px 0; }
        .ttd-nama { font-weight: 900; text-decoration: underline; margin-top: 50px; font-size: 10px;}
        .clear { clear: both; }
        
        .footer-note { margin-top: 20px; font-size: 7px; color: #94a3b8; text-align: left; font-style: italic; border-top: 1px dashed #cbd5e1; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="header-container">
        <h2>KEMENTERIAN HUKUM REPUBLIK INDONESIA</h2>
        <h1>KANTOR WILAYAH SULAWESI TENGAH</h1>
        <p>Jalan Dewi Sartika No. 74, Kota Palu, Sulawesi Tengah 94114 | Laman: silakum.kemenkumsulteng.cloud</p>
    </div>

    <!-- INFO PANEL (INVOICE STYLE) -->
    <div class="info-panel">
        <div class="info-left">
            <div class="info-title">LEADERBOARD NASIONAL (SIRA) LINTAS SATKER</div>
            <div class="info-subtitle">TAHUN ANGGARAN {{ $tahun }}</div>
            <div style="margin-top: 6px; font-size: 9px; color: #475569; font-weight: bold;">
                Periode Pelaporan s.d. Bulan: <span style="color: #0f172a;">{{ $bulan_teks }} {{ $tahun }} (Triwulan {{ $tw_aktif }})</span>
            </div>
        </div>
        <div class="info-right">
            <div style="font-size: 8px; color: #64748b; font-weight: bold; text-transform: uppercase;">Diterbitkan Pada:</div>
            <div style="font-size: 10px; font-weight: 900; color: #0f172a; margin-bottom: 5px;">{{ $tanggal_cetak }}</div>
            <div style="font-size: 8px; color: #64748b;">Oleh: {{ $dicetak_oleh }}</div>
        </div>
    </div>

    <table class="tabel-data">
        <thead>
            <tr>
                <th rowspan="2" class="bg-navy" style="width: 2%;">Peringkat</th>
                <th rowspan="2" class="bg-navy" style="width: 14%;">Satuan Kerja</th>
                <th rowspan="2" class="bg-navy" style="width: 7%;">Pagu Efektif (Rp)</th>
                <th rowspan="2" class="bg-navy" style="width: 7%;">Total RPD (Rp)</th>
                <th rowspan="2" class="bg-navy" style="width: 7%;">Total Realisasi (Rp)</th>
                <th rowspan="2" class="bg-navy" style="width: 6%;">Deviasi Nominal (Rp)</th>
                <th rowspan="2" class="bg-navy" style="width: 5%;">% Serap</th>
                <th rowspan="2" class="bg-navy" style="width: 6%;">Deviasi Tertimbang</th>
                <th colspan="3" class="bg-blue">Status Target Kemenkeu (TW {{ $tw_aktif }})</th>
                <th rowspan="2" class="bg-navy" style="width: 6%;">Nilai IKPA<br><span style="font-size: 6px; font-weight: normal;">(Hal. III DIPA)</span></th>
                <th rowspan="2" class="bg-purple" style="width: 6%;">Capaian RO<br><span style="font-size: 6px; font-weight: normal;">(Maks 100)</span></th>
                <th rowspan="2" class="bg-gold" style="width: 7%;">TOTAL POIN SIRA<br><span style="font-size: 6px; font-weight: normal;">(Maks 55)</span></th>
            </tr>
            <tr class="bg-gray-dark">
                <th style="width: 5%;">51</th>
                <th style="width: 5%;">52</th>
                <th style="width: 5%;">53</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($laporan as $index => $row)
            @php
                $stat51 = isset($row['evaluasi_tw']['51']['status']) ? $row['evaluasi_tw']['51']['status'] : 'N/A';
                $stat52 = isset($row['evaluasi_tw']['52']['status']) ? $row['evaluasi_tw']['52']['status'] : 'N/A';
                $stat53 = isset($row['evaluasi_tw']['53']['status']) ? $row['evaluasi_tw']['53']['status'] : 'N/A';

                $getBadgeClass = function($status) {
                    if ($status === 'N/A') return 'badge badge-na';
                    if ($status === 'Lulus' || $status === 'Tercapai') return 'badge badge-lulus';
                    return 'badge badge-gagal';
                };
                
                $getBadgeText = function($status) {
                    return $status === 'N/A' ? 'N/A' : strtoupper($status);
                };
            @endphp
            <tr style="page-break-inside: avoid;">
                <td class="font-black bg-gray-light" style="font-size: 10px;">#{{ $index + 1 }}</td>
                <td class="text-left">
                    <div class="font-black" style="color: #0f172a; font-size: 8.5px;">{{ $row['satker']->nama_satker }}</div>
                    <div style="font-weight: bold; font-size: 7px; color: #64748b; margin-top: 2px;">DIPA - {{ $row['satker']->kode_satker }}</div>
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

                <td class="font-black bg-gray-light" style="font-size: 9px; color: {{ is_numeric($row['nilai_ikpa']) && $row['nilai_ikpa'] >= 90 ? '#065f46' : '#9f1239' }};">
                    {{ is_numeric($row['nilai_ikpa']) ? number_format($row['nilai_ikpa'], 2, ',', '.') : '-' }}
                </td>

                <td class="font-black text-center" style="font-size: 9px; color: #4c1d95; background-color: #f5f3ff;">
                    {{ number_format($row['evaluasi_tw']['poin']['nilai_ro'] ?? 0, 2, ',', '.') }}
                </td>

                <td class="highlight-poin">
                    {{ number_format($row['evaluasi_tw']['poin']['total_poin'], 2, ',', '.') }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

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
        * Dokumen dicetak secara otomatis dari Sistem Informasi Realisasi Anggaran (SIRA) 2.0. Tidak memerlukan cap basah.
    </div>
</body>
</html>