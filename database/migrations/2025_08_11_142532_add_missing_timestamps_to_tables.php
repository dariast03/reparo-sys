<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn('created_at');
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropColumn('created_at');
        });

        Schema::table('order_parts', function (Blueprint $table) {
            $table->dropColumn('created_at');
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn('created_at');
        });
    }
};
