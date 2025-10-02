<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index()
    {
        $users = User::with('roles')->paginate(10);

        return Inertia::render('admin/users/index', [
            'users' => $users
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        $roles = Role::all();

        return Inertia::render('admin/users/create', [
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'project' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'password' => ['required', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()->symbols()->uncompromised()],
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'] ?? null,
            'email' => $validated['email'],
            'project' => $validated['project'] ?? null,
            'department' => $validated['department'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        if (isset($validated['roles'])) {
            $user->roles()->attach($validated['roles']);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $user->load('roles');
        $roles = Role::all();

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'roles' => $roles
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['nullable', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'project' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'password' => ['nullable', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()->symbols()->uncompromised()],
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id'
        ]);

        $userData = [
            'name' => $validated['name'],
            'username' => $validated['username'] ?? null,
            'email' => $validated['email'],
            'project' => $validated['project'] ?? null,
            'department' => $validated['department'] ?? null,
        ];

        $user->update($userData);

        if (!empty($validated['password'])) {
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $user->roles()->detach();
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
