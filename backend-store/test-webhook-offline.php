<?php

/**
 * Script Testing Webhook Midtrans (Offline Mode)
 *
 * Script ini untuk testing webhook notification dari Midtrans
 * tanpa perlu menjalankan server Laravel
 */

// Konfigurasi
$webhookUrl = 'http://localhost:8000/api/transactions/notification';
$serverKey = 'YOUR_MIDTRANS_SERVER_KEY'; // Ganti dengan server key yang sebenarnya

// Data transaksi test
$orderId = 'TEST-' . time();
$statusCode = '200';
$grossAmount = '50000';
$transactionId = 'TEST-TXN-' . time();

// Generate signature
$signature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

// Payload notification test
$payload = [
    'order_id' => $orderId,
    'transaction_status' => 'settlement', // atau 'capture'
    'status_code' => $statusCode,
    'gross_amount' => $grossAmount,
    'transaction_id' => $transactionId,
    'payment_type' => 'bank_transfer',
    'signature_key' => $signature,
    'transaction_time' => date('Y-m-d H:i:s'),
    'status_message' => 'Success'
];

echo "🧪 Testing Webhook Notification (Offline Mode)\n";
echo "=============================================\n";
echo "Webhook URL: {$webhookUrl}\n";
echo "Order ID: {$orderId}\n";
echo "Status: settlement\n";
echo "Amount: {$grossAmount}\n";
echo "Signature: {$signature}\n\n";

echo "📋 Payload yang akan dikirim:\n";
echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

echo "🔧 Untuk testing webhook ini:\n";
echo "1. Jalankan server Laravel: php artisan serve\n";
echo "2. Buka terminal baru dan jalankan: php test-webhook.php\n";
echo "3. Atau gunakan tools seperti Postman/Insomnia\n\n";

echo "📝 Contoh cURL command:\n";
echo "curl -X POST {$webhookUrl} \\\n";
echo "  -H \"Content-Type: application/json\" \\\n";
echo "  -H \"Accept: application/json\" \\\n";
echo "  -d '" . json_encode($payload) . "'\n\n";

echo "📊 Informasi tambahan:\n";
echo "- Server Key: {$serverKey}\n";
echo "- Timestamp: " . date('Y-m-d H:i:s') . "\n";
echo "- Signature Algorithm: SHA512\n";
echo "- Test Mode: Enabled\n";
