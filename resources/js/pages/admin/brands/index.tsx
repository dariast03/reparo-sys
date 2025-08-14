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
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, PlusCircle, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Brand {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    models_count: number;
    repair_orders_count: number;
    created_at: string;
    updated_at: string;
}

interface PaginatedBrands {
    data: Brand[];
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

interface BrandsIndexProps {
    brands: PaginatedBrands;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function BrandsIndex({ brands, filters }: BrandsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

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

            router.get('/admin/brands', params, {
                preserveState: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
    };

    const handleDeactivateBrand = (brandId: number) => {
        router.delete(`/admin/brands/${brandId}`, {
            preserveScroll: true,
        });
    };

    const handleReactivateBrand = (brandId: number) => {
        router.patch(
            `/admin/brands/${brandId}/reactivate`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                Activa
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                Inactiva
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Gestión de Marcas" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Marcas</h1>
                        <p className="text-muted-foreground">Administra las marcas de dispositivos</p>
                    </div>
                    <Link href="/admin/brands/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nueva Marca
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Buscar Marca</label>
                                <Input
                                    placeholder="Nombre de la marca..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado de la Marca</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">📋 Todos los estados</SelectItem>
                                        <SelectItem value="active">✅ Activas</SelectItem>
                                        <SelectItem value="inactive">❌ Inactivas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Chips de filtros activos */}
                        {(searchTerm || statusFilter !== 'all') && (
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
                                            {statusFilter === 'active' ? '✅' : '❌'} {statusFilter === 'active' ? 'Activas' : 'Inactivas'}
                                            <button
                                                onClick={() => setStatusFilter('all')}
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
                        Mostrando <span className="font-medium">{brands.data.length}</span> de <span className="font-medium">{brands.total}</span>{' '}
                        marcas
                        {(searchTerm || statusFilter !== 'all') && <span className="text-blue-600"> (filtradas)</span>}
                    </div>
                    {brands.total > 0 && (
                        <div className="text-xs text-muted-foreground">
                            Página {brands.current_page} de {brands.last_page}
                        </div>
                    )}
                </div>

                {/* Brands Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Marca</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Modelos</TableHead>
                                    <TableHead>Reparaciones</TableHead>
                                    <TableHead>Fecha Creación</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {brands.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="text-4xl">🏷️</div>
                                                <div className="text-lg font-medium text-muted-foreground">
                                                    {searchTerm || statusFilter !== 'all'
                                                        ? 'No se encontraron marcas con los filtros aplicados'
                                                        : 'No hay marcas registradas'}
                                                </div>
                                                {(searchTerm || statusFilter !== 'all') && (
                                                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                                                        Limpiar filtros y ver todas
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    brands.data.map((brand) => (
                                        <TableRow key={brand.id}>
                                            <TableCell>
                                                <div className="font-medium">{brand.name}</div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(brand.status)}</TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {brand.models_count} {brand.models_count === 1 ? 'modelo' : 'modelos'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {brand.repair_orders_count} {brand.repair_orders_count === 1 ? 'reparación' : 'reparaciones'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{new Date(brand.created_at).toLocaleDateString('es-ES')}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/brands/${brand.id}`}>
                                                        <Button variant="ghost" size="sm" title="Ver detalles">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/brands/${brand.id}/edit`}>
                                                        <Button variant="ghost" size="sm" title="Editar">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {brand.status === 'active' ? (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-red-600" title="Inactivar">
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Inactivar Marca?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        ¿Estás seguro de que deseas inactivar la marca "{brand.name}"? Esta acción no
                                                                        eliminará la marca, pero no aparecerá en las búsquedas normales.
                                                                        {(brand.models_count > 0 || brand.repair_orders_count > 0) && (
                                                                            <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-amber-800">
                                                                                <strong>Atención:</strong> Esta marca tiene {brand.models_count}{' '}
                                                                                modelos y {brand.repair_orders_count} reparaciones asociadas.
                                                                            </div>
                                                                        )}
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeactivateBrand(brand.id)}
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
                                                            onClick={() => handleReactivateBrand(brand.id)}
                                                            title="Reactivar"
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
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
                {brands.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {brands.links.map((link, index) =>
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
