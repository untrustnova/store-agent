<?php

namespace App\Http\Controllers\API\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\City;
use App\Models\EWallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    use ApiResponse;

    public function cities(): JsonResponse
    {
        $cities = City::where('has_bus_station', true)
            ->orderBy('province')
            ->orderBy('name')
            ->get();

        return $this->successResponse(['cities' => $cities], 'Cities fetched successfully');
    }

    public function eWallets(): JsonResponse
    {
        $eWallets = EWallet::where('is_active', true)
            ->orderBy('name')
            ->get();

        return $this->successResponse(['ewallets' => $eWallets], 'E-Wallets fetched successfully');
    }

    public function validateBusRoute(Request $request): JsonResponse
    {
        $request->validate([
            'from_city_id' => 'required|exists:cities,id',
            'to_city_id' => 'required|exists:cities,id|different:from_city_id',
            'date' => 'required|date|after:today',
        ]);

        return $this->successResponse([
            'available' => true,
            'price' => 150000,
            'available_seats' => 45,
            'departure_time' => '08:00',
            'arrival_time' => '14:00',
        ]);
    }

    public function validateEWalletNumber(Request $request): JsonResponse
    {
        $request->validate([
            'ewallet_code' => 'required|exists:e_wallets,code',
            'phone_number' => 'required|string|max:20',
        ]);

        return $this->successResponse([
            'valid' => true,
            'account_holder' => 'John Doe',
        ]);
    }

    public function validatePhoneNumber(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number' => 'required|string|max:20',
            'provider' => 'required|in:telkomsel,indosat,xl,axis,three,smartfren',
        ]);

        return $this->successResponse([
            'valid' => true,
            'provider' => $request->provider,
        ]);
    }

    public function validateGameAccount(Request $request): JsonResponse
    {
        $request->validate([
            'game' => 'required|string',
            'user_id' => 'required|string',
            'server_id' => 'required|string',
        ]);

        return $this->successResponse([
            'valid' => true,
            'username' => 'PlayerOne',
        ]);
    }

    public function validateTokenMeter(Request $request): JsonResponse
    {
        $request->validate([
            'meter_number' => 'required|string|size:11',
        ]);

        return $this->successResponse([
            'valid' => true,
            'customer_name' => 'John Doe',
        ]);
    }
}
