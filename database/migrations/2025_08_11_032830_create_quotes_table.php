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
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('quote_number', 20)->unique();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('repair_order_id')->nullable()->constrained('repair_orders')->nullOnDelete();
            $table->text('work_description');
            $table->decimal('labor_cost', 10, 2)->default(0.00);
            $table->decimal('parts_cost', 10, 2)->default(0.00);
            $table->decimal('additional_cost', 10, 2)->default(0.00);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('taxes', 10, 2)->default(0.00);
            $table->decimal('total', 10, 2);
            $table->integer('validity_days')->default(15);
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('quote_date')->useCurrent();
            $table->date('expiry_date');
            $table->dateTime('response_date')->nullable();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            // Indices
            $table->index('quote_number', 'idx_quote_number');
            $table->index('status', 'idx_quote_status');
            $table->index('quote_date', 'idx_quote_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
