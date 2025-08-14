import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, Calendar, ClipboardList, Edit, FileText, Mail, MapPin, Phone, Star, Truck, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Proveedores',
        href: '/admin/suppliers',
    },
    {
        title: 'Detalles del Proveedor',
        href: '#',
    },
];

interface Purchase {
    id: number;
    total: number;
    created_at: string;
}

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
    purchases?: Purchase[];
}

interface ShowSupplierProps {
    supplier: Supplier;
}

export default function ShowSupplier({ supplier }: ShowSupplierProps) {
    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                <Truck className="mr-1 h-3 w-3" />
                Activo
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                Inactivo
            </Badge>
        );
    };

    const getRatingStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-4 w-4 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title={`Proveedor - ${supplier.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/suppliers">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a Proveedores
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">{supplier.name}</h1>
                                {getStatusBadge(supplier.status)}
                            </div>
                            <p className="text-muted-foreground">Información detallada del proveedor</p>
                        </div>
                    </div>
                    <Link href={`/admin/suppliers/${supplier.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Proveedor
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Información Principal */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Información Básica */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Información Básica
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                            <p className="mt-1 text-sm">{supplier.name}</p>
                                        </div>

                                        {supplier.contact_person && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Persona de Contacto</label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-sm">{supplier.contact_person}</p>
                                                </div>
                                            </div>
                                        )}

                                        {supplier.tax_id && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">RUC/NIT</label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-sm">{supplier.tax_id}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {supplier.phone && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-sm">{supplier.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        {supplier.email && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-sm">{supplier.email}</p>
                                                </div>
                                            </div>
                                        )}

                                        {supplier.address && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                                                <div className="mt-1 flex items-start gap-2">
                                                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                    <p className="text-sm">{supplier.address}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notas */}
                        {supplier.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5" />
                                        Notas Adicionales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{supplier.notes}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Historial de Compras */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Historial de Compras</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {supplier.purchases && supplier.purchases.length > 0 ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-muted-foreground">Total de compras: {supplier.purchases.length}</p>
                                        <div className="space-y-2">
                                            {supplier.purchases.slice(0, 5).map((purchase) => (
                                                <div key={purchase.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                                                    <div>
                                                        <p className="font-medium">Compra #{purchase.id}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(purchase.created_at).toLocaleDateString('es-ES')}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline">${purchase.total.toFixed(2)}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                        {supplier.purchases.length > 5 && (
                                            <p className="text-center text-sm text-muted-foreground">
                                                Y {supplier.purchases.length - 5} compras más...
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center">
                                        <div className="mb-2 text-4xl">🛒</div>
                                        <p className="text-muted-foreground">No hay compras registradas</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panel Lateral */}
                    <div className="space-y-6">
                        {/* Configuraciones */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuraciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Calificación</label>
                                    <div className="mt-1">{getRatingStars(supplier.rating)}</div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Tiempo de Entrega</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm">{supplier.delivery_time_days} días</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                    <div className="mt-1">{getStatusBadge(supplier.status)}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información del Sistema */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Sistema</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm">{new Date(supplier.created_at).toLocaleDateString('es-ES')}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm">{new Date(supplier.updated_at).toLocaleDateString('es-ES')}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">ID del Proveedor</label>
                                    <p className="mt-1 text-sm">#{supplier.id}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
