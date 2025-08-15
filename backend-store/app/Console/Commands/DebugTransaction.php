<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DebugTransaction extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transaction:debug {reference_id?} {--fix : Fix inconsistent transactions}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Debug transaction status and fix inconsistencies';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $referenceId = $this->argument('reference_id');
        $shouldFix = $this->option('fix');

        $this->info('🔍 Debugging Transactions...');
        $this->newLine();

        if ($referenceId) {
            $this->debugSpecificTransaction($referenceId, $shouldFix);
        } else {
            $this->debugAllTransactions($shouldFix);
        }

        return 0;
    }

    protected function debugSpecificTransaction(string $referenceId, bool $shouldFix): void
    {
        $transaction = Transaction::where('reference_id', $referenceId)->first();

        if (!$transaction) {
            $this->error("❌ Transaction with reference ID '{$referenceId}' not found");
            return;
        }

        $this->info("📋 Transaction Details:");
        $this->table(
            ['Field', 'Value'],
            [
                ['ID', $transaction->id],
                ['Reference ID', $transaction->reference_id],
                ['Type', $transaction->type],
                ['Amount', $transaction->amount],
                ['Total Amount', $transaction->total_amount],
                ['Payment Method', $transaction->payment_method],
                ['Payment Status', $transaction->payment_status],
                ['Status', $transaction->status],
                ['Created At', $transaction->created_at],
                ['Updated At', $transaction->updated_at],
            ]
        );

        if ($shouldFix) {
            $this->fixTransaction($transaction);
        }
    }

    protected function debugAllTransactions(bool $shouldFix): void
    {
        $this->info('📊 Transaction Summary:');

        // Count by status
        $statusCounts = Transaction::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $this->table(
            ['Status', 'Count'],
            $statusCounts->map(fn($item) => [$item->status, $item->count])
        );

        // Count by payment status
        $paymentStatusCounts = Transaction::selectRaw('payment_status, COUNT(*) as count')
            ->groupBy('payment_status')
            ->get();

        $this->newLine();
        $this->info('💳 Payment Status Summary:');
        $this->table(
            ['Payment Status', 'Count'],
            $paymentStatusCounts->map(fn($item) => [$item->payment_status, $item->count])
        );

        // Find inconsistent transactions
        $inconsistentTransactions = Transaction::where('payment_status', 'paid')
            ->where('status', 'pending')
            ->get();

        if ($inconsistentTransactions->count() > 0) {
            $this->newLine();
            $this->warn("⚠️  Found {$inconsistentTransactions->count()} inconsistent transactions:");
            $this->warn("   - payment_status = 'paid' but status = 'pending'");

            $this->table(
                ['ID', 'Reference ID', 'Type', 'Payment Status', 'Status'],
                $inconsistentTransactions->map(fn($tx) => [
                    $tx->id,
                    $tx->reference_id,
                    $tx->type,
                    $tx->payment_status,
                    $tx->status
                ])
            );

            if ($shouldFix) {
                $this->info('🔧 Fixing inconsistent transactions...');
                foreach ($inconsistentTransactions as $transaction) {
                    $this->fixTransaction($transaction);
                }
            }
        }

        // Find stuck pending transactions
        $stuckTransactions = Transaction::where('status', 'pending')
            ->where('created_at', '<', now()->subHours(1))
            ->get();

        if ($stuckTransactions->count() > 0) {
            $this->newLine();
            $this->warn("⏰ Found {$stuckTransactions->count()} transactions stuck in pending for more than 1 hour:");

            $this->table(
                ['ID', 'Reference ID', 'Type', 'Created At', 'Hours Ago'],
                $stuckTransactions->map(fn($tx) => [
                    $tx->id,
                    $tx->reference_id,
                    $tx->type,
                    $tx->created_at->format('Y-m-d H:i:s'),
                    $tx->created_at->diffInHours(now())
                ])
            );
        }
    }

    protected function fixTransaction(Transaction $transaction): void
    {
        $this->info("🔧 Fixing transaction {$transaction->reference_id}...");

        $oldStatus = $transaction->status;
        $oldPaymentStatus = $transaction->payment_status;

        // Fix inconsistent status
        if ($transaction->payment_status === 'paid' && $transaction->status === 'pending') {
            $transaction->status = 'completed';
            $this->info("   - Fixed: status 'pending' → 'completed'");
        }

        // Fix other inconsistencies
        if ($transaction->payment_status === 'failed' && $transaction->status === 'pending') {
            $transaction->status = 'failed';
            $this->info("   - Fixed: status 'pending' → 'failed'");
        }

        if ($transaction->payment_status === 'expired' && $transaction->status === 'pending') {
            $transaction->status = 'failed';
            $this->info("   - Fixed: status 'pending' → 'failed'");
        }

        if ($transaction->payment_status === 'refunded' && $transaction->status === 'pending') {
            $transaction->status = 'refunded';
            $this->info("   - Fixed: status 'pending' → 'refunded'");
        }

        if ($transaction->wasChanged()) {
            $transaction->save();
            $this->info("✅ Transaction fixed successfully");

            // Log the fix
            Log::info('Transaction status fixed by debug command', [
                'reference_id' => $transaction->reference_id,
                'old_status' => $oldStatus,
                'new_status' => $transaction->status,
                'old_payment_status' => $oldPaymentStatus,
                'new_payment_status' => $transaction->payment_status
            ]);
        } else {
            $this->info("ℹ️  No fixes needed for this transaction");
        }
    }
}
