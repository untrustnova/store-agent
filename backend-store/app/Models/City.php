<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'province',
        'has_bus_station',
    ];

    protected $casts = [
        'has_bus_station' => 'boolean',
    ];

    public function departureTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'from_city_id');
    }

    public function arrivalTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'to_city_id');
    }
}
