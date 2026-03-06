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
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class AdminResourceController extends Controller
{
    use ApiResponse;

    // User Management
    public function listUsers(): JsonResponse
    {
        $users = User::where('role', 'agent')->paginate();
        return $this->successResponse([
            'users' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ]
        ]);
    }

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

        return $this->successResponse(new UserResource($user), 'User created successfully', 201);
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

        if ($request->has('password') && !empty($request->password)) {
            $user->password = Hash::make($request->password);
        }

        $user->fill($request->except('password'));
        $user->save();

        return $this->successResponse(new UserResource($user), 'User updated successfully');
    }

    public function deleteUser(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return $this->errorResponse('Cannot delete admin user', 403);
        }

        $user->delete();
        return $this->successResponse(null, 'User deleted successfully');
    }

    // City Management
    public function listCities(): JsonResponse
    {
        $cities = City::orderBy('province')->orderBy('name')->get();
        return $this->successResponse(['cities' => $cities]);
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

        return $this->successResponse($city, 'City created successfully', 201);
    }

    public function updateCity(Request $request, City $city): JsonResponse
    {
        $request->validate([
            'name' => 'string|max:255',
            'province' => 'string|max:255',
            'has_bus_station' => 'boolean'
        ]);

        $city->update($request->all());

        return $this->successResponse($city, 'City updated successfully');
    }

    public function deleteCity(City $city): JsonResponse
    {
        $city->delete();
        return $this->successResponse(null, 'City deleted successfully');
    }

    // E-Wallet Management
    public function listEWallets(): JsonResponse
    {
        $ewallets = EWallet::orderBy('name')->get();
        return $this->successResponse(['ewallets' => $ewallets]);
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

        return $this->successResponse($ewallet, 'E-Wallet created successfully', 201);
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

        return $this->successResponse($ewallet, 'E-Wallet updated successfully');
    }

    public function deleteEWallet(EWallet $ewallet): JsonResponse
    {
        $ewallet->delete();
        return $this->successResponse(null, 'E-Wallet deleted successfully');
    }

    // Pulsa Management
    public function listPulsa(Request $request): JsonResponse
    {
        $query = Pulsa::query();

        if ($search = $request->input('search')) {
            $query->where('provider', 'like', "%{$search}%");
        }

        $pulsa = $query->orderBy('nominal', 'asc')->paginate(15);

        return $this->successResponse($pulsa);
    }

    public function createPulsa(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => 'required|string|max:255',
            'nominal' => 'required|integer|min:1000',
            'price' => 'required|numeric|min:1000',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $pulsa = Pulsa::create($validated);
        Cache::tags(['pulsa'])->flush();

        return $this->successResponse($pulsa, 'Pulsa product created successfully', 201);
    }

    public function updatePulsa(Request $request, Pulsa $pulsa): JsonResponse
    {
        $validated = $request->validate([
            'provider' => 'string|max:255',
            'nominal' => 'integer|min:1000',
            'price' => 'numeric|min:1000',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $pulsa->update($validated);
        Cache::tags(['pulsa'])->flush();

        return $this->successResponse($pulsa, 'Pulsa product updated successfully');
    }

    public function deletePulsa(Pulsa $pulsa): JsonResponse
    {
        $pulsa->delete();
        Cache::tags(['pulsa'])->flush();

        return $this->successResponse(null, 'Pulsa product deleted successfully');
    }

    // Kuota Management
    public function listKuota(Request $request): JsonResponse
    {
        $query = Kuota::query();

        if ($search = $request->input('search')) {
            $query->where('package_name', 'like', "%{$search}%")
                  ->orWhere('provider', 'like', "%{$search}%");
        }

        $kuota = $query->orderBy('price', 'asc')->paginate(15);

        return $this->successResponse($kuota);
    }

    public function createKuota(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => 'required|string|max:255',
            'package_name' => 'required|string|max:255',
            'data_amount' => 'required|string|max:50',
            'validity_period' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $kuota = Kuota::create($validated);
        Cache::tags(['kuota'])->flush();

        return $this->successResponse($kuota, 'Kuota package created successfully', 201);
    }

    public function updateKuota(Request $request, Kuota $kuota): JsonResponse
    {
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

        return $this->successResponse($kuota, 'Kuota package updated successfully');
    }

    public function deleteKuota(Kuota $kuota): JsonResponse
    {
        $kuota->delete();
        Cache::tags(['kuota'])->flush();

        return $this->successResponse(null, 'Kuota package deleted successfully');
    }

    // Game Management
    public function listGames(Request $request): JsonResponse
    {
        $query = Game::query();

        if ($search = $request->input('search')) {
            $query->where('game_name', 'like', "%{$search}%");
        }

        $games = $query->orderBy('game_name', 'asc')->paginate(15);

        return $this->successResponse($games);
    }

    public function createGame(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'game_name' => 'required|string|max:255',
            'item_type' => 'required|string|max:255',
            'amount' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $game = Game::create($validated);
        Cache::tags(['games'])->flush();

        return $this->successResponse($game, 'Game product created successfully', 201);
    }

    public function updateGame(Request $request, Game $game): JsonResponse
    {
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

        return $this->successResponse($game, 'Game product updated successfully');
    }

    public function deleteGame(Game $game): JsonResponse
    {
        $game->delete();
        Cache::tags(['games'])->flush();

        return $this->successResponse(null, 'Game product deleted successfully');
    }

    // Token Listrik Management
    public function listTokenListrik(Request $request): JsonResponse
    {
        $query = TokenListrik::query();

        if ($search = $request->input('search')) {
            $query->where('description', 'like', "%{$search}%");
        }

        $tokens = $query->orderBy('nominal', 'asc')->paginate(15);

        return $this->successResponse($tokens);
    }

    public function createTokenListrik(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nominal' => 'required|integer|min:1000',
            'price' => 'required|numeric|min:1000',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $token = TokenListrik::create($validated);
        Cache::tags(['token_listrik'])->flush();

        return $this->successResponse($token, 'Token Listrik product created successfully', 201);
    }

    public function updateTokenListrik(Request $request, TokenListrik $token): JsonResponse
    {
        $validated = $request->validate([
            'nominal' => 'integer|min:1000',
            'price' => 'numeric|min:1000',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $token->update($validated);
        Cache::tags(['token_listrik'])->flush();

        return $this->successResponse($token, 'Token Listrik product updated successfully');
    }

    public function deleteTokenListrik(TokenListrik $token): JsonResponse
    {
        $token->delete();
        Cache::tags(['token_listrik'])->flush();

        return $this->successResponse(null, 'Token Listrik product deleted successfully');
    }
}
