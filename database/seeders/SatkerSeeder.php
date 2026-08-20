<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Satker;

class SatkerSeeder extends Seeder
{
    public function run(): void
    {
        $satkers = [
            ['kode_eselon' => '01', 'kode_satker' => '692028', 'nama_satker' => 'DIPA SETJEN'],
            ['kode_eselon' => '03', 'kode_satker' => '693048', 'nama_satker' => 'DIPA DITJEN PP'],
            ['kode_eselon' => '04', 'kode_satker' => '692068', 'nama_satker' => 'DIPA DITJEN AHU'],
            ['kode_eselon' => '05', 'kode_satker' => '693015', 'nama_satker' => 'DIPA DITJEN KI'],
            ['kode_eselon' => '11', 'kode_satker' => '693116', 'nama_satker' => 'DIPA BPHN'],
            ['kode_eselon' => '12', 'kode_satker' => '693150', 'nama_satker' => 'DIPA BSK Hukum'],
        ];

        foreach ($satkers as $satker) {
            // Menggunakan updateOrCreate agar aman jika dijalankan berulang kali
            Satker::updateOrCreate(
                ['kode_satker' => $satker['kode_satker']], // Acuan pengecekan
                $satker
            );
        }
    }
}
