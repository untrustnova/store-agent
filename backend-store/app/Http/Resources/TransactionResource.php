<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'type' => $this->type,
            'reference_id' => $this->reference_id,
            'amount' => $this->amount,
            'admin_fee' => $this->admin_fee,
            'total_amount' => $this->total_amount,
            'details' => $this->details,
            'payment_method' => $this->payment_method,
            'payment_reference' => $this->payment_reference,
            'payment_status' => $this->payment_status,
            'status' => $this->status,
            'paid_at' => $this->paid_at,
            'expired_at' => $this->expired_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
