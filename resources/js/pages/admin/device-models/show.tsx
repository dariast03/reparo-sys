import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, RotateCcw, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Modelos de Dispositivos',
        href: '/admin/device-models',
    },
    {
        title: 'Ver Modelo',
        href: '#',
    },
];

interface Brand {
    id: number;
    name: string;
}

interface RepairOrder {
    id: number;
    status: string;
    created_at: string;
}

interface DeviceModel {
    id: number;
    brand_id: number;
    name: string;
    device_type: string;
    status: string;
    created_at: string;
    updated_at: string;
    brand: Brand;
    repair_orders: RepairOrder[];
}

interface DeviceModelShowProps {
    deviceModel: DeviceModel;
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

export default function DeviceModelShow({ deviceModel }: DeviceModelShowProps) {
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
            <Head title={`Modelo: ${deviceModel.brand.name} ${deviceModel.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/device-models">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {deviceTypeIcons[deviceModel.device_type as keyof typeof deviceTypeIcons]} {deviceModel.brand.name} {deviceModel.name}
                            </h1>
                            <p className="text-muted-foreground">
                                {deviceTypeLabels[deviceModel.device_type as keyof typeof deviceTypeLabels]} • Registrado el{' '}
                                {new Date(deviceModel.created_at).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/admin/device-models/${deviceModel.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                        {deviceModel.status === 'inactive' && (
                            <Button variant="outline" className="text-green-600">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reactivar
                            </Button>
                        )}
                        {deviceModel.status === 'active' && (
                            <Button variant="outline" className="text-red-600">
                                <X className="mr-2 h-4 w-4" />
                                Desactivar
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* Información básica */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Modelo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Marca</label>
                                        <p className="text-lg font-semibold">{deviceModel.brand.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Nombre del Modelo</label>
                                        <p className="text-lg font-semibold">{deviceModel.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Tipo de Dispositivo</label>
                                        <p className="flex items-center gap-2 text-lg font-semibold">
                                            <span>{deviceTypeIcons[deviceModel.device_type as keyof typeof deviceTypeIcons]}</span>
                                            <span>{deviceTypeLabels[deviceModel.device_type as keyof typeof deviceTypeLabels]}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                        <div className="mt-1">{getStatusBadge(deviceModel.status)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Órdenes de reparación asociadas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Órdenes de Reparación ({deviceModel.repair_orders?.length || 0})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {deviceModel.repair_orders && deviceModel.repair_orders.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {deviceModel.repair_orders.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell>#{order.id}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{order.status}</Badge>
                                                    </TableCell>
                                                    <TableCell>{new Date(order.created_at).toLocaleDateString('es-ES')}</TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm">
                                                            Ver
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="py-8 text-center">
                                        <div className="mb-2 text-4xl">🔧</div>
                                        <p className="text-muted-foreground">No hay órdenes de reparación asociadas a este modelo</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Estadísticas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>📊 Estadísticas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Órdenes de Reparación</span>
                                    <span className="font-semibold">{deviceModel.repair_orders?.length || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Estado</span>
                                    <span className="font-semibold">{deviceModel.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Marca</span>
                                    <span className="font-semibold">{deviceModel.brand.name}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información adicional */}
                        <Card>
                            <CardHeader>
                                <CardTitle>📅 Fechas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                                    <p className="text-sm">{new Date(deviceModel.created_at).toLocaleString('es-ES')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                                    <p className="text-sm">{new Date(deviceModel.updated_at).toLocaleString('es-ES')}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Acciones rápidas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>⚡ Acciones Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/admin/device-models/${deviceModel.id}/edit`} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar Modelo
                                    </Button>
                                </Link>
                                <Link href="/admin/device-models" className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Volver al Listado
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
