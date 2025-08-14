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
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('repair_order_id')->nullable()->constrained('repair_orders')->nullOnDelete();
            $table->enum('movement_type', ['in', 'out', 'adjustment', 'return']);
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2)->default(0.00);
            $table->decimal('total_cost', 10, 2)->default(0.00);
            $table->string('reason', 200)->nullable();
            $table->text('notes')->nullable();
            $table->integer('stock_before');
            $table->integer('stock_after');
            $table->timestamp('movement_date')->useCurrent();
            $table->timestamps();

            // Indices
            $table->index('movement_date', 'idx_movement_date');
            $table->index('product_id', 'idx_movement_product');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
