<?php

namespace App\Http\Controllers\API\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\MidtransService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\User;
use Midtrans\Snap;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    protected MidtransService $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:bus,ewallet,internet,game,token,pulsa',
            'amount' => 'required|numeric|min:1000',
            'payment_method' => 'required|in:bank_transfer,virtual_account,ewallet,qris,cash',
            'details' => 'required|array',
        ]);

        $user = $request->user();
        $adminFee = $this->calculateAdminFee($request->amount, $request->payment_method);
        $totalAmount = $request->amount + $adminFee;

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'type' => $request->type,
            'reference_id' => 'TRX-' . Str::random(8),
            'amount' => $request->amount,
            'admin_fee' => $adminFee,
            'total_amount' => $totalAmount,
            'details' => $request->details,
            'payment_method' => $request->payment_method,
            'expired_at' => $request->payment_method === 'cash' ? null : Carbon::now()->addDay(),
            'status' => $request->payment_method === 'cash' ? 'pending' : 'pending',
            'payment_status' => $request->payment_method === 'cash' ? 'pending' : 'pending',
        ]);

        // Prepare Midtrans parameters
        $params = [
            'transaction_details' => [
                'order_id' => $transaction->reference_id,
                'gross_amount' => $transaction->total_amount,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone_number,
            ],
            'item_details' => [
                [
                    'id' => $transaction->type,
                    'price' => $transaction->amount,
                    'quantity' => 1,
                    'name' => ucfirst($transaction->type) . ' Transaction',
                ],
                [
                    'id' => 'admin_fee',
                    'price' => $transaction->admin_fee,
                    'quantity' => 1,
                    'name' => 'Admin Fee',
                ],
            ],
            'callbacks' => [
                'finish' => config('midtrans.finish_url'),
                'error' => config('midtrans.error_url'),
                'pending' => config('midtrans.pending_url')
            ],
        ];

        // Get snap token from Midtrans
        $result = $this->midtransService->createTransaction($params);

        if ($result['status'] === 'error') {
            return response()->json([
                'status' => 'error',
                'message' => $result['message']
            ], 500);
        }

        $transaction->snap_token = $result['token'];
        $transaction->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction created successfully',
            'data' => [
                'transaction' => new TransactionResource($transaction),
                'snap_token' => $result['token'],
                'redirect_url' => $result['redirect_url'],
            ]
        ], 201);
    }

    private function generateSnapToken(Transaction $transaction): string
    {
        $params = [
            'transaction_details' => [
                'order_id' => $transaction->reference_id,
                'gross_amount' => (int) $transaction->total_amount,
            ],
            'customer_details' => [
                'first_name' => $transaction->user->name,
                'email' => $transaction->user->email,
                'phone' => $transaction->user->phone_number,
            ],
            'item_details' => [
                [
                    'id' => $transaction->type,
                    'price' => (int) $transaction->amount,
                    'quantity' => 1,
                    'name' => ucfirst($transaction->type) . ' Transaction',
                ],
                [
                    'id' => 'admin_fee',
                    'price' => (int) $transaction->admin_fee,
                    'quantity' => 1,
                    'name' => 'Admin Fee',
                ],
            ],
            'expire_time' => $transaction->expired_at->format('Y-m-d H:i:s +0700'),
        ];

        return Snap::getSnapToken($params);
    }

    private function calculateAdminFee(float $amount, string $paymentMethod): float
    {
        $fee = match ($paymentMethod) {
            'bank_transfer' => 4000,
            'virtual_account' => 4500,
            'ewallet' => $amount * 0.015, // 1.5%
            'qris' => $amount * 0.007, // 0.7%
            default => 0,
        };

        return round($fee, 2);
    }

    public function notification(Request $request): JsonResponse
    {
        try {
            Log::info('💰 Midtrans Notification Received', [
                'payload' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            $notificationBody = $request->all();

            // Verify required fields
            if (!isset($notificationBody['order_id'])) {
                Log::error('❌ Order ID missing in notification');
                throw new \Exception('Order ID not found in notification');
            }

            // Find transaction
            $transaction = Transaction::where('reference_id', $notificationBody['order_id'])->first();
            if (!$transaction) {
                Log::error('❌ Transaction not found', [
                    'order_id' => $notificationBody['order_id']
                ]);
                throw new \Exception('Transaction not found: ' . $notificationBody['order_id']);
            }

            Log::info('✅ Transaction found', [
                'transaction_id' => $transaction->id,
                'reference_id' => $transaction->reference_id,
                'current_status' => $transaction->status,
                'current_payment_status' => $transaction->payment_status
            ]);

            // Verify Midtrans signature
            $serverKey = config('midtrans.server_key');
            $orderId = $notificationBody['order_id'];
            $statusCode = $notificationBody['status_code'];
            $grossAmount = $notificationBody['gross_amount'];
            $signature = $notificationBody['signature_key'];

            $mySignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

            Log::info('🔐 Verifying signature', [
                'received_signature' => $signature,
                'calculated_signature' => $mySignature,
                'server_key_configured' => !empty($serverKey)
            ]);

            if ($signature !== $mySignature) {
                Log::error('❌ Invalid signature', [
                    'received_signature' => $signature,
                    'calculated_signature' => $mySignature
                ]);
                throw new \Exception('Invalid signature');
            }            $paymentStatus = strtolower($notificationBody['transaction_status'] ?? 'error');

            Log::info('💳 Processing payment status', [
                'transaction_status' => $paymentStatus,
                'payment_type' => $notificationBody['payment_type'] ?? 'unknown',
                'amount' => $notificationBody['gross_amount'] ?? 0
            ]);

            if ($paymentStatus === 'capture' || $paymentStatus === 'settlement') {
                $transaction->payment_status = 'paid';
                $transaction->status = 'complete';
                $transaction->payment_reference = $notificationBody['transaction_id'];
                Log::info('✅ Payment successful', [
                    'reference_id' => $transaction->reference_id,
                    'payment_reference' => $notificationBody['transaction_id']
                ]);
            } elseif (in_array($paymentStatus, ['cancel', 'deny'])) {
                $transaction->payment_status = 'failed';
                $transaction->status = 'failed';
                Log::info('❌ Payment failed', [
                    'reference_id' => $transaction->reference_id,
                    'reason' => $notificationBody['status_message'] ?? 'Unknown'
                ]);
            } elseif ($paymentStatus === 'expire') {
                $transaction->payment_status = 'expired';
                $transaction->status = 'failed';
                Log::info('⌛ Payment expired', [
                    'reference_id' => $transaction->reference_id
                ]);
            } elseif ($paymentStatus === 'refund') {
                $transaction->payment_status = 'refunded';
                $transaction->status = 'refunded';
                Log::info('💰 Payment refunded', [
                    'reference_id' => $transaction->reference_id
                ]);
            }

            $transaction->save();

            Log::info('✅ Transaction updated successfully', [
                'reference_id' => $transaction->reference_id,
                'new_status' => $transaction->status,
                'new_payment_status' => $transaction->payment_status
            ]);

            Log::info('Transaction updated', [
                'reference_id' => $transaction->reference_id,
                'status' => $transaction->status,
                'payment_status' => $transaction->payment_status
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Notification handled successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Notification Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error processing notification: ' . $e->getMessage()
            ], 500);
        }
    }

    public function checkPaymentStatus(Request $request, Transaction $transaction): JsonResponse
    {
        // Check if user has access to this transaction
        if ($transaction->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access to transaction'
            ], 403);
        }

        // Verify current payment status from Midtrans
        $result = $this->midtransService->verifyPayment($transaction->reference_id);

        if ($result['status'] === 'error') {
            return response()->json([
                'status' => 'error',
                'message' => $result['message']
            ], 500);
        }

        $paymentStatus = strtolower($result['data']['transaction_status'] ?? 'error');

        // Update transaction status if needed
        if ($paymentStatus !== $transaction->payment_status) {
            if ($paymentStatus === 'capture' || $paymentStatus === 'settlement') {
                $transaction->payment_status = 'paid';
                $transaction->status = 'complete';
                $transaction->payment_reference = $result['data']['transaction_id'];
            } elseif (in_array($paymentStatus, ['cancel', 'deny'])) {
                $transaction->payment_status = 'failed';
                $transaction->status = 'failed';
            } elseif ($paymentStatus === 'expire') {
                $transaction->payment_status = 'expired';
                $transaction->status = 'failed';
            } elseif ($paymentStatus === 'refund') {
                $transaction->payment_status = 'refunded';
                $transaction->status = 'refunded';
            }
            $transaction->save();
        }

        // Return updated transaction data
        return response()->json([
            'status' => 'success',
            'message' => 'Payment status retrieved successfully',
            'data' => [
                'transaction' => new TransactionResource($transaction),
                'payment_status' => $paymentStatus,
                'raw_status' => $result['data']
            ]
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->latest()
            ->paginate();

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction history retrieved successfully',
            'data' => [
                'transactions' => TransactionResource::collection($transactions)
            ]
        ]);
    }

    public function show(Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction->load('user');
        return response()->json([
            'status' => 'success',
            'message' => 'Transaction details retrieved successfully',
            'data' => [
                'transaction' => new TransactionResource($transaction),
            ]
        ]);
    }

    public function checkStatus(Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Process transaction based on type
        $result = match($transaction->type) {
            'bus' => $this->processBusTransaction($transaction),
            'ewallet' => $this->processEwalletTransaction($transaction),
            'internet', 'pulsa' => $this->processPulsaTransaction($transaction),
            'game' => $this->processGameTransaction($transaction),
            'token' => $this->processTokenTransaction($transaction),
            default => ['status' => 'unknown', 'message' => 'Unknown transaction type'],
        };

        return response()->json($result);
    }

    protected function processBusTransaction(Transaction $transaction): array
    {
        if ($transaction->payment_status !== 'paid') {
            return ['status' => 'pending', 'message' => 'Waiting for payment'];
        }

        $details = $transaction->details;

        // In a real application, you would call your bus booking service here
        return [
            'status' => 'success',
            'message' => 'Bus ticket booked successfully',
            'data' => [
                'ticket_number' => 'BUS-' . strtoupper(Str::random(8)),
                'passenger_name' => $details['passenger_name'] ?? 'N/A',
                'seat_number' => $details['seat_number'] ?? 'N/A',
                'departure_date' => $details['departure_date'] ?? 'N/A',
                'bus_name' => $details['bus_name'] ?? 'N/A'
            ]
        ];
    }

    protected function processEwalletTransaction(Transaction $transaction): array
    {
        if ($transaction->payment_status !== 'paid') {
            return ['status' => 'pending', 'message' => 'Waiting for payment'];
        }

        $details = $transaction->details;

        // In a real application, you would call your e-wallet service here
        return [
            'status' => 'success',
            'message' => 'E-wallet topped up successfully',
            'data' => [
                'reference' => 'EW-' . strtoupper(Str::random(8)),
                'ewallet_code' => $details['ewallet_code'] ?? 'N/A',
                'phone_number' => $details['phone_number'] ?? 'N/A',
                'amount' => $transaction->amount
            ]
        ];
    }

    protected function processPulsaTransaction(Transaction $transaction): array
    {
        if ($transaction->payment_status !== 'paid') {
            return ['status' => 'pending', 'message' => 'Waiting for payment'];
        }

        $details = $transaction->details;

        // In a real application, you would call your pulsa/data service here
        return [
            'status' => 'success',
            'message' => 'Pulsa/Data package purchased successfully',
            'data' => [
                'reference' => 'PLS-' . strtoupper(Str::random(8)),
                'phone_number' => $details['phone_number'] ?? 'N/A',
                'provider' => $details['provider'] ?? 'N/A',
                'package' => $details['package_name'] ?? 'N/A',
            ]
        ];
    }

    protected function processGameTransaction(Transaction $transaction): array
    {
        if ($transaction->payment_status !== 'paid') {
            return ['status' => 'pending', 'message' => 'Waiting for payment'];
        }

        $details = $transaction->details;

        // In a real application, you would call your game top-up service here
        return [
            'status' => 'success',
            'message' => 'Game currency purchased successfully',
            'data' => [
                'reference' => 'GAME-' . strtoupper(Str::random(8)),
                'game' => $details['game'] ?? 'N/A',
                'user_id' => $details['user_id'] ?? 'N/A',
                'server_id' => $details['server_id'] ?? 'N/A',
                'product' => $details['product_name'] ?? 'N/A'
            ]
        ];
    }

    protected function processTokenTransaction(Transaction $transaction): array
    {
        if ($transaction->payment_status !== 'paid') {
            return ['status' => 'pending', 'message' => 'Waiting for payment'];
        }

        $details = $transaction->details;

        // In a real application, you would call your PLN token service here
        $token = strtoupper(Str::random(20)); // This should come from PLN service

        return [
            'status' => 'success',
            'message' => 'Token generated successfully',
            'data' => [
                'reference' => 'TKN-' . strtoupper(Str::random(8)),
                'meter_number' => $details['meter_number'] ?? 'N/A',
                'customer_name' => $details['customer_name'] ?? 'N/A',
                'token' => $token,
                'amount' => $transaction->amount,
                'kwh_estimate' => $transaction->amount / 1445 // Approximate PLN rate
            ]
        ];
    }
}
