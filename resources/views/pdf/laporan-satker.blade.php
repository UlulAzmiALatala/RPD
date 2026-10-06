<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Rincian Realisasi dan IKPA - {{ $satker->kode_satker }}</title>
    <style>
        /* ==========================================
           PREMIUM PRINT SETTINGS & TYPOGRAPHY
           ========================================== */
        @page { size: landscape; margin: 10mm 12mm; }
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
           INFO SATKER (INVOICE STYLE)
           ========================================== */
        .info-panel { 
            width: 100%; 
            background-color: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            padding: 10px; 
            margin-bottom: 15px; 
            display: table;
            box-sizing: border-box;
        }
        .info-left { display: table-cell; width: 60%; vertical-align: middle; }
        .info-right { display: table-cell; width: 40%; text-align: right; vertical-align: middle; }
        .info-title { font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
        .info-subtitle { font-size: 9px; color: #3b82f6; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        
        .satker-name { font-size: 10px; font-weight: 900; color: #0f172a; margin-bottom: 3px; }
        .satker-detail { font-size: 8.5px; color: #475569; }
        .highlight-pagu { background-color: #ecfdf5; color: #059669; padding: 2px 6px; border: 1px solid #a7f3d0; border-radius: 3px; font-weight: bold; }

        /* ==========================================
           TABEL DATA UTAMA (GRID)
           ========================================== */
        .tabel-data { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .tabel-data th, .tabel-data td { border: 1px solid #cbd5e1; padding: 4px; text-align: center; vertical-align: middle; font-size: 8px; }
        
        /* Premium Header Colors */
        .bg-navy { background-color: #0f172a; color: #fff; border-color: #0f172a; font-weight: 900; }
        .bg-blue { background-color: #1e3a8a; color: #fff; border-color: #1e3a8a; font-weight: 900; }
        .bg-green { background-color: #065f46; color: #fff; border-color: #065f46; font-weight: 900; }
        .bg-red { background-color: #9f1239; color: #fff; border-color: #9f1239; font-weight: 900; }
        .bg-amber { background-color: #b45309; color: #fff; border-color: #b45309; font-weight: 900; }
        .bg-indigo { background-color: #3730a3; color: #fff; border-color: #3730a3; font-weight: 900; }
        .bg-purple { background-color: #4c1d95; color: #fff; border-color: #4c1d95; font-weight: 900; }
        .bg-gray-dark { background-color: #1e293b; color: #e2e8f0; font-weight: bold; font-size: 7.5px; text-transform: uppercase; }
        .bg-gray-light { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
        
        .text-yellow { color: #fde047; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }
        
        /* ==========================================
           TABEL EVALUASI TW (55 POIN)
           ========================================== */
        .section-title { font-size: 10px; font-weight: 900; color: #0f172a; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 15px; }
        
        .tabel-evaluasi { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 8px; }
        .tabel-evaluasi th, .tabel-evaluasi td { border: 1px solid #cbd5e1; padding: 5px; text-align: center; vertical-align: middle; }
        .tabel-evaluasi th { background-color: #0f172a; color: #ffffff; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-color: #0f172a; }
        .tabel-evaluasi .tw-header { background-color: #f1f5f9; color: #0f172a; font-weight: 900; font-size: 12px; }
        
        /* Badges */
        .badge { font-weight: 900; padding: 3px 6px; border-radius: 4px; font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
        .badge-lulus { background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .badge-gagal { background-color: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
        .badge-na { background-color: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }

        /* Breakdown Perhitungan Poin (Invoice Style) */
        .box-poin { width: 100%; background-color: #ffffff; padding: 4px; box-sizing: border-box; }
        .box-poin table { width: 100%; border-collapse: collapse; margin: 0; }
        .box-poin th, .box-poin td { padding: 3px 4px; text-align: left; border: none; }
        .box-poin .poin-title { font-weight: bold; color: #334155; font-size: 8.5px; }
        .box-poin .poin-result { font-weight: 900; color: #0f172a; text-align: right; font-size: 9px; }
        .box-poin .poin-multiplier { padding-left: 10px; font-style: italic; color: #64748b; font-size: 7.5px; }
        .box-poin .poin-total { border-top: 2px solid #0f172a; font-weight: 900; font-size: 10.5px; color: #0f172a; padding-top: 6px; margin-top: 3px; }

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
    <!-- KOP SURAT ELEGANT -->
    <div class="header-container">
        <h2>KEMENTERIAN HUKUM REPUBLIK INDONESIA</h2>
        <h1>KANTOR WILAYAH SULAWESI TENGAH</h1>
        <p>Jalan Dewi Sartika No. 74, Palu Selatan, Kota Palu, Sulawesi Tengah 94114 | Laman: silakum.kemenkumsulteng.cloud</p>
    </div>

    <!-- INFO SATKER (INVOICE STYLE) -->
    <div class="info-panel">
        <div class="info-left">
            <div class="info-title">EXECUTIVE REPORT - KINERJA ANGGARAN</div>
            <div class="info-subtitle">TAHUN ANGGARAN {{ $tahun }}</div>
            <div style="margin-top: 6px;">
                <div class="satker-name">{{ strtoupper($satker->nama_satker) }} ({{ $satker->kode_satker }})</div>
                <div class="satker-detail">
                    <strong>Pagu DIPA (Kotor Evaluasi Kemenkeu):</strong> Rp {{ number_format($pagu_total, 0, ',', '.') }}
                    @if(isset($pagu_efektif))
                        <br><strong>Pagu Efektif (Sisa Dompet):</strong> <span class="highlight-pagu">Rp {{ number_format($pagu_efektif, 0, ',', '.') }}</span>
                    @endif
                </div>
            </div>
        </div>
        <div class="info-right">
            <div style="font-size: 8px; color: #64748b; font-weight: bold; text-transform: uppercase;">Diterbitkan Pada:</div>
            <div style="font-size: 10px; font-weight: 900; color: #0f172a; margin-bottom: 5px;">{{ $tanggal_cetak }}</div>
            <div style="font-size: 8px; color: #64748b;">Dokumen Resmi <br> Sistem Informasi Realisasi Anggaran</div>
        </div>
    </div>

    <!-- TABEL UTAMA (PREMIUM GRID) -->
    <table class="tabel-data">
        <thead>
            <tr>
                <th rowspan="2" class="bg-navy" style="width: 4%;">Bulan</th>
                <th colspan="3" class="bg-blue">Rencana Penarikan (RPD)</th>
                <th colspan="6" class="bg-green">Aktual Penyerapan & % Deviasi</th>
                <th colspan="3" class="bg-red">Deviasi Nominal (Rp)</th>
                <th rowspan="2" class="bg-amber" style="width: 4.5%;">% Proporsi<br>Pagu</th>
                <th rowspan="2" class="bg-indigo" style="width: 4.5%;">% Deviasi<br>Tertimbang</th>
                <th rowspan="2" class="bg-indigo" style="width: 4.5%;">Rata-rata<br>Kumulatif</th>
                <th rowspan="2" class="bg-purple" style="width: 4.5%;">NILAI IKPA<br>(HAL III)</th>
            </tr>
            <tr class="bg-gray-dark">
                <th>Pegawai (51)</th>
                <th>Barang (52)</th>
                <th>Modal (53)</th>
                <th>Pegawai (51)</th>
                <th class="text-yellow">% Dev</th>
                <th>Barang (52)</th>
                <th class="text-yellow">% Dev</th>
                <th>Modal (53)</th>
                <th class="text-yellow">% Dev</th>
                <th>Pegawai (51)</th>
                <th>Barang (52)</th>
                <th>Modal (53)</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($laporan as $row)
            <tr>
                <td class="font-black bg-gray-light">{{ strtoupper(substr($row['nama_bulan'], 0, 3)) }}</td>
                
                <!-- Rencana -->
                <td class="text-right">{{ number_format($row['rpd_51'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($row['rpd_52'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($row['rpd_53'], 0, ',', '.') }}</td>
                
                <!-- Realisasi & Deviasi -->
                <td class="text-right font-bold" style="color: #065f46;">{{ number_format($row['realisasi_51'], 0, ',', '.') }}</td>
                <td style="color: #b45309; font-weight: bold;">{{ is_numeric($row['persen_deviasi_51']) ? number_format($row['persen_deviasi_51'], 2, ',', '.') : '-' }}</td>
                
                <td class="text-right font-bold" style="color: #065f46;">{{ number_format($row['realisasi_52'], 0, ',', '.') }}</td>
                <td style="color: #b45309; font-weight: bold;">{{ is_numeric($row['persen_deviasi_52']) ? number_format($row['persen_deviasi_52'], 2, ',', '.') : '-' }}</td>
                
                <td class="text-right font-bold" style="color: #065f46;">{{ number_format($row['realisasi_53'], 0, ',', '.') }}</td>
                <td style="color: #b45309; font-weight: bold;">{{ is_numeric($row['persen_deviasi_53']) ? number_format($row['persen_deviasi_53'], 2, ',', '.') : '-' }}</td>
                
                <!-- Deviasi Nominal -->
                <td class="text-right" style="color: #9f1239;">{{ number_format($row['deviasi_51'], 0, ',', '.') }}</td>
                <td class="text-right" style="color: #9f1239;">{{ number_format($row['deviasi_52'], 0, ',', '.') }}</td>
                <td class="text-right" style="color: #9f1239;">{{ number_format($row['deviasi_53'], 0, ',', '.') }}</td>
                
                <!-- Proporsi Pagu -->
                @php
                    $totalRpdBulanIni = $row['rpd_51'] + $row['rpd_52'] + $row['rpd_53'];
                    $proporsiBulanIni = ($pagu_total > 0 && $totalRpdBulanIni > 0) ? ($totalRpdBulanIni / $pagu_total) * 100 : 0;
                @endphp
                <td class="font-bold text-gray-dark">{{ $proporsiBulanIni > 0 ? number_format($proporsiBulanIni, 2, ',', '.') : '-' }}</td>
                
                <!-- Deviasi Tertimbang -->
                <td class="font-bold" style="color: #3730a3;">{{ is_numeric($row['persen_seluruh']) ? number_format($row['persen_seluruh'], 2, ',', '.') : '-' }}</td>
                
                <!-- Rata-rata Kumulatif -->
                <td class="font-bold" style="color: #3730a3;">{{ is_numeric($row['rata_kumulatif']) ? number_format($row['rata_kumulatif'], 2, ',', '.') : '-' }}</td>
                
                <!-- Nilai IKPA -->
                <td class="font-black bg-gray-light" style="font-size: 9px;">{{ is_numeric($row['ikpa']) ? number_format($row['ikpa'], 2, ',', '.') : '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- 櫨 TABEL EVALUASI TARGET KEMENKEU & POIN SIRA (55 POIN) 櫨 -->
    @if(isset($evaluasi_tw))
    <!-- 🔥 SOLUSI LAYOUT DOMPDF: Bungkus judul & tabel dalam container anti-potong 🔥 -->
    <div style="page-break-inside: avoid;">
        <div class="section-title">EVALUASI KEPATUHAN TARGET DAN KALKULASI POIN SIRA (BERDASARKAN TRIWULAN)</div>
        <table class="tabel-evaluasi">
            <thead>
                <tr>
                    <th style="width: 7%;">Periode</th>
                    <th style="width: 17%;">Jenis Belanja</th>
                    <th style="width: 16%;">Realisasi Kumulatif (Rp)</th>
                    <th style="width: 17%;">Target Minimal Kemenkeu</th>
                    <th style="width: 10%;">Aktual (%)</th>
                    <th style="width: 10%;">Status</th>
                    <th style="width: 23%;">Kalkulasi Poin SIRA (Maks 55)</th>
                </tr>
            </thead>
            <!-- Tbody terpisah per Triwulan -->
            @foreach(['I', 'II', 'III', 'IV'] as $tw)
                @php 
                    $eval = $evaluasi_tw[$tw]; 
                    $poin = $eval['poin'];
                    $belanjas = [
                        '51' => 'Belanja Pegawai (51)',
                        '52' => 'Belanja Barang (52)',
                        '53' => 'Belanja Modal (53)'
                    ];
                @endphp
                <tbody style="page-break-inside: avoid;">
                    @foreach($belanjas as $kode => $nama)
                    <tr>
                        @if($kode == '51')
                            <td rowspan="3" class="tw-header">TW<br>{{ $tw }}</td>
                        @endif
                        <td class="text-left font-black" style="color: #1e293b;">{{ $nama }}</td>
                        
                        @if($eval[$kode]['status'] === 'N/A')
                            <td colspan="4" style="background-color: #f8fafc;"><span class="badge badge-na">TIDAK ADA PAGU</span></td>
                        @else
                            <td class="text-right font-black" style="color: #065f46;">Rp {{ number_format($eval[$kode]['nominal'], 0, ',', '.') }}</td>
                            <td class="text-right" style="color: #64748b; font-weight: bold;">
                                {{ $eval[$kode]['target_persen'] }}%
                                @if(isset($eval[$kode]['target_nominal']))
                                    <br><span style="font-size: 7px;">(Rp {{ number_format($eval[$kode]['target_nominal'], 0, ',', '.') }})</span>
                                @endif
                            </td>
                            <td class="font-black {{ $eval[$kode]['status'] == 'Tercapai' ? 'text-green' : 'text-red' }}">
                                {{ number_format($eval[$kode]['realisasi_persen'], 2, ',', '.') }}%
                            </td>
                            <td>
                                <span class="badge {{ $eval[$kode]['status'] == 'Tercapai' ? 'badge-lulus' : 'badge-gagal' }}">
                                    {{ strtoupper($eval[$kode]['status']) }}
                                </span>
                            </td>
                        @endif

                        @if($kode == '51')
                            <td rowspan="3" style="padding: 0; vertical-align: top; background-color: #ffffff;">
                                <div class="box-poin">
                                    <table>
                                        <tr>
                                            <td class="poin-title text-green">1. Skor Penyerapan (Maks 100)</td>
                                            <td class="poin-result">{{ number_format($poin['nilai_penyerapan'], 2, ',', '.') }}</td>
                                        </tr>
                                        <tr>
                                            <td class="poin-multiplier">x Bobot 20%</td>
                                            <td class="poin-result" style="color: #059669;">{{ number_format($poin['tertimbang_penyerapan'], 2, ',', '.') }} pts</td>
                                        </tr>
                                        <tr>
                                            <td class="poin-title text-blue" style="padding-top: 4px;">2. Skor Hal. III DIPA (Maks 100)</td>
                                            <td class="poin-result" style="padding-top: 4px;">{{ number_format($poin['ikpa_hal_iii'], 2, ',', '.') }}</td>
                                        </tr>
                                        <tr>
                                            <td class="poin-multiplier">x Bobot 10%</td>
                                            <td class="poin-result" style="color: #2563eb;">{{ number_format($poin['tertimbang_hal_iii'], 2, ',', '.') }} pts</td>
                                        </tr>
                                        <tr>
                                            <td class="poin-title text-purple" style="padding-top: 4px;">3. Capaian Output RO (Maks 100)</td>
                                            <td class="poin-result" style="padding-top: 4px;">{{ number_format($poin['nilai_ro'], 2, ',', '.') }}</td>
                                        </tr>
                                        <tr>
                                            <td class="poin-multiplier" style="padding-bottom: 4px;">x Bobot 25%</td>
                                            <td class="poin-result" style="padding-bottom: 4px; color: #7e22ce;">{{ number_format($poin['tertimbang_ro'], 2, ',', '.') }} pts</td>
                                        </tr>
                                        <tr>
                                            <td class="poin-total">TOTAL POIN SIRA TW {{ $tw }}</td>
                                            <td class="poin-total text-right" style="color: #b45309; font-size: 11.5px;">{{ number_format($poin['total_poin'], 2, ',', '.') }} <span style="font-size: 7.5px; color: #94a3b8;">/ 55</span></td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        @endif
                    </tr>
                    @endforeach
                </tbody>
            @endforeach
        </table>
    </div>
    @endif

    <!-- KOLOM TANDA TANGAN -->
    <div class="ttd-container" style="page-break-inside: avoid;">
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