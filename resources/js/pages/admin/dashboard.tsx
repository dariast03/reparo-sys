import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Key, Shield, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Panel de Control',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel de Control – ReparoSys" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Panel de Control</h1>
                <p className="text-muted-foreground">Accede a la gestión de usuarios, roles y permisos del sistema ReparoSys</p>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Usuarios */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                                <h3 className="font-medium">Usuarios</h3>
                                <p className="text-sm text-muted-foreground">Gestiona los usuarios del sistema</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <a href="/admin/users" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                                Ir a Usuarios →
                            </a>
                        </div>
                    </div>

                    {/* Roles */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                            </div>
                            <div>
                                <h3 className="font-medium">Roles</h3>
                                <p className="text-sm text-muted-foreground">Administra los roles asignados</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <a href="/admin/roles" className="text-sm font-medium text-purple-600 hover:underline dark:text-purple-400">
                                Ir a Roles →
                            </a>
                        </div>
                    </div>

                    {/* Permisos */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                                <Key className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                            </div>
                            <div>
                                <h3 className="font-medium">Permisos</h3>
                                <p className="text-sm text-muted-foreground">Gestiona los permisos del sistema</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <a href="/admin/permissions" className="text-sm font-medium text-amber-600 hover:underline dark:text-amber-400">
                                Ir a Permisos →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
