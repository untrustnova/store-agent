<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Enums\TransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', new Enum(TransactionType::class)],
            'amount' => 'required|numeric|min:1000',
            'payment_method' => ['required', new Enum(PaymentMethod::class)],
            'details' => 'required|array',
            'details.product_id' => 'required|integer',
            'details.phone_number' => 'required_if:type,pulsa,kuota',
            'details.game_id' => 'required_if:type,game',
            'details.meter_number' => 'required_if:type,token_listrik',
        ];
    }
}
