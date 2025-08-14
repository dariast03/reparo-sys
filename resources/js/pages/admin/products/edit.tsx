import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    category_id: number;
    code: string;
    name: string;
    description: string;
    brand: string;
    compatible_model: string;
    current_stock: number;
    minimum_stock: number;
    purchase_price: number;
    sale_price: number;
    product_type: string;
    physical_location: string;
    status: string;
    category: Category;
}

interface ProductEditProps {
    product: Product;
    categories: Category[];
}

const productTypeOptions = [
    { value: 'part', label: 'Repuesto', icon: '🔧' },
    { value: 'accessory', label: 'Accesorio', icon: '📱' },
    { value: 'tool', label: 'Herramienta', icon: '🛠️' },
    { value: 'consumable', label: 'Consumible', icon: '🧽' },
    { value: 'other', label: 'Otro', icon: '📦' },
];

export default function ProductEdit({ product, categories }: ProductEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        category_id: product.category_id.toString(),
        code: product.code || '',
        name: product.name,
        description: product.description || '',
        brand: product.brand || '',
        compatible_model: product.compatible_model || '',
        current_stock: product.current_stock,
        minimum_stock: product.minimum_stock,
        purchase_price: product.purchase_price,
        sale_price: product.sale_price,
        product_type: product.product_type,
        physical_location: product.physical_location || '',
        status: product.status,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/products/${product.id}`);
    };

    const calculateProfitMargin = () => {
        if (data.purchase_price > 0 && data.sale_price > 0) {
            return (((data.sale_price - data.purchase_price) / data.purchase_price) * 100).toFixed(2);
        }
        return '0.00';
    };

    return (
        <AppLayout>
            <Head title={`Editar Producto: ${product.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Editar Producto</h1>
                        <p className="text-muted-foreground">Modificando: {product.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información del Producto</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="category_id">Categoría *</Label>
                                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
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
                                            <Label htmlFor="product_type">Tipo *</Label>
                                            <Select value={data.product_type} onValueChange={(value) => setData('product_type', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {productTypeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.icon} {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.product_type && <p className="text-sm text-red-600">{errors.product_type}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="code">Código</Label>
                                            <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                                            {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre *</Label>
                                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descripción</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="brand">Marca</Label>
                                            <Input id="brand" value={data.brand} onChange={(e) => setData('brand', e.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="compatible_model">Modelo Compatible</Label>
                                            <Input
                                                id="compatible_model"
                                                value={data.compatible_model}
                                                onChange={(e) => setData('compatible_model', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_stock">Stock Actual *</Label>
                                            <Input
                                                id="current_stock"
                                                type="number"
                                                min="0"
                                                value={data.current_stock}
                                                onChange={(e) => setData('current_stock', parseInt(e.target.value) || 0)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="minimum_stock">Stock Mínimo *</Label>
                                            <Input
                                                id="minimum_stock"
                                                type="number"
                                                min="0"
                                                value={data.minimum_stock}
                                                onChange={(e) => setData('minimum_stock', parseInt(e.target.value) || 0)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="purchase_price">Precio Compra *</Label>
                                            <Input
                                                id="purchase_price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.purchase_price}
                                                onChange={(e) => setData('purchase_price', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="sale_price">Precio Venta *</Label>
                                            <Input
                                                id="sale_price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.sale_price}
                                                onChange={(e) => setData('sale_price', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="physical_location">Ubicación Física</Label>
                                            <Input
                                                id="physical_location"
                                                value={data.physical_location}
                                                onChange={(e) => setData('physical_location', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">Estado</Label>
                                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">✅ Activo</SelectItem>
                                                    <SelectItem value="inactive">❌ Inactivo</SelectItem>
                                                    <SelectItem value="discontinued">🚫 Descontinuado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {(data.purchase_price > 0 || data.sale_price > 0) && (
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <p className="text-sm text-muted-foreground">
                                                Margen de Ganancia: <span className="font-semibold text-green-600">{calculateProfitMargin()}%</span>
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Guardando...' : 'Actualizar Producto'}
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
                                <CardTitle>💡 Información</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 font-medium">Producto ID</h4>
                                    <p className="text-sm text-muted-foreground">#{product.id}</p>
                                </div>
                                <div>
                                    <h4 className="mb-2 font-medium">Categoría Actual</h4>
                                    <p className="text-sm text-muted-foreground">{product.category.name}</p>
                                </div>
                                <div>
                                    <h4 className="mb-2 font-medium">Código Actual</h4>
                                    <p className="text-sm text-muted-foreground">{product.code || 'Sin código'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
