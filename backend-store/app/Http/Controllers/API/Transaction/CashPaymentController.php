<?php

namespace App\Http\Controllers\API\Transaction;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CashPaymentController extends Controller
{
    /**
     * Proses pembayaran cash
     */
    public function process(Request $request, Transaction $transaction): JsonResponse
    {
        // Verifikasi akses
        if ($transaction->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Verifikasi metode pembayaran
        if ($transaction->payment_method !== 'cash') {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid payment method'
            ], 400);
        }

        try {
            // Log pembayaran cash
            Log::info('💵 Processing cash payment', [
                'transaction_id' => $transaction->id,
                'reference_id' => $transaction->reference_id,
                'amount' => $transaction->total_amount
            ]);

            // Update status transaksi
            $transaction->payment_status = 'paid';
            $transaction->status = 'completed';
            $transaction->payment_reference = 'CASH-' . $transaction->reference_id;
            $transaction->save();

            Log::info('✅ Cash payment processed successfully', [
                'reference_id' => $transaction->reference_id,
                'status' => $transaction->status,
                'payment_status' => $transaction->payment_status
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Cash payment processed successfully',
                'data' => [
                    'transaction' => $transaction,
                    'payment_reference' => $transaction->payment_reference
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Error processing cash payment', [
                'reference_id' => $transaction->reference_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error processing cash payment'
            ], 500);
        }
    }

    /**
     * Konfirmasi pembayaran cash oleh admin
     */
    public function confirm(Request $request, Transaction $transaction): JsonResponse
    {
        // Hanya admin yang bisa konfirmasi
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Log konfirmasi pembayaran
            Log::info('👨‍💼 Admin confirming cash payment', [
                'admin_id' => $request->user()->id,
                'transaction_id' => $transaction->id,
                'reference_id' => $transaction->reference_id
            ]);

            // Update status transaksi
            $transaction->payment_status = 'paid';
            $transaction->status = 'completed';
            $transaction->save();

            Log::info('✅ Cash payment confirmed by admin', [
                'reference_id' => $transaction->reference_id,
                'status' => $transaction->status,
                'payment_status' => $transaction->payment_status
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Cash payment confirmed successfully',
                'data' => [
                    'transaction' => $transaction
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Error confirming cash payment', [
                'reference_id' => $transaction->reference_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error confirming cash payment'
            ], 500);
        }
    }
}
