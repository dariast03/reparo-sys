<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PermissionController extends Controller
{
    /**
     * Display a listing of the permissions.
     */
    public function index()
    {
        $permissions = Permission::paginate(10);
        
        return Inertia::render('admin/permissions/index', [
            'permissions' => $permissions
        ]);
    }

    /**
     * Show the form for creating a new permission.
     */
    public function create()
    {
        return Inertia::render('admin/permissions/create');
    }

    /**
     * Store a newly created permission in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions',
        ]);

        Permission::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permission created successfully.');
    }

    /**
     * Show the form for editing the specified permission.
     */
    public function edit(Permission $permission)
    {
        return Inertia::render('admin/permissions/edit', [
            'permission' => $permission
        ]);
    }

    /**
     * Update the specified permission in storage.
     */
    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('permissions')->ignore($permission->id)],
        ]);

        $permission->update([
            'name' => $validated['name'],
        ]);

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permission updated successfully.');
    }

    /**
     * Remove the specified permission from storage.
     */
    public function destroy(Permission $permission)
    {
        // Check if permission is in use
        if ($permission->roles()->count() > 0) {
            return redirect()->route('admin.permissions.index')
                ->with('error', 'Cannot delete permission because it is assigned to roles.');
        }
        
        $permission->delete();

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permission deleted successfully.');
    }
} 