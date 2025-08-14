import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { QuickCustomerForm } from '../customers/components/customer-form';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    document_number: string;
}

interface Brand {
    id: number;
    name: string;
}

interface DeviceModel {
    id: number;
    name: string;
}

interface Technician {
    id: number;
    name: string;
}

interface RepairOrderCreateProps {
    customers: Customer[];
    brands: Brand[];
    technicians: Technician[];
    orderNumber: string;
}

export default function RepairOrderCreate({ customers, brands, technicians, orderNumber }: RepairOrderCreateProps) {
    const [models, setModels] = useState<DeviceModel[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        technician_user_id: '',
        brand_id: '',
        model_id: '',
        device_serial: '',
        imei: '',
        device_color: '',
        unlock_pattern: '',
        problem_description: '',
        customer_notes: '',
        included_accessories: '',
        priority: 'normal',
        diagnosis_cost: '0',
        repair_cost: '0',
        total_cost: '0',
        advance_payment: '0',
        promised_date: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/repair-orders');
    };

    const handleBrandChange = async (brandId: string) => {
        setData('brand_id', brandId);
        setData('model_id', '');

        if (brandId) {
            try {
                const response = await fetch(`/admin/api/repair-orders/models-by-brand?brand_id=${brandId}`);
                const modelsData = await response.json();
                setModels(modelsData);
            } catch (error) {
                console.error('Error fetching models:', error);
                setModels([]);
            }
        } else {
            setModels([]);
        }
    };

    // Calculate total when costs change
    const updateTotal = () => {
        const diagnosis = parseFloat(data.diagnosis_cost) || 0;
        const repair = parseFloat(data.repair_cost) || 0;
        const total = diagnosis + repair;
        setData('total_cost', total.toString());
    };

    return (
        <AppLayout>
            <Head title="Nueva Orden de Reparación" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/repair-orders">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Nueva Orden de Reparación</h1>
                        <p className="text-muted-foreground">Orden #{orderNumber}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Cliente y Dispositivo */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información del Cliente</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_id">Cliente *</Label>

                                        <div className="flex gap-2">
                                            <Combobox value={data.customer_id} onValueChange={(value) => setData('customer_id', value || '')}>
                                                <ComboboxInput
                                                    placeholder="Buscar cliente..."
                                                    className={errors.customer_id ? 'border-red-500' : ''}
                                                />
                                                <ComboboxContent>
                                                    {customers.map((customer) => (
                                                        <ComboboxItem
                                                            key={customer.id}
                                                            value={customer.id.toString()}
                                                            label={`${customer.first_name} ${customer.last_name} - ${customer.document_number}`}
                                                        />
                                                    ))}
                                                    <ComboboxEmpty>No se encontraron clientes</ComboboxEmpty>
                                                </ComboboxContent>
                                            </Combobox>

                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-8">
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                    </Button>
                                                </SheetTrigger>
                                                <SheetContent>
                                                    <SheetHeader>
                                                        <SheetTitle>Agregar Cliente Rápido</SheetTitle>
                                                        <SheetDescription>
                                                            Completa los datos básicos del cliente para agregarlo rápidamente.
                                                        </SheetDescription>
                                                    </SheetHeader>
                                                    <QuickCustomerForm
                                                        onSuccess={(customer) => {
                                                            // Refresh customer list and select new customer
                                                            router.reload({ only: ['customers'] });
                                                            setData('customer_id', customer?.id?.toString());
                                                        }}
                                                    />
                                                </SheetContent>
                                            </Sheet>
                                        </div>
                                        {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Información del Dispositivo</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="brand_id">Marca *</Label>
                                            <Combobox value={data.brand_id} onValueChange={(value) => handleBrandChange(value || '')}>
                                                <ComboboxInput placeholder="Buscar marca..." className={errors.brand_id ? 'border-red-500' : ''} />
                                                <ComboboxContent>
                                                    {brands.map((brand) => (
                                                        <ComboboxItem key={brand.id} value={brand.id.toString()} label={brand.name} />
                                                    ))}
                                                    <ComboboxEmpty>No se encontraron marcas</ComboboxEmpty>
                                                </ComboboxContent>
                                            </Combobox>
                                            {errors.brand_id && <p className="text-sm text-red-600">{errors.brand_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="model_id">Modelo *</Label>
                                            <Combobox value={data.model_id} onValueChange={(value) => setData('model_id', value || '')}>
                                                <ComboboxInput placeholder="Buscar modelo..." className={errors.model_id ? 'border-red-500' : ''} />
                                                <ComboboxContent>
                                                    {models.map((model) => (
                                                        <ComboboxItem key={model.id} value={model.id.toString()} label={model.name} />
                                                    ))}
                                                    <ComboboxEmpty>
                                                        {data.brand_id ? 'No se encontraron modelos para esta marca' : 'Primero selecciona una marca'}
                                                    </ComboboxEmpty>
                                                </ComboboxContent>
                                            </Combobox>
                                            {errors.model_id && <p className="text-sm text-red-600">{errors.model_id}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="device_serial">Número de Serie</Label>
                                            <Input
                                                id="device_serial"
                                                value={data.device_serial}
                                                onChange={(e) => setData('device_serial', e.target.value)}
                                                placeholder="Ej: ABC123XYZ"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="imei">IMEI</Label>
                                            <Input
                                                id="imei"
                                                value={data.imei}
                                                onChange={(e) => setData('imei', e.target.value)}
                                                placeholder="Ej: 123456789012345"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="device_color">Color</Label>
                                            <Input
                                                id="device_color"
                                                value={data.device_color}
                                                onChange={(e) => setData('device_color', e.target.value)}
                                                placeholder="Ej: Negro"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="unlock_pattern">Patrón de Desbloqueo</Label>
                                        <Input
                                            id="unlock_pattern"
                                            value={data.unlock_pattern}
                                            onChange={(e) => setData('unlock_pattern', e.target.value)}
                                            placeholder="PIN, patrón, contraseña, etc."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Descripción del Problema</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="problem_description">Problema Reportado *</Label>
                                        <Textarea
                                            id="problem_description"
                                            value={data.problem_description}
                                            onChange={(e) => setData('problem_description', e.target.value)}
                                            placeholder="Describe detalladamente el problema reportado por el cliente..."
                                            rows={4}
                                            required
                                        />
                                        {errors.problem_description && <p className="text-sm text-red-600">{errors.problem_description}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer_notes">Notas del Cliente</Label>
                                        <Textarea
                                            id="customer_notes"
                                            value={data.customer_notes}
                                            onChange={(e) => setData('customer_notes', e.target.value)}
                                            placeholder="Información adicional proporcionada por el cliente..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="included_accessories">Accesorios Incluidos</Label>
                                        <Textarea
                                            id="included_accessories"
                                            value={data.included_accessories}
                                            onChange={(e) => setData('included_accessories', e.target.value)}
                                            placeholder="Cargador, funda, audífonos, etc."
                                            rows={2}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Asignación y Prioridad</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="technician_user_id">Técnico Asignado</Label>
                                        <Select value={data.technician_user_id} onValueChange={(value) => setData('technician_user_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin asignar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {technicians
                                                    .filter((technician) => technician.id != null && technician.id > 0)
                                                    .map((technician) => (
                                                        <SelectItem key={technician.id} value={technician.id.toString()}>
                                                            {technician.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Prioridad *</Label>
                                        <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">🟢 Baja</SelectItem>
                                                <SelectItem value="normal">🔵 Normal</SelectItem>
                                                <SelectItem value="high">🟠 Alta</SelectItem>
                                                <SelectItem value="urgent">🔴 Urgente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="promised_date">Fecha Prometida</Label>
                                        <Input
                                            id="promised_date"
                                            type="datetime-local"
                                            value={data.promised_date}
                                            onChange={(e) => setData('promised_date', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Costos</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="diagnosis_cost">Costo de Diagnóstico</Label>
                                        <Input
                                            id="diagnosis_cost"
                                            type="number"
                                            step="0.01"
                                            value={data.diagnosis_cost}
                                            onChange={(e) => {
                                                setData('diagnosis_cost', e.target.value);
                                                setTimeout(updateTotal, 0);
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="repair_cost">Costo de Reparación</Label>
                                        <Input
                                            id="repair_cost"
                                            type="number"
                                            step="0.01"
                                            value={data.repair_cost}
                                            onChange={(e) => {
                                                setData('repair_cost', e.target.value);
                                                setTimeout(updateTotal, 0);
                                            }}
                                        />
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

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing} className="flex-1">
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Guardando...' : 'Crear Orden'}
                                </Button>
                                <Link href="/admin/repair-orders">
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
