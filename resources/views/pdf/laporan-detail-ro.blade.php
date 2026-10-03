<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Detail Capaian Rincian Output (RO)</title>
    <style>
        @page { size: portrait; margin: 10mm; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 9px; line-height: 1.3; color: #000; }
        
        .kop-surat { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
        .kop-surat h1 { margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .kop-surat h2 { margin: 0; font-size: 10px; font-weight: bold; }
        .kop-surat p { margin: 2px 0 0 0; font-size: 8px; }
        
        .judul-laporan { text-align: center; margin-bottom: 12px; }
        .judul-laporan h3 { margin: 0; font-size: 11px; text-decoration: underline; font-weight: bold; text-transform: uppercase; }
        
        .header-info { margin-bottom: 10px; font-size: 9px; }
        
        .tabel-data { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .tabel-data th, .tabel-data td { border: 1px solid #000; padding: 5px; text-align: center; vertical-align: middle; }
        .tabel-data th { background-color: #0f172a; color: #fff; font-weight: bold; text-transform: uppercase; font-size: 8px; }
        
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        
        .ttd-container { width: 100%; margin-top: 25px; page-break-inside: avoid; }
        .ttd-box { width: 35%; float: right; text-align: center; font-size: 9px; }
        .ttd-box p { margin: 0 0 3px 0; }
        .ttd-nama { font-weight: bold; text-decoration: underline; margin-top: 50px; }
        .clear { clear: both; }
    </style>
</head>
<body>
    <div class="kop-surat">
        <h2>KEMENTERIAN HUKUM REPUBLIK INDONESIA</h2>
        <h1>KANTOR WILAYAH SULAWESI TENGAH</h1>
        <p>Jalan Dewi Sartika No. 74, Kota Palu, Sulawesi Tengah 94114</p>
    </div>

    <div class="judul-laporan">
        <h3>LAPORAN DETAIL CAPAIAN KINERJA FISIK (RINCIAN OUTPUT)</h3>
    </div>

    <div class="header-info">
        <strong>Satuan Kerja :</strong> {{ $satker->nama_satker }} ({{ $satker->kode_satker }})<br>
        <strong>Tahun Anggaran:</strong> {{ $tahun }}
    </div>

    <table class="tabel-data">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 14%;">Kode RO</th>
                <th style="width: 32%;" class="text-left">Nama Rincian Output</th>
                <th style="width: 12%;">Target Volume</th>
                <th style="width: 13%;">Pagu Anggaran (Rp)</th>
                <th style="width: 12%;">Realisasi Volume</th>
                <th style="width: 13%;">Serapan Anggaran (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($data_ro as $index => $ro)
            @php
                $totVol = $ro->realisasiOutputs->sum('realisasi_volume');
                $totAng = $ro->realisasiOutputs->sum('realisasi_anggaran');
            @endphp
            <tr>
                <td class="font-bold">{{ $index + 1 }}</td>
                <td class="font-bold">{{ $ro->kode_ro }}</td>
                <td class="text-left font-bold">{{ $ro->nama_ro }}</td>
                <td>{{ number_format($ro->target_volume, 2, ',', '.') }} {{ $ro->satuan }}</td>
                <td class="text-right">{{ number_format($ro->pagu_anggaran, 0, ',', '.') }}</td>
                <td class="font-bold" style="color: #065f46;">{{ number_format($totVol, 2, ',', '.') }}</td>
                <td class="text-right font-bold" style="color: #1e3a8a;">{{ number_format($totAng, 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="padding: 15px; font-style: italic;">Belum ada Rincian Output (RO) yang di-setup untuk tahun anggaran ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

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
</body>
</html>