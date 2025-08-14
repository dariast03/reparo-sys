import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

interface RepairOrder {
    id: number;
    order_number: string;
    status: string;
    priority: string;
    technical_notes?: string;
    diagnosis_cost: string;
    repair_cost: string;
    total_cost: string;
    advance_payment: string;
    technician_user_id?: number;
}

interface Technician {
    id: number;
    name: string;
}

interface RepairOrderEditProps {
    repairOrder: RepairOrder;
    technicians: Technician[];
}

export default function RepairOrderEdit({ repairOrder, technicians }: RepairOrderEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        status: repairOrder.status,
        priority: repairOrder.priority,
        technical_notes: repairOrder.technical_notes || '',
        diagnosis_cost: repairOrder.diagnosis_cost,
        repair_cost: repairOrder.repair_cost,
        total_cost: repairOrder.total_cost,
        advance_payment: repairOrder.advance_payment,
        technician_user_id: repairOrder.technician_user_id?.toString() || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/repair-orders/${repairOrder.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Editar Orden ${repairOrder.order_number}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/repair-orders/${repairOrder.id}`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Editar Orden {repairOrder.order_number}</h1>
                        <p className="text-muted-foreground">Actualizar estado y información técnica</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Estado y Asignación</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Estado</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="received">Recibido</SelectItem>
                                            <SelectItem value="diagnosing">Diagnosticando</SelectItem>
                                            <SelectItem value="waiting_parts">Esperando Repuestos</SelectItem>
                                            <SelectItem value="repairing">Reparando</SelectItem>
                                            <SelectItem value="repaired">Reparado</SelectItem>
                                            <SelectItem value="unrepairable">Irreparable</SelectItem>
                                            <SelectItem value="waiting_customer">Esperando Cliente</SelectItem>
                                            <SelectItem value="delivered">Entregado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Prioridad</Label>
                                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Baja</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                            <SelectItem value="urgent">Urgente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="technician_user_id">Técnico Asignado</Label>
                                    <Combobox value={data.technician_user_id} onValueChange={(value) => setData('technician_user_id', value || '')}>
                                        <ComboboxInput placeholder="Buscar técnico..." />
                                        <ComboboxContent>
                                            {technicians.map((technician) => (
                                                <ComboboxItem key={technician.id} value={technician.id.toString()} label={technician.name} />
                                            ))}
                                            <ComboboxEmpty>No se encontraron técnicos</ComboboxEmpty>
                                        </ComboboxContent>
                                    </Combobox>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Costos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="diagnosis_cost">Diagnóstico</Label>
                                        <Input
                                            id="diagnosis_cost"
                                            type="number"
                                            step="0.01"
                                            value={data.diagnosis_cost}
                                            onChange={(e) => setData('diagnosis_cost', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="repair_cost">Reparación</Label>
                                        <Input
                                            id="repair_cost"
                                            type="number"
                                            step="0.01"
                                            value={data.repair_cost}
                                            onChange={(e) => setData('repair_cost', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="total_cost">Total</Label>
                                    <Input
                                        id="total_cost"
                                        type="number"
                                        step="0.01"
                                        value={data.total_cost}
                                        onChange={(e) => setData('total_cost', e.target.value)}
                                        className="font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="advance_payment">Pago Adelantado</Label>
                                    <Input
                                        id="advance_payment"
                                        type="number"
                                        step="0.01"
                                        value={data.advance_payment}
                                        onChange={(e) => setData('advance_payment', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notas Técnicas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={data.technical_notes}
                                        onChange={(e) => setData('technical_notes', e.target.value)}
                                        placeholder="Diagnóstico, reparaciones realizadas, observaciones técnicas..."
                                        rows={6}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Guardando...' : 'Actualizar Orden'}
                        </Button>
                        <Link href={`/admin/repair-orders/${repairOrder.id}`}>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
