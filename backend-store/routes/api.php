<?php

use App\Http\Controllers\API\Admin\AdminController;
use App\Http\Controllers\API\Admin\AdminResourceController;
use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\API\Transaction\ServiceController;
use App\Http\Controllers\API\Transaction\TransactionController;
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
        Route::get('/{transaction}/check-status', [TransactionController::class, 'checkPaymentStatus'])->name('transactions.check-payment-status');
    });

    // Service Routes
    Route::prefix('services')->group(function () {
        Route::get('/cities', [ServiceController::class, 'cities'])->name('services.cities');
        Route::get('/e-wallets', [ServiceController::class, 'eWallets'])->name('services.ewallets');
        Route::post('/validate-bus-route', [ServiceController::class, 'validateBusRoute'])->name('services.validate-bus');
        Route::post('/validate-ewallet-number', [ServiceController::class, 'validateEWalletNumber'])->name('services.validate-ewallet');
        Route::post('/validate-phone-number', [ServiceController::class, 'validatePhoneNumber'])->name('services.validate-phone');
        Route::post('/validate-game-account', [ServiceController::class, 'validateGameAccount'])->name('services.validate-game');
        Route::post('/validate-token-meter', [ServiceController::class, 'validateTokenMeter'])->name('services.validate-token');
    });

    // Admin Routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Dashboard & Reports
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
        Route::get('/transactions', [AdminController::class, 'transactions'])->name('admin.transactions');
        Route::get('/transaction-summary', [AdminController::class, 'transactionSummary'])->name('admin.transaction-summary');

        // User Management
        Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
        Route::post('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('admin.users.toggle-status');
        Route::post('/users', [AdminResourceController::class, 'createUser'])->name('admin.users.create');
        Route::put('/users/{user}', [AdminResourceController::class, 'updateUser'])->name('admin.users.update');
        Route::delete('/users/{user}', [AdminResourceController::class, 'deleteUser'])->name('admin.users.delete');

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
    });
});

// Midtrans Webhook
Route::post('/transactions/notification', [TransactionController::class, 'notification'])
    ->name('transactions.notification');
