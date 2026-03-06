<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case BANK_TRANSFER = 'bank_transfer';
    case VIRTUAL_ACCOUNT = 'virtual_account';
    case EWALLET = 'ewallet';
    case QRIS = 'qris';
    case CASH = 'cash';
}
