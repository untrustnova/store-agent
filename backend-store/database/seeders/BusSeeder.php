<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class BusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // This seeder will be used for bus routes in the future
        // For now, we'll just ensure cities are seeded first
        $this->call(CitySeeder::class);

        // Bus routes can be added here when the Bus model is created
        // Example structure:
        // $routes = [
        //     [
        //         'origin_city_id' => City::where('name', 'Jakarta')->first()->id,
        //         'destination_city_id' => City::where('name', 'Bandung')->first()->id,
        //         'bus_company' => 'Primajasa',
        //         'departure_time' => '08:00',
        //         'arrival_time' => '12:00',
        //         'price' => 50000,
        //         'is_active' => true
        //     ]
        // ];
    }
}
