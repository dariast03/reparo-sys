import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';

interface RepairOrder {
    id: number;
    order_number: string;
    customer: {
        first_name: string;
        last_name: string;
        document_number: string;
        phone: string;
        email: string;
    };
    brand: { name: string };
    model: { name: string };
    technician?: { name: string };
    reception_user: { name: string };
    device_serial?: string;
    imei?: string;
    device_color?: string;
    unlock_pattern?: string;
    problem_description: string;
    customer_notes?: string;
    technical_notes?: string;
    included_accessories?: string;
    status: string;
    priority: string;
    diagnosis_cost: string;
    repair_cost: string;
    total_cost: string;
    advance_payment: string;
    pending_balance: string;
    promised_date?: string;
    created_at: string;
}

interface RepairOrderShowProps {
    repairOrder: RepairOrder;
}

const statusLabels = {
    received: 'Recibido',
    diagnosing: 'Diagnosticando',
    waiting_parts: 'Esperando Repuestos',
    repairing: 'Reparando',
    repaired: 'Reparado',
    unrepairable: 'Irreparable',
    waiting_customer: 'Esperando Cliente',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

const priorityLabels = {
    low: 'Baja',
    normal: 'Normal',
    high: 'Alta',
    urgent: 'Urgente',
};

export default function RepairOrderShow({ repairOrder }: RepairOrderShowProps) {
    const formatCurrency = (amount: string): string => {
        const num = parseFloat(amount);
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'BOB',
        }).format(isNaN(num) ? 0 : num);
    };

    return (
        <AppLayout>
            <Head title={`Orden ${repairOrder.order_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/repair-orders">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Orden {repairOrder.order_number}</h1>
                            <p className="text-muted-foreground">
                                {repairOrder.customer.first_name} {repairOrder.customer.last_name} •{repairOrder.brand.name} {repairOrder.model.name}
                            </p>
                        </div>
                    </div>
                    <Link href={`/admin/repair-orders/${repairOrder.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* Estado y Prioridad */}
                        <div className="flex gap-4">
                            <Badge variant="secondary" className="px-4 py-2 text-lg">
                                {statusLabels[repairOrder.status as keyof typeof statusLabels]}
                            </Badge>
                            <Badge variant="outline" className="px-4 py-2 text-lg">
                                Prioridad: {priorityLabels[repairOrder.priority as keyof typeof priorityLabels]}
                            </Badge>
                        </div>

                        {/* Información del Cliente */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                    <p className="font-semibold">
                                        {repairOrder.customer.first_name} {repairOrder.customer.last_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Documento</label>
                                    <p className="font-semibold">{repairOrder.customer.document_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                                    <p className="font-semibold">{repairOrder.customer.phone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="font-semibold">{repairOrder.customer.email}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información del Dispositivo */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Dispositivo</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Marca</label>
                                    <p className="font-semibold">{repairOrder.brand.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Modelo</label>
                                    <p className="font-semibold">{repairOrder.model.name}</p>
                                </div>
                                {repairOrder.device_serial && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Serie</label>
                                        <p className="font-semibold">{repairOrder.device_serial}</p>
                                    </div>
                                )}
                                {repairOrder.imei && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">IMEI</label>
                                        <p className="font-semibold">{repairOrder.imei}</p>
                                    </div>
                                )}
                                {repairOrder.device_color && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Color</label>
                                        <p className="font-semibold">{repairOrder.device_color}</p>
                                    </div>
                                )}
                                {repairOrder.unlock_pattern && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Desbloqueo</label>
                                        <p className="font-semibold">{repairOrder.unlock_pattern}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Problema y Notas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Descripción del Problema</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Problema Reportado</label>
                                    <p className="mt-1 whitespace-pre-wrap">{repairOrder.problem_description}</p>
                                </div>
                                {repairOrder.customer_notes && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Notas del Cliente</label>
                                        <p className="mt-1 whitespace-pre-wrap">{repairOrder.customer_notes}</p>
                                    </div>
                                )}
                                {repairOrder.technical_notes && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Notas Técnicas</label>
                                        <p className="mt-1 whitespace-pre-wrap">{repairOrder.technical_notes}</p>
                                    </div>
                                )}
                                {repairOrder.included_accessories && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Accesorios Incluidos</label>
                                        <p className="mt-1 whitespace-pre-wrap">{repairOrder.included_accessories}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Costos */}
                        <Card>
                            <CardHeader>
                                <CardTitle>💰 Costos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Diagnóstico:</span>
                                    <span className="font-semibold">{formatCurrency(repairOrder.diagnosis_cost)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Reparación:</span>
                                    <span className="font-semibold">{formatCurrency(repairOrder.repair_cost)}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between text-lg">
                                    <span className="font-semibold">Total:</span>
                                    <span className="font-bold">{formatCurrency(repairOrder.total_cost)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Adelanto:</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(repairOrder.advance_payment)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pendiente:</span>
                                    <span className="font-bold text-red-600">{formatCurrency(repairOrder.pending_balance)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Personal */}
                        <Card>
                            <CardHeader>
                                <CardTitle>👥 Asignaciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Recibido por</label>
                                    <p className="font-semibold">{repairOrder.reception_user.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Técnico Asignado</label>
                                    <p className="font-semibold">{repairOrder.technician ? repairOrder.technician.name : 'Sin asignar'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fechas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>📅 Fechas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Recibido</label>
                                    <p className="font-semibold">{new Date(repairOrder.created_at).toLocaleString('es-ES')}</p>
                                </div>
                                {repairOrder.promised_date && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Fecha Prometida</label>
                                        <p className="font-semibold">{new Date(repairOrder.promised_date).toLocaleString('es-ES')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
