<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;

class MidtransService
{
    protected string $baseUrl;
    protected string $serverKey;
    protected bool $isProduction;

    public function __construct()
    {
        $this->serverKey = config('midtrans.server_key');
        $this->isProduction = config('midtrans.is_production');
        $this->baseUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap/v1'
            : 'https://app.sandbox.midtrans.com/snap/v1';
    }

    public function createTransaction(array $params): array
    {
        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->withOptions([
                    'verify' => false // Disable SSL verification temporarily
                ])
                ->post($this->baseUrl . '/transactions', $params);

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'token' => $response->json('token'),
                    'redirect_url' => $response->json('redirect_url')
                ];
            }

            return [
                'status' => 'error',
                'message' => $response->json('error_messages')[0] ?? 'Unknown error occurred'
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    public function verifyPayment(string $orderId): array
    {
        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->withOptions([
                    'verify' => false // Disable SSL verification temporarily
                ])
                ->get($this->baseUrl . "/transactions/{$orderId}/status");

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'data' => $response->json()
                ];
            }

            return [
                'status' => 'error',
                'message' => $response->json('error_messages')[0] ?? 'Unknown error occurred'
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}
