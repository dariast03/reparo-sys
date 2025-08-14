import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Mail, MapPin, Pencil, Phone, PlusCircle, Star, Truck, UserCheck, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Gestión de Proveedores',
        href: '/admin/suppliers',
    },
];

interface Supplier {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    tax_id: string | null;
    delivery_time_days: number;
    rating: number;
    status: 'active' | 'inactive';
    notes: string | null;
    created_at: string;
    updated_at: string;
}

interface PaginatedSuppliers {
    data: Supplier[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface SuppliersIndexProps {
    suppliers: PaginatedSuppliers;
    filters: {
        search?: string;
        status?: string;
        rating?: string;
    };
}

export default function SuppliersIndex({ suppliers, filters }: SuppliersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [ratingFilter, setRatingFilter] = useState(filters.rating || 'all');

    // Auto-aplicar filtros cuando cambien los valores
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params: Record<string, string | undefined> = {};

            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            if (ratingFilter !== 'all') {
                params.rating = ratingFilter;
            }

            router.get('/admin/suppliers', params, {
                preserveState: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, ratingFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setRatingFilter('all');
    };

    const handleDeactivateSupplier = (supplierId: number) => {
        router.delete(`/admin/suppliers/${supplierId}`, {
            preserveScroll: true,
        });
    };

    const handleReactivateSupplier = (supplierId: number) => {
        router.patch(
            `/admin/suppliers/${supplierId}/reactivate`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                <Truck className="mr-1 h-3 w-3" />
                Activo
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                <UserX className="mr-1 h-3 w-3" />
                Inactivo
            </Badge>
        );
    };

    const getRatingStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-3 w-3 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">({rating})</span>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Gestión de Proveedores" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Proveedores</h1>
                        <p className="text-muted-foreground">Administra la información de tus proveedores</p>
                    </div>
                    <Link href="/admin/suppliers/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo Proveedor
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Filtros</CardTitle>
                            <Button variant="outline" size="sm" onClick={handleClearFilters}>
                                Limpiar Filtros
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Buscar Proveedor</label>
                                <Input
                                    placeholder="Nombre, contacto, email, teléfono..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado del Proveedor</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">📋 Todos los estados</SelectItem>
                                        <SelectItem value="active">✅ Activos</SelectItem>
                                        <SelectItem value="inactive">❌ Inactivos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Calificación Mínima</label>
                                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por calificación" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">⭐ Todas las calificaciones</SelectItem>
                                        <SelectItem value="5">⭐⭐⭐⭐⭐ 5 estrellas</SelectItem>
                                        <SelectItem value="4">⭐⭐⭐⭐ 4+ estrellas</SelectItem>
                                        <SelectItem value="3">⭐⭐⭐ 3+ estrellas</SelectItem>
                                        <SelectItem value="2">⭐⭐ 2+ estrellas</SelectItem>
                                        <SelectItem value="1">⭐ 1+ estrellas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Chips de filtros activos */}
                        {(searchTerm || statusFilter !== 'all' || ratingFilter !== 'all') && (
                            <div className="mt-4 border-t pt-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Filtros activos:</span>
                                    {searchTerm && (
                                        <Badge variant="secondary" className="gap-1">
                                            🔍 "{searchTerm}"
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-gray-200"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {statusFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            {statusFilter === 'active' ? '✅' : '❌'} {statusFilter === 'active' ? 'Activos' : 'Inactivos'}
                                            <button
                                                onClick={() => setStatusFilter('all')}
                                                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-gray-200"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {ratingFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            ⭐ {ratingFilter}+ estrellas
                                            <button
                                                onClick={() => setRatingFilter('all')}
                                                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-gray-200"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Mostrando <span className="font-medium">{suppliers.data.length}</span> de{' '}
                        <span className="font-medium">{suppliers.total}</span> proveedores
                        {(searchTerm || statusFilter !== 'all' || ratingFilter !== 'all') && <span className="text-blue-600"> (filtrados)</span>}
                    </div>
                    {suppliers.total > 0 && (
                        <div className="text-xs text-muted-foreground">
                            Página {suppliers.current_page} de {suppliers.last_page}
                        </div>
                    )}
                </div>

                {/* Suppliers Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Calificación</TableHead>
                                    <TableHead>Tiempo Entrega</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="text-4xl">🚚</div>
                                                <div className="text-lg font-medium text-muted-foreground">
                                                    {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all'
                                                        ? 'No se encontraron proveedores con los filtros aplicados'
                                                        : 'No hay proveedores registrados'}
                                                </div>
                                                {(searchTerm || statusFilter !== 'all' || ratingFilter !== 'all') && (
                                                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                                                        Limpiar filtros y ver todos
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    suppliers.data.map((supplier) => (
                                        <TableRow key={supplier.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{supplier.name}</div>
                                                    {supplier.tax_id && <div className="text-sm text-muted-foreground">RUC: {supplier.tax_id}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {supplier.contact_person && <div className="text-sm font-medium">{supplier.contact_person}</div>}
                                                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                        {supplier.phone && (
                                                            <div className="flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {supplier.phone}
                                                            </div>
                                                        )}
                                                        {supplier.email && (
                                                            <div className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {supplier.email}
                                                            </div>
                                                        )}
                                                        {supplier.address && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {supplier.address}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getRatingStars(supplier.rating)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="gap-1">
                                                    <Truck className="h-3 w-3" />
                                                    {supplier.delivery_time_days} días
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/suppliers/${supplier.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/suppliers/${supplier.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {supplier.status === 'active' ? (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-red-600">
                                                                    <UserX className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Inactivar Proveedor?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        ¿Estás seguro de que deseas inactivar a {supplier.name}? Esta acción no
                                                                        eliminará el proveedor, pero no aparecerá en las búsquedas normales.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeactivateSupplier(supplier.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Inactivar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-green-600"
                                                            onClick={() => handleReactivateSupplier(supplier.id)}
                                                        >
                                                            <UserCheck className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {suppliers.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {suppliers.links.map((link, index) =>
                                link.url ? (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => router.get(link.url!)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <Button key={index} variant="outline" size="sm" disabled dangerouslySetInnerHTML={{ __html: link.label }} />
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
