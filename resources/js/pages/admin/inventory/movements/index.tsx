import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { InventoryMovement, Product } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDownCircle, ArrowUpCircle, Calendar, Eye, Filter, Package, RefreshCw, Search, TrendingDown, TrendingUp, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface InventoryMovementsIndexProps {
    movements: {
        data: InventoryMovement[];
        links: any;
        meta: any;
    };
    products: Product[];
    reasons: string[];
    filters: {
        search?: string;
        product_id?: string;
        movement_type?: string;
        reason?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function InventoryMovementsIndex({ movements, products, reasons, filters }: InventoryMovementsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);

    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        product_id: filters.product_id || '',
        movement_type: filters.movement_type || '',
        reason: filters.reason || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        get(route('admin.inventory.movements.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setData({
            search: '',
            product_id: '',
            movement_type: '',
            reason: '',
            date_from: '',
            date_to: '',
        });
        get(route('admin.inventory.movements.index'));
    };

    const getMovementTypeBadge = (type: string) => {
        if (type === 'in') {
            return (
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    <ArrowUpCircle className="mr-1 h-3 w-3" />
                    Entrada
                </Badge>
            );
        } else {
            return (
                <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                    <ArrowDownCircle className="mr-1 h-3 w-3" />
                    Salida
                </Badge>
            );
        }
    };

    const getReasonBadge = (reason: string) => {
        const colors: Record<string, string> = {
            sale: 'bg-blue-100 text-blue-800',
            purchase: 'bg-purple-100 text-purple-800',
            adjustment: 'bg-yellow-100 text-yellow-800',
            sale_cancellation: 'bg-orange-100 text-orange-800',
            initial_stock: 'bg-gray-100 text-gray-800',
            transfer: 'bg-indigo-100 text-indigo-800',
        };

        const labels: Record<string, string> = {
            sale: 'Venta',
            purchase: 'Compra',
            adjustment: 'Ajuste',
            sale_cancellation: 'Anulación Venta',
            initial_stock: 'Stock Inicial',
            transfer: 'Transferencia',
        };

        return <Badge className={colors[reason] || 'bg-gray-100 text-gray-800'}>{labels[reason] || reason}</Badge>;
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
            <Head title="Movimientos de Inventario" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
                        <p className="text-muted-foreground">Historial completo de movimientos de stock</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('admin.inventory.stock.index')}>
                            <Button variant="outline">
                                <Package className="mr-2 h-4 w-4" />
                                Gestión de Stock
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Movimientos</p>
                                    <p className="text-2xl font-bold">{movements.meta?.total || 0}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Entradas Hoy</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {
                                            movements.data.filter(
                                                (m) =>
                                                    m.movement_type === 'in' &&
                                                    new Date(m.movement_date).toDateString() === new Date().toDateString(),
                                            ).length
                                        }
                                    </p>
                                </div>
                                <ArrowUpCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Salidas Hoy</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {
                                            movements.data.filter(
                                                (m) =>
                                                    m.movement_type === 'out' &&
                                                    new Date(m.movement_date).toDateString() === new Date().toDateString(),
                                            ).length
                                        }
                                    </p>
                                </div>
                                <ArrowDownCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Productos Activos</p>
                                    <p className="text-2xl font-bold">{products.length}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Buscar</Label>
                                    <Input
                                        id="search"
                                        placeholder="Producto o notas..."
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                    />
                                </div>

                                {showFilters && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="product_id">Producto</Label>
                                            <Select value={data.product_id} onValueChange={(value) => setData('product_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todos" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Todos</SelectItem>
                                                    {products.map((product) => (
                                                        <SelectItem key={product.id} value={product.id.toString()}>
                                                            {product.code} - {product.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="movement_type">Tipo</Label>
                                            <Select value={data.movement_type} onValueChange={(value) => setData('movement_type', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todos" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Todos</SelectItem>
                                                    <SelectItem value="in">Entrada</SelectItem>
                                                    <SelectItem value="out">Salida</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Razón</Label>
                                            <Select value={data.reason} onValueChange={(value) => setData('reason', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Todas</SelectItem>
                                                    {reasons.map((reason) => (
                                                        <SelectItem key={reason} value={reason}>
                                                            {reason}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date_from">Desde</Label>
                                            <Input
                                                id="date_from"
                                                type="date"
                                                value={data.date_from}
                                                onChange={(e) => setData('date_from', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date_to">Hasta</Label>
                                            <Input
                                                id="date_to"
                                                type="date"
                                                value={data.date_to}
                                                onChange={(e) => setData('date_to', e.target.value)}
                                            />
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

                {/* Tabla de movimientos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Movimientos ({movements.meta?.total || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>Stock Antes/Después</TableHead>
                                        <TableHead>Razón</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Notas</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="py-8 text-center">
                                                No se encontraron movimientos
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        movements.data.map((movement) => (
                                            <TableRow key={movement.id}>
                                                <TableCell className="font-mono text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {formatDate(movement.movement_date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{movement.product?.name}</span>
                                                        <span className="text-sm text-muted-foreground">{movement.product?.code}</span>
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
                                                <TableCell>{getReasonBadge(movement.reason)}</TableCell>
                                                <TableCell>{movement.user?.name}</TableCell>
                                                <TableCell className="max-w-xs">
                                                    <span className="truncate text-sm text-muted-foreground" title={movement.notes}>
                                                        {movement.notes || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={route('admin.inventory.movements.show', movement.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {movement.product && (
                                                            <Link href={route('admin.inventory.stock.show', movement.product.id)}>
                                                                <Button variant="ghost" size="sm" title="Ver producto">
                                                                    <Package className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginación */}
                        {movements.links && <div className="mt-4 flex justify-center">{/* Aquí iría el componente de paginación */}</div>}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
