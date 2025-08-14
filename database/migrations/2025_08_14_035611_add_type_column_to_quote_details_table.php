<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('quote_details', function (Blueprint $table) {
            // Check if column doesn't exist before adding it
            if (!Schema::hasColumn('quote_details', 'type')) {
                $table->enum('type', ['product', 'labor', 'service'])->default('product')->after('total_price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quote_details', function (Blueprint $table) {
            if (Schema::hasColumn('quote_details', 'type')) {
                $table->dropColumn('type');
            }
        });
    }
};
