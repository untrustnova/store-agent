<?php

use App\Http\Controllers\API\Admin\AdminController;
use App\Http\Controllers\API\Admin\AdminResourceController;
use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\API\PublicResourceController;
use App\Http\Controllers\API\Transaction\ServiceController;
use App\Http\Controllers\API\Transaction\TransactionController;
use App\Http\Controllers\API\Transaction\CashPaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Payment Notification Route (No Auth Required)
Route::post('/transactions/notification', [TransactionController::class, 'notification'])
    ->name('transactions.notification')
    ->middleware('json');

// Auth Routes
Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');
Route::post('/auth/register', [AuthController::class, 'register'])->name('auth.register');

// Public Products Routes (No Auth Required)
Route::prefix('products')->group(function () {
    Route::get('/pulsa', [PublicResourceController::class, 'listPulsa'])->name('products.pulsa');
    Route::get('/kuota', [PublicResourceController::class, 'listKuota'])->name('products.kuota');
    Route::get('/games', [PublicResourceController::class, 'listGames'])->name('products.games');
    Route::get('/token-listrik', [PublicResourceController::class, 'listTokenListrik'])->name('products.token');
    Route::get('/{type}/{id}', [PublicResourceController::class, 'getProductDetails'])->name('products.details');
});

// Service Routes - Public Access (Read Only)
Route::prefix('services')->group(function () {
    Route::get('/cities', [ServiceController::class, 'cities'])->name('services.cities');
    Route::get('/e-wallets', [ServiceController::class, 'eWallets'])->name('services.ewallets');

    // Validation Routes
    Route::post('/validate-bus-route', [ServiceController::class, 'validateBusRoute'])->name('services.validate-bus');
    Route::post('/validate-ewallet-number', [ServiceController::class, 'validateEWalletNumber'])->name('services.validate-ewallet');
    Route::post('/validate-phone-number', [ServiceController::class, 'validatePhoneNumber'])->name('services.validate-phone');
    Route::post('/validate-game-account', [ServiceController::class, 'validateGameAccount'])->name('services.validate-game');
    Route::post('/validate-token-meter', [ServiceController::class, 'validateTokenMeter'])->name('services.validate-token');
});

Route::middleware('auth:sanctum')->group(function () {
    // Auth Routes
    Route::get('/auth/me', [AuthController::class, 'me'])->name('auth.me');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

    // Transaction Routes
    Route::prefix('transactions')->group(function () {
        Route::post('/', [TransactionController::class, 'create'])->name('transactions.create');
        Route::get('/history', [TransactionController::class, 'history'])->name('transactions.history');
        Route::get('/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
        Route::get('/{transaction}/status', [TransactionController::class, 'checkStatus'])->name('transactions.check-status');
        Route::get('/{transaction}/payment-status', [TransactionController::class, 'checkPaymentStatus'])->name('transactions.check-payment-status');

        // Cash Payment Routes
        Route::post('/{transaction}/cash/process', [CashPaymentController::class, 'process'])->name('transactions.cash.process');
        Route::post('/{transaction}/cash/confirm', [CashPaymentController::class, 'confirm'])->middleware('admin')->name('transactions.cash.confirm');
    });

    // Admin Routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Dashboard & Reports
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
        Route::get('/transactions', [AdminController::class, 'transactions'])->name('admin.transactions');
        Route::get('/transaction-summary', [AdminController::class, 'transactionSummary'])->name('admin.transaction-summary');

        // User Management
        Route::get('/users', [AdminResourceController::class, 'listUsers'])->name('admin.users.index');
        Route::post('/users', [AdminResourceController::class, 'createUser'])->name('admin.users.create');
        Route::put('/users/{user}', [AdminResourceController::class, 'updateUser'])->name('admin.users.update');
        Route::delete('/users/{user}', [AdminResourceController::class, 'deleteUser'])->name('admin.users.delete');
        Route::post('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('admin.users.toggle-status');

        // City Management
        Route::get('/cities', [AdminResourceController::class, 'listCities'])->name('admin.cities.index');
        Route::post('/cities', [AdminResourceController::class, 'createCity'])->name('admin.cities.create');
        Route::put('/cities/{city}', [AdminResourceController::class, 'updateCity'])->name('admin.cities.update');
        Route::delete('/cities/{city}', [AdminResourceController::class, 'deleteCity'])->name('admin.cities.delete');

        // E-Wallet Management
        Route::get('/e-wallets', [AdminResourceController::class, 'listEWallets'])->name('admin.ewallets.index');
        Route::post('/e-wallets', [AdminResourceController::class, 'createEWallet'])->name('admin.ewallets.create');
        Route::put('/e-wallets/{ewallet}', [AdminResourceController::class, 'updateEWallet'])->name('admin.ewallets.update');
        Route::delete('/e-wallets/{ewallet}', [AdminResourceController::class, 'deleteEWallet'])->name('admin.ewallets.delete');

        // Pulsa Management
        Route::get('/pulsa', [AdminResourceController::class, 'listPulsa'])->name('admin.pulsa.index');
        Route::post('/pulsa', [AdminResourceController::class, 'createPulsa'])->name('admin.pulsa.create');
        Route::put('/pulsa/{pulsa}', [AdminResourceController::class, 'updatePulsa'])->name('admin.pulsa.update');
        Route::delete('/pulsa/{pulsa}', [AdminResourceController::class, 'deletePulsa'])->name('admin.pulsa.delete');

        // Kuota Management
        Route::get('/kuota', [AdminResourceController::class, 'listKuota'])->name('admin.kuota.index');
        Route::post('/kuota', [AdminResourceController::class, 'createKuota'])->name('admin.kuota.create');
        Route::put('/kuota/{kuota}', [AdminResourceController::class, 'updateKuota'])->name('admin.kuota.update');
        Route::delete('/kuota/{kuota}', [AdminResourceController::class, 'deleteKuota'])->name('admin.kuota.delete');

        // Game Management
        Route::get('/games', [AdminResourceController::class, 'listGames'])->name('admin.games.index');
        Route::post('/games', [AdminResourceController::class, 'createGame'])->name('admin.games.create');
        Route::put('/games/{game}', [AdminResourceController::class, 'updateGame'])->name('admin.games.update');
        Route::delete('/games/{game}', [AdminResourceController::class, 'deleteGame'])->name('admin.games.delete');

        // Token Listrik Management
        Route::get('/token-listrik', [AdminResourceController::class, 'listTokenListrik'])->name('admin.token-listrik.index');
        Route::post('/token-listrik', [AdminResourceController::class, 'createTokenListrik'])->name('admin.token-listrik.create');
        Route::put('/token-listrik/{token}', [AdminResourceController::class, 'updateTokenListrik'])->name('admin.token-listrik.update');
        Route::delete('/token-listrik/{token}', [AdminResourceController::class, 'deleteTokenListrik'])->name('admin.token-listrik.delete');

        // Payment Management
        Route::get('/payments', [AdminController::class, 'payments'])->name('admin.payments.index');
        Route::post('/payments/{transaction}/approve', [AdminController::class, 'approvePayment'])->name('admin.payments.approve');
        Route::post('/payments/{transaction}/reject', [AdminController::class, 'rejectPayment'])->name('admin.payments.reject');
    });
});

// (Removed duplicate Midtrans Webhook; defined above with json middleware)
