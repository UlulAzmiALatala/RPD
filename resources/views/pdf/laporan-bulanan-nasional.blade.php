<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Bulanan IKPA Nasional</title>
    <style>
        /* Menggunakan ukuran kertas Legal Landscape agar kolom tabel tidak terlalu sempit */
        @page { size: legal landscape; margin: 8mm; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 8px; line-height: 1.2; color: #000; }
        
        .kop-surat { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
        .kop-surat h1 { margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .kop-surat h2 { margin: 0; font-size: 10px; font-weight: bold; }
        .kop-surat p { margin: 2px 0 0 0; font-size: 8px; }
        
        .judul-laporan { text-align: center; margin-bottom: 10px; }
        .judul-laporan h3 { margin: 0; font-size: 10px; text-decoration: underline; font-weight: bold; text-transform: uppercase; }
        
        .header-info { margin-bottom: 8px; font-size: 8px; font-weight: bold; }
        
        .tabel-data { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .tabel-data th, .tabel-data td { border: 1px solid #000; padding: 4px; text-align: center; vertical-align: middle; }
        
        .bg-navy { background-color: #0f172a; color: #fff; }
        .bg-blue { background-color: #1e3a8a; color: #fff; }
        .bg-gray-dark { background-color: #1f2937; color: #fff; }
        .bg-gray-light { background-color: #f3f4f6; color: #000; }
        .bg-gold { background-color: #f59e0b; color: #fff; }
        .highlight-poin { background-color: #fef3c7; color: #b45309; font-size: 10px; font-weight: bold; }
        
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }

        /* Badge Kelulusan Kemenkeu */
        .badge-lulus { background-color: #d1fae5; color: #065f46; font-weight: bold; padding: 2px 4px; border-radius: 3px; display: inline-block;}
        .badge-gagal { background-color: #ffe4e6; color: #be123c; font-weight: bold; padding: 2px 4px; border-radius: 3px; display: inline-block;}
        .badge-na { background-color: #f1f5f9; color: #64748b; font-weight: bold; padding: 2px 4px; border-radius: 3px; display: inline-block;}
        
        .ttd-container { width: 100%; margin-top: 20px; page-break-inside: avoid; }
        .ttd-box { width: 30%; float: right; text-align: center; font-size: 9px; }
        .ttd-box p { margin: 0 0 3px 0; }
        .ttd-nama { font-weight: bold; text-decoration: underline; margin-top: 45px; }
        .clear { clear: both; }
    </style>
</head>
<body>
    <div class="kop-surat">
        <h2>KEMENTERIAN HUKUM REPUBLIK INDONESIA</h2>
        <h1>KANTOR WILAYAH SULAWESI TENGAH</h1>
        <p>Jalan Dewi Sartika No. 74, Kota Palu, Sulawesi Tengah 94114 | Laman: silakum.kemenkumsulteng.cloud/</p>
    </div>

    <div class="judul-laporan">
        <h3>REKAPITULASI KINERJA PELAKSANAAN ANGGARAN (IKPA) LINTAS SATKER</h3>
    </div>

    <div class="header-info">
        Periode Pelaporan s.d. Bulan: {{ $bulan_teks }} {{ $tahun }} (Triwulan {{ $tw_aktif }})
    </div>

    <table class="tabel-data">
        <thead>
            <tr class="bg-navy">
                <th rowspan="2" style="width: 2%;">Peringkat</th>
                <th rowspan="2" style="width: 14%;">Satuan Kerja</th>
                <th rowspan="2" style="width: 7%;">Pagu Efektif (Rp)</th>
                <th rowspan="2" style="width: 7%;">Total RPD (Rp)</th>
                <th rowspan="2" style="width: 7%;">Total Realisasi (Rp)</th>
                <th rowspan="2" style="width: 7%;">Deviasi Nominal (Rp)</th>
                <th rowspan="2" style="width: 6%;">% Serap</th>
                <th rowspan="2" style="width: 7%;">Deviasi Tertimbang</th>
                <th colspan="3" class="bg-blue">Status Target Kemenkeu (TW {{ $tw_aktif }})</th>
                <th rowspan="2" style="width: 6%;">Nilai IKPA<br><span style="font-size: 6px; font-weight: normal;">(Hal. III DIPA)</span></th>
                <th rowspan="2" class="bg-gold" style="width: 7%;">TOTAL POIN SIRA<br><span style="font-size: 6px; font-weight: normal;">(Maksimal 30)</span></th>
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
                // Logika format badge
                $stat51 = isset($row['evaluasi_tw']['51']['status']) ? $row['evaluasi_tw']['51']['status'] : 'N/A';
                $stat52 = isset($row['evaluasi_tw']['52']['status']) ? $row['evaluasi_tw']['52']['status'] : 'N/A';
                $stat53 = isset($row['evaluasi_tw']['53']['status']) ? $row['evaluasi_tw']['53']['status'] : 'N/A';

                $getBadgeClass = function($status) {
                    if ($status === 'N/A') return 'badge-na';
                    if ($status === 'Lulus' || $status === 'Tercapai') return 'badge-lulus';
                    return 'badge-gagal';
                };
                
                $getBadgeText = function($status) {
                    return $status === 'N/A' ? 'N/A' : strtoupper($status);
                };
            @endphp
            <tr>
                <td class="font-bold bg-gray-light">#{{ $index + 1 }}</td>
                <td class="text-left font-bold">{{ $row['satker']->nama_satker }} <br><span style="font-weight: normal; font-size: 7px;">({{ $row['satker']->kode_satker }})</span></td>
                <td class="text-right">{{ number_format($row['pagu_efektif'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($row['total_rpd'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($row['total_realisasi'], 0, ',', '.') }}</td>
                <td class="text-right" style="color: #9f1239;">{{ number_format($row['total_deviasi'], 0, ',', '.') }}</td>
                <td class="font-bold">{{ number_format($row['persentase_penyerapan'], 2, ',', '.') }}%</td>
                <td class="font-bold">{{ is_numeric($row['deviasi_tertimbang_kumulatif']) ? number_format($row['deviasi_tertimbang_kumulatif'], 2, ',', '.') : '-' }}</td>
                
                <!-- Status Evaluasi Kemenkeu -->
                <td><span class="{{ $getBadgeClass($stat51) }}">{{ $getBadgeText($stat51) }}</span></td>
                <td><span class="{{ $getBadgeClass($stat52) }}">{{ $getBadgeText($stat52) }}</span></td>
                <td><span class="{{ $getBadgeClass($stat53) }}">{{ $getBadgeText($stat53) }}</span></td>

                <!-- Nilai IKPA -->
                <td class="font-bold bg-gray-light" style="font-size: 9px; color: {{ is_numeric($row['nilai_ikpa']) && $row['nilai_ikpa'] >= 90 ? '#065f46' : '#9f1239' }};">
                    {{ is_numeric($row['nilai_ikpa']) ? number_format($row['nilai_ikpa'], 2, ',', '.') : '-' }}
                </td>

                <!-- TOTAL POIN SIRA -->
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
            <p>Kepala Kantor Wilayah,</p>
            
            <br><br><br><br>

            <p class="ttd-nama">Rakhmat Renaldy, S.H., M.H.</p>
            <p>NIP. 197310101996031001</p>
        </div>
        <div class="clear"></div>
    </div>
</body>
</html>