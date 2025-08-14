import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, Edit, Mail, MoreHorizontal, Package, User, Wrench } from 'lucide-react';
import { useState } from 'react';

interface Quote {
    id: number;
    quote_number: string;
    customer: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        address?: string;
    };
    user: {
        id: number;
        name: string;
    };
    repair_order?: {
        id: number;
        order_number: string;
        status: string;
    };
    work_description: string;
    labor_cost: string;
    parts_cost: string;
    additional_cost: string;
    subtotal: string;
    discount: string;
    taxes: string;
    total: string;
    validity_days: number;
    status: string;
    notes?: string;
    expiry_date: string;
    created_at: string;
    quote_details?: Array<{
        id: number;
        description: string;
        quantity: string;
        unit_price: string;
        total_price: string;
        type: string;
        product?: {
            id: number;
            name: string;
        };
    }>;
}

interface QuoteShowProps {
    quote: Quote;
}

const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800',
};

const statusLabels = {
    draft: 'Borrador',
    sent: 'Enviada',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    expired: 'Vencida',
};

const typeLabels = {
    product: 'Repuesto',
    labor: 'Mano de Obra',
    service: 'Servicio',
};

const typeIcons = {
    product: Package,
    labor: Wrench,
    service: User,
};

export default function QuoteShow({ quote }: QuoteShowProps) {
    const [updating, setUpdating] = useState(false);

    const handleSendEmail = () => {
        if (!quote.customer.email) {
            alert('El cliente no tiene email registrado.');
            return;
        }

        if (confirm('¿Está seguro de enviar esta cotización por email?')) {
            setUpdating(true);
            router.post(
                `/admin/quotes/${quote.id}/send-email`,
                {},
                {
                    onFinish: () => setUpdating(false),
                },
            );
        }
    };

    const handleStatusUpdate = (status: string) => {
        const confirmMessages = {
            approved: '¿Confirma que desea marcar esta cotización como APROBADA?',
            rejected: '¿Confirma que desea marcar esta cotización como RECHAZADA?',
            expired: '¿Confirma que desea marcar esta cotización como VENCIDA?',
        };

        const message = confirmMessages[status as keyof typeof confirmMessages] || `¿Confirma que desea cambiar el estado a ${status}?`;

        if (confirm(message)) {
            setUpdating(true);
            router.patch(
                `/admin/quotes/${quote.id}/update-status`,
                {
                    status: status,
                    response_date: new Date().toISOString(),
                },
                {
                    onFinish: () => setUpdating(false),
                },
            );
        }
    };

    const isExpired = new Date(quote.expiry_date) < new Date();
    const daysUntilExpiry = Math.ceil((new Date(quote.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

    console.log(quote.quote_details);
    return (
        <AppLayout>
            <Head title={`Cotización ${quote.quote_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/quotes">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Cotización {quote.quote_number}</h1>
                            <div className="mt-2 flex items-center gap-4">
                                <Badge className={statusColors[quote.status as keyof typeof statusColors]}>
                                    {statusLabels[quote.status as keyof typeof statusLabels]}
                                </Badge>
                                {isExpired ? (
                                    <span className="text-sm font-medium text-red-600">Vencida</span>
                                ) : daysUntilExpiry <= 3 ? (
                                    <span className="text-sm font-medium text-orange-600">Vence en {daysUntilExpiry} días</span>
                                ) : (
                                    <span className="text-sm font-medium text-green-600">{daysUntilExpiry} días restantes</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <MoreHorizontal className="mr-2 h-4 w-4" />
                                    Acciones
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <Link href={`/admin/quotes/${quote.id}/edit`}>
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => window.open(`/admin/quotes/${quote.id}/download-pdf`, '_blank')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar PDF
                                </DropdownMenuItem>
                                {quote.customer.email && (
                                    <DropdownMenuItem onClick={handleSendEmail} disabled={updating}>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Enviar por Email
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {quote.status === 'sent' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleStatusUpdate('approved')} disabled={updating}>
                                            <span className="mr-2 h-4 w-4 text-green-600">✓</span>
                                            Marcar como Aprobada
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusUpdate('rejected')} disabled={updating}>
                                            <span className="mr-2 h-4 w-4 text-red-600">✗</span>
                                            Marcar como Rechazada
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {quote.status !== 'expired' && isExpired && (
                                    <DropdownMenuItem onClick={() => handleStatusUpdate('expired')} disabled={updating}>
                                        <span className="mr-2 h-4 w-4 text-orange-600">⚠</span>
                                        Marcar como Vencida
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Información Principal */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Cliente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                        <p className="text-sm">{quote.customer.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <p className="text-sm">{quote.customer.email}</p>
                                    </div>
                                    {quote.customer.phone && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                                            <p className="text-sm">{quote.customer.phone}</p>
                                        </div>
                                    )}
                                    {quote.customer.address && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                                            <p className="text-sm">{quote.customer.address}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {quote.repair_order && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Orden de Reparación Vinculada</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">#{quote.repair_order.order_number}</p>
                                            <p className="text-sm text-muted-foreground">Estado: {quote.repair_order.status}</p>
                                        </div>
                                        <Link href={`/admin/repair-orders/${quote.repair_order.id}`}>
                                            <Button variant="outline" size="sm">
                                                Ver Orden
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Descripción del Trabajo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed">{quote.work_description}</p>
                            </CardContent>
                        </Card>

                        {quote.quote_details && quote.quote_details.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detalles de la Cotización</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Tipo</TableHead>
                                                    <TableHead>Descripción</TableHead>
                                                    <TableHead className="text-center">Cant.</TableHead>
                                                    <TableHead className="text-right">P. Unit.</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {quote.quote_details.map((detail) => {
                                                    const Icon = typeIcons[detail.type as keyof typeof typeIcons];
                                                    return (
                                                        <TableRow key={detail.id}>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Icon className="h-4 w-4" />
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {typeLabels[detail.type as keyof typeof typeLabels]}
                                                                    </Badge>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="text-sm font-medium">{detail.description}</p>
                                                                    {detail.product && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Producto: {detail.product.name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">{parseFloat(detail.quantity).toFixed(2)}</TableCell>
                                                            <TableCell className="text-right font-mono">
                                                                ${parseFloat(detail.unit_price).toFixed(2)}
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono font-medium">
                                                                ${parseFloat(detail.total_price).toFixed(2)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {quote.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notas Adicionales</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed">{quote.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Información Lateral */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de la Cotización</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Número</label>
                                    <p className="font-mono">{quote.quote_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Elaborado por</label>
                                    <p className="text-sm">{quote.user.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Fecha de Emisión</label>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <p className="text-sm">{new Date(quote.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Fecha de Vencimiento</label>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <p className="text-sm">{new Date(quote.expiry_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Días de Validez</label>
                                    <p className="text-sm">{quote.validity_days} días</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen de Costos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Mano de Obra:</span>
                                        <span className="font-mono text-sm">${parseFloat(quote.labor_cost).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Repuestos:</span>
                                        <span className="font-mono text-sm">${parseFloat(quote.parts_cost).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Servicios:</span>
                                        <span className="font-mono text-sm">${parseFloat(quote.additional_cost).toFixed(2)}</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Subtotal:</span>
                                        <span className="font-mono text-sm font-medium">${parseFloat(quote.subtotal).toFixed(2)}</span>
                                    </div>
                                    {parseFloat(quote.discount) > 0 && (
                                        <div className="flex justify-between text-red-600">
                                            <span className="text-sm">Descuento:</span>
                                            <span className="font-mono text-sm">-${parseFloat(quote.discount).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {parseFloat(quote.taxes) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-sm">Impuestos:</span>
                                            <span className="font-mono text-sm">${parseFloat(quote.taxes).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <hr />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="font-mono text-green-600">${parseFloat(quote.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
