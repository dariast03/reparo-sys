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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('product_categories')->restrictOnDelete();
            $table->string('code', 50)->nullable();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->string('brand', 100)->nullable();
            $table->string('compatible_model', 100)->nullable();
            $table->integer('current_stock')->default(0);
            $table->integer('minimum_stock')->default(0);
            $table->decimal('purchase_price', 10, 2)->default(0.00);
            $table->decimal('sale_price', 10, 2)->default(0.00);
            $table->decimal('profit_margin', 5, 2)->default(0.00);
            $table->enum('product_type', ['part', 'accessory', 'tool', 'consumable', 'other']);
            $table->string('physical_location', 100)->nullable();
            $table->enum('status', ['active', 'inactive', 'discontinued'])->default('active');
            $table->timestamps();

            // Indices
            $table->index('code', 'idx_product_code');
            $table->index('name', 'idx_product_name');
            $table->index('current_stock', 'idx_product_stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
