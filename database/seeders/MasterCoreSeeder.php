<?php

namespace Database\Seeders;

use App\Models\CutOff;
use App\Models\PdfSetting;
use App\Models\Satker;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class MasterCoreSeeder extends Seeder
{
    public function run(): void
    {
        $tahun = 2026;
        $hasNip = Schema::hasColumn('users', 'nip');
        $hasNoHp = Schema::hasColumn('users', 'no_hp');

        // =====================================================================
        // 1. MASTER 6 DIPA SATUAN KERJA KANWIL KEMENKUM SULAWESI TENGAH
        // =====================================================================
        $satkers = [
            [
                'kode_eselon' => '01',
                'kode_satker' => '692028',
                'nama_satker' => 'DIPA SETJEN (Sekretariat Jenderal)',
            ],
            [
                'kode_eselon' => '03',
                'kode_satker' => '692029',
                'nama_satker' => 'DIPA AHU (Administrasi Hukum Umum)',
            ],
            [
                'kode_eselon' => '06',
                'kode_satker' => '692030',
                'nama_satker' => 'DIPA KI (Kekayaan Intelektual)',
            ],
            [
                'kode_eselon' => '02',
                'kode_satker' => '692031',
                'nama_satker' => 'DIPA PP (Peraturan Perundang-Undangan)',
            ],
            [
                'kode_eselon' => '10',
                'kode_satker' => '692032',
                'nama_satker' => 'DIPA BPHN (Pembinaan Hukum Nasional)',
            ],
            [
                'kode_eselon' => '11',
                'kode_satker' => '692033',
                'nama_satker' => 'DIPA BSK (Badan Strategi Kebijakan)',
            ],
        ];

        foreach ($satkers as $s) {
            Satker::updateOrCreate(
                ['kode_satker' => $s['kode_satker']],
                $s
            );
        }

        // =====================================================================
        // 2. AKUN PENGGUNA (ADMIN KANWIL & OPERATOR SATKER)
        // Password default seluruh akun demo: password123
        // =====================================================================
        $defaultPassword = Hash::make('password123');

        $users = [
            // Admin Utama (Langsung masuk Dashboard untuk demo)
            [
                'name' => 'Super Admin Kanwil Sulteng',
                'email' => 'admin@kemenkum.go.id',
                'role' => 'admin',
                'kode_satker' => null,
                'nip' => '198804152012121001',
                'no_hp' => '081145001001',
                'is_active' => true,
                'must_change_password' => false,
            ],
            [
                'name' => 'Verifikator Keuangan Kanwil',
                'email' => 'verifikator@kemenkum.go.id',
                'role' => 'admin',
                'kode_satker' => null,
                'nip' => '199108202015032002',
                'no_hp' => '081145001002',
                'is_active' => true,
                'must_change_password' => false,
            ],

            // Operator 6 Satker Aktif
            [
                'name' => 'Operator DIPA SETJEN',
                'email' => 'setjen@kemenkum.go.id',
                'role' => 'satker',
                'kode_satker' => '692028',
                'nip' => '199302102017121001',
                'no_hp' => '081245002028',
                'is_active' => true,
                'must_change_password' => false,
            ],
            [
                'name' => 'Operator DIPA AHU',
                'email' => 'ahu@kemenkum.go.id',
                'role' => 'satker',
                'kode_satker' => '692029',
                'nip' => '199405182018012003',
                'no_hp' => '081245002029',
                'is_active' => true,
                'must_change_password' => false,
            ],
            [
                'name' => 'Operator DIPA KI',
                'email' => 'ki@kemenkum.go.id',
                'role' => 'satker',
                'kode_satker' => '692030',
                'nip' => '199509222019021004',
                'no_hp' => '081245002030',
                'is_active' => true,
                'must_change_password' => false,
            ],
            [
                'name' => 'Operator DIPA PP',
                'email' => 'pp@kemenkum.go.id',
                'role' => 'satker',
                'kode_satker' => '692031',
                'nip' => '199211042018011005',
                'no_hp' => '081245002031',
                'is_active' => true,
                'must_change_password' => false,
            ],
            [
                'name' => 'Operator DIPA BPHN',
                'email' => 'bphn@kemenkum.go.id',
                'role' => 'satker',
                'kode_satker' => '692032',
                'nip' => '199603142020122006',
                'no_hp' => '081245002032',
                'is_active' => true,
                'must_change_password' => false,
            ],
            [
                'name' => 'Operator DIPA BSK',
                'email' => 'bsk@kemenkum.go.id',
                'role' => 'satker',
                'kode_satker' => '692033',
                'nip' => '199707092022031007',
                'no_hp' => '081245002033',
                'is_active' => true,
                'must_change_password' => false,
            ],

            // Akun Demo Keamanan: Wajib Ganti Password saat login pertama
            [
                'name' => 'Operator Baru SETJEN (Demo Wajib Ganti PW)',
                'email' => 'baru@kemenkum.go.id',
                'role' => 'satker',
                'kode_satker' => '692028',
                'nip' => '199901122025011008',
                'no_hp' => '081245009901',
                'is_active' => true,
                'must_change_password' => true,
            ],

            // Akun Demo Keamanan: Suspended (Nonaktif)
            [
                'name' => 'Eks Operator Mutasi (Demo Suspended)',
                'email' => 'nonaktif@kemenkum.go.id',
                'role' => 'satker',
                'kode_satker' => '692032',
                'nip' => '198612012010121009',
                'no_hp' => '081245009902',
                'is_active' => false,
                'must_change_password' => false,
            ],
        ];

        $adminId = null;
        foreach ($users as $u) {
            $payload = [
                'name' => $u['name'],
                'password' => $defaultPassword,
                'role' => $u['role'],
                'kode_satker' => $u['kode_satker'],
                'is_active' => $u['is_active'],
                'must_change_password' => $u['must_change_password'],
                'email_verified_at' => now(),
            ];

            if ($hasNip) {
                $payload['nip'] = $u['nip'];
            }
            if ($hasNoHp) {
                $payload['no_hp'] = $u['no_hp'];
            }

            $user = User::updateOrCreate(
                ['email' => $u['email']],
                $payload
            );

            if ($u['email'] === 'admin@kemenkum.go.id') {
                $adminId = $user->id;
            }
        }

        // =====================================================================
        // 3. PENGATURAN KOP & PEJABAT PENANDA TANGAN PDF DINAMIS
        // =====================================================================
        if (Schema::hasTable('pdf_settings')) {
            PdfSetting::updateOrCreate(
                ['id' => 1],
                [
                    'logo_path' => null,
                    'instansi_baris_1' => 'KEMENTERIAN HUKUM REPUBLIK INDONESIA',
                    'instansi_baris_2' => 'KANTOR WILAYAH SULAWESI TENGAH',
                    'alamat_kop' => 'Jalan Dewi Sartika No. 74, Palu Selatan, Kota Palu, Sulawesi Tengah 94114 | Laman: silakum.kemenkumsulteng.cloud',
                    'kota_ttd' => 'Palu',
                    'jabatan_ttd' => 'Kepala Kantor Wilayah,',
                    'nama_pejabat' => 'Hendrik Pagiling, S.H., M.H.',
                    'nip_pejabat' => '197310101996031001',
                    'catatan_kaki' => 'Dokumen dicetak secara otomatis dari Sistem Informasi Realisasi Anggaran (SIRA) 2.0 (Skala 65 Poin). Tidak memerlukan cap basah.',
                    'updated_by' => $adminId,
                ]
            );
        }

        // =====================================================================
        // 4. JADWAL CUT-OFF (TUTUP BUKU) TAHUN ANGGARAN 2026
        // Bulan 1-10 Terkunci (Sudah Tutup Buku), Bulan 11-12 Terbuka
        // =====================================================================
        for ($bulan = 1; $bulan <= 12; $bulan++) {
            CutOff::updateOrCreate(
                ['tahun' => $tahun, 'bulan' => $bulan],
                ['is_closed' => $bulan <= 10]
            );
        }
    }
}
