<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name'     => 'Admin WastraHub',
                'email'    => 'admin@wastrahub.com',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
            ],
            [
                'name'     => 'Batik Artisan Admin',
                'email'    => 'admin@batikartisan.com',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
            ],
            [
                'name'     => 'User WastraHub',
                'email'    => 'user@wastrahub.com',
                'password' => Hash::make('user123'),
                'role'     => 'user',
            ],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(
                ['email' => $u['email']],
                $u
            );
        }

        $this->command?->info('UserSeeder: ' . count($users) . ' akun demo berhasil di-seed.');
    }
}
