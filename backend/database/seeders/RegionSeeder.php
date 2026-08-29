<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Region;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regions = [
            [
                'name' => 'Pekalongan',
                'slug' => 'pekalongan',
                'description' => 'Batik Pekalongan terkenal dengan warna-warna cerah dan motif pesisir.',
                'cover_image' => 'pekalongan.jpg',
            ],
            [
                'name' => 'Lasem',
                'slug' => 'lasem',
                'description' => 'Batik Lasem memiliki ciri khas warna merah darah ayam.',
                'cover_image' => 'lasem.jpg',
            ],
            [
                'name' => 'Bakaran',
                'slug' => 'bakaran',
                'description' => 'Batik khas Kabupaten Pati dengan nuansa klasik.',
                'cover_image' => 'bakaran.jpg',
            ],
            [
                'name' => 'Yogyakarta',
                'slug' => 'yogyakarta',
                'description' => 'Batik klasik dengan filosofi budaya Keraton Yogyakarta.',
                'cover_image' => 'yogyakarta.jpg',
            ],
            [
                'name' => 'Solo',
                'slug' => 'solo',
                'description' => 'Batik Solo terkenal dengan warna sogan dan motif tradisional.',
                'cover_image' => 'solo.jpg',
            ],
            [
                'name' => 'Cirebon',
                'slug' => 'cirebon',
                'description' => 'Batik Cirebon identik dengan motif Mega Mendung.',
                'cover_image' => 'cirebon.jpg',
            ],
            [
                'name' => 'Madura',
                'slug' => 'madura',
                'description' => 'Batik Madura memiliki warna berani dan kontras.',
                'cover_image' => 'madura.jpg',
            ],
            [
                'name' => 'Garut',
                'slug' => 'garut',
                'description' => 'Batik Garut memiliki motif alam dengan warna lembut.',
                'cover_image' => 'garut.jpg',
            ],
            [
                'name' => 'Banyumas',
                'slug' => 'banyumas',
                'description' => 'Batik Banyumas berciri warna gelap dengan motif sederhana.',
                'cover_image' => 'banyumas.jpg',
            ],
            [
                'name' => 'Tuban',
                'slug' => 'tuban',
                'description' => 'Batik Tuban memiliki corak tradisional khas Jawa Timur.',
                'cover_image' => 'tuban.jpg',
            ],
        ];

        foreach ($regions as $region) {
            Region::create($region);
        }
    }
}