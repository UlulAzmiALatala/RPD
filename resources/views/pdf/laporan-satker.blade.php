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
        
        /* Pewarnaan Header Tabel */
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
        
        /* 🔥 TABEL EVALUASI TW 🔥 */
        .tabel-evaluasi { width: 100%; border-collapse: collapse; margin-bottom: 5px; font-size: 8px; }
        .tabel-evaluasi th, .tabel-evaluasi td { border: 1px solid #000; padding: 4px; text-align: center; vertical-align: middle; }
        .tabel-evaluasi th { background-color: #0f172a; color: #ffffff; font-weight: bold; text-transform: uppercase; }
        .tabel-evaluasi .tw-header { background-color: #cbd5e1; color: #0f172a; font-weight: bold; }
        
        .badge-lulus { background-color: #d1fae5; color: #065f46; font-weight: bold; padding: 2px 4px; border-radius: 3px; display: inline-block;}
        .badge-gagal { background-color: #ffe4e6; color: #be123c; font-weight: bold; padding: 2px 4px; border-radius: 3px; display: inline-block;}
        .badge-na { background-color: #f1f5f9; color: #64748b; font-weight: bold; padding: 2px 4px; border-radius: 3px; display: inline-block;}

        /* BOX PERHITUNGAN POIN */
        .box-poin { width: 100%; border: 1px solid #0f172a; background-color: #f8fafc; padding: 5px; margin-bottom: 20px; font-size: 8px; }
        .box-poin table { width: 100%; border-collapse: collapse; }
        .box-poin th, .box-poin td { padding: 3px 5px; text-align: left; border: none; }
        .box-poin .poin-title { font-weight: bold; color: #1e3a8a; }
        .box-poin .poin-result { font-weight: bold; color: #065f46; text-align: right; font-size: 9px; }
        .box-poin .poin-total { border-top: 1px dashed #94a3b8; font-weight: bold; font-size: 10px; color: #0f172a; }

        .ttd-container { width: 100%; margin-top: 15px; page-break-inside: avoid; }
        .ttd-box { width: 30%; float: right; text-align: center; font-size: 9px; }
        .ttd-box p { margin: 0 0 3px 0; }
        .ttd-nama { font-weight: bold; text-decoration: underline; margin-top: 40px; }
        .clear { clear: both; }
        
        .section-title { font-size: 10px; font-weight: bold; color: #0f172a; margin-bottom: 5px; border-bottom: 1px solid #000; padding-bottom: 2px; text-transform: uppercase;}
    </style>
</head>
<body>
    <!-- KOP SURAT RESMI -->
    <div class="kop-surat">
        <h2>KEMENTERIAN HUKUM REPUBLIK INDONESIA</h2>
        <h1>KANTOR WILAYAH SULAWESI TENGAH</h1>
        <p>Jalan Dewi Sartika No. 74, Palu Selatan, Kota Palu, Sulawesi Tengah 94114</p>
        <p>Telepon: (0451) 482613 | Laman: silakum.kemenkumsulteng.cloud/</p>
    </div>

    <!-- JUDUL -->
    <div class="judul-laporan">
        <h3>DETAIL INDIKATOR HALAMAN III DIPA DAN PENYERAPAN ANGGARAN</h3>
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

    <!-- TABEL UTAMA (DISESUAIKAN DENGAN KEMENKEU & REACT) -->
    <table class="tabel-data">
        <thead>
            <tr>
                <th rowspan="2" class="bg-navy" style="width: 3%;">Bulan</th>
                
                <!-- Kolom Rencana -->
                <th colspan="3" class="bg-blue">Rencana Penarikan</th>
                
                <!-- Kolom Penyerapan & % Deviasi Bergandengan -->
                <th colspan="6" class="bg-green">Penyerapan & % Deviasi</th>
                
                <!-- Kolom Deviasi Nominal -->
                <th colspan="3" class="bg-red">Deviasi Nominal (Rp)</th>
                
                <!-- Kolom Proporsi Pagu -->
                <th rowspan="2" class="bg-brown" style="width: 4%;">% Proporsi<br>Pagu</th>

                <!-- Kolom Deviasi Tertimbang -->
                <th rowspan="2" class="bg-indigo" style="width: 4%;">% Deviasi<br>Tertimbang</th>
                
                <!-- Kolom Hasil Akhir -->
                <th rowspan="2" class="bg-indigo" style="width: 4%;">% Rata-rata<br>Kumulatif</th>
                <th rowspan="2" class="bg-purple" style="width: 4%;">NILAI<br>IKPA</th>
            </tr>
            <tr class="bg-gray-dark">
                <!-- Rencana -->
                <th>51</th>
                <th>52</th>
                <th>53</th>
                
                <!-- Penyerapan & % Dev Bergandengan -->
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
                
                <!-- Realisasi 51 & % Dev 51 -->
                <td class="text-right">{{ number_format($row['realisasi_51'], 0, ',', '.') }}</td>
                <td>{{ is_numeric($row['persen_deviasi_51']) ? number_format($row['persen_deviasi_51'], 2, ',', '.') : '-' }}</td>
                
                <!-- Realisasi 52 & % Dev 52 -->
                <td class="text-right">{{ number_format($row['realisasi_52'], 0, ',', '.') }}</td>
                <td>{{ is_numeric($row['persen_deviasi_52']) ? number_format($row['persen_deviasi_52'], 2, ',', '.') : '-' }}</td>
                
                <!-- Realisasi 53 & % Dev 53 -->
                <td class="text-right">{{ number_format($row['realisasi_53'], 0, ',', '.') }}</td>
                <td>{{ is_numeric($row['persen_deviasi_53']) ? number_format($row['persen_deviasi_53'], 2, ',', '.') : '-' }}</td>
                
                <!-- Deviasi Nominal -->
                <td class="text-right">{{ number_format($row['deviasi_51'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($row['deviasi_52'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($row['deviasi_53'], 0, ',', '.') }}</td>
                
                <!-- Proporsi Pagu -->
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

    <!-- 🔥 TABEL EVALUASI TARGET KEMENKEU & POIN (BARU) 🔥 -->
    @if(isset($evaluasi_tw))
    <div style="page-break-inside: avoid;">
        <div class="section-title">EVALUASI TARGET PENYERAPAN DAN POIN SIRA (BERDASARKAN TRIWULAN)</div>
        <table class="tabel-evaluasi">
            <thead>
                <tr>
                    <th style="width: 8%;">Triwulan</th>
                    <th style="width: 20%;">Jenis Belanja</th>
                    <th style="width: 15%;">Realisasi Kumulatif (Rp)</th>
                    <th style="width: 12%;">Target (%)</th>
                    <th style="width: 12%;">Aktual (%)</th>
                    <th style="width: 12%;">Status</th>
                    <th style="width: 21%;">Kalkulasi Poin SIRA</th>
                </tr>
            </thead>
            <tbody>
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
                    
                    @foreach($belanjas as $kode => $nama)
                    <tr>
                        @if($kode == '51')
                            <td rowspan="3" class="tw-header">TW {{ $tw }}</td>
                        @endif
                        <td class="text-left font-bold">{{ $nama }}</td>
                        
                        @if($eval[$kode]['status'] === 'N/A')
                            <td colspan="4" style="background-color: #f8fafc;"><span class="badge-na">TIDAK ADA PAGU</span></td>
                        @else
                            <td class="text-right">Rp {{ number_format($eval[$kode]['nominal'], 0, ',', '.') }}</td>
                            <td>{{ $eval[$kode]['target_persen'] }}%</td>
                            <td class="font-bold">{{ number_format($eval[$kode]['realisasi_persen'], 2, ',', '.') }}%</td>
                            <td>
                                <span class="{{ $eval[$kode]['status'] == 'Tercapai' ? 'badge-lulus' : 'badge-gagal' }}">
                                    {{ strtoupper($eval[$kode]['status']) }}
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
                                            <td style="padding-left: 10px; font-style: italic;">Dikali Bobot 20%</td>
                                            <td class="poin-result">{{ number_format($poin['tertimbang_penyerapan'], 2, ',', '.') }} pts</td>
                                        </tr>
                                        <tr>
                                            <td class="poin-title">2. Hal. III DIPA (Maks 100)</td>
                                            <td class="text-right">{{ number_format($poin['ikpa_hal_iii'], 2, ',', '.') }}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding-left: 10px; font-style: italic; padding-bottom: 5px;">Dikali Bobot 10%</td>
                                            <td class="poin-result" style="padding-bottom: 5px;">{{ number_format($poin['tertimbang_hal_iii'], 2, ',', '.') }} pts</td>
                                        </tr>
                                        <tr>
                                            <td class="poin-total" style="padding-top: 5px;">TOTAL POIN SIRA TW {{ $tw }}</td>
                                            <td class="poin-total text-right" style="padding-top: 5px; color: #b45309;">{{ number_format($poin['total_poin'], 2, ',', '.') }} / 30</td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        @endif
                    </tr>
                    @endforeach
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- KOLOM TANDA TANGAN -->
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