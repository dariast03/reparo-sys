import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calculator, Package, Plus, Save, Trash2, User, UserPlus, Wrench } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    full_name?: string;
    document_number: string;
}

interface RepairOrder {
    id: number;
    order_number: string;
    customer_id: number;
}

interface Product {
    id: number;
    name: string;
    price: string;
    stock: number;
}

interface User {
    id: number;
    name: string;
}

interface QuoteItem {
    id?: number;
    product_id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    type: 'product' | 'labor' | 'service';
}

interface QuoteCreateProps {
    customers: Customer[];
    repairOrders: RepairOrder[];
    products: Product[];
    quoteNumber: string;
}

// Componente para agregar cliente rápido
function QuickCustomerForm({ onSuccess }: { onSuccess: (customer: Customer) => void }) {
    const { data, setData, post, processing, errors, reset } = useForm<any>({
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        city: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/customers', {
            onSuccess: () => {
                reset();
                // Recargar la página para obtener la lista actualizada de clientes
                router.reload();
            },
            onError: (error) => {
                console.log('🚀 ~ handleSubmit ~ error:', error);
                // Manejar errores aquí
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required />
                    {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido *</Label>
                    <Input id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required />
                    {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>
            <div className="flex justify-end space-x-2">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : 'Guardar Cliente'}
                </Button>
            </div>
        </form>
    );
}

export default function QuoteCreate({ customers, repairOrders, products, quoteNumber }: QuoteCreateProps) {
    console.log('🚀 ~ QuoteCreate ~ repairOrders:', repairOrders);
    console.log('🚀 ~ QuoteCreate ~ customers:', customers);
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [selectedRepairOrder, setSelectedRepairOrder] = useState<RepairOrder | null>(null);
    const pageProps = usePage().props as any;
    const auth = pageProps.auth;

    const { data, setData, processing, errors } = useForm({
        quote_number: quoteNumber,
        customer_id: '',
        user_id: auth.user.id.toString(), // Usuario autenticado automáticamente
        repair_order_id: '',
        work_description: '',
        labor_cost: 0,
        parts_cost: 0,
        additional_cost: 0,
        subtotal: 0,
        discount: 0,
        taxes: 0,
        total: 0,
        validity_days: 15,
        status: 'pending',
        notes: '',
    });

    const addItem = () => {
        setItems([
            ...items,
            {
                description: '',
                quantity: 1,
                unit_price: 0,
                total_price: 0,
                type: 'product',
            },
        ]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        calculateTotals(newItems);
    };

    const updateItem = (index: number, field: keyof QuoteItem, value: string | number | undefined) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-calculate total price when quantity or unit_price changes
        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
        }

        setItems(newItems);
        calculateTotals(newItems);
    };

    const calculateTotals = (currentItems: QuoteItem[]) => {
        const laborCost = currentItems.filter((item) => item.type === 'labor').reduce((sum, item) => sum + item.total_price, 0);

        const partsCost = currentItems.filter((item) => item.type === 'product').reduce((sum, item) => sum + item.total_price, 0);

        const additionalCost = currentItems.filter((item) => item.type === 'service').reduce((sum, item) => sum + item.total_price, 0);

        const subtotal = laborCost + partsCost + additionalCost;
        const totalAfterDiscount = subtotal - data.discount;
        const total = totalAfterDiscount + data.taxes;

        setData((prevData) => ({
            ...prevData,
            labor_cost: laborCost,
            parts_cost: partsCost,
            additional_cost: additionalCost,
            subtotal: subtotal,
            total: total,
        }));
    };

    const handleRepairOrderChange = (repairOrderId: string) => {
        if (!repairOrderId) {
            // Sin vincular
            setSelectedRepairOrder(null);
            setData('repair_order_id', '');
            return;
        }

        const repairOrder = repairOrders.find((ro) => ro.id === parseInt(repairOrderId));
        setSelectedRepairOrder(repairOrder || null);

        if (repairOrder) {
            setData('customer_id', repairOrder.customer_id.toString());
        }

        setData('repair_order_id', repairOrderId);
    };

    const handleDiscountChange = (discount: number) => {
        setData('discount', discount);
        const subtotal = typeof data.subtotal === 'number' ? data.subtotal : 0;
        const totalAfterDiscount = subtotal - discount;
        const taxes = typeof data.taxes === 'number' ? data.taxes : 0;
        const total = totalAfterDiscount + taxes;
        setData('total', total);
    };

    const handleTaxesChange = (taxes: number) => {
        setData('taxes', taxes);
        const subtotal = typeof data.subtotal === 'number' ? data.subtotal : 0;
        const discount = typeof data.discount === 'number' ? data.discount : 0;
        const totalAfterDiscount = subtotal - discount;
        const total = totalAfterDiscount + taxes;
        setData('total', total);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        // Add regular form data with proper type conversion
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                // Convert numeric fields to ensure they are sent as numbers
                if (
                    key === 'validity_days' ||
                    key === 'discount' ||
                    key === 'taxes' ||
                    key === 'labor_cost' ||
                    key === 'parts_cost' ||
                    key === 'additional_cost' ||
                    key === 'subtotal' ||
                    key === 'total'
                ) {
                    formData.append(key, Number(value).toString());
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        // Add items data
        items.forEach((item, index) => {
            formData.append(`items[${index}][description]`, item.description);
            formData.append(`items[${index}][quantity]`, item.quantity.toString());
            formData.append(`items[${index}][unit_price]`, item.unit_price.toString());
            formData.append(`items[${index}][total_price]`, item.total_price.toString());
            formData.append(`items[${index}][type]`, item.type);
            if (item.product_id) {
                formData.append(`items[${index}][product_id]`, item.product_id.toString());
            }
        });

        router.post('/admin/quotes', formData);
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

    return (
        <AppLayout>
            <Head title="Nueva Cotización" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/quotes">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Nueva Cotización</h1>
                        <p className="text-muted-foreground">Cotización #{quoteNumber}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Información Principal */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información Principal</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="customer_id">Cliente *</Label>
                                            </div>

                                            <div className="flex gap-2">
                                                <Combobox
                                                    value={data.customer_id}
                                                    onValueChange={(value) => {
                                                        if (!selectedRepairOrder) {
                                                            setData('customer_id', value || '');
                                                        }
                                                    }}
                                                >
                                                    <ComboboxInput placeholder="Buscar cliente..." disabled={!!selectedRepairOrder} />
                                                    <ComboboxContent>
                                                        {customers
                                                            .filter((customer) => customer.id && customer.id > 0)
                                                            .map((customer) => (
                                                                <ComboboxItem
                                                                    key={customer.id}
                                                                    value={customer.id.toString()}
                                                                    label={`${customer.full_name || `${customer.first_name} ${customer.last_name}`} - ${customer.document_number}`}
                                                                />
                                                            ))}
                                                        <ComboboxEmpty>No se encontraron clientes.</ComboboxEmpty>
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
                                                                setData('customer_id', customer.id.toString());
                                                            }}
                                                        />
                                                    </SheetContent>
                                                </Sheet>
                                            </div>
                                            {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="repair_order_id">Orden de Reparación (Opcional)</Label>
                                            <Combobox value={data.repair_order_id} onValueChange={(value) => handleRepairOrderChange(value || '')}>
                                                <ComboboxInput placeholder="Buscar orden de reparación..." />
                                                <ComboboxContent>
                                                    {repairOrders.map((order) => (
                                                        <ComboboxItem key={order.id} value={order.id.toString()} label={`#${order.order_number}`} />
                                                    ))}
                                                    <ComboboxEmpty>No se encontraron órdenes.</ComboboxEmpty>
                                                </ComboboxContent>
                                            </Combobox>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="validity_days">Días de Validez *</Label>
                                            <Input
                                                id="validity_days"
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={data.validity_days}
                                                onChange={(e) => setData('validity_days', parseInt(e.target.value) || 15)}
                                            />
                                            {errors.validity_days && <p className="text-sm text-red-600">{errors.validity_days}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="work_description">Descripción del Trabajo *</Label>
                                        <Textarea
                                            id="work_description"
                                            value={data.work_description}
                                            onChange={(e) => setData('work_description', e.target.value)}
                                            placeholder="Describe detalladamente el trabajo a realizar..."
                                            rows={4}
                                        />
                                        {errors.work_description && <p className="text-sm text-red-600">{errors.work_description}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ítems de la Cotización */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Ítems de la Cotización</CardTitle>
                                        <Button type="button" onClick={addItem} size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Agregar Ítem
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {items.map((item, index) => {
                                            const Icon = typeIcons[item.type];
                                            return (
                                                <div key={index} className="space-y-4 rounded-lg border p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="h-4 w-4" />
                                                            <Badge variant="outline">{typeLabels[item.type]}</Badge>
                                                        </div>
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                                        <div className="space-y-2">
                                                            <Label>Tipo</Label>
                                                            <Select
                                                                value={item.type}
                                                                onValueChange={(value) => updateItem(index, 'type', value as QuoteItem['type'])}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="product">Repuesto</SelectItem>
                                                                    <SelectItem value="labor">Mano de Obra</SelectItem>
                                                                    <SelectItem value="service">Servicio</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {item.type === 'product' && (
                                                            <div className="space-y-2">
                                                                <Label>Producto</Label>
                                                                <Select
                                                                    value={item.product_id?.toString() || ''}
                                                                    onValueChange={(value) => {
                                                                        if (!value) {
                                                                            // Manual selection - clear product_id but keep description and price
                                                                            updateItem(index, 'product_id', undefined);
                                                                            return;
                                                                        }

                                                                        const productId = parseInt(value);
                                                                        const product = products.find((p) => p.id === productId);

                                                                        // Update all fields at once
                                                                        const newItems = [...items];
                                                                        newItems[index] = {
                                                                            ...newItems[index],
                                                                            product_id: productId,
                                                                            description: product ? product.name : newItems[index].description,
                                                                            unit_price: product
                                                                                ? parseFloat(product.price)
                                                                                : newItems[index].unit_price,
                                                                        };

                                                                        // Recalculate total price
                                                                        newItems[index].total_price =
                                                                            newItems[index].quantity * newItems[index].unit_price;

                                                                        setItems(newItems);
                                                                        calculateTotals(newItems);
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Seleccionar..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value={null!}>Manual</SelectItem>
                                                                        {products.map((product) => (
                                                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                                                {product.name} (Stock: {product.stock})
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}

                                                        <div className={`space-y-2 ${item.type === 'product' ? 'md:col-span-1' : 'md:col-span-2'}`}>
                                                            <Label>Descripción</Label>
                                                            <Input
                                                                value={item.description}
                                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                                placeholder="Descripción del ítem..."
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Cantidad</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Precio Unit.</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.unit_price}
                                                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Total</Label>
                                                            <Input type="number" value={item.total_price} readOnly className="bg-gray-50" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {items.length === 0 && (
                                            <div className="py-8 text-center text-muted-foreground">
                                                <Calculator className="mx-auto mb-2 h-8 w-8" />
                                                <p>No hay ítems agregados</p>
                                                <p className="text-sm">Haz clic en "Agregar Ítem" para comenzar</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Resumen y Totales */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resumen de Costos</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Mano de Obra:</span>
                                            <span className="font-mono">
                                                ${(typeof data.labor_cost === 'number' ? data.labor_cost : 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Repuestos:</span>
                                            <span className="font-mono">
                                                ${(typeof data.parts_cost === 'number' ? data.parts_cost : 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Servicios:</span>
                                            <span className="font-mono">
                                                ${(typeof data.additional_cost === 'number' ? data.additional_cost : 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <hr />
                                        <div className="flex justify-between font-medium">
                                            <span>Subtotal:</span>
                                            <span className="font-mono">${(typeof data.subtotal === 'number' ? data.subtotal : 0).toFixed(2)}</span>
                                        </div>
                                    </div>{' '}
                                    <div className="space-y-2">
                                        <Label htmlFor="discount">Descuento</Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.discount}
                                            onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="taxes">Impuestos</Label>
                                        <Input
                                            id="taxes"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.taxes}
                                            onChange={(e) => handleTaxesChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <hr />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="font-mono text-green-600">${data.total.toFixed(2)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Configuración</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Estado</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pendiente</SelectItem>
                                                <SelectItem value="approved">Aprobada</SelectItem>
                                                <SelectItem value="rejected">Rechazada</SelectItem>
                                                <SelectItem value="expired">Expirada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notas</Label>
                                        <Textarea
                                            id="notes"
                                            value={typeof data.notes === 'string' ? data.notes : ''}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Notas adicionales..."
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Guardando...' : 'Crear Cotización'}
                        </Button>
                        <Link href="/admin/quotes">
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
