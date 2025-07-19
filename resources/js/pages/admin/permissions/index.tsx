import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Permission } from '@/types';
import { Head } from '@inertiajs/react';
import { Pencil, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Gestión de Permisos',
        href: '/admin/permissions',
    },
];

interface PermissionsIndexProps {
    permissions: {
        data: Permission[];
        // Agrega propiedades de paginación si es necesario
    };
}

export default function PermissionsIndex({ permissions: permissionsData }: PermissionsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [permissions] = useState<Permission[]>(permissionsData.data);

    const filteredPermissions = permissions.filter(
        (permission) =>
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.guard_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleDelete = (id: number) => {
        // En una aplicación real, esto haría una llamada a la API
        if (confirm('¿Está seguro que desea eliminar este permiso?')) {
            // Envía un formulario para eliminar el permiso
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/admin/permissions/${id}`;

            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'DELETE';
            form.appendChild(methodInput);

            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            form.appendChild(csrfInput);

            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Permisos" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Gestión de Permisos</h1>
                        <p className="text-muted-foreground">Administra los permisos del sistema</p>
                    </div>
                    <a
                        href="/admin/permissions/create"
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Agregar Permiso
                    </a>
                </div>

                <div className="relative mb-4">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                        placeholder="Buscar permisos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                >
                                    ID
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                >
                                    Nombre
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                >
                                    Código
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                >
                                    Creado
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                >
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                            {filteredPermissions.length > 0 ? (
                                filteredPermissions.map((permission) => (
                                    <tr key={permission.id}>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">{permission.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">
                                            {permission.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{permission.name}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {new Date(permission.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={`/admin/permissions/${permission.id}/edit`}
                                                    className="rounded-md bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(permission.id)}
                                                    className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No se encontraron permisos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
