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
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_number', 20)->unique();
            $table->foreignId('supplier_id')->constrained('suppliers')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('taxes', 10, 2)->default(0.00);
            $table->decimal('total', 10, 2);
            $table->enum('status', ['pending', 'partial', 'received', 'cancelled'])->default('pending');
            $table->timestamp('order_date')->useCurrent();
            $table->date('promised_date')->nullable();
            $table->date('received_date')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indices
            $table->index('purchase_number', 'idx_purchase_number');
            $table->index('status', 'idx_purchase_status');
            $table->index('order_date', 'idx_purchase_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
