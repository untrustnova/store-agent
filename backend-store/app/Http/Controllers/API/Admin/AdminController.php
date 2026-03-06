<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\UserResource;
use App\Http\Traits\ApiResponse;
use App\Models\Transaction;
use App\Models\User;
use App\Enums\PaymentStatus;
use App\Enums\TransactionStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    use ApiResponse;

    public function dashboard(): JsonResponse
    {
        $totalAgents = User::where('role', 'agent')->count();
        $activeAgents = User::where('role', 'agent')->where('is_active', true)->count();

        $today = now()->startOfDay();
        $todayTransactions = Transaction::where('created_at', '>=', $today)
            ->selectRaw('
                COUNT(*) as count,
                SUM(CASE WHEN payment_status = ? THEN total_amount ELSE 0 END) as total_amount
            ', [PaymentStatus::PAID->value])->first();

        return $this->successResponse([
            'total_agents' => $totalAgents,
            'active_agents' => $activeAgents,
            'today_transactions' => (int) $todayTransactions->count,
            'today_amount' => (float) ($todayTransactions->total_amount ?? 0),
        ], 'Dashboard data retrieved successfully');
    }

    public function users(): JsonResponse
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

    public function toggleUserStatus(User $user): JsonResponse
    {
        $user->is_active = !$user->is_active;
        $user->save();

        return $this->successResponse(new UserResource($user), 'User status updated successfully');
    }

    public function transactions(): JsonResponse
    {
        $transactions = Transaction::with('user')->latest()->paginate();
        return $this->successResponse([
            'transactions' => TransactionResource::collection($transactions),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'total' => $transactions->total(),
            ]
        ]);
    }

    public function transactionSummary(): JsonResponse
    {
        $summary = Transaction::selectRaw('
            COUNT(*) as total_transactions,
            SUM(CASE WHEN payment_status = ? THEN 1 ELSE 0 END) as paid_transactions,
            SUM(CASE WHEN payment_status = ? THEN total_amount ELSE 0 END) as total_amount,
            SUM(CASE WHEN payment_status = ? THEN admin_fee ELSE 0 END) as total_fees
        ', [
            PaymentStatus::PAID->value,
            PaymentStatus::PAID->value,
            PaymentStatus::PAID->value
        ])->first();

        return $this->successResponse($summary);
    }

    public function payments(): JsonResponse
    {
        $transactions = Transaction::with('user')
            ->where('payment_method', 'cash')
            ->latest()
            ->paginate();

        return $this->successResponse([
            'payments' => TransactionResource::collection($transactions),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'total' => $transactions->total(),
            ]
        ]);
    }

    public function approvePayment(Transaction $transaction): JsonResponse
    {
        if ($transaction->payment_method->value !== 'cash') {
            return $this->errorResponse('Only cash payments can be approved', 400);
        }

        $transaction->payment_status = PaymentStatus::PAID;
        $transaction->status = TransactionStatus::COMPLETED;
        $transaction->paid_at = now();
        $transaction->save();

        return $this->successResponse(new TransactionResource($transaction), 'Payment approved successfully');
    }

    public function rejectPayment(Transaction $transaction): JsonResponse
    {
        if ($transaction->payment_method->value !== 'cash') {
            return $this->errorResponse('Only cash payments can be rejected', 400);
        }

        $transaction->payment_status = PaymentStatus::FAILED;
        $transaction->status = TransactionStatus::FAILED;
        $transaction->save();

        return $this->successResponse(new TransactionResource($transaction), 'Payment rejected successfully');
    }
}
