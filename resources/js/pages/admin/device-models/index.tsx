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
import { Eye, Pencil, PlusCircle, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Modelos de Dispositivos',
        href: '/admin/device-models',
    },
];

interface Brand {
    id: number;
    name: string;
}

interface DeviceModel {
    id: number;
    brand_id: number;
    name: string;
    device_type: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    brand: Brand;
    full_name: string;
}

interface PaginatedDeviceModels {
    data: DeviceModel[];
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

interface DeviceModelsIndexProps {
    deviceModels: PaginatedDeviceModels;
    filters: {
        search?: string;
        status?: string;
        device_type?: string;
        brand_id?: string;
    };
    brands: Brand[];
}

const deviceTypeLabels = {
    phone: 'Teléfono',
    tablet: 'Tablet',
    laptop: 'Laptop',
    smartwatch: 'Smartwatch',
    other: 'Otro',
};

const deviceTypeIcons = {
    phone: '📱',
    tablet: '📱',
    laptop: '💻',
    smartwatch: '⌚',
    other: '📟',
};

export default function DeviceModelsIndex({ deviceModels, filters, brands }: DeviceModelsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [deviceTypeFilter, setDeviceTypeFilter] = useState(filters.device_type || 'all');
    const [brandFilter, setBrandFilter] = useState(filters.brand_id || 'all');

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
            if (deviceTypeFilter !== 'all') {
                params.device_type = deviceTypeFilter;
            }
            if (brandFilter !== 'all') {
                params.brand_id = brandFilter;
            }

            router.get('/admin/device-models', params, {
                preserveState: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, deviceTypeFilter, brandFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDeviceTypeFilter('all');
        setBrandFilter('all');
    };

    const handleDeactivateModel = (modelId: number) => {
        router.delete(`/admin/device-models/${modelId}`, {
            preserveScroll: true,
        });
    };

    const handleReactivateModel = (modelId: number) => {
        router.patch(
            `/admin/device-models/${modelId}/reactivate`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                Activo
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                Inactivo
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Modelos de Dispositivos" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Modelos de Dispositivos</h1>
                        <p className="text-muted-foreground">Gestiona los modelos de dispositivos por marca</p>
                    </div>
                    <Link href="/admin/device-models/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo Modelo
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Buscar Modelo</label>
                                <Input
                                    placeholder="Nombre del modelo o marca..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Marca</label>
                                <Select value={brandFilter} onValueChange={setBrandFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">🏷️ Todas las marcas</SelectItem>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo de Dispositivo</label>
                                <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">📋 Todos los tipos</SelectItem>
                                        {Object.entries(deviceTypeLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {deviceTypeIcons[value as keyof typeof deviceTypeIcons]} {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado</label>
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
                        </div>

                        {/* Chips de filtros activos */}
                        {(searchTerm || statusFilter !== 'all' || deviceTypeFilter !== 'all' || brandFilter !== 'all') && (
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
                                    {brandFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            🏷️ {brands.find((b) => b.id.toString() === brandFilter)?.name}
                                            <button
                                                onClick={() => setBrandFilter('all')}
                                                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-gray-200"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {deviceTypeFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            {deviceTypeIcons[deviceTypeFilter as keyof typeof deviceTypeIcons]}{' '}
                                            {deviceTypeLabels[deviceTypeFilter as keyof typeof deviceTypeLabels]}
                                            <button
                                                onClick={() => setDeviceTypeFilter('all')}
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
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Mostrando <span className="font-medium">{deviceModels.data.length}</span> de{' '}
                        <span className="font-medium">{deviceModels.total}</span> modelos
                        {(searchTerm || statusFilter !== 'all' || deviceTypeFilter !== 'all' || brandFilter !== 'all') && (
                            <span className="text-blue-600"> (filtrados)</span>
                        )}
                    </div>
                    {deviceModels.total > 0 && (
                        <div className="text-xs text-muted-foreground">
                            Página {deviceModels.current_page} de {deviceModels.last_page}
                        </div>
                    )}
                </div>

                {/* Models Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Modelo</TableHead>
                                    <TableHead>Marca</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha Registro</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deviceModels.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="text-4xl">🔍</div>
                                                <div className="text-lg font-medium text-muted-foreground">
                                                    {searchTerm || statusFilter !== 'all' || deviceTypeFilter !== 'all' || brandFilter !== 'all'
                                                        ? 'No se encontraron modelos con los filtros aplicados'
                                                        : 'No hay modelos registrados'}
                                                </div>
                                                {(searchTerm || statusFilter !== 'all' || deviceTypeFilter !== 'all' || brandFilter !== 'all') && (
                                                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                                                        Limpiar filtros y ver todos
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    deviceModels.data.map((model) => (
                                        <TableRow key={model.id}>
                                            <TableCell>
                                                <div className="font-medium">{model.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{model.brand.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span>{deviceTypeIcons[model.device_type as keyof typeof deviceTypeIcons]}</span>
                                                    <span>{deviceTypeLabels[model.device_type as keyof typeof deviceTypeLabels]}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(model.status)}</TableCell>
                                            <TableCell>{new Date(model.created_at).toLocaleDateString('es-ES')}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/device-models/${model.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/device-models/${model.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {model.status === 'active' ? (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-red-600">
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Desactivar Modelo?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        ¿Estás seguro de que deseas desactivar el modelo {model.brand.name}{' '}
                                                                        {model.name}? Esta acción no eliminará el modelo, pero no aparecerá en las
                                                                        búsquedas normales.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeactivateModel(model.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Desactivar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-green-600"
                                                            onClick={() => handleReactivateModel(model.id)}
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
                {deviceModels.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {deviceModels.links.map((link, index) =>
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
