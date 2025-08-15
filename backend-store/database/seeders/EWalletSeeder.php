<?php

namespace Database\Seeders;

use App\Models\EWallet;
use Illuminate\Database\Seeder;

class EWalletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ewallets = [
            ['name' => 'DANA', 'code' => 'DANA', 'is_active' => true],
            ['name' => 'OVO', 'code' => 'OVO', 'is_active' => true],
            ['name' => 'GoPay', 'code' => 'GOPAY', 'is_active' => true],
            ['name' => 'ShopeePay', 'code' => 'SHOPEEPAY', 'is_active' => true],
            ['name' => 'LinkAja', 'code' => 'LINKAJA', 'is_active' => true],
            ['name' => 'QRIS', 'code' => 'QRIS', 'is_active' => true],
            ['name' => 'Bank Transfer', 'code' => 'BANK', 'is_active' => true],
            ['name' => 'Cash', 'code' => 'CASH', 'is_active' => true],
        ];

        foreach ($ewallets as $ewallet) {
            EWallet::firstOrCreate(
                ['code' => $ewallet['code']],
                $ewallet
            );
        }
    }
}
