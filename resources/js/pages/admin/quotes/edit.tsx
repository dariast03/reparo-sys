import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calculator, Package, Plus, Save, Trash2, User, Wrench } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    full_name?: string;
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

interface Quote {
    id: number;
    quote_number: string;
    customer_id: number;
    user_id: number;
    repair_order_id?: number;
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
    quote_details?: Array<{
        id: number;
        product_id?: number;
        description: string;
        quantity: string;
        unit_price: string;
        total_price: string;
        type: string;
    }>;
}

interface QuoteEditProps {
    quote: Quote;
    customers: Customer[];
    repairOrders: RepairOrder[];
    products: Product[];
    users: User[];
}

export default function QuoteEdit({ quote, customers, repairOrders, products, users }: QuoteEditProps) {
    const [items, setItems] = useState<QuoteItem[]>(
        quote.quote_details?.map((detail) => ({
            id: detail.id,
            product_id: detail.product_id,
            description: detail.description,
            quantity: parseFloat(detail.quantity),
            unit_price: parseFloat(detail.unit_price),
            total_price: parseFloat(detail.total_price),
            type: detail.type as 'product' | 'labor' | 'service',
        })) || [],
    );
    const [selectedRepairOrder, setSelectedRepairOrder] = useState<RepairOrder | null>(
        quote.repair_order_id ? repairOrders.find((ro) => ro.id === quote.repair_order_id) || null : null,
    );

    const { data, setData, processing, errors } = useForm({
        quote_number: quote.quote_number,
        customer_id: quote.customer_id.toString(),
        user_id: quote.user_id.toString(),
        repair_order_id: quote.repair_order_id?.toString() || '',
        work_description: quote.work_description,
        labor_cost: parseFloat(quote.labor_cost),
        parts_cost: parseFloat(quote.parts_cost),
        additional_cost: parseFloat(quote.additional_cost),
        subtotal: parseFloat(quote.subtotal),
        discount: parseFloat(quote.discount),
        taxes: parseFloat(quote.taxes),
        total: parseFloat(quote.total),
        validity_days: quote.validity_days,
        status: quote.status,
        notes: quote.notes || '',
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

        // Auto-calculate total price
        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
        }

        // If product selected, populate fields
        if (field === 'product_id' && value && typeof value === 'string') {
            const product = products.find((p) => p.id === parseInt(value));
            if (product) {
                newItems[index].description = product.name;
                newItems[index].unit_price = parseFloat(product.price);
                newItems[index].total_price = newItems[index].quantity * parseFloat(product.price);
            }
        }

        setItems(newItems);
        calculateTotals(newItems);
    };

    const calculateTotals = (currentItems: QuoteItem[]) => {
        const laborCost = currentItems.filter((item) => item.type === 'labor').reduce((sum, item) => sum + item.total_price, 0);

        const partsCost = currentItems.filter((item) => item.type === 'product').reduce((sum, item) => sum + item.total_price, 0);

        const additionalCost = currentItems.filter((item) => item.type === 'service').reduce((sum, item) => sum + item.total_price, 0);

        const subtotal = laborCost + partsCost + additionalCost;
        const totalAfterDiscount = subtotal - (typeof data.discount === 'number' ? data.discount : 0);
        const total = totalAfterDiscount + (typeof data.taxes === 'number' ? data.taxes : 0);

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

        // Add regular form data
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value.toString());
            }
        });

        // Add items data
        items.forEach((item, index) => {
            if (item.id) {
                formData.append(`items[${index}][id]`, item.id.toString());
            }
            formData.append(`items[${index}][description]`, item.description);
            formData.append(`items[${index}][quantity]`, item.quantity.toString());
            formData.append(`items[${index}][unit_price]`, item.unit_price.toString());
            formData.append(`items[${index}][total_price]`, item.total_price.toString());
            formData.append(`items[${index}][item_type]`, item.type);
            if (item.product_id) {
                formData.append(`items[${index}][product_id]`, item.product_id.toString());
            }
        });

        // Add _method for PUT request
        formData.append('_method', 'PUT');

        router.post(`/admin/quotes/${quote.id}`, formData);
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
            <Head title={`Editar Cotización ${quote.quote_number}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/quotes/${quote.id}`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Editar Cotización</h1>
                        <p className="text-muted-foreground">Cotización #{quote.quote_number}</p>
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
                                            <Label htmlFor="customer_id">Cliente *</Label>
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
                                                                label={customer.full_name || `${customer.first_name} ${customer.last_name}`}
                                                            />
                                                        ))}
                                                    <ComboboxEmpty>No se encontraron clientes.</ComboboxEmpty>
                                                </ComboboxContent>
                                            </Combobox>
                                            {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="repair_order_id">Orden de Reparación (Opcional)</Label>
                                            <Combobox value={data.repair_order_id} onValueChange={(value) => handleRepairOrderChange(value || '')}>
                                                <ComboboxInput placeholder="Buscar orden de reparación..." />
                                                <ComboboxContent>
                                                    <ComboboxItem value="" label="Sin vincular" />
                                                    {repairOrders.map((order) => (
                                                        <ComboboxItem key={order.id} value={order.id.toString()} label={`#${order.order_number}`} />
                                                    ))}
                                                    <ComboboxEmpty>No se encontraron órdenes.</ComboboxEmpty>
                                                </ComboboxContent>
                                            </Combobox>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="user_id">Elaborado por *</Label>
                                            <Select value={data.user_id} onValueChange={(value) => setData('user_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar usuario" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users
                                                        .filter((user) => user.id && user.id > 0)
                                                        .map((user) => (
                                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                                {user.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.user_id && <p className="text-sm text-red-600">{errors.user_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="validity_days">Días de Validez *</Label>
                                            <Input
                                                id="validity_days"
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={typeof data.validity_days === 'number' ? data.validity_days : 0}
                                                onChange={(e) => setData('validity_days', parseInt(e.target.value))}
                                            />
                                            {errors.validity_days && <p className="text-sm text-red-600">{errors.validity_days}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="work_description">Descripción del Trabajo *</Label>
                                        <Textarea
                                            id="work_description"
                                            value={typeof data.work_description === 'string' ? data.work_description : ''}
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
                                                                <Label>Repuesto</Label>
                                                                <Select
                                                                    value={item.product_id?.toString() || ''}
                                                                    onValueChange={(value) =>
                                                                        updateItem(index, 'product_id', value ? parseInt(value) : undefined)
                                                                    }
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
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="discount">Descuento</Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={typeof data.discount === 'number' ? data.discount : 0}
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
                                            value={typeof data.taxes === 'number' ? data.taxes : 0}
                                            onChange={(e) => handleTaxesChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>

                                    <hr />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="font-mono text-green-600">
                                            ${(typeof data.total === 'number' ? data.total : 0).toFixed(2)}
                                        </span>
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
                                                <SelectItem value="draft">Borrador</SelectItem>
                                                <SelectItem value="sent">Enviada</SelectItem>
                                                <SelectItem value="approved">Aprobada</SelectItem>
                                                <SelectItem value="rejected">Rechazada</SelectItem>
                                                <SelectItem value="expired">Vencida</SelectItem>
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
                            {processing ? 'Guardando...' : 'Actualizar Cotización'}
                        </Button>
                        <Link href={`/admin/quotes/${quote.id}`}>
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
