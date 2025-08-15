<?php

namespace Database\Seeders;

use App\Models\Game;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    public function run(): void
    {
        $games = [
            // Genshin Impact
            ['game_name' => 'Genshin Impact', 'item_type' => 'Genesis Crystal', 'amount' => '60', 'price' => 16000, 'description' => 'GC 60'],
            ['game_name' => 'Genshin Impact', 'item_type' => 'Genesis Crystal', 'amount' => '300 + 30', 'price' => 79000, 'description' => 'GC 300 + Bonus'],
            ['game_name' => 'Genshin Impact', 'item_type' => 'Genesis Crystal', 'amount' => '980 + 110', 'price' => 159000, 'description' => 'GC 980 + Bonus'],
            ['game_name' => 'Genshin Impact', 'item_type' => 'Genesis Crystal', 'amount' => '1980 + 260', 'price' => 319000, 'description' => 'GC 1980 + Bonus'],

            // Honkai Star Rail
            ['game_name' => 'Honkai Star Rail', 'item_type' => 'Oneiric Shard', 'amount' => '60', 'price' => 16000],
            ['game_name' => 'Honkai Star Rail', 'item_type' => 'Oneiric Shard', 'amount' => '300 + 30', 'price' => 79000],
            ['game_name' => 'Honkai Star Rail', 'item_type' => 'Oneiric Shard', 'amount' => '980 + 110', 'price' => 159000],

            // Zenless Zone Zero
            ['game_name' => 'Zenless Zone Zero', 'item_type' => 'Premium Currency', 'amount' => '60', 'price' => 16000],
            ['game_name' => 'Zenless Zone Zero', 'item_type' => 'Premium Currency', 'amount' => '300 + 30', 'price' => 79000],

            // Blue Archive
            ['game_name' => 'Blue Archive', 'item_type' => 'Pyroxene', 'amount' => '490', 'price' => 79000],
            ['game_name' => 'Blue Archive', 'item_type' => 'Pyroxene', 'amount' => '1200 + 300', 'price' => 149000],

            // Azur Lane
            ['game_name' => 'Azur Lane', 'item_type' => 'Gems', 'amount' => '300', 'price' => 75000],
            ['game_name' => 'Azur Lane', 'item_type' => 'Gems', 'amount' => '600', 'price' => 145000],

            // Arknights
            ['game_name' => 'Arknights', 'item_type' => 'Originium', 'amount' => '60', 'price' => 16000],
            ['game_name' => 'Arknights', 'item_type' => 'Originium', 'amount' => '185 + 25', 'price' => 299000],

            // Fate Grand Order
            ['game_name' => 'Fate Grand Order', 'item_type' => 'Saint Quartz', 'amount' => '12', 'price' => 120000],
            ['game_name' => 'Fate Grand Order', 'item_type' => 'Saint Quartz', 'amount' => '30', 'price' => 300000],

            // Guardian Tales
            ['game_name' => 'Guardian Tales', 'item_type' => 'Gems', 'amount' => '300', 'price' => 75000],
            ['game_name' => 'Guardian Tales', 'item_type' => 'Gems', 'amount' => '1200', 'price' => 289000],

            // Wuthering Waves
            ['game_name' => 'Wuthering Waves', 'item_type' => 'Astrite', 'amount' => '300', 'price' => 75000],
            ['game_name' => 'Wuthering Waves', 'item_type' => 'Astrite', 'amount' => '980', 'price' => 179000],

            // Uma Musume
            ['game_name' => 'Uma Musume', 'item_type' => 'Jewel', 'amount' => '1500', 'price' => 149000],
            ['game_name' => 'Uma Musume', 'item_type' => 'Jewel', 'amount' => '5000', 'price' => 459000],
        ];

        foreach ($games as $data) {
            Game::create(array_merge([
                'description' => $data['description'] ?? null,
                'is_active' => true,
            ], $data));
        }
    }
}


