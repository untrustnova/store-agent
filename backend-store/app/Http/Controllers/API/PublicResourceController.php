<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Pulsa;
use App\Models\Kuota;
use App\Models\Game;
use App\Models\TokenListrik;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicResourceController extends Controller
{
    use ApiResponse;

    public function listPulsa(Request $request): JsonResponse
    {
        try {
            $cacheKey = 'pulsa_list_' . md5(json_encode($request->all()));

            $data = Cache::remember($cacheKey, 3600, function () use ($request) {
                $query = Pulsa::where('is_active', true);

                if ($provider = $request->input('provider')) {
                    $query->where('provider', $provider);
                }

                $pulsa = $query->orderBy('provider')
                              ->orderBy('nominal')
                              ->get()
                              ->groupBy('provider');

                $formattedPulsa = $pulsa->map(function ($items) {
                    return [
                        'items' => $items->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'nominal' => $item->nominal,
                                'price' => (float) $item->price,
                                'description' => $item->description,
                            ];
                        })
                    ];
                });

                return [
                    'providers' => $pulsa->keys(),
                    'pulsa' => $formattedPulsa
                ];
            });

            return $this->successResponse($data, 'Pulsa list retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve pulsa list', 500);
        }
    }

    public function listKuota(Request $request): JsonResponse
    {
        try {
            $cacheKey = 'kuota_list_' . md5(json_encode($request->all()));

            $data = Cache::remember($cacheKey, 3600, function () use ($request) {
                $query = Kuota::where('is_active', true);

                if ($provider = $request->input('provider')) {
                    $query->where('provider', $provider);
                }

                $kuota = $query->orderBy('provider')
                              ->orderBy('price')
                              ->get()
                              ->groupBy('provider');

                $formattedKuota = $kuota->map(function ($items) {
                    return [
                        'items' => $items->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'package_name' => $item->package_name,
                                'data_amount' => $item->data_amount,
                                'validity_period' => $item->validity_period,
                                'price' => (float) $item->price,
                                'description' => $item->description,
                            ];
                        })
                    ];
                });

                return [
                    'providers' => $kuota->keys(),
                    'kuota' => $formattedKuota
                ];
            });

            return $this->successResponse($data, 'Kuota list retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve kuota list', 500);
        }
    }

    public function listGames(Request $request): JsonResponse
    {
        try {
            $cacheKey = 'games_list_' . md5(json_encode($request->all()));

            $data = Cache::remember($cacheKey, 3600, function () use ($request) {
                $query = Game::where('is_active', true);

                if ($gameName = $request->input('game_name')) {
                    $query->where('game_name', $gameName);
                }

                $games = $query->orderBy('game_name')
                             ->orderBy('price')
                             ->get()
                             ->groupBy('game_name');

                $formattedGames = $games->map(function ($items) {
                    return [
                        'items' => $items->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'item_type' => $item->item_type,
                                'amount' => $item->amount,
                                'price' => (float) $item->price,
                                'description' => $item->description,
                            ];
                        })
                    ];
                });

                return [
                    'games' => $games->keys(),
                    'items' => $formattedGames
                ];
            });

            return $this->successResponse($data, 'Games list retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve games list', 500);
        }
    }

    public function listTokenListrik(Request $request): JsonResponse
    {
        try {
            $cacheKey = 'token_listrik_list_' . md5(json_encode($request->all()));

            $data = Cache::remember($cacheKey, 3600, function () use ($request) {
                $tokens = TokenListrik::where('is_active', true)
                    ->when($request->has('min_nominal'), function ($query) use ($request) {
                        return $query->where('nominal', '>=', $request->min_nominal);
                    })
                    ->when($request->has('max_nominal'), function ($query) use ($request) {
                        return $query->where('nominal', '<=', $request->max_nominal);
                    })
                    ->orderBy('nominal')
                    ->get();

                return [
                    'tokens' => $tokens->map(function ($token) {
                        return [
                            'id' => $token->id,
                            'nominal' => $token->nominal,
                            'price' => (float) $token->price,
                            'description' => $token->description,
                        ];
                    })
                ];
            });

            return $this->successResponse($data, 'Token listrik list retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve token listrik list', 500);
        }
    }

    public function getProductDetails(string $type, $id): JsonResponse
    {
        try {
            $model = match($type) {
                'pulsa' => Pulsa::class,
                'kuota' => Kuota::class,
                'game' => Game::class,
                'token-listrik' => TokenListrik::class,
                default => null
            };

            if (!$model) {
                return $this->errorResponse('Invalid product type', 400);
            }

            $product = $model::where('id', $id)
                            ->where('is_active', true)
                            ->firstOrFail();

            return $this->successResponse($product);
        } catch (\Exception $e) {
            return $this->errorResponse('Product not found', 404);
        }
    }
}
