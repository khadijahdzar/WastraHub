<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['name' => 'Batik Tulis', 'slug' => 'batik-tulis', 'description' => 'Batik yang dibuat menggunakan teknik tulis manual'],
            ['name' => 'Batik Cap', 'slug' => 'batik-cap', 'description' => 'Batik yang dibuat menggunakan teknik cap'],
            ['name' => 'Batik Premium', 'slug' => 'batik-premium', 'description' => 'Batik kualitas premium dengan bahan terbaik'],
            ['name' => 'Batik Modern', 'slug' => 'batik-modern', 'description' => 'Batik dengan desain modern'],
        ];

        foreach ($items as $item) {
            Category::updateOrCreate(['slug' => $item['slug']], $item);
        }
    }
}