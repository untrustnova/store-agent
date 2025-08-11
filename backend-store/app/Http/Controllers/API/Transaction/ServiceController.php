<?php

namespace App\Http\Controllers\API\Transaction;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\EWallet;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function cities(): JsonResponse
    {
        $cities = City::where('has_bus_station', true)
            ->orderBy('province')
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Cities fetched successfully',
            'data' => [
                'cities' => $cities
            ]
        ]);
    }

    public function eWallets(): JsonResponse
    {
        $eWallets = EWallet::where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'E-Wallets fetched successfully',
            'data' => [
                'ewallets' => $eWallets
            ]
        ]);
    }

    public function validateBusRoute(Request $request): JsonResponse
    {
        $request->validate([
            'from_city_id' => 'required|exists:cities,id',
            'to_city_id' => 'required|exists:cities,id|different:from_city_id',
            'date' => 'required|date|after:today',
        ]);

        // Here you would typically call your bus service provider's API
        // For now, we'll return a mock response
        return response()->json([
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

        // Here you would typically call your e-wallet service provider's API
        // For now, we'll return a mock response
        return response()->json([
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

        // Here you would typically call your phone service provider's API
        // For now, we'll return a mock response
        return response()->json([
            'valid' => true,
            'provider' => $request->provider,
            'products' => [
                ['code' => 'P10', 'name' => 'Pulsa 10.000', 'price' => 11000],
                ['code' => 'P20', 'name' => 'Pulsa 20.000', 'price' => 21000],
                ['code' => 'P50', 'name' => 'Pulsa 50.000', 'price' => 51000],
                ['code' => 'P100', 'name' => 'Pulsa 100.000', 'price' => 100000],
            ]
        ]);
    }

    public function validateGameAccount(Request $request): JsonResponse
    {
        $request->validate([
            'game' => 'required|string',
            'user_id' => 'required|string',
            'server_id' => 'required|string',
        ]);

        // Here you would typically call your game service provider's API
        // For now, we'll return a mock response
        return response()->json([
            'valid' => true,
            'username' => 'PlayerOne',
            'products' => [
                ['code' => 'DM60', 'name' => '60 Diamonds', 'price' => 15000],
                ['code' => 'DM300', 'name' => '300 Diamonds', 'price' => 75000],
                ['code' => 'DM1200', 'name' => '1200 Diamonds', 'price' => 300000],
            ]
        ]);
    }

    public function validateTokenMeter(Request $request): JsonResponse
    {
        $request->validate([
            'meter_number' => 'required|string|size:11',
        ]);

        // Here you would typically call your PLN service provider's API
        // For now, we'll return a mock response
        return response()->json([
            'valid' => true,
            'customer_name' => 'John Doe',
            'customer_address' => '123 Main Street',
            'tariff' => 'R1/900VA',
            'products' => [
                ['code' => 'T20', 'name' => 'Token 20.000', 'price' => 21000],
                ['code' => 'T50', 'name' => 'Token 50.000', 'price' => 51000],
                ['code' => 'T100', 'name' => 'Token 100.000', 'price' => 101000],
                ['code' => 'T200', 'name' => 'Token 200.000', 'price' => 201000],
            ]
        ]);
    }
}
