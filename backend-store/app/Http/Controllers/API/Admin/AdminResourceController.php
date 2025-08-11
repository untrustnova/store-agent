<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\EWallet;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminResourceController extends Controller
{
    // User Management
    public function createUser(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone_number' => 'required|string|max:20',
            'address' => 'required|string',
            'role' => 'required|in:admin,agent',
            'is_active' => 'boolean'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone_number' => $request->phone_number,
            'address' => $request->address,
            'role' => $request->role,
            'is_active' => $request->is_active ?? true,
            'balance' => 0
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User created successfully',
            'data' => [
                'user' => new UserResource($user)
            ]
        ], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'name' => 'string|max:255',
            'email' => ['string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'string|min:8|nullable',
            'phone_number' => 'string|max:20',
            'address' => 'string',
            'role' => 'in:admin,agent',
            'is_active' => 'boolean'
        ]);

        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->fill($request->except('password'));
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully',
            'data' => [
                'user' => new UserResource($user)
            ]
        ]);
    }

    public function deleteUser(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot delete admin user'], 403);
        }

        $user->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully'
        ]);
    }

    // City Management
    public function listCities(): JsonResponse
    {
        $cities = City::orderBy('province')->orderBy('name')->get();
        return response()->json(['cities' => $cities]);
    }

    public function createCity(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'has_bus_station' => 'boolean'
        ]);

        $city = City::create([
            'name' => $request->name,
            'province' => $request->province,
            'has_bus_station' => $request->has_bus_station ?? true
        ]);

        return response()->json([
            'message' => 'City created successfully',
            'city' => $city
        ], 201);
    }

    public function updateCity(Request $request, City $city): JsonResponse
    {
        $request->validate([
            'name' => 'string|max:255',
            'province' => 'string|max:255',
            'has_bus_station' => 'boolean'
        ]);

        $city->update($request->all());

        return response()->json([
            'message' => 'City updated successfully',
            'city' => $city
        ]);
    }

    public function deleteCity(City $city): JsonResponse
    {
        // Check if city is being used in any transactions
        if ($city->departureTransactions()->exists() || $city->arrivalTransactions()->exists()) {
            return response()->json([
                'message' => 'Cannot delete city that is being used in transactions'
            ], 403);
        }

        $city->delete();
        return response()->json(['message' => 'City deleted successfully']);
    }

    // E-Wallet Management
    public function listEWallets(): JsonResponse
    {
        $ewallets = EWallet::orderBy('name')->get();
        return response()->json(['ewallets' => $ewallets]);
    }

    public function createEWallet(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:e_wallets',
            'is_active' => 'boolean'
        ]);

        $ewallet = EWallet::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'is_active' => $request->is_active ?? true
        ]);

        return response()->json([
            'message' => 'E-Wallet created successfully',
            'ewallet' => $ewallet
        ], 201);
    }

    public function updateEWallet(Request $request, EWallet $ewallet): JsonResponse
    {
        $request->validate([
            'name' => 'string|max:255',
            'code' => ['string', 'max:50', Rule::unique('e_wallets')->ignore($ewallet->id)],
            'is_active' => 'boolean'
        ]);

        if ($request->has('code')) {
            $request->merge(['code' => strtoupper($request->code)]);
        }

        $ewallet->update($request->all());

        return response()->json([
            'message' => 'E-Wallet updated successfully',
            'ewallet' => $ewallet
        ]);
    }

    public function deleteEWallet(EWallet $ewallet): JsonResponse
    {
        // Check if e-wallet is being used in any transactions
        if ($ewallet->transactions()->exists()) {
            return response()->json([
                'message' => 'Cannot delete e-wallet that is being used in transactions'
            ], 403);
        }

        $ewallet->delete();
        return response()->json(['message' => 'E-Wallet deleted successfully']);
    }
}
