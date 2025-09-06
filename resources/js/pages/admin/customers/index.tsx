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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye, Pencil, PlusCircle, QrCode, UserCheck, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    document_number: string;
    document_type: string;
    phone: string;
    email: string;
    address: string;
    birth_date: string;
    gender: string;
    status: 'active' | 'inactive';
    qr_code: string;
    qr_url: string;
    qr_base64: string;
    qr_data_uri: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedCustomers {
    data: Customer[];
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

interface CustomersIndexProps {
    customers: PaginatedCustomers;
    filters: {
        search?: string;
        status?: string;
        document_type?: string;
    };
}

const documentTypeLabels = {
    ci: 'Cédula de Identidad',
    passport: 'Pasaporte',
    driver_license: 'Licencia de Conducir',
    foreigner_id: 'Carnet de Extranjero',
    nit: 'NIT',
    military_id: 'Libreta Militar',
    other: 'Otro',
};

export default function CustomersIndex({ customers, filters }: CustomersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [documentTypeFilter, setDocumentTypeFilter] = useState(filters.document_type || 'all');

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
            if (documentTypeFilter !== 'all') {
                params.document_type = documentTypeFilter;
            }

            router.get('/admin/customers', params, {
                preserveState: true,
                replace: true,
            });
        }, 500); // Debounce de 500ms para el input de búsqueda

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, documentTypeFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDocumentTypeFilter('all');
    };

    const handleDeactivateCustomer = (customerId: number) => {
        router.delete(`/admin/customers/${customerId}`, {
            preserveScroll: true,
        });
    };

    const handleReactivateCustomer = (customerId: number) => {
        router.patch(
            `/admin/customers/${customerId}/reactivate`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                Activo
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                Inactivo
            </Badge>
        );
    };

    const downloadQR = (customer: Customer) => {
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = customer.qr_data_uri;
        link.download = `qr-cliente-${customer.first_name}-${customer.last_name}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout>
            <Head title="Gestión de Clientes" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
                        <p className="text-muted-foreground">Administra la información de tus clientes</p>
                    </div>
                    <Link href="/admin/customers/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo Cliente
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Buscar Cliente</label>
                                <Input
                                    placeholder="Nombre, documento, teléfono o email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado del Cliente</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">📋 Todos los estados</SelectItem>
                                        <SelectItem value="active">✅ Activos</SelectItem>
                                        <SelectItem value="inactive">❌ Inactivos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo de Documento</label>
                                <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por documento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">📄 Todos los tipos</SelectItem>
                                        {Object.entries(documentTypeLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {value === 'ci' && '🆔'}
                                                {value === 'passport' && '📘'}
                                                {value === 'driver_license' && '🚗'}
                                                {value === 'foreigner_id' && '🌍'}
                                                {value === 'nit' && '🏢'}
                                                {value === 'military_id' && '🎖️'}
                                                {value === 'other' && '📋'} {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Chips de filtros activos */}
                        {(searchTerm || statusFilter !== 'all' || documentTypeFilter !== 'all') && (
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
                                    {statusFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            {statusFilter === 'active' ? '✅' : '❌'} {statusFilter === 'active' ? 'Activos' : 'Inactivos'}
                                            <button
                                                onClick={() => setStatusFilter('all')}
                                                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-gray-200"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {documentTypeFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            📄 {documentTypeLabels[documentTypeFilter as keyof typeof documentTypeLabels]}
                                            <button
                                                onClick={() => setDocumentTypeFilter('all')}
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
                        Mostrando <span className="font-medium">{customers.data.length}</span> de{' '}
                        <span className="font-medium">{customers.total}</span> clientes
                        {(searchTerm || statusFilter !== 'all' || documentTypeFilter !== 'all') && (
                            <span className="text-blue-600"> (filtrados)</span>
                        )}
                    </div>
                    {customers.total > 0 && (
                        <div className="text-xs text-muted-foreground">
                            Página {customers.current_page} de {customers.last_page}
                        </div>
                    )}
                </div>

                {/* Customers Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha Registro</TableHead>
                                    <TableHead>Código QR</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="text-4xl">🔍</div>
                                                <div className="text-lg font-medium text-muted-foreground">
                                                    {searchTerm || statusFilter !== 'all' || documentTypeFilter !== 'all'
                                                        ? 'No se encontraron clientes con los filtros aplicados'
                                                        : 'No hay clientes registrados'}
                                                </div>
                                                {(searchTerm || statusFilter !== 'all' || documentTypeFilter !== 'all') && (
                                                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                                                        Limpiar filtros y ver todos
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.data.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {customer.first_name} {customer.last_name}
                                                    </div>
                                                    {customer.email && <div className="text-sm text-muted-foreground">{customer.email}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{customer.document_number}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {documentTypeLabels[customer.document_type as keyof typeof documentTypeLabels]}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{customer.phone}</div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(customer.status)}</TableCell>
                                            <TableCell>{new Date(customer.created_at).toLocaleDateString('es-ES')}</TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <QrCode className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                Código QR - {customer.first_name} {customer.last_name}
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Escanea este código para acceder rápidamente a la información del cliente.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <div className="bg-white p-4 rounded-lg border">
                                                                <img
                                                                    src={customer.qr_data_uri}
                                                                    alt={`QR Code for ${customer.first_name} ${customer.last_name}`}
                                                                    className="w-48 h-48"
                                                                />
                                                            </div>
                                                            <div className="text-sm text-muted-foreground text-center">
                                                                <p>Código: <code className="bg-muted px-2 py-1 rounded">{customer.qr_code}</code></p>
                                                                <p className="mt-1">URL: <code className="bg-muted px-2 py-1 rounded text-xs">{customer.qr_url}</code></p>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button onClick={() => downloadQR(customer)} className="w-full">
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Descargar QR
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/customers/${customer.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/customers/${customer.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {customer.status === 'active' ? (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-red-600">
                                                                    <UserX className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Inactivar Cliente?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        ¿Estás seguro de que deseas inactivar a {customer.first_name}{' '}
                                                                        {customer.last_name}? Esta acción no eliminará el cliente, pero no aparecerá
                                                                        en las búsquedas normales.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeactivateCustomer(customer.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Inactivar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-green-600"
                                                            onClick={() => handleReactivateCustomer(customer.id)}
                                                        >
                                                            <UserCheck className="h-4 w-4" />
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
                {customers.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {customers.links.map((link, index) =>
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
