<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Pulsa;
use App\Models\Kuota;
use App\Models\Game;
use App\Models\TokenListrik;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicResourceController extends Controller
{
    // Pulsa
    public function listPulsa(Request $request): JsonResponse
    {
        try {
            $cacheKey = 'pulsa_list_' . md5(json_encode($request->all()));

            return Cache::remember($cacheKey, 3600, function () use ($request) {
                $query = Pulsa::where('is_active', true);

                if ($provider = $request->input('provider')) {
                    $query->where('provider', $provider);
                }

                if ($nominal = $request->input('nominal')) {
                    $query->where('nominal', $nominal);
                }

                $pulsa = $query->orderBy('provider')
                              ->orderBy('nominal')
                              ->get()
                              ->groupBy('provider');

                // Transform the data for frontend
                $formattedPulsa = $pulsa->map(function ($items) {
                    return [
                        'items' => $items->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'nominal' => $item->nominal,
                                'price' => $item->price,
                                'description' => $item->description,
                            ];
                        })
                    ];
                });

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'providers' => $pulsa->keys(),
                        'pulsa' => $formattedPulsa
                    ]
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve pulsa list'
            ], 500);
        }
    }

    // Kuota
    public function listKuota(Request $request): JsonResponse
    {
        try {
            $cacheKey = 'kuota_list_' . md5(json_encode($request->all()));

            return Cache::remember($cacheKey, 3600, function () use ($request) {
                $query = Kuota::where('is_active', true);

                if ($provider = $request->input('provider')) {
                    $query->where('provider', $provider);
                }

                $kuota = $query->orderBy('provider')
                              ->orderBy('price')
                              ->get()
                              ->groupBy('provider');

                // Transform the data for frontend
                $formattedKuota = $kuota->map(function ($items) {
                    return [
                        'items' => $items->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'package_name' => $item->package_name,
                                'data_amount' => $item->data_amount,
                                'validity_period' => $item->validity_period,
                                'price' => $item->price,
                                'description' => $item->description,
                            ];
                        })
                    ];
                });

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'providers' => $kuota->keys(),
                        'kuota' => $formattedKuota
                    ]
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve kuota list'
            ], 500);
        }
    }

    // Games
    public function listGames(Request $request): JsonResponse
    {
        try {
            $cacheKey = 'games_list_' . md5(json_encode($request->all()));

            return Cache::remember($cacheKey, 3600, function () use ($request) {
                $query = Game::where('is_active', true);

                if ($gameName = $request->input('game_name')) {
                    $query->where('game_name', $gameName);
                }

                $games = $query->orderBy('game_name')
                             ->orderBy('price')
                             ->get()
                             ->groupBy('game_name');

                // Transform the data for frontend
                $formattedGames = $games->map(function ($items) {
                    return [
                        'items' => $items->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'item_type' => $item->item_type,
                                'amount' => $item->amount,
                                'price' => $item->price,
                                'description' => $item->description,
                            ];
                        })
                    ];
                });

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'games' => $games->keys(),
                        'items' => $formattedGames
                    ]
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve games list'
            ], 500);
        }
    }

    // Token Listrik
    public function listTokenListrik(Request $request): JsonResponse
    {
        try {
            $cacheKey = 'token_listrik_list_' . md5(json_encode($request->all()));

            return Cache::remember($cacheKey, 3600, function () use ($request) {
                $tokens = TokenListrik::where('is_active', true)
                    ->when($request->has('min_nominal'), function ($query) use ($request) {
                        return $query->where('nominal', '>=', $request->min_nominal);
                    })
                    ->when($request->has('max_nominal'), function ($query) use ($request) {
                        return $query->where('nominal', '<=', $request->max_nominal);
                    })
                    ->orderBy('nominal')
                    ->get();

                // Transform the data for frontend
                $formattedTokens = $tokens->map(function ($token) {
                    return [
                        'id' => $token->id,
                        'nominal' => $token->nominal,
                        'price' => $token->price,
                        'description' => $token->description,
                    ];
                });

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'tokens' => $formattedTokens
                    ]
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve token listrik list'
            ], 500);
        }
    }

    // Get Product Details
    public function getProductDetails(string $type, $id): JsonResponse
    {
        try {
            $model = match($type) {
                'pulsa' => Pulsa::class,
                'kuota' => Kuota::class,
                'game' => Game::class,
                'token-listrik' => TokenListrik::class,
                default => throw new \InvalidArgumentException('Invalid product type')
            };

            $product = $model::where('id', $id)
                            ->where('is_active', true)
                            ->firstOrFail();

            return response()->json([
                'status' => 'success',
                'data' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found'
            ], 404);
        }
    }
}
