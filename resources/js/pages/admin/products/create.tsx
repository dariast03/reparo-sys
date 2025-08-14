import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Brand, DeviceModel } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent, useMemo } from 'react';

interface Category {
    id: number;
    name: string;
}

interface ProductCreateProps {
    categories: Category[];
    brands: Brand[];
    deviceModels: DeviceModel[];
}

const productTypeOptions = [
    { value: 'part', label: 'Repuesto', icon: '🔧' },
    { value: 'accessory', label: 'Accesorio', icon: '📱' },
    { value: 'tool', label: 'Herramienta', icon: '🛠️' },
    { value: 'consumable', label: 'Consumible', icon: '🧽' },
    { value: 'other', label: 'Otro', icon: '📦' },
];

export default function ProductCreate({ categories, brands, deviceModels }: ProductCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        brand_id: null as number | null,
        device_model_id: null as number | null,
        code: '',
        name: '',
        description: '',
        compatible_model: '',
        current_stock: 0,
        minimum_stock: 0,
        purchase_price: 0,
        sale_price: 0,
        product_type: '',
        physical_location: '',
        status: 'active',
    });

    // Filter device models based on selected brand
    const availableModels = useMemo(() => {
        if (!data.brand_id) return [];
        return deviceModels.filter((model) => model.brand_id === data.brand_id);
    }, [data.brand_id, deviceModels]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/products');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const calculateProfitMargin = () => {
        if (data.purchase_price > 0 && data.sale_price > 0) {
            return (((data.sale_price - data.purchase_price) / data.purchase_price) * 100).toFixed(2);
        }
        return '0.00';
    };

    const calculateProfitAmount = () => {
        return data.sale_price - data.purchase_price;
    };

    return (
        <AppLayout>
            <Head title="Crear Producto" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Crear Producto</h1>
                        <p className="text-muted-foreground">Agrega un nuevo producto al catálogo</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Información básica */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información Básica</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="category_id">Categoría *</Label>
                                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona una categoría" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="product_type">Tipo de Producto *</Label>
                                            <Select value={data.product_type} onValueChange={(value) => setData('product_type', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {productTypeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <span className="flex items-center gap-2">
                                                                <span>{option.icon}</span>
                                                                <span>{option.label}</span>
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.product_type && <p className="text-sm text-red-600">{errors.product_type}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="code">Código del Producto</Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value)}
                                                placeholder="Se generará automáticamente si se deja vacío"
                                            />
                                            {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre del Producto *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Ej: Pantalla iPhone 14 Pro, Cable USB-C, etc."
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descripción</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Descripción detallada del producto..."
                                            rows={3}
                                        />
                                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="brand_id">Marca</Label>
                                            <Combobox
                                                value={data.brand_id?.toString() || ''}
                                                onValueChange={(value) => {
                                                    const numericValue = value ? parseInt(value) : null;
                                                    setData('brand_id', numericValue);
                                                    // Reset model when brand changes
                                                    setData('device_model_id', null);
                                                }}
                                            >
                                                <ComboboxInput
                                                    placeholder="Seleccionar marca..."
                                                    className={errors.brand_id ? 'border-red-500' : ''}
                                                />
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
                                            <Label htmlFor="device_model_id">Modelo Compatible</Label>
                                            <Combobox
                                                value={data.device_model_id?.toString() || ''}
                                                onValueChange={(value) => {
                                                    const numericValue = value ? parseInt(value) : null;
                                                    setData('device_model_id', numericValue);
                                                }}
                                            >
                                                <ComboboxInput
                                                    placeholder={data.brand_id ? 'Seleccionar modelo...' : 'Primero selecciona una marca'}
                                                    className={errors.device_model_id ? 'border-red-500' : ''}
                                                    disabled={!data.brand_id}
                                                />
                                                <ComboboxContent>
                                                    {availableModels.map((model) => (
                                                        <ComboboxItem key={model.id} value={model.id.toString()} label={model.name} />
                                                    ))}
                                                    <ComboboxEmpty>
                                                        {data.brand_id ? 'No se encontraron modelos para esta marca' : 'Primero selecciona una marca'}
                                                    </ComboboxEmpty>
                                                </ComboboxContent>
                                            </Combobox>
                                            {errors.device_model_id && <p className="text-sm text-red-600">{errors.device_model_id}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Inventario */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventario</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_stock">Stock Actual *</Label>
                                            <Input
                                                id="current_stock"
                                                type="number"
                                                min="0"
                                                value={data.current_stock}
                                                onChange={(e) => setData('current_stock', parseInt(e.target.value) || 0)}
                                                required
                                            />
                                            {errors.current_stock && <p className="text-sm text-red-600">{errors.current_stock}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="minimum_stock">Stock Mínimo *</Label>
                                            <Input
                                                id="minimum_stock"
                                                type="number"
                                                min="0"
                                                value={data.minimum_stock}
                                                onChange={(e) => setData('minimum_stock', parseInt(e.target.value) || 0)}
                                                required
                                            />
                                            {errors.minimum_stock && <p className="text-sm text-red-600">{errors.minimum_stock}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="physical_location">Ubicación Física</Label>
                                            <Input
                                                id="physical_location"
                                                value={data.physical_location}
                                                onChange={(e) => setData('physical_location', e.target.value)}
                                                placeholder="Ej: Estante A1, Cajón 3..."
                                            />
                                            {errors.physical_location && <p className="text-sm text-red-600">{errors.physical_location}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Precios */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Precios</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="purchase_price">Precio de Compra *</Label>
                                            <Input
                                                id="purchase_price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.purchase_price}
                                                onChange={(e) => setData('purchase_price', parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                            {errors.purchase_price && <p className="text-sm text-red-600">{errors.purchase_price}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="sale_price">Precio de Venta *</Label>
                                            <Input
                                                id="sale_price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.sale_price}
                                                onChange={(e) => setData('sale_price', parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                            {errors.sale_price && <p className="text-sm text-red-600">{errors.sale_price}</p>}
                                        </div>
                                    </div>

                                    {(data.purchase_price > 0 || data.sale_price > 0) && (
                                        <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Margen de Ganancia</Label>
                                                <p className="text-lg font-semibold text-green-600">{calculateProfitMargin()}%</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Ganancia por Unidad</Label>
                                                <p className="text-lg font-semibold text-green-600">{formatCurrency(calculateProfitAmount())}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Guardando...' : 'Crear Producto'}
                                </Button>
                                <Link href="/admin/products">
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>💡 Consejos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 font-medium">Código del Producto</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Si no ingresas un código, se generará automáticamente basado en la categoría.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-2 font-medium">Stock Mínimo</h4>
                                    <p className="text-sm text-muted-foreground">Define el nivel de stock que activará alertas de reposición.</p>
                                </div>
                                <div>
                                    <h4 className="mb-2 font-medium">Precios</h4>
                                    <p className="text-sm text-muted-foreground">
                                        El margen de ganancia se calcula automáticamente basado en los precios de compra y venta.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-2 font-medium">Ubicación Física</h4>
                                    <p className="text-sm text-muted-foreground">Ayuda a encontrar rápidamente el producto en el almacén.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
