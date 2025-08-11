<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class SimpleRolesSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            ['module' => 'reparaciones', 'name' => 'reparaciones.view', 'title' => 'Ver Reparaciones', 'description' => 'Ver órdenes de reparación', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'reparaciones', 'name' => 'reparaciones.create', 'title' => 'Crear Reparaciones', 'description' => 'Crear nuevas órdenes', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'reparaciones', 'name' => 'reparaciones.edit', 'title' => 'Editar Reparaciones', 'description' => 'Editar órdenes existentes', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'clientes', 'name' => 'clientes.view', 'title' => 'Ver Clientes', 'description' => 'Ver lista de clientes', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'clientes', 'name' => 'clientes.create', 'title' => 'Crear Clientes', 'description' => 'Agregar nuevos clientes', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'clientes', 'name' => 'clientes.edit', 'title' => 'Editar Clientes', 'description' => 'Modificar datos de clientes', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'inventario', 'name' => 'inventario.view', 'title' => 'Ver Inventario', 'description' => 'Ver productos e inventario', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'inventario', 'name' => 'inventario.manage', 'title' => 'Gestionar Inventario', 'description' => 'Gestionar productos', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'ventas', 'name' => 'ventas.view', 'title' => 'Ver Ventas', 'description' => 'Ver historial de ventas', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'ventas', 'name' => 'ventas.create', 'title' => 'Crear Ventas', 'description' => 'Registrar nuevas ventas', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'reportes', 'name' => 'reportes.view', 'title' => 'Ver Reportes', 'description' => 'Ver reportes del sistema', 'is_active' => true, 'guard_name' => 'web'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name'], 'guard_name' => $permission['guard_name']],
                $permission
            );
        }

        // Create roles
        $rootRole = Role::firstOrCreate(['name' => 'root', 'guard_name' => 'web'], ['title' => 'Super Administrador', 'description' => 'Acceso completo', 'is_active' => true]);
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web'], ['title' => 'Administrador', 'description' => 'Acceso administrativo', 'is_active' => true]);
        $technicianRole = Role::firstOrCreate(['name' => 'technician', 'guard_name' => 'web'], ['title' => 'Técnico', 'description' => 'Acceso técnico', 'is_active' => true]);
        $receptionistRole = Role::firstOrCreate(['name' => 'receptionist', 'guard_name' => 'web'], ['title' => 'Recepcionista', 'description' => 'Acceso recepción', 'is_active' => true]);

        // Assign permissions to roles
        $rootRole->givePermissionTo(Permission::all());
        $adminRole->givePermissionTo(['reparaciones.view', 'reparaciones.create', 'reparaciones.edit', 'clientes.view', 'clientes.create', 'clientes.edit', 'inventario.view', 'inventario.manage', 'ventas.view', 'ventas.create', 'reportes.view']);
        $technicianRole->givePermissionTo(['reparaciones.view', 'reparaciones.edit', 'clientes.view', 'inventario.view']);
        $receptionistRole->givePermissionTo(['reparaciones.view', 'reparaciones.create', 'clientes.view', 'clientes.create', 'clientes.edit', 'ventas.view', 'ventas.create']);
    }
}
