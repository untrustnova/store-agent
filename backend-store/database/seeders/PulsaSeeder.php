<?php

namespace Database\Seeders;

use App\Models\Pulsa;
use Illuminate\Database\Seeder;

class PulsaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pulsas = [
            // Telkomsel
            ['provider' => 'Telkomsel', 'nominal' => 5000, 'price' => 7000, 'is_active' => true],
            ['provider' => 'Telkomsel', 'nominal' => 10000, 'price' => 12000, 'is_active' => true],
            ['provider' => 'Telkomsel', 'nominal' => 20000, 'price' => 22000, 'is_active' => true],
            ['provider' => 'Telkomsel', 'nominal' => 25000, 'price' => 27000, 'is_active' => true],
            ['provider' => 'Telkomsel', 'nominal' => 50000, 'price' => 52000, 'is_active' => true],
            ['provider' => 'Telkomsel', 'nominal' => 100000, 'price' => 102000, 'is_active' => true],

            // XL
            ['provider' => 'XL', 'nominal' => 5000, 'price' => 6800, 'is_active' => true],
            ['provider' => 'XL', 'nominal' => 10000, 'price' => 11800, 'is_active' => true],
            ['provider' => 'XL', 'nominal' => 20000, 'price' => 21800, 'is_active' => true],
            ['provider' => 'XL', 'nominal' => 25000, 'price' => 26800, 'is_active' => true],
            ['provider' => 'XL', 'nominal' => 50000, 'price' => 51800, 'is_active' => true],
            ['provider' => 'XL', 'nominal' => 100000, 'price' => 101800, 'is_active' => true],

            // Indosat
            ['provider' => 'Indosat', 'nominal' => 5000, 'price' => 6900, 'is_active' => true],
            ['provider' => 'Indosat', 'nominal' => 10000, 'price' => 11900, 'is_active' => true],
            ['provider' => 'Indosat', 'nominal' => 20000, 'price' => 21900, 'is_active' => true],
            ['provider' => 'Indosat', 'nominal' => 25000, 'price' => 26900, 'is_active' => true],
            ['provider' => 'Indosat', 'nominal' => 50000, 'price' => 51900, 'is_active' => true],
            ['provider' => 'Indosat', 'nominal' => 100000, 'price' => 101900, 'is_active' => true],

            // Tri
            ['provider' => 'Tri', 'nominal' => 5000, 'price' => 6700, 'is_active' => true],
            ['provider' => 'Tri', 'nominal' => 10000, 'price' => 11700, 'is_active' => true],
            ['provider' => 'Tri', 'nominal' => 20000, 'price' => 21700, 'is_active' => true],
            ['provider' => 'Tri', 'nominal' => 25000, 'price' => 26700, 'is_active' => true],
            ['provider' => 'Tri', 'nominal' => 50000, 'price' => 51700, 'is_active' => true],
            ['provider' => 'Tri', 'nominal' => 100000, 'price' => 101700, 'is_active' => true],

            // Smartfren
            ['provider' => 'Smartfren', 'nominal' => 5000, 'price' => 6500, 'is_active' => true],
            ['provider' => 'Smartfren', 'nominal' => 10000, 'price' => 11500, 'is_active' => true],
            ['provider' => 'Smartfren', 'nominal' => 20000, 'price' => 21500, 'is_active' => true],
            ['provider' => 'Smartfren', 'nominal' => 25000, 'price' => 26500, 'is_active' => true],
            ['provider' => 'Smartfren', 'nominal' => 50000, 'price' => 51500, 'is_active' => true],
            ['provider' => 'Smartfren', 'nominal' => 100000, 'price' => 101500, 'is_active' => true],
        ];

        foreach ($pulsas as $pulsa) {
            Pulsa::firstOrCreate(
                [
                    'provider' => $pulsa['provider'],
                    'nominal' => $pulsa['nominal']
                ],
                $pulsa
            );
        }
    }
}
