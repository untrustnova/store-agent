<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\EWallet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Database\Seeders\GameSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user if not exists
        if (!User::where('email', 'admin@admin.com')->exists()) {
            User::create([
                'name' => 'Super Admin',
                'email' => 'admin@admin.com',
                'password' => bcrypt('password123'),
                'role' => 'admin',
                'is_active' => true,
                'phone_number' => '081234567890',
                'address' => 'Jl. Admin No. 1',
                'balance' => 0
            ]);
        }

        // Create some agent users
        User::factory(5)->create();

        // Create cities
        City::factory()->createMany([
            ['name' => 'Jakarta', 'province' => 'DKI Jakarta'],
            ['name' => 'Surabaya', 'province' => 'Jawa Timur'],
            ['name' => 'Bandung', 'province' => 'Jawa Barat'],
            ['name' => 'Medan', 'province' => 'Sumatera Utara'],
            ['name' => 'Makassar', 'province' => 'Sulawesi Selatan'],
            ['name' => 'Semarang', 'province' => 'Jawa Tengah'],
            ['name' => 'Palembang', 'province' => 'Sumatera Selatan'],
            ['name' => 'Balikpapan', 'province' => 'Kalimantan Timur'],
        ]);

        // Create e-wallets
        EWallet::factory()->createMany([
            ['name' => 'DANA', 'code' => 'DANA'],
            ['name' => 'OVO', 'code' => 'OVO'],
            ['name' => 'GoPay', 'code' => 'GOPAY'],
            ['name' => 'ShopeePay', 'code' => 'SHOPEEPAY'],
            ['name' => 'LinkAja', 'code' => 'LINKAJA'],
        ]);

        // Seed games
        $this->call(GameSeeder::class);
    }
}
