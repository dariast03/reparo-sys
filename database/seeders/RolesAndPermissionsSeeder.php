<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Módulo: Reparaciones
            ['module' => 'reparaciones', 'name' => 'reparaciones.view', 'title' => 'Ver Reparaciones', 'description' => 'Permite ver todas las órdenes de reparación', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'reparaciones', 'name' => 'reparaciones.create', 'title' => 'Crear Reparaciones', 'description' => 'Permite registrar nuevas reparaciones', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'reparaciones', 'name' => 'reparaciones.edit', 'title' => 'Editar Reparaciones', 'description' => 'Permite editar reparaciones existentes', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'reparaciones', 'name' => 'reparaciones.delete', 'title' => 'Eliminar Reparaciones', 'description' => 'Permite eliminar registros de reparación', 'is_active' => true, 'guard_name' => 'web'],

            // Módulo: Clientes
            ['module' => 'clientes', 'name' => 'clientes.view', 'title' => 'Ver Clientes', 'description' => 'Permite ver la lista de clientes', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'clientes', 'name' => 'clientes.create', 'title' => 'Crear Clientes', 'description' => 'Permite agregar nuevos clientes', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'clientes', 'name' => 'clientes.edit', 'title' => 'Editar Clientes', 'description' => 'Permite modificar datos de clientes', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'clientes', 'name' => 'clientes.delete', 'title' => 'Eliminar Clientes', 'description' => 'Permite eliminar clientes del sistema', 'is_active' => true, 'guard_name' => 'web'],

            // Módulo: Dispositivos
            ['module' => 'dispositivos', 'name' => 'dispositivos.view', 'title' => 'Ver Dispositivos', 'description' => 'Permite ver dispositivos registrados', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'dispositivos', 'name' => 'dispositivos.create', 'title' => 'Agregar Dispositivos', 'description' => 'Permite agregar nuevos dispositivos', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'dispositivos', 'name' => 'dispositivos.edit', 'title' => 'Editar Dispositivos', 'description' => 'Permite modificar información de dispositivos', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'dispositivos', 'name' => 'dispositivos.delete', 'title' => 'Eliminar Dispositivos', 'description' => 'Permite eliminar dispositivos del sistema', 'is_active' => true, 'guard_name' => 'web'],

            // Módulo: Técnicos
            ['module' => 'tecnicos', 'name' => 'tecnicos.view', 'title' => 'Ver Técnicos', 'description' => 'Permite ver técnicos disponibles', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'tecnicos', 'name' => 'tecnicos.assign', 'title' => 'Asignar Técnicos', 'description' => 'Permite asignar técnicos a reparaciones', 'is_active' => true, 'guard_name' => 'web'],

            // Módulo: Inventario
            ['module' => 'inventario', 'name' => 'inventario.view', 'title' => 'Ver Inventario', 'description' => 'Permite ver los repuestos y stock disponible', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'inventario', 'name' => 'inventario.manage', 'title' => 'Gestionar Inventario', 'description' => 'Permite agregar, editar o eliminar productos del inventario', 'is_active' => true, 'guard_name' => 'web'],

            // Módulo: Ingresos
            ['module' => 'ingresos', 'name' => 'ingresos.view', 'title' => 'Ver Ingresos', 'description' => 'Permite ver los pagos recibidos', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'ingresos', 'name' => 'ingresos.manage', 'title' => 'Gestionar Ingresos', 'description' => 'Permite registrar y actualizar ingresos', 'is_active' => true, 'guard_name' => 'web'],

            // Módulo: Reportes
            ['module' => 'reportes', 'name' => 'reportes.view', 'title' => 'Ver Reportes', 'description' => 'Permite generar y ver reportes del sistema', 'is_active' => true, 'guard_name' => 'web'],

            // Módulo: Usuarios
            ['module' => 'usuarios', 'name' => 'usuarios.view', 'title' => 'Ver Usuarios', 'description' => 'Permite ver todos los usuarios del sistema', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'usuarios', 'name' => 'usuarios.manage', 'title' => 'Gestionar Usuarios', 'description' => 'Permite crear, editar y eliminar usuarios', 'is_active' => true, 'guard_name' => 'web'],

            // Módulo: Roles y Permisos
            ['module' => 'roles', 'name' => 'roles.manage', 'title' => 'Gestionar Roles', 'description' => 'Permite gestionar roles del sistema', 'is_active' => true, 'guard_name' => 'web'],
            ['module' => 'permisos', 'name' => 'permisos.manage', 'title' => 'Gestionar Permisos', 'description' => 'Permite gestionar permisos del sistema', 'is_active' => true, 'guard_name' => 'web'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        $rootRole = Role::create([
            'name' => 'root',
            'title' => 'Superadministrador',
            'description' => 'Acceso absoluto a todo el sistema ReparoSys',
            'is_active' => true,
            'guard_name' => 'web',
        ]);

        $rootRole->givePermissionTo(Permission::all());

        // Roles
        $adminRole = Role::create([
            'name' => 'admin',
            'title' => 'Administrador',
            'description' => 'Acceso total al sistema ReparoSys',
            'is_active' => true,
            'guard_name' => 'web',
        ]);
        $adminRole->givePermissionTo(Permission::all());

        $tecnicoRole = Role::create([
            'name' => 'tecnico',
            'title' => 'Técnico',
            'description' => 'Acceso a reparaciones asignadas y recursos técnicos',
            'is_active' => true,
            'guard_name' => 'web',
        ]);
        $tecnicoRole->givePermissionTo([
            'reparaciones.view',
            'reparaciones.edit',
            'tecnicos.view',
            'inventario.view',
        ]);

        $recepcionRole = Role::create([
            'name' => 'recepcionista',
            'title' => 'Recepcionista',
            'description' => 'Encargado de registrar clientes y dispositivos',
            'is_active' => true,
            'guard_name' => 'web',
        ]);
        $recepcionRole->givePermissionTo([
            'clientes.view',
            'clientes.create',
            'clientes.edit',
            'dispositivos.view',
            'dispositivos.create',
            'reparaciones.create',
        ]);
    }
}
