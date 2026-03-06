<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;
use Illuminate\Support\Facades\Log;

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
            
        if (empty($this->serverKey)) {
            Log::warning('Midtrans Server Key is not configured.');
        }
    }

    public function createTransaction(array $params): array
    {
        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->post($this->baseUrl . '/transactions', $params);

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'token' => $response->json('token'),
                    'redirect_url' => $response->json('redirect_url')
                ];
            }

            Log::error('Midtrans API Error', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            return [
                'status' => 'error',
                'message' => $response->json('error_messages')[0] ?? 'Unknown Midtrans error'
            ];
        } catch (Exception $e) {
            Log::error('Midtrans Exception', ['message' => $e->getMessage()]);
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    public function verifyPayment(string $orderId): array
    {
        try {
            // Transaction status API uses different base URL usually, but for Snap it might be different.
            // Actually Midtrans Transaction Status API is:
            // https://api.sandbox.midtrans.com/v2/{order_id}/status
            
            $statusBaseUrl = $this->isProduction
                ? 'https://api.midtrans.com/v2'
                : 'https://api.sandbox.midtrans.com/v2';

            $response = Http::withBasicAuth($this->serverKey, '')
                ->get($statusBaseUrl . "/{$orderId}/status");

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'data' => $response->json()
                ];
            }

            return [
                'status' => 'error',
                'message' => $response->json('status_message') ?? 'Unknown error'
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}
