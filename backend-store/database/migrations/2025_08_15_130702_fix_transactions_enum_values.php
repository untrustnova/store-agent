<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Fix enum values for transactions.type to match current implementation
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('bus','ewallet','pulsa','kuota','game','token_listrik') NOT NULL");

        // Fix enum values for transactions.payment_method to include 'cash'
        DB::statement("ALTER TABLE transactions MODIFY COLUMN payment_method ENUM('bank_transfer','virtual_account','ewallet','qris','cash') NOT NULL");
    }

    public function down(): void
    {
        // Revert to previous enum definitions if needed
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('bus','ewallet','internet','game','token','pulsa') NOT NULL");
        DB::statement("ALTER TABLE transactions MODIFY COLUMN payment_method ENUM('bank_transfer','virtual_account','ewallet','qris') NOT NULL");
    }
};
