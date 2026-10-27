<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Detail Capaian Rincian Output (RO)</title>
    <style>
        @page { size: portrait; margin: 10mm 15mm; }
        body { 
            font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; 
            font-size: 8.5px; 
            line-height: 1.3; 
            color: #1e293b; 
            background-color: #ffffff;
        }
        
        .header-container { width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; text-align: center; }
        .header-container h1 { margin: 0; font-size: 13px; font-weight: 900; text-transform: uppercase; color: #0f172a; }
        .header-container h2 { margin: 2px 0 0 0; font-size: 9.5px; font-weight: bold; color: #475569; }
        .header-container p { margin: 3px 0 0 0; font-size: 7.5px; color: #64748b; }
        
        .info-panel { 
            width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; 
            border-radius: 6px; padding: 10px; margin-bottom: 15px; display: table; box-sizing: border-box;
        }
        .info-left { display: table-cell; width: 60%; vertical-align: middle; }
        .info-right { display: table-cell; width: 40%; text-align: right; vertical-align: middle; }
        .info-title { font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 2px; }
        .info-subtitle { font-size: 9px; color: #4c1d95; font-weight: bold; text-transform: uppercase; }
        .satker-name { font-size: 10.5px; font-weight: 900; color: #0f172a; margin-top: 6px; }
        
        .tabel-data { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .tabel-data th, .tabel-data td { border: 1px solid #cbd5e1; padding: 5px; text-align: center; vertical-align: middle; }
        .tabel-data th { background-color: #0f172a; color: #ffffff; font-weight: 900; text-transform: uppercase; font-size: 7.5px; }
        
        /* 🔥 STYLE SUB-TABEL TRANSAKSI DI DALAM PDF */
        .sub-table { width: 100%; border-collapse: collapse; margin-top: 4px; margin-bottom: 4px; background-color: #f8fafc; }
        .sub-table td { border: 1px dotted #94a3b8; padding: 3px 4px; font-size: 7.5px; text-align: left; }
        
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }
        
        .ttd-container { width: 100%; margin-top: 20px; page-break-inside: avoid; }
        .ttd-box { width: 35%; float: right; text-align: center; font-size: 9px; color: #0f172a; }
        .ttd-box p { margin: 0 0 3px 0; }
        .ttd-nama { font-weight: 900; text-decoration: underline; margin-top: 45px; font-size: 10.5px; }
        .clear { clear: both; }
        
        .footer-note { margin-top: 15px; font-size: 7.5px; color: #94a3b8; text-align: left; font-style: italic; border-top: 1px dashed #cbd5e1; padding-top: 4px; }
    </style>
</head>
<body>
    <div class="header-container">
        <h2>KEMENTERIAN HUKUM REPUBLIK INDONESIA</h2>
        <h1>KANTOR WILAYAH SULAWESI TENGAH</h1>
        <p>Jalan Dewi Sartika No. 74, Kota Palu, Sulawesi Tengah 94114 | Laman: silakum.kemenkumsulteng.cloud</p>
    </div>

    <div class="info-panel">
        <div class="info-left">
            <div class="info-title">LAPORAN CAPAIAN KINERJA FISIK & KEUANGAN</div>
            <div class="info-subtitle">RINCIAN OUTPUT (RO) - LIVE LEDGER TRACEABILITY</div>
            <div class="satker-name">{{ strtoupper($satker->nama_satker) }} ({{ $satker->kode_satker }})</div>
            <div style="font-size: 8.5px; color: #475569; font-weight: bold; margin-top: 2px;">
                Tahun Anggaran: <span style="color: #0f172a;">{{ $tahun }}</span>
            </div>
        </div>
        <div class="info-right">
            <div style="font-size: 7.5px; color: #64748b; font-weight: bold; text-transform: uppercase;">Diterbitkan Pada:</div>
            <div style="font-size: 10px; font-weight: 900; color: #0f172a; margin-bottom: 4px;">{{ $tanggal_cetak }}</div>
            <div style="font-size: 7.5px; color: #64748b;">Dokumen Resmi SIRA 2.0</div>
        </div>
    </div>

    <table class="tabel-data">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 14%;">Kode RO</th>
                <th style="width: 32%;" class="text-left">Nama Rincian Output & Rincian Transaksi Keuangan</th>
                <th style="width: 11%;">Target Vol</th>
                <th style="width: 12%;">Pagu (Rp)</th>
                <th style="width: 13%; background-color: #065f46;">Realisasi Vol</th>
                <th style="width: 14%; background-color: #1e3a8a;">Serapan (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($data_ro as $index => $ro)
            @php
                $totVol = $ro->realisasiOutputs->sum('realisasi_volume');
                // Serapan Anggaran ditarik LIVE dari Ledger Transaksi (Realisasi Detail)
                $totAng = $ro->realisasiDetails->sum('nominal');
            @endphp
            <tr style="page-break-inside: avoid;">
                <td class="font-black" style="background-color: #f8fafc; vertical-align: top;">{{ $index + 1 }}</td>
                <td class="font-black" style="font-size: 8px; vertical-align: top;">{{ $ro->kode_ro }}</td>
                <td class="text-left" style="vertical-align: top;">
                    <div class="font-black" style="color: #0f172a; font-size: 9px; margin-bottom: 4px;">{{ $ro->nama_ro }}</div>
                    
                    <!-- 🔥 DAFTAR RINCIAN TRANSAKSI KEUANGAN YANG MEMBIAYAI RO INI -->
                    @if($ro->realisasiDetails && $ro->realisasiDetails->count() > 0)
                        <table class="sub-table">
                            <tr>
                                <td colspan="3" style="font-weight: bold; color: #475569; background-color: #e2e8f0;">Rincian Transaksi Keuangan (Ledger):</td>
                            </tr>
                            @foreach($ro->realisasiDetails as $det)
                            <tr>
                                <td style="width: 15%; font-weight: bold; color: #3b82f6;">[{{ strtoupper($det->jenis_belanja) }}]</td>
                                <td style="width: 60%;">{{ $det->uraian }}</td>
                                <td style="width: 25%; text-align: right; font-weight: bold;">Rp {{ number_format($det->nominal, 0, ',', '.') }}</td>
                            </tr>
                            @endforeach
                        </table>
                    @else
                        <div style="font-size: 7.5px; color: #94a3b8; font-style: italic;">Belum ada transaksi keuangan yang dikaitkan ke RO ini.</div>
                    @endif
                </td>
                <td class="font-bold" style="vertical-align: top;">{{ number_format($ro->target_volume, 2, ',', '.') }} <br><span style="font-size: 6.5px; color: #64748b;">{{ $ro->satuan }}</span></td>
                <td class="text-right font-bold" style="vertical-align: top;">{{ number_format($ro->pagu_anggaran, 0, ',', '.') }}</td>
                <td class="font-black" style="color: #065f46; font-size: 9px; background-color: #ecfdf5; vertical-align: top;">{{ number_format($totVol, 2, ',', '.') }}</td>
                <td class="text-right font-black" style="color: #1e3a8a; background-color: #eff6ff; vertical-align: top;">{{ number_format($totAng, 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="padding: 15px; font-style: italic; color: #64748b; font-weight: bold;">
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