<?php

namespace Database\Factories;

use App\Models\EWallet;
use Illuminate\Database\Eloquent\Factories\Factory;

class EWalletFactory extends Factory
{
    protected $model = EWallet::class;

    public function definition(): array
    {
        $wallets = [
            ['name' => 'DANA', 'code' => 'DANA'],
            ['name' => 'OVO', 'code' => 'OVO'],
            ['name' => 'GoPay', 'code' => 'GOPAY'],
            ['name' => 'ShopeePay', 'code' => 'SHOPEEPAY'],
            ['name' => 'LinkAja', 'code' => 'LINKAJA'],
        ];

        $wallet = $this->faker->unique()->randomElement($wallets);

        return [
            'name' => $wallet['name'],
            'code' => $wallet['code'],
            'is_active' => true,
        ];
    }
}
