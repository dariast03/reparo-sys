import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Role } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Pencil, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Gestión de Roles',
        href: '/admin/roles',
    },
];

interface RolesIndexProps {
    roles: {
        data: Role[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function RolesIndex({ roles: rolesData }: RolesIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [roles, setRoles] = useState<Role[]>(rolesData.data);

    const filteredRoles = roles.filter(
        (role) =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro que desea eliminar este rol?')) {
            router.delete(`/admin/roles/${id}`, {
                onSuccess: () => {
                    // Elimina el rol del estado local después de la eliminación exitosa
                    setRoles(roles.filter((role) => role.id !== id));
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Gestión de Roles</h1>
                        <p className="text-muted-foreground">Administra los roles de usuario</p>
                    </div>
                    <a
                        href="/admin/roles/create"
                        className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Agregar Rol
                    </a>
                </div>

                <div className="relative mb-4">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 text-sm placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                        placeholder="Buscar roles..."
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
                                    Descripción
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
                            {filteredRoles.length > 0 ? (
                                filteredRoles.map((role) => (
                                    <tr key={role.id}>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">{role.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">{role.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{role.description}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {new Date(role.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={`/admin/roles/${role.id}/edit`}
                                                    className="rounded-md bg-purple-100 p-2 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(role.id)}
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
                                        No se encontraron roles
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
