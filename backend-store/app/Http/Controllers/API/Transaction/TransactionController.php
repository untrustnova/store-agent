<?php

namespace App\Http\Controllers\API\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Traits\ApiResponse;
use App\Models\Transaction;
use App\Services\MidtransService;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    use ApiResponse;

    protected TransactionService $transactionService;
    protected MidtransService $midtransService;

    public function __construct(TransactionService $transactionService, MidtransService $midtransService)
    {
        $this->transactionService = $transactionService;
        $this->midtransService = $midtransService;
    }

    public function create(StoreTransactionRequest $request): JsonResponse
    {
        try {
            $transaction = $this->transactionService->createTransaction($request->user(), $request->validated());

            return $this->successResponse([
                'transaction' => new TransactionResource($transaction),
                'snap_token' => $transaction->snap_token,
            ], 'Transaction created successfully', 201);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Exception $e) {
            Log::error('Transaction Creation Error', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id
            ]);
            return $this->errorResponse('Failed to create transaction: ' . $e->getMessage(), 500);
        }
    }

    public function history(Request $request): JsonResponse
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->latest()
            ->paginate();

        return $this->successResponse([
            'transactions' => TransactionResource::collection($transactions),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'total' => $transactions->total(),
            ]
        ], 'Transaction history retrieved successfully');
    }

    public function show(Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return $this->errorResponse('Unauthorized access to transaction', 403);
        }

        return $this->successResponse(new TransactionResource($transaction->load('user')));
    }

    public function notification(Request $request): JsonResponse
    {
        try {
            Log::info('💰 Midtrans Notification Received', $request->all());

            $this->transactionService->handleNotification($request->all());

            return $this->successResponse(null, 'Notification handled successfully');
        } catch (\Exception $e) {
            Log::error('Notification Error', [
                'message' => $e->getMessage(),
                'payload' => $request->all()
            ]);

            return $this->errorResponse('Error processing notification: ' . $e->getMessage(), 500);
        }
    }

    public function checkPaymentStatus(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return $this->errorResponse('Unauthorized access to transaction', 403);
        }

        try {
            $result = $this->midtransService->verifyPayment($transaction->reference_id);

            if ($result['status'] === 'success') {
                $midtransStatus = strtolower($result['data']['transaction_status'] ?? 'error');
                $this->transactionService->updateTransactionStatus($transaction, $midtransStatus, $result['data']['transaction_id'] ?? null);
            }

            return $this->successResponse([
                'transaction' => new TransactionResource($transaction->fresh()),
                'midtrans_status' => $result['data']['transaction_status'] ?? 'unknown'
            ], 'Payment status retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to check payment status: ' . $e->getMessage(), 500);
        }
    }
}
