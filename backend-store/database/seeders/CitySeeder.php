<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = [
            ['name' => 'Jakarta', 'province' => 'DKI Jakarta'],
            ['name' => 'Surabaya', 'province' => 'Jawa Timur'],
            ['name' => 'Bandung', 'province' => 'Jawa Barat'],
            ['name' => 'Medan', 'province' => 'Sumatera Utara'],
            ['name' => 'Makassar', 'province' => 'Sulawesi Selatan'],
            ['name' => 'Semarang', 'province' => 'Jawa Tengah'],
            ['name' => 'Palembang', 'province' => 'Sumatera Selatan'],
            ['name' => 'Balikpapan', 'province' => 'Kalimantan Timur'],
            ['name' => 'Manado', 'province' => 'Sulawesi Utara'],
            ['name' => 'Denpasar', 'province' => 'Bali'],
            ['name' => 'Yogyakarta', 'province' => 'DI Yogyakarta'],
            ['name' => 'Malang', 'province' => 'Jawa Timur'],
            ['name' => 'Padang', 'province' => 'Sumatera Barat'],
            ['name' => 'Pekanbaru', 'province' => 'Riau'],
            ['name' => 'Pontianak', 'province' => 'Kalimantan Barat'],
        ];

        foreach ($cities as $city) {
            City::firstOrCreate(
                ['name' => $city['name']],
                $city
            );
        }
    }
}
