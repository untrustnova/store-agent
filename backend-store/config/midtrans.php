<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials and configuration for Midtrans
    | payment gateway. These values will be loaded from the .env file.
    |
    */

    // Midtrans API Credentials
    'server_key' => env('MIDTRANS_SERVER_KEY'),
    'client_key' => env('MIDTRANS_CLIENT_KEY'),
    'merchant_id' => env('MIDTRANS_MERCHANT_ID'),

    // Environment and App Settings
    'is_production' => env('MIDTRANS_PRODUCTION', false),

    // Callback URLs
    'finish_url' => env('MIDTRANS_FINISH_URL', 'https://yourfrontend.com/payment/finish'),
    'error_url' => env('MIDTRANS_ERROR_URL', 'https://yourfrontend.com/payment/error'),
    'pending_url' => env('MIDTRANS_PENDING_URL', 'https://yourfrontend.com/payment/pending'),
    'is_sanitized' => env('MIDTRANS_SANITIZED', true),
    'is_3ds' => env('MIDTRANS_3DS', true),

    // Application URL for Midtrans callbacks and redirects
    'app_url' => env('MIDTRANS_APP_URL', env('APP_URL')),
    'notification_url' => env('MIDTRANS_NOTIFICATION_URL'),

    // Default Settings
    'default_currency' => 'IDR',
    'payment_methods' => [
        'bank_transfer' => [
            'fee' => 4000,
            'name' => 'Bank Transfer'
        ],
        'virtual_account' => [
            'fee' => 4500,
            'name' => 'Virtual Account'
        ],
        'ewallet' => [
            'fee_percentage' => 0.015, // 1.5%
            'name' => 'E-Wallet'
        ],
        'qris' => [
            'fee_percentage' => 0.007, // 0.7%
            'name' => 'QRIS'
        ]
    ],

    // Default expiry settings
    'expiry' => [
        'duration' => 24, // in hours
        'unit' => 'hour'
    ],

    // Error message translations
    'error_messages' => [
        'general' => 'An error occurred while processing your payment.',
        'invalid_credentials' => 'Invalid payment credentials.',
        'transaction_expired' => 'Transaction has expired.',
        'transaction_not_found' => 'Transaction not found.',
        'payment_not_found' => 'Payment not found.',
        'invalid_signature' => 'Invalid signature.',
    ],

    // Status mapping
    'status_mapping' => [
        'pending' => ['pending'],
        'success' => ['capture', 'settlement'],
        'failed' => ['deny', 'cancel', 'failure'],
        'expired' => ['expire'],
        'refunded' => ['refund']
    ],
];
