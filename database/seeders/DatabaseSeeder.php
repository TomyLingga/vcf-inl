<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        \App\Models\User::firstOrCreate(
            ['username' => 'admin'],
            [
                'nama' => 'Administrator',
                'password_hash' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        \App\Models\User::firstOrCreate(
            ['username' => 'petugas'],
            [
                'nama' => 'Petugas Security',
                'password_hash' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'petugas',
                'is_active' => true,
            ]
        );
    }
}
