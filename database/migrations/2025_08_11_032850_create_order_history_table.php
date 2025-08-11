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
        Schema::create('order_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_order_id')->constrained('repair_orders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->enum('previous_status', [
                'received',
                'diagnosing',
                'waiting_parts',
                'repairing',
                'repaired',
                'unrepairable',
                'waiting_customer',
                'delivered',
                'cancelled'
            ])->nullable();
            $table->enum('new_status', [
                'received',
                'diagnosing',
                'waiting_parts',
                'repairing',
                'repaired',
                'unrepairable',
                'waiting_customer',
                'delivered',
                'cancelled'
            ]);
            $table->text('notes')->nullable();
            $table->timestamp('change_date')->useCurrent();

            $table->timestamps();

            // Indices
            $table->index('repair_order_id', 'idx_history_order');
            $table->index('change_date', 'idx_history_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_history');
    }
};
