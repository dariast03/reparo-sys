<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\PermissionController;
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
});
