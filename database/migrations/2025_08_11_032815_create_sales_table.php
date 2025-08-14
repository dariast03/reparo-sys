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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('sale_number', 20)->unique();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('seller_user_id')->constrained('users')->restrictOnDelete();
            $table->enum('sale_type', ['cash', 'credit'])->default('cash');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('taxes', 10, 2)->default(0.00);
            $table->decimal('total', 10, 2);
            $table->decimal('advance_payment', 10, 2)->default(0.00);
            $table->decimal('pending_balance', 10, 2)->default(0.00);
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->enum('payment_method', ['cash', 'card', 'transfer', 'qr', 'mixed'])->default('cash');
            $table->text('notes')->nullable();
            $table->timestamp('sale_date')->useCurrent();

            $table->timestamps();

            // Indices
            $table->index('sale_number', 'idx_sale_number');
            $table->index('sale_date', 'idx_sale_date');
            $table->index('status', 'idx_sale_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
