<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CustomerPortalController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/admin', function () {
    return redirect('/admin/dashboard');
})->name('admin.redirect');

// Customer Portal Routes (public)
Route::get('/cliente/{qrCode}', [CustomerPortalController::class, 'show'])->name('customer.portal');
Route::get('/cliente/{qrCode}/nueva-orden', [CustomerPortalController::class, 'createRepairOrder'])->name('customer.create-repair-order');
Route::get('/cliente/{qrCode}/nueva-cotizacion', [CustomerPortalController::class, 'createQuote'])->name('customer.create-quote');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
