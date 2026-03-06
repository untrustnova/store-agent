<?php

namespace App\Enums;

enum TransactionType: string
{
    case BUS = 'bus';
    case EWALLET = 'ewallet';
    case PULSA = 'pulsa';
    case KUOTA = 'kuota';
    case GAME = 'game';
    case TOKEN_LISTRIK = 'token_listrik';
}
