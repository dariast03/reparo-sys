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
import { InventoryMovement, Product } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowDownCircle, ArrowLeft, ArrowUpCircle, BarChart3, Calendar, Edit, History, Package, Settings, TrendingDown } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface StockShowProps {
    product: Product;
    recentMovements: InventoryMovement[];
    stockHistory: Array<{
        date: string;
        net_movement: number;
    }>;
}

export default function StockShow({ product, recentMovements, stockHistory }: StockShowProps) {
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);

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

    const handleAdjustStock = () => {
        setAdjustModalOpen(true);
        resetAdjust();
    };

    const submitAdjustment = (e: FormEvent) => {
        e.preventDefault();

        postAdjust(route('admin.inventory.stock.adjust', product.id), {
            onSuccess: () => {
                setAdjustModalOpen(false);
                resetAdjust();
                router.reload();
            },
        });
    };

    const getStockLevelBadge = () => {
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

    const getMovementTypeBadge = (type: string) => {
        if (type === 'in') {
            return (
                <Badge variant="default" className="bg-green-100 text-green-800">
                    <ArrowUpCircle className="mr-1 h-3 w-3" />
                    Entrada
                </Badge>
            );
        } else {
            return (
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                    <ArrowDownCircle className="mr-1 h-3 w-3" />
                    Salida
                </Badge>
            );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title={`Stock - ${product.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.inventory.stock.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                            <p className="text-muted-foreground">Código: {product.code}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAdjustStock}>
                            <Settings className="mr-2 h-4 w-4" />
                            Ajustar Stock
                        </Button>
                        <Link href={route('admin.products.edit', product.id)}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Producto
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Información del producto */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Información del Producto
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Código</dt>
                                    <dd className="mt-1 font-mono text-sm">{product.code}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Nombre</dt>
                                    <dd className="mt-1 text-sm">{product.name}</dd>
                                </div>
                                {product.brand && (
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Marca</dt>
                                        <dd className="mt-1 text-sm">{product.brand.name}</dd>
                                    </div>
                                )}
                                {product.category && (
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Categoría</dt>
                                        <dd className="mt-1 text-sm">{product.category.name}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Precio de Venta</dt>
                                    <dd className="mt-1 font-mono text-sm">${parseFloat(product.sale_price).toFixed(2)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                                    <dd className="mt-1">
                                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                            {product.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </dd>
                                </div>
                                {product.description && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-muted-foreground">Descripción</dt>
                                        <dd className="mt-1 text-sm">{product.description}</dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Estado del Stock
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{product.current_stock}</div>
                                    <div className="text-sm text-muted-foreground">Unidades en stock</div>
                                    <div className="mt-2">{getStockLevelBadge()}</div>
                                </div>

                                {product.minimum_stock && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Stock mínimo</span>
                                            <span className="font-medium">{product.minimum_stock}</span>
                                        </div>
                                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    product.current_stock <= product.minimum_stock ? 'bg-red-600' : 'bg-green-600'
                                                }`}
                                                style={{
                                                    width: `${Math.min((product.current_stock / (product.minimum_stock * 2)) * 100, 100)}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Valor en stock</span>
                                        <span className="font-medium">${(product.current_stock * parseFloat(product.sale_price)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Movimientos recientes */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Movimientos Recientes
                            </CardTitle>
                            <Link href={route('admin.inventory.movements.product', product.id)}>
                                <Button variant="outline" size="sm">
                                    Ver Todos
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentMovements.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">No hay movimientos registrados para este producto</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Cantidad</TableHead>
                                            <TableHead>Stock Antes/Después</TableHead>
                                            <TableHead>Razón</TableHead>
                                            <TableHead>Usuario</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentMovements.map((movement) => (
                                            <TableRow key={movement.id}>
                                                <TableCell className="font-mono text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {formatDate(movement.movement_date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getMovementTypeBadge(movement.movement_type)}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    <span className={movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'}>
                                                        {movement.movement_type === 'in' ? '+' : '-'}
                                                        {movement.quantity}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center font-mono">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground">{movement.stock_before}</span>
                                                        <TrendingDown className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-semibold">{movement.stock_after}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{movement.reason}</TableCell>
                                                <TableCell>{movement.user?.name}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modal de ajuste de stock */}
                <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajustar Stock</DialogTitle>
                            <DialogDescription>
                                Producto: <strong>{product.name}</strong> ({product.code})
                                <br />
                                Stock actual: <strong>{product.current_stock}</strong>
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
