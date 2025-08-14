import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Edit, Package, RotateCcw, X } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface InventoryMovement {
    id: number;
    movement_type: string;
    quantity: number;
    reason: string;
    created_at: string;
    user: User;
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
    status: string;
    created_at: string;
    updated_at: string;
    category: Category;
    is_low_stock: boolean;
    profit_amount: number;
}

interface ProductShowProps {
    product: Product;
    recentMovements: InventoryMovement[];
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

export default function ProductShow({ product, recentMovements }: ProductShowProps) {
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

    const getStockBadge = () => {
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
            <Head title={`Producto: ${product.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/products">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold">
                                <span>{productTypeIcons[product.product_type as keyof typeof productTypeIcons]}</span>
                                <span>{product.name}</span>
                            </h1>
                            <p className="text-muted-foreground">
                                {product.category.name} • {productTypeLabels[product.product_type as keyof typeof productTypeLabels]}
                                {product.code && ` • Código: ${product.code}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                        {product.status === 'inactive' && (
                            <Button variant="outline" className="text-green-600">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reactivar
                            </Button>
                        )}
                        {product.status === 'active' && (
                            <Button variant="outline" className="text-red-600">
                                <X className="mr-2 h-4 w-4" />
                                Desactivar
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* Información básica */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Producto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                        <p className="text-lg font-semibold">{product.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Código</label>
                                        <p className="text-lg font-semibold">{product.code || 'Sin código'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Categoría</label>
                                        <p className="text-lg font-semibold">{product.category.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                                        <p className="flex items-center gap-2 text-lg font-semibold">
                                            <span>{productTypeIcons[product.product_type as keyof typeof productTypeIcons]}</span>
                                            <span>{productTypeLabels[product.product_type as keyof typeof productTypeLabels]}</span>
                                        </p>
                                    </div>
                                    {product.brand && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Marca</label>
                                            <p className="text-lg font-semibold">{product.brand}</p>
                                        </div>
                                    )}
                                    {product.compatible_model && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Modelo Compatible</label>
                                            <p className="text-lg font-semibold">{product.compatible_model}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                        <div className="mt-1">{getStatusBadge(product.status)}</div>
                                    </div>
                                    {product.physical_location && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
                                            <p className="text-lg font-semibold">{product.physical_location}</p>
                                        </div>
                                    )}
                                </div>

                                {product.description && (
                                    <div className="mt-6">
                                        <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                                        <p className="mt-1 text-sm">{product.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Movimientos recientes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Movimientos Recientes de Inventario</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentMovements && recentMovements.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Cantidad</TableHead>
                                                <TableHead>Motivo</TableHead>
                                                <TableHead>Usuario</TableHead>
                                                <TableHead>Fecha</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentMovements.map((movement) => (
                                                <TableRow key={movement.id}>
                                                    <TableCell>
                                                        <Badge variant={movement.movement_type === 'in' ? 'default' : 'secondary'}>
                                                            {movement.movement_type === 'in' ? 'Entrada' : 'Salida'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{movement.quantity}</TableCell>
                                                    <TableCell>{movement.reason}</TableCell>
                                                    <TableCell>{movement.user.name}</TableCell>
                                                    <TableCell>{new Date(movement.created_at).toLocaleDateString('es-ES')}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="py-8 text-center">
                                        <div className="mb-2 text-4xl">📦</div>
                                        <p className="text-muted-foreground">No hay movimientos de inventario registrados</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Inventario */}
                        <Card>
                            <CardHeader>
                                <CardTitle>📦 Inventario</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Stock Actual</span>
                                    <span className="text-2xl font-semibold">{product.current_stock}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Stock Mínimo</span>
                                    <span className="font-semibold">{product.minimum_stock}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Estado del Stock</span>
                                    <div>{getStockBadge()}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Precios */}
                        <Card>
                            <CardHeader>
                                <CardTitle>💰 Precios</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Precio de Compra</span>
                                    <span className="font-semibold">{formatCurrency(product.purchase_price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Precio de Venta</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(product.sale_price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Ganancia por Unidad</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(product.profit_amount)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Margen de Ganancia</span>
                                    <span className="font-semibold text-green-600">{Number(product.profit_margin).toFixed(2)}%</span>
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
                                    <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                                    <p className="text-sm">{new Date(product.created_at).toLocaleString('es-ES')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                                    <p className="text-sm">{new Date(product.updated_at).toLocaleString('es-ES')}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Acciones rápidas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>⚡ Acciones Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/admin/products/${product.id}/edit`} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar Producto
                                    </Button>
                                </Link>
                                <Link href="/admin/products" className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Volver al Listado
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
