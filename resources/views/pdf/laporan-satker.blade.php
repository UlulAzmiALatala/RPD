<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Rincian Realisasi dan IKPA</title>
    <style>
        /* Kita pakai ukuran A4 Landscape yang dimaksimalkan marginnya */
        @page { size: landscape; margin: 8mm; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 8px; line-height: 1.2; color: #000; }
        
        .kop-surat { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
        .kop-surat h1 { margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .kop-surat h2 { margin: 0; font-size: 10px; font-weight: bold; }
        .kop-surat p { margin: 2px 0 0 0; font-size: 8px; }
        
        .judul-laporan { text-align: center; margin-bottom: 10px; }
        .judul-laporan h3 { margin: 0; font-size: 10px; text-decoration: underline; font-weight: bold; }
        
        .header-info { display: table; width: 100%; margin-bottom: 8px; font-size: 8px; }
        .header-left { display: table-cell; width: 60%; }
        .header-right { display: table-cell; width: 40%; text-align: right; }
        
        /* 🔥 STYLE TABEL ALA KEMENKEU (SANGAT DETAIL) 🔥 */
        .tabel-data { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .tabel-data th, .tabel-data td { border: 1px solid #000; padding: 3px; text-align: center; vertical-align: middle; }
        
        /* Pewarnaan Header Tabel (Sesuai Screenshot) */
        .bg-navy { background-color: #0f172a; color: #fff; }
        .bg-blue { background-color: #1e3a8a; color: #fff; }
        .bg-green { background-color: #065f46; color: #fff; }
        .bg-red { background-color: #9f1239; color: #fff; }
        .bg-brown { background-color: #451a03; color: #fff; }
        .bg-indigo { background-color: #312e81; color: #fff; }
        .bg-purple { background-color: #4c1d95; color: #fff; }
        .bg-gray-dark { background-color: #1f2937; color: #d1d5db; }
        .bg-gray-light { background-color: #f3f4f6; color: #000; }
        .text-amber { color: #fbbf24; }
        
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        
        .ttd-container { width: 100%; margin-top: 15px; page-break-inside: avoid; }
        .ttd-box { width: 30%; float: right; text-align: center; font-size: 9px; }
        .ttd-box p { margin: 0 0 3px 0; }
        .ttd-nama { font-weight: bold; text-decoration: underline; margin-top: 40px; }
        .clear { clear: both; }
    </style>
</head>
<body>
    <!-- KOP SURAT RESMI -->
    <div class="kop-surat">
        <h2>KEMENTERIAN HUKUM REPUBLIK INDONESIA</h2>
        <h1>KANTOR WILAYAH SULAWESI TENGAH</h1>
        <p>Jalan Dewi Sartika No. 74, Palu Selatan, Kota Palu, Sulawesi Tengah 94114</p>
        <p>Telepon: (0451) 482613 | Laman: sulteng.kemenkumham.go.id</p>
    </div>

    <!-- JUDUL -->
    <div class="judul-laporan">
        <h3>DETAIL INDIKATOR HALAMAN III DIPA</h3>
    </div>

    <!-- INFO SATKER -->
    <div class="header-info">
        <div class="header-left">
            <strong>Satuan Kerja :</strong> {{ $satker->nama_satker }} ({{ $satker->kode_satker }})<br>
            <strong>Tahun Anggaran:</strong> {{ $tahun }} | <strong>Total Pagu:</strong> Rp {{ number_format($pagu_total, 0, ',', '.') }}
        </div>
        <div class="header-right">
            <strong>Tanggal Cetak:</strong> {{ $tanggal_cetak }}
        </div>
    </div>

    <!-- TABEL UTAMA (SANGAT DETAIL SESUAI SCREENSHOT REACT) -->
    <table class="tabel-data">
        <thead>
            <tr>
                <th rowspan="2" class="bg-navy" style="width: 3%;">Bulan</th>
                
                <!-- Kolom Rencana -->
                <th colspan="3" class="bg-blue">Rencana Penarikan</th>
                
                <!-- Kolom Penyerapan & % Deviasi -->
                <th colspan="6" class="bg-green">Penyerapan & % Deviasi</th>
                
                <!-- Kolom Deviasi Nominal -->
                <th colspan="3" class="bg-red">Deviasi Nominal (Rp)</th>
                
                <!-- Kolom Hasil Akhir -->
                <th rowspan="2" class="bg-brown" style="width: 4%;">% Proporsi<br>Pagu</th>
                <th rowspan="2" class="bg-indigo" style="width: 4%;">% Deviasi<br>Tertimbang</th>
                <th rowspan="2" class="bg-indigo" style="width: 4%;">% Rata-rata<br>Kumulatif</th>
                <th rowspan="2" class="bg-purple" style="width: 4%;">NILAI<br>IKPA</th>
            </tr>
            <tr class="bg-gray-dark">
                <!-- Rencana -->
                <th>51</th>
                <th>52</th>
                <th>53</th>
                
                <!-- Penyerapan & % Dev -->
                <th>51</th>
                <th class="text-amber">% Dev</th>
                <th>52</th>
                <th class="text-amber">% Dev</th>
                <th>53</th>
                <th class="text-amber">% Dev</th>
                
                <!-- Deviasi Nominal -->
                <th>51</th>
                <th>52</th>
                <th>53</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($laporan as $row)
            <tr>
                <td class="font-bold bg-gray-light">{{ strtoupper(substr($row['nama_bulan'], 0, 3)) }}</td>
                
                <!-- Rencana -->
                <td class="text-right">{{ number_format($row['rpd_51'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($row['rpd_52'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($row['rpd_53'], 0, ',', '.') }}</td>
                
                <!-- Realisasi & Persen Deviasi Komponen -->
                <td class="text-right">{{ number_format($row['realisasi_51'], 0, ',', '.') }}</td>
                <td>{{ is_numeric($row['persen_deviasi_51']) ? number_format($row['persen_deviasi_51'], 2, ',', '.') : '-' }}</td>
                
                <td class="text-right">{{ number_format($row['realisasi_52'], 0, ',', '.') }}</td>
                <td>{{ is_numeric($row['persen_deviasi_52']) ? number_format($row['persen_deviasi_52'], 2, ',', '.') : '-' }}</td>
                
                <td class="text-right">{{ number_format($row['realisasi_53'], 0, ',', '.') }}</td>
                <td>{{ is_numeric($row['persen_deviasi_53']) ? number_format($row['persen_deviasi_53'], 2, ',', '.') : '-' }}</td>
                
                <!-- Deviasi Nominal -->
                <td class="text-right">{{ number_format($row['deviasi_51'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($row['deviasi_52'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($row['deviasi_53'], 0, ',', '.') }}</td>
                
                <!-- Proporsi Pagu -->
                <!-- Menghitung proporsi total RPD bulan ini terhadap total pagu -->
                @php
                    $totalRpdBulanIni = $row['rpd_51'] + $row['rpd_52'] + $row['rpd_53'];
                    $proporsiBulanIni = ($pagu_total > 0 && $totalRpdBulanIni > 0) ? ($totalRpdBulanIni / $pagu_total) * 100 : 0;
                @endphp
                <td class="font-bold">{{ $proporsiBulanIni > 0 ? number_format($proporsiBulanIni, 2, ',', '.') : '-' }}</td>
                
                <!-- Deviasi Tertimbang (Persen Seluruh) -->
                <td class="font-bold">{{ is_numeric($row['persen_seluruh']) ? number_format($row['persen_seluruh'], 2, ',', '.') : '-' }}</td>
                
                <!-- Rata-rata Kumulatif -->
                <td class="font-bold">{{ is_numeric($row['rata_kumulatif']) ? number_format($row['rata_kumulatif'], 2, ',', '.') : '-' }}</td>
                
                <!-- Nilai IKPA -->
                <td class="font-bold bg-gray-light">{{ is_numeric($row['ikpa']) ? number_format($row['ikpa'], 2, ',', '.') : '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- KOLOM TANDA TANGAN -->
    <div class="ttd-container">
        <div class="ttd-box">
            <p>Palu, {{ $tanggal_cetak }}</p>
            <p>Kepala Kantor Wilayah,</p>
            
            <!-- Ruang Kosong untuk TTD -->
            
            <p class="ttd-nama">Rakhmat Renaldy, S.H., M.H.</p>
            <p>NIP. 197310101996031001</p>
        </div>
        <div class="clear"></div>
    </div>
</body>
</html>