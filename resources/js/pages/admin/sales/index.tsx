import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Sale, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CreditCard, Eye, FileText, Filter, Plus, Receipt, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface SalesIndexProps {
    sales: {
        data: Sale[];
        links: any;
        meta: any;
    };
    sellers: User[];
    filters: {
        search?: string;
        status?: string;
        payment_method?: string;
        seller_id?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function SalesIndex({ sales, sellers, filters }: SalesIndexProps) {
    console.log('🚀 ~ SalesIndex ~ sales:', sales);
    const [showFilters, setShowFilters] = useState(false);

    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        status: filters.status || '',
        payment_method: filters.payment_method || '',
        seller_id: filters.seller_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        get(route('admin.sales.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setData({
            search: '',
            status: '',
            payment_method: '',
            seller_id: '',
            date_from: '',
            date_to: '',
        });
        get(route('admin.sales.index'));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            paid: 'default',
            pending: 'secondary',
            cancelled: 'destructive',
        };

        const labels: Record<string, string> = {
            paid: 'Pagado',
            pending: 'Pendiente',
            cancelled: 'Anulado',
        };

        return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
    };

    const getSaleTypeBadge = (saleType: string) => {
        return <Badge variant={saleType === 'cash' ? 'default' : 'secondary'}>{saleType === 'cash' ? 'Contado' : 'Crédito'}</Badge>;
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            cash: 'Efectivo',
            card: 'Tarjeta',
            transfer: 'Transferencia',
            qr: 'QR',
            mixed: 'Mixto',
        };

        return labels[method] || method;
    };

    const handleCancelSale = (saleId: number) => {
        if (confirm('¿Está seguro de que desea anular esta venta?')) {
            const reason = prompt('Motivo de anulación:');
            if (reason) {
                router.post(
                    route('admin.sales.cancel', saleId),
                    {
                        cancellation_reason: reason,
                    },
                    {
                        onSuccess: () => {
                            router.reload();
                        },
                    },
                );
            }
        }
    };

    const canCancelSale = (sale: Sale) => {
        // Solo se pueden anular ventas del día actual
        const today = new Date().toDateString();
        const saleDate = new Date(sale.created_at).toDateString();
        return sale.status !== 'cancelled' && today === saleDate;
    };

    return (
        <AppLayout>
            <Head title="Ventas" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
                        <p className="text-muted-foreground">Gestiona todas las ventas del sistema</p>
                    </div>
                    <Link href={route('admin.sales.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Venta
                        </Button>
                    </Link>
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
                                        placeholder="Número de venta o cliente..."
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                    />
                                </div>

                                {showFilters && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Estado</Label>
                                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todos" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Todos</SelectItem>
                                                    <SelectItem value="paid">Pagado</SelectItem>
                                                    <SelectItem value="pending">Pendiente</SelectItem>
                                                    <SelectItem value="cancelled">Anulado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="payment_method">Método de Pago</Label>
                                            <Select value={data.payment_method} onValueChange={(value) => setData('payment_method', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todos" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Todos</SelectItem>
                                                    <SelectItem value="cash">Efectivo</SelectItem>
                                                    <SelectItem value="card">Tarjeta</SelectItem>
                                                    <SelectItem value="transfer">Transferencia</SelectItem>
                                                    <SelectItem value="qr">QR</SelectItem>
                                                    <SelectItem value="mixed">Mixto</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="seller_id">Vendedor</Label>
                                            <Select value={data.seller_id} onValueChange={(value) => setData('seller_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todos" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Todos</SelectItem>
                                                    {sellers.map((seller) => (
                                                        <SelectItem key={seller.id} value={seller.id.toString()}>
                                                            {seller.name}
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

                {/* Tabla de ventas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ventas ({sales.meta?.total || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Número</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Vendedor</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Método Pago</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="py-8 text-center">
                                                No se encontraron ventas
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sales.data.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell className="font-medium">{sale.sale_number}</TableCell>
                                                <TableCell>
                                                    {sale.customer
                                                        ? sale.customer.full_name || `${sale.customer.first_name} ${sale.customer.last_name}`
                                                        : 'Cliente público'}
                                                </TableCell>
                                                <TableCell>{sale.seller.name}</TableCell>
                                                <TableCell>{getSaleTypeBadge(sale.sale_type)}</TableCell>
                                                <TableCell className="font-semibold">
                                                    ${sale.total_number.toFixed(2)}
                                                    {sale.pending_balance_number > 0 && (
                                                        <div className="text-xs text-orange-600">
                                                            Pendiente: ${sale.pending_balance_number.toFixed(2)}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getPaymentMethodLabel(sale.payment_method)}</TableCell>
                                                <TableCell>{getStatusBadge(sale.status)}</TableCell>
                                                <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={route('admin.sales.show', sale.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>

                                                        {sale.status !== 'cancelled' && (
                                                            <>
                                                                <Link href={route('admin.sales.print-invoice', sale.id)}>
                                                                    <Button variant="ghost" size="sm">
                                                                        <FileText className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>

                                                                <Link href={route('admin.sales.print-receipt', sale.id)}>
                                                                    <Button variant="ghost" size="sm">
                                                                        <Receipt className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>

                                                                {sale.status === 'pending' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            // Implementar modal de pago a crédito
                                                                        }}
                                                                    >
                                                                        <CreditCard className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}

                                                        {canCancelSale(sale) && (
                                                            <Button variant="ghost" size="sm" onClick={() => handleCancelSale(sale.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
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
                        {sales.links && <div className="mt-4 flex justify-center">{/* Aquí iría el componente de paginación */}</div>}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
