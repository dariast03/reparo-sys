import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Eye, Package, Pencil, PlusCircle, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Productos',
        href: '/admin/products',
    },
];

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
    profit_margin: number;
    product_type: string;
    physical_location: string;
    status: 'active' | 'inactive' | 'discontinued';
    created_at: string;
    updated_at: string;
    category: Category;
    is_low_stock: boolean;
    profit_amount: number;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface ProductsIndexProps {
    products: PaginatedProducts;
    filters: {
        search?: string;
        status?: string;
        product_type?: string;
        category_id?: string;
        stock_status?: string;
    };
    categories: Category[];
}

const productTypeLabels = {
    part: 'Repuesto',
    accessory: 'Accesorio',
    tool: 'Herramienta',
    consumable: 'Consumible',
    other: 'Otro',
};

const productTypeIcons = {
    part: '🔧',
    accessory: '📱',
    tool: '🛠️',
    consumable: '🧽',
    other: '📦',
};

const statusLabels = {
    active: 'Activo',
    inactive: 'Inactivo',
    discontinued: 'Descontinuado',
};

export default function ProductsIndex({ products, filters, categories }: ProductsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [productTypeFilter, setProductTypeFilter] = useState(filters.product_type || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || 'all');
    const [stockStatusFilter, setStockStatusFilter] = useState(filters.stock_status || 'all');

    // Auto-aplicar filtros cuando cambien los valores
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params: Record<string, string | undefined> = {};

            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            if (productTypeFilter !== 'all') {
                params.product_type = productTypeFilter;
            }
            if (categoryFilter !== 'all') {
                params.category_id = categoryFilter;
            }
            if (stockStatusFilter !== 'all') {
                params.stock_status = stockStatusFilter;
            }

            router.get('/admin/products', params, {
                preserveState: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, productTypeFilter, categoryFilter, stockStatusFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setProductTypeFilter('all');
        setCategoryFilter('all');
        setStockStatusFilter('all');
    };

    const handleDeactivateProduct = (productId: number) => {
        router.delete(`/admin/products/${productId}`, {
            preserveScroll: true,
        });
    };

    const handleReactivateProduct = (productId: number) => {
        router.patch(
            `/admin/products/${productId}/reactivate`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Activo
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Inactivo
                    </Badge>
                );
            case 'discontinued':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Descontinuado
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStockBadge = (product: Product) => {
        if (product.current_stock === 0) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Sin Stock
                </Badge>
            );
        } else if (product.is_low_stock) {
            return (
                <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="h-3 w-3" />
                    Stock Bajo
                </Badge>
            );
        } else {
            return (
                <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
                    <Package className="h-3 w-3" />
                    En Stock
                </Badge>
            );
        }
    };

    const formatCurrency = (amount: number | string) => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(numericAmount || 0);
    };

    return (
        <AppLayout>
            <Head title="Productos" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Productos</h1>
                        <p className="text-muted-foreground">Gestiona el catálogo de productos y repuestos</p>
                    </div>
                    <Link href="/admin/products/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo Producto
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Filtros</CardTitle>
                            <Button variant="outline" size="sm" onClick={handleClearFilters}>
                                Limpiar Filtros
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Buscar Producto</label>
                                <Input
                                    placeholder="Nombre, código, marca..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría</label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">🏷️ Todas las categorías</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo de Producto</label>
                                <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">📋 Todos los tipos</SelectItem>
                                        {Object.entries(productTypeLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {productTypeIcons[value as keyof typeof productTypeIcons]} {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock</label>
                                <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por stock" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">📦 Todos</SelectItem>
                                        <SelectItem value="available">✅ En Stock</SelectItem>
                                        <SelectItem value="low">⚠️ Stock Bajo</SelectItem>
                                        <SelectItem value="out">❌ Sin Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">📋 Todos los estados</SelectItem>
                                        <SelectItem value="active">✅ Activos</SelectItem>
                                        <SelectItem value="inactive">❌ Inactivos</SelectItem>
                                        <SelectItem value="discontinued">🚫 Descontinuados</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Chips de filtros activos */}
                        {(searchTerm ||
                            statusFilter !== 'all' ||
                            productTypeFilter !== 'all' ||
                            categoryFilter !== 'all' ||
                            stockStatusFilter !== 'all') && (
                            <div className="mt-4 border-t pt-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Filtros activos:</span>
                                    {searchTerm && (
                                        <Badge variant="secondary" className="gap-1">
                                            🔍 "{searchTerm}"
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-gray-200"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {categoryFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            🏷️ {categories.find((c) => c.id.toString() === categoryFilter)?.name}
                                            <button
                                                onClick={() => setCategoryFilter('all')}
                                                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-gray-200"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {productTypeFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            {productTypeIcons[productTypeFilter as keyof typeof productTypeIcons]}{' '}
                                            {productTypeLabels[productTypeFilter as keyof typeof productTypeLabels]}
                                            <button
                                                onClick={() => setProductTypeFilter('all')}
                                                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-gray-200"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {stockStatusFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            📦 Stock: {stockStatusFilter}
                                            <button
                                                onClick={() => setStockStatusFilter('all')}
                                                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-gray-200"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {statusFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            {statusFilter === 'active' ? '✅' : statusFilter === 'inactive' ? '❌' : '🚫'}{' '}
                                            {statusLabels[statusFilter as keyof typeof statusLabels]}
                                            <button
                                                onClick={() => setStatusFilter('all')}
                                                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-gray-200"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Mostrando <span className="font-medium">{products.data.length}</span> de <span className="font-medium">{products.total}</span>{' '}
                        productos
                        {(searchTerm ||
                            statusFilter !== 'all' ||
                            productTypeFilter !== 'all' ||
                            categoryFilter !== 'all' ||
                            stockStatusFilter !== 'all') && <span className="text-blue-600"> (filtrados)</span>}
                    </div>
                    {products.total > 0 && (
                        <div className="text-xs text-muted-foreground">
                            Página {products.current_page} de {products.last_page}
                        </div>
                    )}
                </div>

                {/* Products Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Precio Venta</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha Registro</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="text-4xl">🔍</div>
                                                <div className="text-lg font-medium text-muted-foreground">
                                                    {searchTerm ||
                                                    statusFilter !== 'all' ||
                                                    productTypeFilter !== 'all' ||
                                                    categoryFilter !== 'all' ||
                                                    stockStatusFilter !== 'all'
                                                        ? 'No se encontraron productos con los filtros aplicados'
                                                        : 'No hay productos registrados'}
                                                </div>
                                                {(searchTerm ||
                                                    statusFilter !== 'all' ||
                                                    productTypeFilter !== 'all' ||
                                                    categoryFilter !== 'all' ||
                                                    stockStatusFilter !== 'all') && (
                                                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                                                        Limpiar filtros y ver todos
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.data.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <span>{productTypeIcons[product.product_type as keyof typeof productTypeIcons]}</span>
                                                        <span>{product.name}</span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {product.code && `${product.code} • `}
                                                        {product.brand && `${product.brand}`}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{product.category.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {productTypeLabels[product.product_type as keyof typeof productTypeLabels]}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="font-medium">{product.current_stock} uds.</div>
                                                    {getStockBadge(product)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{formatCurrency(product.sale_price)}</div>
                                                {product.profit_margin && Number(product.profit_margin) > 0 && (
                                                    <div className="text-sm text-green-600">+{Number(product.profit_margin).toFixed(1)}%</div>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(product.status)}</TableCell>
                                            <TableCell>{new Date(product.created_at).toLocaleDateString('es-ES')}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/products/${product.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {product.status === 'active' ? (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-red-600">
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Desactivar Producto?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        ¿Estás seguro de que deseas desactivar el producto "{product.name}"? Esta
                                                                        acción no eliminará el producto, pero no aparecerá en las búsquedas normales.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeactivateProduct(product.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Desactivar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-green-600"
                                                            onClick={() => handleReactivateProduct(product.id)}
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {products.links.map((link, index) =>
                                link.url ? (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => router.get(link.url!)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <Button key={index} variant="outline" size="sm" disabled dangerouslySetInnerHTML={{ __html: link.label }} />
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
