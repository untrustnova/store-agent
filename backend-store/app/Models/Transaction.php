<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'reference_id',
        'amount',
        'admin_fee',
        'total_amount',
        'details',
        'payment_method',
        'payment_reference',
        'payment_status',
        'status',
        'snap_token',
        'paid_at',
        'expired_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'admin_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'details' => 'array',
        'paid_at' => 'datetime',
        'expired_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // These relationships are not currently used in the current implementation
    // but kept for potential future bus route functionality
    public function fromCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'from_city_id');
    }

    public function toCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'to_city_id');
    }

    public function eWallet(): BelongsTo
    {
        return $this->belongsTo(EWallet::class);
    }
}
