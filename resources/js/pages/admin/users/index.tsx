import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head } from '@inertiajs/react';
import { Pencil, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Gestión de Usuarios',
        href: '/admin/users',
    },
];

interface UsersIndexProps {
    users: {
        data: User[];
        // Add pagination props if needed
    };
}

export default function UsersIndex({ users: usersData }: UsersIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [users] = useState<User[]>(usersData.data);

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    const handleDelete = (id: number) => {
        // In a real application, this would make an API call
        if (confirm('Are you sure you want to delete this user?')) {
            // Submit a form to delete the user
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/admin/users/${id}`;

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
            <Head title="Gestión de Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                        <p className="text-muted-foreground">Administra los usuarios del sistema</p>
                    </div>
                    <a
                        href="/admin/users/create"
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Agregar Usuario
                    </a>
                </div>

                <div className="relative mb-4">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                        placeholder="Buscar usuarios..."
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
                                    Usuario
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                >
                                    Correo
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                >
                                    Verificado
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                >
                                    Creado en
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
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">{user.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">{user.name}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {user.username || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">{user.email}</td>

                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {user.email_verified_at ? 'Si' : 'No'}
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={`/admin/users/${user.id}/edit`}
                                                    className="rounded-md bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
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
                                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No users found
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
