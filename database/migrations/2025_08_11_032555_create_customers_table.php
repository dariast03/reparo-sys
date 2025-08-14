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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('document_number', 50)->nullable();
            $table->enum('document_type', [
                'ci',             // Cédula de Identidad
                'passport',       // Pasaporte
                'driver_license', // Licencia de Conducir
                'foreigner_id',   // Carnet de Extranjero
                'nit',            // Número de Identificación Tributaria
                'military_id',    // Libreta Militar
                'other'           // Otro
            ])->default('ci');

            $table->string('phone', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('address')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            // Indices
            $table->index('document_number', 'idx_customer_document');
            $table->index('phone', 'idx_customer_phone');
            $table->index('email', 'idx_customer_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
