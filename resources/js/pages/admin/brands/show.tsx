import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Hash, Pencil, Smartphone, Wrench } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Marcas',
        href: '/admin/brands',
    },
    {
        title: 'Detalles',
        href: '#',
    },
];

interface DeviceModel {
    id: number;
    name: string;
    status: string;
}

interface RepairOrder {
    id: number;
    order_number: string;
    customer: {
        first_name: string;
        last_name: string;
    };
    status: string;
    created_at: string;
}

interface Brand {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    models_count: number;
    repair_orders_count: number;
    created_at: string;
    updated_at: string;
    models: DeviceModel[];
    repair_orders: RepairOrder[];
}

interface BrandsShowProps {
    brand: Brand;
}

export default function BrandsShow({ brand }: BrandsShowProps) {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title={`Marca: ${brand.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/brands">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Marca: {brand.name}</h1>
                            <p className="text-muted-foreground">Información detallada de la marca</p>
                        </div>
                    </div>
                    <Link href={`/admin/brands/${brand.id}/edit`}>
                        <Button>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Marca
                        </Button>
                    </Link>
                </div>

                {/* Información General */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Hash className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">ID de la Marca</p>
                                    <p className="text-2xl font-bold">{brand.id}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <Smartphone className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Modelos</p>
                                    <p className="text-2xl font-bold">{brand.models_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-100 p-2">
                                    <Wrench className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Reparaciones</p>
                                    <p className="text-2xl font-bold">{brand.repair_orders_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-100 p-2">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Estado</p>
                                    <div className="mt-1">{getStatusBadge(brand.status)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detalles de la Marca */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Marca</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                    <p className="text-lg font-semibold">{brand.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                    <div className="mt-1">{getStatusBadge(brand.status)}</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                                    <p className="text-lg">{formatDate(brand.created_at)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                                    <p className="text-lg">{formatDate(brand.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Modelos de la Marca */}
                {brand.models && brand.models.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5" />
                                Modelos de Dispositivos ({brand.models.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {brand.models.map((model) => (
                                    <div key={model.id} className="rounded-lg border p-3">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{model.name}</p>
                                            <Badge variant={model.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                                {model.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Órdenes de Reparación Recientes */}
                {brand.repair_orders && brand.repair_orders.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench className="h-5 w-5" />
                                Órdenes de Reparación Recientes ({brand.repair_orders.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead># Orden</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Fecha</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {brand.repair_orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.order_number}</TableCell>
                                            <TableCell>
                                                {order.customer.first_name} {order.customer.last_name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{order.status}</Badge>
                                            </TableCell>
                                            <TableCell>{new Date(order.created_at).toLocaleDateString('es-ES')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Estado cuando no hay datos */}
                {(!brand.models || brand.models.length === 0) && (!brand.repair_orders || brand.repair_orders.length === 0) && (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <div className="mb-4 text-6xl">🏷️</div>
                                <h3 className="mb-2 text-lg font-medium text-muted-foreground">Esta marca aún no tiene actividad</h3>
                                <p className="text-sm text-muted-foreground">
                                    No hay modelos de dispositivos ni órdenes de reparación asociadas a esta marca.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
