<?php

namespace Database\Seeders;

use App\Models\Kuota;
use Illuminate\Database\Seeder;

class KuotaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kuotas = [
            // Telkomsel
            ['provider' => 'Telkomsel', 'package_name' => 'Internet 1GB', 'data_amount' => '1GB', 'validity_period' => '30 Days', 'price' => 15000, 'is_active' => true],
            ['provider' => 'Telkomsel', 'package_name' => 'Internet 2GB', 'data_amount' => '2GB', 'validity_period' => '30 Days', 'price' => 25000, 'is_active' => true],
            ['provider' => 'Telkomsel', 'package_name' => 'Internet 5GB', 'data_amount' => '5GB', 'validity_period' => '30 Days', 'price' => 50000, 'is_active' => true],
            ['provider' => 'Telkomsel', 'package_name' => 'Internet 10GB', 'data_amount' => '10GB', 'validity_period' => '30 Days', 'price' => 85000, 'is_active' => true],

            // XL
            ['provider' => 'XL', 'package_name' => 'Internet 1GB', 'data_amount' => '1GB', 'validity_period' => '30 Days', 'price' => 14000, 'is_active' => true],
            ['provider' => 'XL', 'package_name' => 'Internet 2GB', 'data_amount' => '2GB', 'validity_period' => '30 Days', 'price' => 24000, 'is_active' => true],
            ['provider' => 'XL', 'package_name' => 'Internet 5GB', 'data_amount' => '5GB', 'validity_period' => '30 Days', 'price' => 48000, 'is_active' => true],
            ['provider' => 'XL', 'package_name' => 'Internet 10GB', 'data_amount' => '10GB', 'validity_period' => '30 Days', 'price' => 80000, 'is_active' => true],

            // Indosat
            ['provider' => 'Indosat', 'package_name' => 'Internet 1GB', 'data_amount' => '1GB', 'validity_period' => '30 Days', 'price' => 14500, 'is_active' => true],
            ['provider' => 'Indosat', 'package_name' => 'Internet 2GB', 'data_amount' => '2GB', 'validity_period' => '30 Days', 'price' => 24500, 'is_active' => true],
            ['provider' => 'Indosat', 'package_name' => 'Internet 5GB', 'data_amount' => '5GB', 'validity_period' => '30 Days', 'price' => 49000, 'is_active' => true],
            ['provider' => 'Indosat', 'package_name' => 'Internet 10GB', 'data_amount' => '10GB', 'validity_period' => '30 Days', 'price' => 82000, 'is_active' => true],

            // Tri
            ['provider' => 'Tri', 'package_name' => 'Internet 1GB', 'data_amount' => '1GB', 'validity_period' => '30 Days', 'price' => 13000, 'is_active' => true],
            ['provider' => 'Tri', 'package_name' => 'Internet 2GB', 'data_amount' => '2GB', 'validity_period' => '30 Days', 'price' => 23000, 'is_active' => true],
            ['provider' => 'Tri', 'package_name' => 'Internet 5GB', 'data_amount' => '5GB', 'validity_period' => '30 Days', 'price' => 47000, 'is_active' => true],
            ['provider' => 'Tri', 'package_name' => 'Internet 10GB', 'data_amount' => '10GB', 'validity_period' => '30 Days', 'price' => 78000, 'is_active' => true],

            // Smartfren
            ['provider' => 'Smartfren', 'package_name' => 'Internet 1GB', 'data_amount' => '1GB', 'validity_period' => '30 Days', 'price' => 12000, 'is_active' => true],
            ['provider' => 'Smartfren', 'package_name' => 'Internet 2GB', 'data_amount' => '2GB', 'validity_period' => '30 Days', 'price' => 22000, 'is_active' => true],
            ['provider' => 'Smartfren', 'package_name' => 'Internet 5GB', 'data_amount' => '5GB', 'validity_period' => '30 Days', 'price' => 45000, 'is_active' => true],
            ['provider' => 'Smartfren', 'package_name' => 'Internet 10GB', 'data_amount' => '10GB', 'validity_period' => '30 Days', 'price' => 75000, 'is_active' => true],
        ];

        foreach ($kuotas as $kuota) {
            Kuota::firstOrCreate(
                [
                    'provider' => $kuota['provider'],
                    'package_name' => $kuota['package_name']
                ],
                $kuota
            );
        }
    }
}
