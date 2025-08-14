import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, PlusCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Brand {
    id: number;
    name: string;
}

interface Technician {
    id: number;
    name: string;
}

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    document_number: string;
}

interface DeviceModel {
    id: number;
    name: string;
}

interface RepairOrder {
    id: number;
    order_number: string;
    customer: Customer;
    brand: Brand;
    model: DeviceModel;
    technician?: Technician;
    status: string;
    priority: string;
    total_cost: string;
    pending_balance: string;
    promised_date: string | null;
    created_at: string;
}

interface PaginatedRepairOrders {
    data: RepairOrder[];
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

interface RepairOrdersIndexProps {
    repairOrders: PaginatedRepairOrders;
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        brand_id?: string;
        technician_id?: string;
    };
    brands: Brand[];
    technicians: Technician[];
}

const statusLabels = {
    received: 'Recibido',
    diagnosing: 'Diagnosticando',
    waiting_parts: 'Esperando Repuestos',
    repairing: 'Reparando',
    repaired: 'Reparado',
    unrepairable: 'Irreparable',
    waiting_customer: 'Esperando Cliente',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

const statusColors = {
    received: 'bg-blue-100 text-blue-800',
    diagnosing: 'bg-yellow-100 text-yellow-800',
    waiting_parts: 'bg-orange-100 text-orange-800',
    repairing: 'bg-purple-100 text-purple-800',
    repaired: 'bg-green-100 text-green-800',
    unrepairable: 'bg-red-100 text-red-800',
    waiting_customer: 'bg-gray-100 text-gray-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
};

const priorityLabels = {
    low: 'Baja',
    normal: 'Normal',
    high: 'Alta',
    urgent: 'Urgente',
};

const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
};

export default function RepairOrdersIndex({ repairOrders, filters, brands, technicians }: RepairOrdersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [brandFilter, setBrandFilter] = useState(filters.brand_id || 'all');
    const [technicianFilter, setTechnicianFilter] = useState(filters.technician_id || 'all');

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
            if (priorityFilter !== 'all') {
                params.priority = priorityFilter;
            }
            if (brandFilter !== 'all') {
                params.brand_id = brandFilter;
            }
            if (technicianFilter !== 'all') {
                params.technician_id = technicianFilter;
            }

            router.get('/admin/repair-orders', params, {
                preserveState: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, priorityFilter, brandFilter, technicianFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPriorityFilter('all');
        setBrandFilter('all');
        setTechnicianFilter('all');
    };

    const formatCurrency = (amount: string | number): string => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'BOB',
        }).format(isNaN(num) ? 0 : num);
    };

    const getStatusBadge = (status: string) => {
        const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
        return (
            <Badge variant="secondary" className={colorClass}>
                {statusLabels[status as keyof typeof statusLabels] || status}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const colorClass = priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800';
        return (
            <Badge variant="secondary" className={colorClass}>
                {priorityLabels[priority as keyof typeof priorityLabels] || priority}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Órdenes de Reparación" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Órdenes de Reparación</h1>
                        <p className="text-muted-foreground">Gestiona las órdenes de reparación de dispositivos</p>
                    </div>
                    <Link href="/admin/repair-orders/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nueva Orden
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
                                <label className="text-sm font-medium">Buscar</label>
                                <Input
                                    placeholder="Orden, cliente, serial, IMEI..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">📋 Todos los estados</SelectItem>
                                        {Object.entries(statusLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Prioridad</label>
                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">📋 Todas las prioridades</SelectItem>
                                        {Object.entries(priorityLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Marca</label>
                                <Select value={brandFilter} onValueChange={setBrandFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">🏷️ Todas las marcas</SelectItem>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Técnico</label>
                                <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">👨‍🔧 Todos los técnicos</SelectItem>
                                        {technicians.map((technician) => (
                                            <SelectItem key={technician.id} value={technician.id.toString()}>
                                                {technician.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Mostrando <span className="font-medium">{repairOrders.data.length}</span> de{' '}
                        <span className="font-medium">{repairOrders.total}</span> órdenes
                    </div>
                    {repairOrders.total > 0 && (
                        <div className="text-xs text-muted-foreground">
                            Página {repairOrders.current_page} de {repairOrders.last_page}
                        </div>
                    )}
                </div>

                {/* Orders Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Orden</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Dispositivo</TableHead>
                                    <TableHead>Técnico</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Prioridad</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {repairOrders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="text-4xl">🔧</div>
                                                <div className="text-lg font-medium text-muted-foreground">
                                                    No se encontraron órdenes de reparación
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    repairOrders.data.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <div className="font-medium">{order.order_number}</div>
                                                {order.promised_date && (
                                                    <div className="text-sm text-muted-foreground">
                                                        Prometido: {new Date(order.promised_date).toLocaleDateString('es-ES')}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {order.customer.first_name} {order.customer.last_name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{order.customer.document_number}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{order.brand.name}</div>
                                                <div className="text-sm text-muted-foreground">{order.model.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                {order.technician ? (
                                                    <div className="font-medium">{order.technician.name}</div>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">Sin asignar</div>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                                            <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{formatCurrency(order.total_cost)}</div>
                                                {parseFloat(order.pending_balance) > 0 && (
                                                    <div className="text-sm text-red-600">Pendiente: {formatCurrency(order.pending_balance)}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>{new Date(order.created_at).toLocaleDateString('es-ES')}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/repair-orders/${order.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/repair-orders/${order.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                        <Button variant="ghost" size="sm" className="text-red-600">
                                                            <X className="h-4 w-4" />
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
                {repairOrders.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {repairOrders.links.map((link, index) =>
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
