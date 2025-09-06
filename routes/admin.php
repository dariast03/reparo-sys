<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\ProductCategoryController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\DeviceModelController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\RepairOrderController;
use App\Http\Controllers\Admin\QuoteController;
use App\Http\Controllers\Admin\SaleController;
use App\Http\Controllers\Admin\InventoryMovementController;
use App\Http\Controllers\Admin\StockController;
use Illuminate\Support\Facades\Route;

Route::group([
    'prefix' => 'admin',
    'as' => 'admin.',
    'middleware' => ['auth', 'verified', \App\Http\Middleware\AdminMiddleware::class]
], function () {
    // Admin Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Users Management
    Route::resource('users', UserController::class);

    // Roles Management
    Route::resource('roles', RoleController::class);

    // Permissions Management
    Route::resource('permissions', PermissionController::class);

    // Customers Management
    Route::resource('customers', CustomerController::class);
    Route::patch('customers/{customer}/reactivate', [CustomerController::class, 'reactivate'])->name('customers.reactivate');
    Route::post('customers/{customer}/send-qr-email', [CustomerController::class, 'sendQrEmail'])->name('customers.send-qr-email');
    Route::get('api/customers/search', [CustomerController::class, 'search'])->name('customers.search');

    // Brands Management
    Route::resource('brands', BrandController::class);
    Route::patch('brands/{brand}/reactivate', [BrandController::class, 'reactivate'])->name('brands.reactivate');

    // Categories Management
    Route::resource('categories', ProductCategoryController::class);
    Route::patch('categories/{category}/reactivate', [ProductCategoryController::class, 'reactivate'])->name('categories.reactivate');

    // Suppliers Management
    Route::resource('suppliers', SupplierController::class);
    Route::patch('suppliers/{supplier}/reactivate', [SupplierController::class, 'reactivate'])->name('suppliers.reactivate');

    // Device Models Management
    Route::resource('device-models', DeviceModelController::class);
    Route::patch('device-models/{device_model}/reactivate', [DeviceModelController::class, 'reactivate'])->name('device-models.reactivate');
    Route::get('api/device-models/by-brand', [DeviceModelController::class, 'getModelsByBrand'])->name('device-models.by-brand');

    // Products Management
    Route::resource('products', ProductController::class);
    Route::patch('products/{product}/reactivate', [ProductController::class, 'reactivate'])->name('products.reactivate');

    // Repair Orders Management
    Route::resource('repair-orders', RepairOrderController::class);
    Route::get('api/repair-orders/models-by-brand', [RepairOrderController::class, 'getModelsByBrand'])->name('repair-orders.models-by-brand');

    // Quotes Management
    Route::resource('quotes', QuoteController::class);
    Route::post('quotes/{quote}/send-email', [QuoteController::class, 'sendEmail'])->name('quotes.send-email');
    Route::get('quotes/{quote}/download-pdf', [QuoteController::class, 'downloadPDF'])->name('quotes.download-pdf');
    Route::patch('quotes/{quote}/update-status', [QuoteController::class, 'updateStatus'])->name('quotes.update-status');

    // Sales Management
    Route::resource('sales', SaleController::class);
    Route::post('sales/{sale}/cancel', [SaleController::class, 'cancel'])->name('sales.cancel');
    Route::post('sales/{sale}/credit-payment', [SaleController::class, 'creditPayment'])->name('sales.credit-payment');
    Route::get('sales/{sale}/print-invoice', [SaleController::class, 'printInvoice'])->name('sales.print-invoice');
    Route::get('sales/{sale}/print-receipt', [SaleController::class, 'printReceipt'])->name('sales.print-receipt');
    Route::get('api/sales/search-products', [SaleController::class, 'searchProducts'])->name('sales.search-products');

    // Inventory Management
    Route::prefix('inventory')->as('inventory.')->group(function () {
        // Inventory Movements
        Route::get('movements', [InventoryMovementController::class, 'index'])->name('movements.index');
        Route::get('movements/{movement}', [InventoryMovementController::class, 'show'])->name('movements.show');
        Route::get('movements/product/{product}', [InventoryMovementController::class, 'productMovements'])->name('movements.product');

        // Stock Management
        Route::get('stock', [StockController::class, 'index'])->name('stock.index');
        Route::get('stock/{product}', [StockController::class, 'show'])->name('stock.show');
        Route::post('stock/{product}/adjust', [StockController::class, 'adjust'])->name('stock.adjust');
        Route::post('stock/bulk-adjust', [StockController::class, 'bulkAdjust'])->name('stock.bulk-adjust');
    });
});
