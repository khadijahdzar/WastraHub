<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            RegionSeeder::class,
            ProductSeeder::class,
        ]);

        // Admin utama (sesuai demo frontend)
        User::updateOrCreate(
            ['email' => 'admin@wastrahub.com'],
            [
                'name'     => 'Admin WastraHub',
                'password' => bcrypt('admin123'),
                'role'     => 'admin',
            ]
        );

        // Alias email lama (kompatibilitas)
        User::updateOrCreate(
            ['email' => 'admin@batikartisan.com'],
            [
                'name'     => 'Admin Batik Artisan',
                'password' => bcrypt('admin123'),
                'role'     => 'admin',
            ]
        );

        // User demo
        User::updateOrCreate(
            ['email' => 'user@wastrahub.com'],
            [
                'name'     => 'Pengguna Demo',
                'password' => bcrypt('user123'),
                'role'     => 'user',
            ]
        );
    }
}
