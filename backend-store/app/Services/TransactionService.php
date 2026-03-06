<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;
use InvalidArgumentException;

class TransactionService
{
    protected MidtransService $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    public function createTransaction(User $user, array $data): Transaction
    {
        $type = TransactionType::from($data['type']);
        $paymentMethod = PaymentMethod::from($data['payment_method']);
        $amount = $data['amount'];
        $details = $data['details'];

        // Validate product and price
        $this->validateProduct($type, $details['product_id'], $amount);

        $adminFee = $this->calculateAdminFee($amount, $paymentMethod);
        $totalAmount = $amount + $adminFee;

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'type' => $type,
            'reference_id' => 'TRX-' . Str::upper(Str::random(8)),
            'amount' => $amount,
            'admin_fee' => $adminFee,
            'total_amount' => $totalAmount,
            'details' => $details,
            'payment_method' => $paymentMethod,
            'expired_at' => $paymentMethod === PaymentMethod::CASH ? null : Carbon::now()->addDay(),
            'status' => TransactionStatus::PENDING,
            'payment_status' => PaymentStatus::PENDING,
        ]);

        if ($paymentMethod !== PaymentMethod::CASH) {
            $midtransParams = $this->prepareMidtransParams($transaction);
            $result = $this->midtransService->createTransaction($midtransParams);

            if ($result['status'] === 'error') {
                throw new \Exception('Midtrans Error: ' . $result['message']);
            }

            $transaction->snap_token = $result['token'];
            $transaction->save();
        }

        return $transaction;
    }

    protected function validateProduct(TransactionType $type, int $productId, float $amount): void
    {
        $product = match($type) {
            TransactionType::PULSA => \App\Models\Pulsa::find($productId),
            TransactionType::KUOTA => \App\Models\Kuota::find($productId),
            TransactionType::GAME => \App\Models\Game::find($productId),
            TransactionType::TOKEN_LISTRIK => \App\Models\TokenListrik::find($productId),
            default => null
        };

        if (!$product) {
            throw new InvalidArgumentException('Product not found');
        }

        if (!$product->is_active) {
            throw new InvalidArgumentException('Product is not active');
        }

        if ((float) $product->price !== (float) $amount) {
            throw new InvalidArgumentException('Invalid amount for the selected product');
        }
    }

    public function calculateAdminFee(float $amount, PaymentMethod $paymentMethod): float
    {
        $config = config('midtrans.payment_methods.' . $paymentMethod->value);

        if (!$config) {
            return 0;
        }

        $fee = 0;
        if (isset($config['fee'])) {
            $fee = $config['fee'];
        } elseif (isset($config['fee_percentage'])) {
            $fee = $amount * $config['fee_percentage'];
        }

        return round((float) $fee, 2);
    }

    protected function prepareMidtransParams(Transaction $transaction): array
    {
        return [
            'transaction_details' => [
                'order_id' => $transaction->reference_id,
                'gross_amount' => (float) $transaction->total_amount,
            ],
            'customer_details' => [
                'first_name' => $transaction->user->name,
                'email' => $transaction->user->email,
                'phone' => $transaction->user->phone_number,
            ],
            'item_details' => $this->getItemDetails($transaction),
            'callbacks' => [
                'finish' => config('midtrans.finish_url'),
                'error' => config('midtrans.error_url'),
                'pending' => config('midtrans.pending_url')
            ],
        ];
    }

    protected function getItemDetails(Transaction $transaction): array
    {
        $product = match($transaction->type) {
            TransactionType::PULSA => \App\Models\Pulsa::find($transaction->details['product_id']),
            TransactionType::KUOTA => \App\Models\Kuota::find($transaction->details['product_id']),
            TransactionType::GAME => \App\Models\Game::find($transaction->details['product_id']),
            TransactionType::TOKEN_LISTRIK => \App\Models\TokenListrik::find($transaction->details['product_id']),
            default => null
        };

        $items = [];

        if ($product) {
            $itemName = match($transaction->type) {
                TransactionType::PULSA => "Pulsa {$product->provider} - {$product->nominal}",
                TransactionType::KUOTA => "Paket {$product->provider} - {$product->package_name}",
                TransactionType::GAME => "{$product->game_name} - {$product->item_type} {$product->amount}",
                TransactionType::TOKEN_LISTRIK => "Token Listrik {$product->nominal}",
                default => ucfirst($transaction->type->value) . ' Transaction'
            };

            $items[] = [
                'id' => $transaction->type->value . '_' . $product->id,
                'price' => (float) $transaction->amount,
                'quantity' => 1,
                'name' => $itemName,
            ];
        } else {
            $items[] = [
                'id' => $transaction->type->value,
                'price' => (float) $transaction->amount,
                'quantity' => 1,
                'name' => ucfirst($transaction->type->value) . ' Transaction',
            ];
        }

        // Add admin fee as item
        if ($transaction->admin_fee > 0) {
            $items[] = [
                'id' => 'admin_fee',
                'price' => (float) $transaction->admin_fee,
                'quantity' => 1,
                'name' => 'Admin Fee',
            ];
        }

        return $items;
    }

    public function handleNotification(array $payload): void
    {
        $orderId = $payload['order_id'];
        $transaction = Transaction::where('reference_id', $orderId)->first();

        if (!$transaction) {
            throw new \Exception('Transaction not found: ' . $orderId);
        }

        // Verify signature
        $serverKey = config('midtrans.server_key');
        $statusCode = $payload['status_code'];
        $grossAmount = $payload['gross_amount'];
        $signature = $payload['signature_key'];
        $mySignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($signature !== $mySignature) {
            throw new \Exception('Invalid Midtrans signature');
        }

        $midtransStatus = strtolower($payload['transaction_status'] ?? 'error');
        $this->updateTransactionStatus($transaction, $midtransStatus, $payload['transaction_id'] ?? null);
    }

    public function updateTransactionStatus(Transaction $transaction, string $midtransStatus, ?string $paymentReference = null): void
    {
        $oldPaymentStatus = $transaction->payment_status;

        if (in_array($midtransStatus, ['capture', 'settlement'])) {
            $transaction->payment_status = PaymentStatus::PAID;
            $transaction->status = TransactionStatus::COMPLETED;
            $transaction->payment_reference = $paymentReference;
            $transaction->paid_at = $transaction->paid_at ?? now();
        } elseif (in_array($midtransStatus, ['cancel', 'deny'])) {
            $transaction->payment_status = PaymentStatus::FAILED;
            $transaction->status = TransactionStatus::FAILED;
        } elseif ($midtransStatus === 'expire') {
            $transaction->payment_status = PaymentStatus::EXPIRED;
            $transaction->status = TransactionStatus::FAILED;
        } elseif ($midtransStatus === 'refund') {
            $transaction->payment_status = PaymentStatus::REFUNDED;
            $transaction->status = TransactionStatus::REFUNDED;
        }

        if ($transaction->isDirty()) {
            $transaction->save();
        }
    }
}
