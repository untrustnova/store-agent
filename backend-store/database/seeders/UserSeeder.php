<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
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
    }
}
