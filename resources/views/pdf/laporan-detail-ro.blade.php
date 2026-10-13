<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Detail Capaian Rincian Output (RO)</title>
    <style>
        /* ==========================================
           PREMIUM PRINT SETTINGS & TYPOGRAPHY
           ========================================== */
        @page { size: portrait; margin: 10mm 15mm; }
        body { 
            font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; 
            font-size: 9px; 
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
            border-radius: 6px; padding: 12px; margin-bottom: 20px; display: table; box-sizing: border-box;
        }
        .info-left { display: table-cell; width: 60%; vertical-align: middle; }
        .info-right { display: table-cell; width: 40%; text-align: right; vertical-align: middle; }
        .info-title { font-size: 13px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
        .info-subtitle { font-size: 10px; color: #4c1d95; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        
        .satker-name { font-size: 11px; font-weight: 900; color: #0f172a; margin-bottom: 3px; margin-top: 8px; }
        
        /* ==========================================
           TABEL DATA UTAMA (GRID)
           ========================================== */
        .tabel-data { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .tabel-data th, .tabel-data td { border: 1px solid #cbd5e1; padding: 6px; text-align: center; vertical-align: middle; }
        .tabel-data th { background-color: #0f172a; color: #ffffff; font-weight: 900; text-transform: uppercase; font-size: 8px; letter-spacing: 0.5px; border-color: #0f172a; }
        
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }
        
        /* ==========================================
           FOOTER & TTD
           ========================================== */
        .ttd-container { width: 100%; margin-top: 30px; page-break-inside: avoid; }
        .ttd-box { width: 35%; float: right; text-align: center; font-size: 10px; color: #0f172a; }
        .ttd-box p { margin: 0 0 3px 0; }
        .ttd-nama { font-weight: 900; text-decoration: underline; margin-top: 50px; font-size: 11px;}
        .clear { clear: both; }
        
        .footer-note { margin-top: 20px; font-size: 8px; color: #94a3b8; text-align: left; font-style: italic; border-top: 1px dashed #cbd5e1; padding-top: 5px; }
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
            <div class="info-title">LAPORAN CAPAIAN KINERJA FISIK</div>
            <div class="info-subtitle">RINCIAN OUTPUT (RO)</div>
            <div class="satker-name">{{ strtoupper($satker->nama_satker) }} ({{ $satker->kode_satker }})</div>
            <div style="font-size: 9px; color: #475569; font-weight: bold;">
                Tahun Anggaran: <span style="color: #0f172a;">{{ $tahun }}</span>
            </div>
        </div>
        <div class="info-right">
            <div style="font-size: 8px; color: #64748b; font-weight: bold; text-transform: uppercase;">Diterbitkan Pada:</div>
            <div style="font-size: 11px; font-weight: 900; color: #0f172a; margin-bottom: 5px;">{{ $tanggal_cetak }}</div>
            <div style="font-size: 8px; color: #64748b;">Dokumen Resmi <br> Sistem Informasi Realisasi Anggaran</div>
        </div>
    </div>

    <table class="tabel-data">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 14%;">Kode RO</th>
                <th style="width: 32%;" class="text-left">Nama Rincian Output</th>
                <th style="width: 12%;">Target Volume</th>
                <th style="width: 13%;">Pagu Anggaran (Rp)</th>
                <th style="width: 12%; background-color: #065f46;">Realisasi Volume</th>
                <th style="width: 13%; background-color: #1e3a8a;">Serapan Anggaran (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($data_ro as $index => $ro)
            @php
                $totVol = $ro->realisasiOutputs->sum('realisasi_volume');
                $totAng = $ro->realisasiOutputs->sum('realisasi_anggaran');
            @endphp
            <tr style="page-break-inside: avoid;">
                <td class="font-black" style="background-color: #f8fafc;">{{ $index + 1 }}</td>
                <td class="font-black" style="font-size: 8.5px;">{{ $ro->kode_ro }}</td>
                <td class="text-left font-black" style="color: #0f172a; font-size: 9.5px;">{{ $ro->nama_ro }}</td>
                <td class="font-bold">{{ number_format($ro->target_volume, 2, ',', '.') }} <br><span style="font-size: 7px; color: #64748b;">{{ $ro->satuan }}</span></td>
                <td class="text-right font-bold">{{ number_format($ro->pagu_anggaran, 0, ',', '.') }}</td>
                <td class="font-black" style="color: #065f46; font-size: 10px; background-color: #ecfdf5;">{{ number_format($totVol, 2, ',', '.') }}</td>
                <td class="text-right font-black" style="color: #1e3a8a; background-color: #eff6ff;">{{ number_format($totAng, 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="padding: 20px; font-style: italic; color: #64748b; font-weight: bold;">
                    Belum ada Rincian Output (RO) yang di-setup untuk tahun anggaran ini.
                </td>
            </tr>
            @endforelse
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