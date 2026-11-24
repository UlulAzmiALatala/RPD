@php
    $pdfSetting = \App\Models\PdfSetting::current();
    $logoBase64 = $pdfSetting->getLogoBase64();
@endphp
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
        
        .sub-table { width: 100%; border-collapse: collapse; margin-top: 4px; margin-bottom: 4px; background-color: #f8fafc; }
        .sub-table td { border: 1px dotted #94a3b8; padding: 3px 4px; font-size: 7.5px; text-align: left; }
        
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }
        
        .ttd-container { width: 100%; margin-top: 20px; page-break-inside: avoid; }
        .ttd-box { width: 38%; float: right; text-align: center; font-size: 9px; color: #0f172a; }
        .ttd-box p { margin: 0 0 3px 0; }
        .ttd-nama { font-weight: 900; text-decoration: underline; margin-top: 45px; font-size: 10.5px; }
        .clear { clear: both; }
        
        .footer-note { margin-top: 15px; font-size: 7.5px; color: #94a3b8; text-align: left; font-style: italic; border-top: 1px dashed #cbd5e1; padding-top: 4px; }
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

    <div class="info-panel">
        <div class="info-left">
            <div class="info-title">LAPORAN CAPAIAN KINERJA FISIK &amp; KEUANGAN</div>
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
                <th style="width: 32%;" class="text-left">Nama Rincian Output &amp; Rincian Transaksi Keuangan</th>
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
                $totAng = $ro->realisasiDetails->sum('nominal');
            @endphp
            <tr style="page-break-inside: avoid;">
                <td class="font-black" style="background-color: #f8fafc; vertical-align: top;">{{ $index + 1 }}</td>
                <td class="font-black" style="font-size: 8px; vertical-align: top;">{{ $ro->kode_ro }}</td>
                <td class="text-left" style="vertical-align: top;">
                    <div class="font-black" style="color: #0f172a; font-size: 9px; margin-bottom: 4px;">{{ $ro->nama_ro }}</div>
                    
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