<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        // Get counts for dashboard stats
        $stats = [
            'users_count' => User::count(),
            'roles_count' => Role::count(),
            'permissions_count' => Permission::count(),
        ];
        
        return Inertia::render('admin/dashboard', [
            'stats' => $stats
        ]);
    }
} 