<?php

namespace Database\Seeders;

use App\Models\TokenListrik;
use Illuminate\Database\Seeder;

class TokenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tokens = [
            ['nominal' => 20000, 'price' => 22000, 'description' => '13.2 kWh', 'is_active' => true],
            ['nominal' => 50000, 'price' => 52000, 'description' => '33.0 kWh', 'is_active' => true],
            ['nominal' => 100000, 'price' => 102000, 'description' => '66.0 kWh', 'is_active' => true],
            ['nominal' => 200000, 'price' => 202000, 'description' => '132.0 kWh', 'is_active' => true],
            ['nominal' => 500000, 'price' => 502000, 'description' => '330.0 kWh', 'is_active' => true],
            ['nominal' => 1000000, 'price' => 1002000, 'description' => '660.0 kWh', 'is_active' => true],
        ];

        foreach ($tokens as $token) {
            TokenListrik::firstOrCreate(
                ['nominal' => $token['nominal']],
                $token
            );
        }
    }
}
