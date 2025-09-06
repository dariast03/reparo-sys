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
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, FileText, Mail, MapPin, Phone, QrCode, Send, ShoppingCart, User, UserCheck, UserX, Wrench } from 'lucide-react';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    document_number: string;
    document_type: string;
    phone: string;
    email: string;
    address: string;
    birth_date: string;
    gender: string;
    notes: string;
    status: 'active' | 'inactive';
    qr_code?: string;
    qr_url?: string;
    qr_base64?: string;
    qr_data_uri?: string;
    created_at: string;
    updated_at: string;
    repair_orders?: Array<{
        id: number;
        order_number: string;
        status: string;
        total_cost: number;
        received_date: string;
        created_at: string;
    }>;
    sales?: Array<{
        id: number;
        sale_number: string;
        total: number;
        sale_date: string;
        created_at: string;
    }>;
    quotes?: Array<{
        id: number;
        quote_number: string;
        total: number;
        status: string;
        quote_date: string;
        created_at: string;
    }>;
}

interface Statistics {
    total_repair_orders: number;
    total_sales: number;
    total_quotes: number;
    pending_repair_orders: number;
    total_spent: number;
}

interface ShowCustomerProps {
    customer: Customer;
    statistics: Statistics;
}

const documentTypeLabels = {
    ci: 'Cédula de Identidad',
    passport: 'Pasaporte',
    driver_license: 'Licencia de Conducir',
    foreigner_id: 'Carnet de Extranjero',
    nit: 'NIT',
    military_id: 'Libreta Militar',
    other: 'Otro',
};

const genderLabels = {
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otro',
};

export default function ShowCustomer({ customer, statistics }: ShowCustomerProps) {
    const handleDeactivateCustomer = () => {
        router.delete(`/admin/customers/${customer.id}`, {
            preserveScroll: true,
        });
    };

    const handleReactivateCustomer = () => {
        router.patch(
            `/admin/customers/${customer.id}/reactivate`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleSendQrEmail = () => {
        router.post(
            `/admin/customers/${customer.id}/send-qr-email`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                <UserCheck className="mr-1 h-3 w-3" />
                Activo
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                <UserX className="mr-1 h-3 w-3" />
                Inactivo
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'BOB',
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title={`${customer.first_name} ${customer.last_name} - Detalles del Cliente`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/customers">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {customer.first_name} {customer.last_name}
                            </h1>
                            <div className="mt-1 flex items-center gap-2">
                                {getStatusBadge(customer.status)}
                                <span className="text-muted-foreground">
                                    Cliente desde {new Date(customer.created_at).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/admin/customers/${customer.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                        {customer.email && (
                            <Button variant="outline" onClick={handleSendQrEmail}>
                                <Send className="mr-2 h-4 w-4" />
                                Enviar QR
                            </Button>
                        )}
                        {customer.status === 'active' ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                                        <UserX className="mr-2 h-4 w-4" />
                                        Inactivar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Inactivar Cliente?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            ¿Estás seguro de que deseas inactivar a {customer.first_name} {customer.last_name}? Esta acción no
                                            eliminará el cliente, pero no aparecerá en las búsquedas normales.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeactivateCustomer} className="bg-red-600 hover:bg-red-700">
                                            Inactivar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <Button
                                variant="outline"
                                className="border-green-600 text-green-600 hover:bg-green-50"
                                onClick={handleReactivateCustomer}
                            >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Reactivar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Personal Information */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Información Personal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Nombres</label>
                                        <p className="text-lg">{customer.first_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Apellidos</label>
                                        <p className="text-lg">{customer.last_name}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Tipo de Documento</label>
                                        <p>{documentTypeLabels[customer.document_type as keyof typeof documentTypeLabels]}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Número de Documento</label>
                                        <p className="font-mono">{customer.document_number}</p>
                                    </div>
                                </div>

                                {(customer.birth_date || customer.gender) && (
                                    <>
                                        <Separator />
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {customer.birth_date && (
                                                <div>
                                                    <label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                                        <Calendar className="h-4 w-4" />
                                                        Fecha de Nacimiento
                                                    </label>
                                                    <p>{new Date(customer.birth_date).toLocaleDateString('es-ES')}</p>
                                                </div>
                                            )}
                                            {customer.gender && (
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">Género</label>
                                                    <p>{genderLabels[customer.gender as keyof typeof genderLabels]}</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {customer.notes && (
                                    <>
                                        <Separator />
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Notas</label>
                                            <p className="whitespace-pre-wrap">{customer.notes}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de Contacto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{customer.phone}</p>
                                            <p className="text-sm text-muted-foreground">Teléfono</p>
                                        </div>
                                    </div>

                                    {customer.email && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{customer.email}</p>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                            </div>
                                        </div>
                                    )}

                                    {customer.address && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{customer.address}</p>
                                                <p className="text-sm text-muted-foreground">Dirección</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {customer.qr_code && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-3">
                                                <QrCode className="h-5 w-5 text-muted-foreground" />
                                                <label className="text-sm font-medium text-muted-foreground">Código QR del Cliente</label>
                                            </div>
                                            <div className="flex justify-center p-3 bg-white rounded-lg border">
                                                <img
                                                    src={customer.qr_data_uri}
                                                    alt={`QR Code for ${customer.first_name} ${customer.last_name}`}
                                                    className="w-32 h-32"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2 font-mono">{customer.qr_code}</p>
                                            {customer.qr_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3"
                                                    onClick={() => window.open(customer.qr_url, '_blank')}
                                                >
                                                    Ver Portal del Cliente
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Wrench className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Reparaciones</p>
                                    <p className="text-2xl font-bold">{statistics.total_repair_orders}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <ShoppingCart className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Ventas</p>
                                    <p className="text-2xl font-bold">{statistics.total_sales}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <FileText className="h-8 w-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Presupuestos</p>
                                    <p className="text-2xl font-bold">{statistics.total_quotes}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Wrench className="h-8 w-8 text-orange-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                                    <p className="text-2xl font-bold">{statistics.pending_repair_orders}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-500 font-bold text-white">
                                    Bs
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Total Gastado</p>
                                    <p className="text-2xl font-bold">{formatCurrency(statistics.total_spent)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recent Repair Orders */}
                    {customer.repair_orders && customer.repair_orders.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="h-5 w-5" />
                                    Órdenes de Reparación Recientes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {customer.repair_orders.slice(0, 5).map((order) => (
                                        <div key={order.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{order.order_number}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString('es-ES')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline">{order.status}</Badge>
                                                <p className="text-sm">{formatCurrency(order.total_cost)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Sales */}
                    {customer.sales && customer.sales.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Ventas Recientes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {customer.sales.slice(0, 5).map((sale) => (
                                        <div key={sale.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{sale.sale_number}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(sale.created_at).toLocaleDateString('es-ES')}
                                                </p>
                                            </div>
                                            <p className="font-medium">{formatCurrency(sale.total)}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Quotes */}
                    {customer.quotes && customer.quotes.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Presupuestos Recientes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {customer.quotes.slice(0, 5).map((quote) => (
                                        <div key={quote.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{quote.quote_number}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(quote.created_at).toLocaleDateString('es-ES')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline">{quote.status}</Badge>
                                                <p className="text-sm">{formatCurrency(quote.total)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
