import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Brand, Product, ProductCategory } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Edit,
    Eye,
    Filter,
    History,
    Package,
    Plus,
    RefreshCw,
    Search,
    Settings,
    TrendingDown,
    TrendingUp,
    X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface StockIndexProps {
    products: {
        data: Product[];
        links: any;
        meta: any;
    };
    brands: Brand[];
    categories: ProductCategory[];
    filters: {
        search?: string;
        brand_id?: string;
        category_id?: string;
        status?: string;
        stock_level?: string;
    };
}

export default function StockIndex({ products, brands, categories, filters }: StockIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        brand_id: filters.brand_id || '',
        category_id: filters.category_id || '',
        status: filters.status || '',
        stock_level: filters.stock_level || '',
    });

    const {
        data: adjustData,
        setData: setAdjustData,
        post: postAdjust,
        processing: adjustProcessing,
        reset: resetAdjust,
    } = useForm({
        adjustment_type: 'add' as 'add' | 'subtract' | 'set',
        quantity: '',
        reason: '',
        notes: '',
    });

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        get(route('admin.inventory.stock.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setData({
            search: '',
            brand_id: '',
            category_id: '',
            status: '',
            stock_level: '',
        });
        get(route('admin.inventory.stock.index'));
    };

    const getStockLevelBadge = (product: Product) => {
        if (product.current_stock <= 0) {
            return <Badge variant="destructive">Sin Stock</Badge>;
        } else if (product.minimum_stock && product.current_stock <= product.minimum_stock) {
            return (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Stock Bajo
                </Badge>
            );
        } else {
            return (
                <Badge variant="default" className="bg-green-100 text-green-800">
                    Disponible
                </Badge>
            );
        }
    };

    const getStatusBadge = (status: string) => {
        return status === 'active' ? <Badge variant="default">Activo</Badge> : <Badge variant="secondary">Inactivo</Badge>;
    };

    const handleAdjustStock = (product: Product) => {
        setSelectedProduct(product);
        setAdjustModalOpen(true);
        resetAdjust();
    };

    const submitAdjustment = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        postAdjust(route('admin.inventory.stock.adjust', selectedProduct.id), {
            onSuccess: () => {
                setAdjustModalOpen(false);
                setSelectedProduct(null);
                resetAdjust();
                router.reload();
            },
        });
    };

    // Estadísticas rápidas
    const totalProducts = products.meta?.total || 0;
    const lowStockProducts = products.data.filter((p) => p.minimum_stock && p.current_stock <= p.minimum_stock).length;
    const outOfStockProducts = products.data.filter((p) => p.current_stock <= 0).length;
    const totalStockValue = products.data.reduce((sum, p) => sum + p.current_stock * parseFloat(p.sale_price), 0);

    return (
        <AppLayout>
            <Head title="Gestión de Stock" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Stock</h1>
                        <p className="text-muted-foreground">Administra el inventario de productos</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('admin.inventory.movements.index')}>
                            <Button variant="outline">
                                <History className="mr-2 h-4 w-4" />
                                Ver Movimientos
                            </Button>
                        </Link>
                        <Link href={route('admin.products.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Producto
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Productos</p>
                                    <p className="text-2xl font-bold">{totalProducts}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Sin Stock</p>
                                    <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Stock Bajo</p>
                                    <p className="text-2xl font-bold text-yellow-600">{lowStockProducts}</p>
                                </div>
                                <TrendingDown className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Valor Stock</p>
                                    <p className="text-2xl font-bold text-green-600">${totalStockValue.toFixed(2)}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filtros
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                                {showFilters ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Buscar</Label>
                                    <Input
                                        id="search"
                                        placeholder="Nombre o código..."
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                    />
                                </div>

                                {showFilters && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="brand_id">Marca</Label>
                                            <Select value={data.brand_id} onValueChange={(value) => setData('brand_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Todas</SelectItem>
                                                    {brands.map((brand) => (
                                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category_id">Categoría</Label>
                                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Todas</SelectItem>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">Estado</Label>
                                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todos" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Todos</SelectItem>
                                                    <SelectItem value="active">Activo</SelectItem>
                                                    <SelectItem value="inactive">Inactivo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="stock_level">Nivel de Stock</Label>
                                            <Select value={data.stock_level} onValueChange={(value) => setData('stock_level', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todos" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Todos</SelectItem>
                                                    <SelectItem value="available">Disponible</SelectItem>
                                                    <SelectItem value="low">Stock Bajo</SelectItem>
                                                    <SelectItem value="zero">Sin Stock</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    <Search className="mr-2 h-4 w-4" />
                                    {processing ? 'Buscando...' : 'Buscar'}
                                </Button>
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Limpiar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Tabla de productos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Productos ({products.meta?.total || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Marca</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Stock Actual</TableHead>
                                        <TableHead>Stock Mínimo</TableHead>
                                        <TableHead>Precio Venta</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Nivel Stock</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="py-8 text-center">
                                                No se encontraron productos
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        products.data.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-mono">{product.code}</TableCell>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell>{product.brand?.name || '-'}</TableCell>
                                                <TableCell>{product.category?.name || '-'}</TableCell>
                                                <TableCell className="text-right font-mono font-semibold">{product.current_stock}</TableCell>
                                                <TableCell className="text-right font-mono">{product.minimum_stock || '-'}</TableCell>
                                                <TableCell className="text-right font-mono">${parseFloat(product.sale_price).toFixed(2)}</TableCell>
                                                <TableCell>{getStatusBadge(product.status)}</TableCell>
                                                <TableCell>{getStockLevelBadge(product)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={route('admin.inventory.stock.show', product.id)}>
                                                            <Button variant="ghost" size="sm" title="Ver detalles">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('admin.inventory.movements.product', product.id)}>
                                                            <Button variant="ghost" size="sm" title="Ver movimientos">
                                                                <BarChart3 className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Ajustar stock"
                                                            onClick={() => handleAdjustStock(product)}
                                                        >
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                        <Link href={route('admin.products.edit', product.id)}>
                                                            <Button variant="ghost" size="sm" title="Editar producto">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginación */}
                        {products.links && <div className="mt-4 flex justify-center">{/* Aquí iría el componente de paginación */}</div>}
                    </CardContent>
                </Card>

                {/* Modal de ajuste de stock */}
                <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajustar Stock</DialogTitle>
                            <DialogDescription>
                                {selectedProduct && (
                                    <>
                                        Producto: <strong>{selectedProduct.name}</strong> ({selectedProduct.code})
                                        <br />
                                        Stock actual: <strong>{selectedProduct.current_stock}</strong>
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitAdjustment} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="adjustment_type">Tipo de Ajuste</Label>
                                <Select
                                    value={adjustData.adjustment_type}
                                    onValueChange={(value: 'add' | 'subtract' | 'set') => setAdjustData('adjustment_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="add">Agregar stock</SelectItem>
                                        <SelectItem value="subtract">Reducir stock</SelectItem>
                                        <SelectItem value="set">Establecer stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Cantidad</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={adjustData.quantity}
                                    onChange={(e) => setAdjustData('quantity', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Razón</Label>
                                <Select value={adjustData.reason} onValueChange={(value) => setAdjustData('reason', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una razón" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="adjustment">Ajuste de inventario</SelectItem>
                                        <SelectItem value="damage">Producto dañado</SelectItem>
                                        <SelectItem value="loss">Pérdida</SelectItem>
                                        <SelectItem value="return">Devolución</SelectItem>
                                        <SelectItem value="transfer">Transferencia</SelectItem>
                                        <SelectItem value="correction">Corrección</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas (opcional)</Label>
                                <Textarea
                                    id="notes"
                                    value={adjustData.notes}
                                    onChange={(e) => setAdjustData('notes', e.target.value)}
                                    placeholder="Descripción adicional del ajuste..."
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setAdjustModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={adjustProcessing}>
                                    {adjustProcessing ? 'Ajustando...' : 'Ajustar Stock'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
