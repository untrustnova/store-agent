<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\UserResource;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminController extends Controller
{
    public function users(): AnonymousResourceCollection
    {
        $users = User::where('role', 'agent')->paginate();
        return UserResource::collection($users);
    }

    public function toggleUserStatus(User $user): JsonResponse
    {
        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'User status updated successfully',
            'data' => [
                'user' => new UserResource($user)
            ]
        ]);
    }

    public function transactions(): AnonymousResourceCollection
    {
        $transactions = Transaction::with('user')->latest()->paginate();
        return TransactionResource::collection($transactions);
    }

    public function transactionSummary(): JsonResponse
    {
        $summary = Transaction::selectRaw('
            COUNT(*) as total_transactions,
            SUM(CASE WHEN payment_status = "paid" THEN 1 ELSE 0 END) as paid_transactions,
            SUM(CASE WHEN payment_status = "paid" THEN total_amount ELSE 0 END) as total_amount,
            SUM(CASE WHEN payment_status = "paid" THEN admin_fee ELSE 0 END) as total_fees
        ')->first();

        return response()->json($summary);
    }

    public function dashboard(): JsonResponse
    {
        $totalAgents = User::where('role', 'agent')->count();
        $activeAgents = User::where('role', 'agent')->where('is_active', true)->count();

        $today = now()->startOfDay();
        $todayTransactions = Transaction::where('created_at', '>=', $today)
            ->selectRaw('
                COUNT(*) as count,
                SUM(CASE WHEN payment_status = "paid" THEN total_amount ELSE 0 END) as total_amount
            ')->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Dashboard data retrieved successfully',
            'data' => [
                'total_agents' => $totalAgents,
                'active_agents' => $activeAgents,
                'today_transactions' => $todayTransactions->count,
                'today_amount' => $todayTransactions->total_amount ?? 0,
            ]
        ]);
    }
}
