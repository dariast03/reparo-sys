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
        Schema::create('repair_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 20)->unique();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('reception_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('technician_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('brand_id')->constrained('brands')->restrictOnDelete();
            $table->foreignId('model_id')->constrained('models')->restrictOnDelete();
            $table->string('device_serial', 100)->nullable();
            $table->string('imei', 50)->nullable();
            $table->string('device_color', 50)->nullable();
            $table->string('unlock_pattern', 100)->nullable();
            $table->text('problem_description');
            $table->text('customer_notes')->nullable();
            $table->text('technical_notes')->nullable();
            $table->text('initial_diagnosis')->nullable();
            $table->text('final_diagnosis')->nullable();
            $table->text('solution_applied')->nullable();
            $table->text('included_accessories')->nullable();
            $table->enum('status', [
                'received',
                'diagnosing',
                'waiting_parts',
                'repairing',
                'repaired',
                'unrepairable',
                'waiting_customer',
                'delivered',
                'cancelled'
            ])->default('received');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->decimal('diagnosis_cost', 10, 2)->default(0.00);
            $table->decimal('repair_cost', 10, 2)->default(0.00);
            $table->decimal('total_cost', 10, 2)->default(0.00);
            $table->decimal('advance_payment', 10, 2)->default(0.00);
            $table->decimal('pending_balance', 10, 2)->default(0.00);
            $table->timestamp('received_date')->useCurrent();
            $table->dateTime('promised_date')->nullable();
            $table->dateTime('diagnosis_date')->nullable();
            $table->dateTime('repair_date')->nullable();
            $table->dateTime('delivery_date')->nullable();
            $table->timestamps();

            // Indices
            $table->index('order_number', 'idx_order_number');
            $table->index('status', 'idx_order_status');
            $table->index('received_date', 'idx_order_date');
            $table->index('customer_id', 'idx_order_customer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repair_orders');
    }
};
