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
        Schema::table('products', function (Blueprint $table) {
            // Agregar la nueva columna brand_id como nullable primero
            $table->foreignId('brand_id')->nullable()->constrained('brands')->after('description');
        });

        // Migrar datos existentes: crear brands para los valores únicos en la columna brand
        $products = \App\Models\Product::whereNotNull('brand')->get();
        $brands = [];

        foreach ($products as $product) {
            if (!empty($product->brand)) {
                // Buscar o crear la marca
                if (!isset($brands[$product->brand])) {
                    $brand = \App\Models\Brand::firstOrCreate([
                        'name' => $product->brand
                    ], [
                        'status' => 'active'
                    ]);
                    $brands[$product->brand] = $brand->id;
                }

                // Actualizar el producto con el brand_id
                $product->update(['brand_id' => $brands[$product->brand]]);
            }
        }

        Schema::table('products', function (Blueprint $table) {
            // Eliminar la columna brand original
            $table->dropColumn('brand');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Volver a agregar la columna brand como string
            $table->string('brand', 100)->nullable()->after('description');
        });

        // Migrar datos de vuelta
        $products = \App\Models\Product::with('brand')->whereNotNull('brand_id')->get();

        foreach ($products as $product) {
            if ($product->brand) {
                $product->update(['brand' => $product->brand->name]);
            }
        }

        Schema::table('products', function (Blueprint $table) {
            // Eliminar la foreign key y columna brand_id
            $table->dropForeign(['brand_id']);
            $table->dropColumn('brand_id');
        });
    }
};
