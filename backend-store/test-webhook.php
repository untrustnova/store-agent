<?php

/**
 * Script Testing Webhook Midtrans
 *
 * Gunakan script ini untuk testing webhook notification dari Midtrans
 * Pastikan server Laravel berjalan dan dapat diakses dari internet
 */

// Konfigurasi
$webhookUrl = 'http://localhost:8000/api/transactions/notification';
$serverKey = 'YOUR_MIDTRANS_SERVER_KEY'; // Ganti dengan server key yang sebenarnya

// Fungsi untuk mengecek apakah server berjalan
function checkServerStatus($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode > 0;
}

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

echo "🧪 Testing Webhook Notification\n";
echo "===============================\n";
echo "Webhook URL: {$webhookUrl}\n";
echo "Order ID: {$orderId}\n";
echo "Status: settlement\n";
echo "Amount: {$grossAmount}\n";
echo "Signature: {$signature}\n\n";

// Cek status server terlebih dahulu
echo "🔍 Checking server status...\n";
if (!checkServerStatus($webhookUrl)) {
    echo "❌ Server tidak dapat diakses!\n";
    echo "💡 Pastikan:\n";
    echo "   1. Server Laravel berjalan dengan perintah: php artisan serve\n";
    echo "   2. Port 8000 tidak diblokir oleh firewall\n";
    echo "   3. URL webhook sudah benar\n\n";
    echo "🚀 Untuk menjalankan server Laravel:\n";
    echo "   cd " . getcwd() . "\n";
    echo "   php artisan serve\n\n";
    exit(1);
}

echo "✅ Server dapat diakses\n\n";

try {
    // Kirim POST request ke webhook menggunakan cURL
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $webhookUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($error) {
        throw new Exception("cURL Error: " . $error);
    }

    echo "📤 Request sent successfully\n";
    echo "Status Code: " . $httpCode . "\n";
    echo "Response: " . $response . "\n\n";

    if ($httpCode >= 200 && $httpCode < 300) {
        echo "✅ Webhook processed successfully\n";
    } else {
        echo "❌ Webhook failed with status: " . $httpCode . "\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n📝 Note: Check Laravel logs for detailed information\n";
echo "Log file: storage/logs/laravel.log\n";
