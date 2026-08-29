<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Region;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil region berdasarkan slug
        $yogyakarta = Region::where('slug', 'yogyakarta')->first();
        $solo = Region::where('slug', 'solo')->first();
        $cirebon = Region::where('slug', 'cirebon')->first();
        $pekalongan = Region::where('slug', 'pekalongan')->first();

        Product::create([
            'category_id' => 1,
            'region_id' => $yogyakarta->id,
            'name' => 'Batik Parang Tulis Premium',
            'slug' => 'batik-parang-tulis-premium',
            'description' => 'Batik tulis motif parang dengan kualitas premium.',
            'price' => 750000,
            'stock' => 10,
            'image' => 'batik-parang.jpg',
            'material' => 'Katun Primisima',
            'type' => 'Batik Tulis',
            'status' => 'active',
        ]);

        Product::create([
            'category_id' => 2,
            'region_id' => $solo->id,
            'name' => 'Batik Kawung Cap Elegan',
            'slug' => 'batik-kawung-cap-elegan',
            'description' => 'Batik cap motif kawung dengan desain elegan.',
            'price' => 350000,
            'stock' => 20,
            'image' => 'batik-kawung.jpg',
            'material' => 'Katun Premium',
            'type' => 'Batik Cap',
            'status' => 'active',
        ]);

        Product::create([
            'category_id' => 3,
            'region_id' => $cirebon->id,
            'name' => 'Batik Mega Mendung Exclusive',
            'slug' => 'batik-mega-mendung-exclusive',
            'description' => 'Batik premium khas Cirebon dengan motif Mega Mendung.',
            'price' => 1200000,
            'stock' => 5,
            'image' => 'mega-mendung.jpg',
            'material' => 'Sutra',
            'type' => 'Batik Premium',
            'status' => 'active',
        ]);

        Product::create([
            'category_id' => 4,
            'region_id' => $pekalongan->id,
            'name' => 'Batik Modern Casual',
            'slug' => 'batik-modern-casual',
            'description' => 'Batik modern untuk gaya sehari-hari.',
            'price' => 250000,
            'stock' => 15,
            'image' => 'batik-modern.jpg',
            'material' => 'Katun',
            'type' => 'Batik Modern',
            'status' => 'active',
        ]);
    }
}