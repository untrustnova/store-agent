<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update enum values for transactions.type to align with frontend/backend code
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('bus','ewallet','pulsa','kuota','game','token_listrik') NOT NULL");
    }

    public function down(): void
    {
        // Revert to previous enum definition if needed
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('bus','ewallet','internet','game','token','pulsa') NOT NULL");
    }
};


