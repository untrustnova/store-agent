# Troubleshooting Guide - Store Agent

## 🔴 Masalah: Status Transaksi Tetap "Pending" Meskipun Pembayaran Berhasil

### Deskripsi Masalah

Setelah pembayaran berhasil melalui Midtrans, status transaksi di database tetap "pending" dan tidak berubah menjadi "completed".

### Penyebab yang Ditemukan

#### 1. **Inkonsistensi Nama Status (FIXED ✅)**

-   **Migration** mendefinisikan status: `['pending', 'processing', 'completed', 'failed', 'refunded']`
-   **Beberapa controller** menggunakan `'completed'` (benar)
-   **Beberapa controller** menggunakan `'complete'` (salah - tidak ada dalam enum)

**File yang diperbaiki:**

-   `TransactionController.php` - Method `notification()` dan `checkPaymentStatus()`
-   `CashPaymentController.php` - Method `process()` dan `confirm()`

#### 2. **Webhook Notification Tidak Terkirim**

-   Midtrans tidak dapat mengirim notification ke endpoint webhook
-   Server Laravel tidak dapat diakses dari internet
-   Firewall atau security group memblokir request

#### 3. **Signature Verification Gagal**

-   Server key Midtrans tidak sesuai
-   Format signature tidak sesuai dengan yang diharapkan
-   Encoding atau hashing yang salah

#### 4. **Database Constraint Error**

-   Field status tidak sesuai dengan enum yang didefinisikan
-   Foreign key constraint error
-   Database connection issue

### Solusi yang Diterapkan

#### ✅ **Fix 1: Konsistensi Status**

```php
// SEBELUM (SALAH)
$transaction->status = 'complete';

// SESUDAH (BENAR)
$transaction->status = 'completed';
```

#### ✅ **Fix 2: Verifikasi Webhook Route**

```php
// Route sudah benar di api.php
Route::post('/transactions/notification', [TransactionController::class, 'notification'])
    ->name('transactions.notification')
    ->middleware('json');
```

#### ✅ **Fix 3: Logging yang Lengkap**

Semua proses webhook sudah dilengkapi dengan logging yang detail untuk debugging.

### Cara Testing dan Verifikasi

#### 1. **Test Webhook Manual**

```bash
# Jalankan script testing
php test-webhook.php
```

#### 2. **Cek Log Laravel**

```bash
# Monitor log real-time
tail -f storage/logs/laravel.log

# Cari log webhook
grep "Midtrans Notification" storage/logs/laravel.log
```

#### 3. **Verifikasi Database**

```sql
-- Cek status transaksi
SELECT id, reference_id, status, payment_status, created_at
FROM transactions
WHERE reference_id = 'YOUR_ORDER_ID';

-- Cek enum values
SHOW COLUMNS FROM transactions LIKE 'status';
```

#### 4. **Test Endpoint Webhook**

```bash
# Test dengan curl
curl -X POST http://localhost:8000/api/transactions/notification \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "TEST-123",
    "transaction_status": "settlement",
    "status_code": "200",
    "gross_amount": "50000",
    "signature_key": "test-signature"
  }'
```

### Checklist Verifikasi

-   [ ] **Status Enum**: Pastikan semua controller menggunakan `'completed'` bukan `'complete'`
-   [ ] **Webhook Route**: Route `/api/transactions/notification` dapat diakses
-   [ ] **Server Key**: Konfigurasi Midtrans server key sudah benar
-   [ ] **Database**: Migration sudah dijalankan dengan benar
-   [ ] **Logging**: Log webhook muncul di `storage/logs/laravel.log`
-   [ ] **Internet Access**: Server dapat diakses dari internet (untuk webhook Midtrans)

### Monitoring dan Alerting

#### 1. **Log Monitoring**

```bash
# Monitor error webhook
grep "Notification Error" storage/logs/laravel.log

# Monitor success webhook
grep "Payment successful" storage/logs/laravel.log
```

#### 2. **Database Monitoring**

```sql
-- Cek transaksi yang stuck di pending
SELECT COUNT(*) as pending_count
FROM transactions
WHERE status = 'pending'
AND created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- Cek transaksi yang payment_status paid tapi status masih pending
SELECT COUNT(*) as inconsistent_count
FROM transactions
WHERE payment_status = 'paid'
AND status = 'pending';
```

### Prevention

#### 1. **Unit Testing**

Buat test untuk memastikan status update berfungsi:

```php
public function test_webhook_updates_transaction_status()
{
    // Test webhook notification
    // Verify status berubah dari pending ke completed
}
```

#### 2. **Integration Testing**

Test integrasi dengan Midtrans sandbox environment.

#### 3. **Monitoring Dashboard**

Buat dashboard untuk monitoring status transaksi real-time.

### Support dan Escalation

Jika masalah masih berlanjut:

1. **Check Logs**: Periksa `storage/logs/laravel.log` untuk error detail
2. **Database Check**: Verifikasi data di database
3. **Midtrans Support**: Hubungi support Midtrans untuk verifikasi webhook
4. **Network Check**: Pastikan server dapat diakses dari internet

### Referensi

-   [Midtrans Webhook Documentation](https://docs.midtrans.com/docs/webhook)
-   [Laravel Logging](https://laravel.com/docs/logging)
-   [Database Migrations](https://laravel.com/docs/migrations)
