import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Customer, Product } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calculator, Package, Plus, Save, ShoppingCart, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface SaleItem {
    id?: number;
    product_id?: number;
    product_code?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface SaleCreateProps {
    customers: Customer[];
    products: Product[];
    saleNumber: string;
}

export default function SaleCreate({ customers, products, saleNumber }: SaleCreateProps) {
    const [items, setItems] = useState<SaleItem[]>([]);
    const [searchProduct, setSearchProduct] = useState('');

    const { data, setData, processing, errors } = useForm({
        sale_number: saleNumber,
        customer_id: '',
        sale_type: 'cash' as 'cash' | 'credit',
        subtotal: 0,
        discount: 0,
        taxes: 0,
        total: 0,
        advance_payment: 0,
        payment_method: 'cash' as 'cash' | 'card' | 'transfer' | 'qr' | 'mixed',
        notes: '',
    });

    const addItem = (product?: Product) => {
        if (product) {
            // Check if product is already in the list
            const existingItemIndex = items.findIndex((item) => item.product_id === product.id);

            if (existingItemIndex !== -1) {
                // If exists, increase quantity
                const newItems = [...items];
                newItems[existingItemIndex].quantity += 1;
                newItems[existingItemIndex].total_price = newItems[existingItemIndex].quantity * newItems[existingItemIndex].unit_price;
                setItems(newItems);
            } else {
                // Add new item
                const newItem: SaleItem = {
                    product_id: product.id,
                    product_code: product.code,
                    product_name: product.name,
                    quantity: 1,
                    unit_price: product.sale_price_number || parseFloat(product.sale_price),
                    total_price: product.sale_price_number || parseFloat(product.sale_price),
                };
                setItems([...items, newItem]);
            }
        } else {
            // Add empty item for manual entry
            setItems([
                ...items,
                {
                    product_name: '',
                    quantity: 1,
                    unit_price: 0,
                    total_price: 0,
                },
            ]);
        }

        setSearchProduct('');
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        calculateTotals(newItems);
    };

    const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-calculate total price
        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
        }

        setItems(newItems);
        calculateTotals(newItems);
    };

    const calculateTotals = (currentItems: SaleItem[]) => {
        const subtotal = currentItems.reduce((sum, item) => sum + item.total_price, 0);
        const totalAfterDiscount = subtotal - data.discount;
        const total = totalAfterDiscount + data.taxes;

        setData((prevData) => ({
            ...prevData,
            subtotal: subtotal,
            total: total,
        }));
    };

    const handleDiscountChange = (discount: number) => {
        setData('discount', discount);
        const subtotal = data.subtotal;
        const totalAfterDiscount = subtotal - discount;
        const total = totalAfterDiscount + data.taxes;
        setData('total', total);
    };

    const handleTaxesChange = (taxes: number) => {
        setData('taxes', taxes);
        const subtotal = data.subtotal;
        const totalAfterDiscount = subtotal - data.discount;
        const total = totalAfterDiscount + taxes;
        setData('total', total);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            alert('Debe agregar al menos un producto');
            return;
        }

        const formData = new FormData();

        // Add regular form data
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value.toString());
            }
        });

        // Add items data
        items.forEach((item, index) => {
            if (item.product_id) {
                formData.append(`items[${index}][product_id]`, item.product_id.toString());
            }
            formData.append(`items[${index}][quantity]`, item.quantity.toString());
            formData.append(`items[${index}][unit_price]`, item.unit_price.toString());
            formData.append(`items[${index}][total_price]`, item.total_price.toString());
        });

        router.post('/admin/sales', formData);
    };

    const filteredProducts = products.filter(
        (product) =>
            searchProduct === '' ||
            product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
            product.code.toLowerCase().includes(searchProduct.toLowerCase()),
    );

    const getStockStatus = (stock: number) => {
        if (stock <= 0) return { color: 'text-red-600', text: 'Sin stock' };
        if (stock <= 5) return { color: 'text-orange-600', text: 'Stock bajo' };
        return { color: 'text-green-600', text: 'En stock' };
    };

    return (
        <AppLayout>
            <Head title="Nueva Venta" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/sales">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Nueva Venta</h1>
                        <p className="text-muted-foreground">Cree una nueva venta con productos del inventario</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Productos */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Búsqueda de productos */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Productos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Buscar producto por nombre o código..."
                                            value={searchProduct}
                                            onChange={(e) => setSearchProduct(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button type="button" onClick={() => addItem()}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Lista de productos filtrados */}
                                    {searchProduct && (
                                        <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
                                            {filteredProducts.slice(0, 10).map((product) => {
                                                const stockStatus = getStockStatus(product.current_stock);
                                                return (
                                                    <div
                                                        key={product.id}
                                                        className="flex cursor-pointer items-center justify-between rounded p-2 hover:bg-muted"
                                                        onClick={() => addItem(product)}
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium">{product.name}</div>
                                                            <div className="text-sm text-muted-foreground">Código: {product.code}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-semibold">
                                                                ${(product.sale_price_number || parseFloat(product.sale_price)).toFixed(2)}
                                                            </div>
                                                            <div className={`text-xs ${stockStatus.color}`}>{product.current_stock} disponibles</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Lista de productos seleccionados */}
                                    <div className="space-y-2">
                                        {items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 items-center gap-2 rounded-lg border p-3">
                                                <div className="col-span-5">
                                                    <Input
                                                        placeholder="Nombre del producto"
                                                        value={item.product_name}
                                                        onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                                                    />
                                                    {item.product_code && (
                                                        <div className="mt-1 text-xs text-muted-foreground">Código: {item.product_code}</div>
                                                    )}
                                                </div>
                                                <div className="col-span-2">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        placeholder="Cant."
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="Precio"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <div className="text-right font-semibold">${item.total_price.toFixed(2)}</div>
                                                </div>
                                                <div className="col-span-1">
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {items.length === 0 && (
                                            <div className="py-8 text-center text-muted-foreground">
                                                No hay productos agregados. Busque un producto o agregue uno manualmente.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Información de la venta */}
                        <div className="space-y-6">
                            {/* Información principal */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        Información de Venta
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sale_number">Número de Venta</Label>
                                        <Input
                                            id="sale_number"
                                            value={data.sale_number}
                                            onChange={(e) => setData('sale_number', e.target.value)}
                                            readOnly
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer_id">Cliente (Opcional)</Label>
                                        <Combobox value={data.customer_id} onValueChange={(value) => setData('customer_id', value || '')}>
                                            <ComboboxInput placeholder="Buscar cliente..." />
                                            <ComboboxContent>
                                                <ComboboxItem value="" label="Cliente público" />
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
                                        <Label htmlFor="sale_type">Tipo de Venta *</Label>
                                        <Select value={data.sale_type} onValueChange={(value: 'cash' | 'credit') => setData('sale_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Contado</SelectItem>
                                                <SelectItem value="credit">Crédito</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.sale_type && <p className="text-sm text-red-600">{errors.sale_type}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method">Método de Pago *</Label>
                                        <Select value={data.payment_method} onValueChange={(value: any) => setData('payment_method', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Efectivo</SelectItem>
                                                <SelectItem value="card">Tarjeta</SelectItem>
                                                <SelectItem value="transfer">Transferencia</SelectItem>
                                                <SelectItem value="qr">QR</SelectItem>
                                                <SelectItem value="mixed">Mixto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.payment_method && <p className="text-sm text-red-600">{errors.payment_method}</p>}
                                    </div>

                                    {data.sale_type === 'credit' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="advance_payment">Anticipo</Label>
                                            <Input
                                                id="advance_payment"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.advance_payment}
                                                onChange={(e) => setData('advance_payment', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Totales */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        Totales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold">${data.subtotal.toFixed(2)}</span>
                                    </div>

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

                                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                        <span>Total:</span>
                                        <span>${data.total.toFixed(2)}</span>
                                    </div>

                                    {data.sale_type === 'credit' && data.advance_payment > 0 && (
                                        <div className="space-y-1 border-t pt-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Anticipo:</span>
                                                <span>${data.advance_payment.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-semibold text-orange-600">
                                                <span>Saldo Pendiente:</span>
                                                <span>${(data.total - data.advance_payment).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Notas */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notas (Opcional)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        placeholder="Notas adicionales sobre la venta..."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <Button type="submit" disabled={processing || items.length === 0}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Guardando...' : 'Crear Venta'}
                        </Button>
                        <Link href="/admin/sales">
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
