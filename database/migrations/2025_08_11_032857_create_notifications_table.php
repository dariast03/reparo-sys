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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('repair_order_id')->nullable()->constrained('repair_orders')->nullOnDelete();
            $table->enum('type', ['email', 'sms', 'push', 'system']);
            $table->string('subject', 200);
            $table->text('message');
            $table->string('recipient_email', 100)->nullable();
            $table->string('recipient_phone', 20)->nullable();
            $table->enum('status', ['pending', 'sent', 'failed', 'read'])->default('pending');
            $table->dateTime('scheduled_date');
            $table->dateTime('sent_date')->nullable();
            $table->integer('send_attempts')->default(0);
            $table->text('error_message')->nullable();

            $table->timestamps();

            // Indices
            $table->index('status', 'idx_notification_status');
            $table->index('scheduled_date', 'idx_notification_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
