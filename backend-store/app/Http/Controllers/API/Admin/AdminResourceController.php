<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\EWallet;
use App\Models\User;
use App\Models\Pulsa;
use App\Models\Kuota;
use App\Models\Game;
use App\Models\TokenListrik;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

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

    // Pulsa Management
    public function listPulsa(Request $request): JsonResponse
    {
        try {
            $query = Pulsa::query();

            if ($search = $request->input('search')) {
                $query->where('provider', 'like', "%{$search}%");
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($provider = $request->input('provider')) {
                $query->where('provider', $provider);
            }

            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->input('min_price'));
            }

            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->input('max_price'));
            }

            $pulsa = $query->orderBy($request->input('sort_by', 'nominal'), $request->input('order', 'asc'))
                          ->paginate($request->input('per_page', 10));

            return response()->json([
                'data' => $pulsa,
                'message' => 'Pulsa products retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving pulsa products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createPulsa(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'provider' => 'required|string|max:255',
                'nominal' => 'required|integer|min:1000',
                'price' => 'required|numeric|min:1000',
                'description' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            $pulsa = DB::transaction(function () use ($validated) {
                return Pulsa::create($validated);
            });

            Cache::tags(['pulsa'])->flush();

            return response()->json([
                'data' => $pulsa,
                'message' => 'Pulsa product created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating pulsa product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updatePulsa(Request $request, Pulsa $pulsa): JsonResponse
    {
        try {
            $validated = $request->validate([
                'provider' => 'string|max:255',
                'nominal' => 'integer|min:1000',
                'price' => 'numeric|min:1000',
                'description' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            $pulsa->update($validated);
            Cache::tags(['pulsa'])->flush();

            return response()->json([
                'data' => $pulsa,
                'message' => 'Pulsa product updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating pulsa product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deletePulsa(Pulsa $pulsa): JsonResponse
    {
        try {
            $pulsa->delete();
            Cache::tags(['pulsa'])->flush();

            return response()->json([
                'message' => 'Pulsa product deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting pulsa product: ' . $e->getMessage()
            ], 500);
        }
    }

    // Kuota Management
    public function listKuota(Request $request): JsonResponse
    {
        try {
            $query = Kuota::query();

            if ($search = $request->input('search')) {
                $query->where(function($q) use ($search) {
                    $q->where('provider', 'like', "%{$search}%")
                      ->orWhere('package_name', 'like', "%{$search}%");
                });
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($provider = $request->input('provider')) {
                $query->where('provider', $provider);
            }

            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->input('min_price'));
            }

            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->input('max_price'));
            }

            $kuota = $query->orderBy($request->input('sort_by', 'price'), $request->input('order', 'asc'))
                          ->paginate($request->input('per_page', 10));

            return response()->json([
                'data' => $kuota,
                'message' => 'Kuota packages retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving kuota packages: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createKuota(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'provider' => 'required|string|max:255',
                'package_name' => 'required|string|max:255',
                'data_amount' => 'required|string|max:50',
                'validity_period' => 'required|string|max:50',
                'price' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            $kuota = DB::transaction(function () use ($validated) {
                return Kuota::create($validated);
            });

            Cache::tags(['kuota'])->flush();

            return response()->json([
                'data' => $kuota,
                'message' => 'Kuota package created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating kuota package: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateKuota(Request $request, Kuota $kuota): JsonResponse
    {
        try {
            $validated = $request->validate([
                'provider' => 'string|max:255',
                'package_name' => 'string|max:255',
                'data_amount' => 'string|max:50',
                'validity_period' => 'string|max:50',
                'price' => 'numeric|min:0',
                'description' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            $kuota->update($validated);
            Cache::tags(['kuota'])->flush();

            return response()->json([
                'data' => $kuota,
                'message' => 'Kuota package updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating kuota package: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteKuota(Kuota $kuota): JsonResponse
    {
        try {
            $kuota->delete();
            Cache::tags(['kuota'])->flush();

            return response()->json([
                'message' => 'Kuota package deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting kuota package: ' . $e->getMessage()
            ], 500);
        }
    }

    // Game Management
    public function listGames(Request $request): JsonResponse
    {
        try {
            $query = Game::query();

            if ($search = $request->input('search')) {
                $query->where(function($q) use ($search) {
                    $q->where('game_name', 'like', "%{$search}%")
                      ->orWhere('item_type', 'like', "%{$search}%");
                });
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($gameName = $request->input('game_name')) {
                $query->where('game_name', $gameName);
            }

            if ($itemType = $request->input('item_type')) {
                $query->where('item_type', $itemType);
            }

            $games = $query->orderBy($request->input('sort_by', 'game_name'), $request->input('order', 'asc'))
                          ->paginate($request->input('per_page', 10));

            return response()->json([
                'data' => $games,
                'message' => 'Game products retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving game products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createGame(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'game_name' => 'required|string|max:255',
                'item_type' => 'required|string|max:255',
                'amount' => 'required|string|max:50',
                'price' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            $game = DB::transaction(function () use ($validated) {
                return Game::create($validated);
            });

            Cache::tags(['games'])->flush();

            return response()->json([
                'data' => $game,
                'message' => 'Game product created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating game product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateGame(Request $request, Game $game): JsonResponse
    {
        try {
            $validated = $request->validate([
                'game_name' => 'string|max:255',
                'item_type' => 'string|max:255',
                'amount' => 'string|max:50',
                'price' => 'numeric|min:0',
                'description' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            $game->update($validated);
            Cache::tags(['games'])->flush();

            return response()->json([
                'data' => $game,
                'message' => 'Game product updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating game product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteGame(Game $game): JsonResponse
    {
        try {
            $game->delete();
            Cache::tags(['games'])->flush();

            return response()->json([
                'message' => 'Game product deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting game product: ' . $e->getMessage()
            ], 500);
        }
    }

    // Token Listrik Management
    public function listTokenListrik(Request $request): JsonResponse
    {
        try {
            $query = TokenListrik::query();

            if ($search = $request->input('search')) {
                $query->where('description', 'like', "%{$search}%");
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('min_nominal')) {
                $query->where('nominal', '>=', $request->input('min_nominal'));
            }

            if ($request->has('max_nominal')) {
                $query->where('nominal', '<=', $request->input('max_nominal'));
            }

            $tokens = $query->orderBy($request->input('sort_by', 'nominal'), $request->input('order', 'asc'))
                           ->paginate($request->input('per_page', 10));

            return response()->json([
                'data' => $tokens,
                'message' => 'Token Listrik products retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving token listrik products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createTokenListrik(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nominal' => 'required|integer|min:1000',
                'price' => 'required|numeric|min:1000',
                'description' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            $token = DB::transaction(function () use ($validated) {
                return TokenListrik::create($validated);
            });

            Cache::tags(['token_listrik'])->flush();

            return response()->json([
                'data' => $token,
                'message' => 'Token Listrik product created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating token listrik product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateTokenListrik(Request $request, TokenListrik $token): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nominal' => 'integer|min:1000',
                'price' => 'numeric|min:1000',
                'description' => 'nullable|string',
                'is_active' => 'boolean'
            ]);

            $token->update($validated);
            Cache::tags(['token_listrik'])->flush();

            return response()->json([
                'data' => $token,
                'message' => 'Token Listrik product updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating token listrik product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteTokenListrik(TokenListrik $token): JsonResponse
    {
        try {
            $token->delete();
            Cache::tags(['token_listrik'])->flush();

            return response()->json([
                'message' => 'Token Listrik product deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting token listrik product: ' . $e->getMessage()
            ], 500);
        }
    }
}
