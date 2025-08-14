import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Calendar, Download, Eye, FileText, Filter, Mail, MoreHorizontal, Plus, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Quote {
    id: number;
    quote_number: string;
    customer: {
        id: number;
        name: string;
        email: string;
    };
    user: {
        id: number;
        name: string;
    };
    repair_order?: {
        id: number;
        order_number: string;
    };
    total: string;
    status: string;
    expiry_date: string;
    created_at: string;
}

interface QuoteIndexProps {
    quotes: {
        data: Quote[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}

const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800',
};

const statusLabels = {
    draft: 'Borrador',
    sent: 'Enviada',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    expired: 'Vencida',
};

export default function QuoteIndex({ quotes, filters }: QuoteIndexProps) {
    const [showFilters, setShowFilters] = useState(false);

    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        status: filters.status || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        get('/admin/quotes');
    };

    const resetFilters = () => {
        setData({
            search: '',
            status: '',
            date_from: '',
            date_to: '',
        });
        router.get('/admin/quotes');
    };

    const handleSendEmail = (quote: Quote) => {
        if (!quote.customer.email) {
            alert('El cliente no tiene email registrado.');
            return;
        }

        if (confirm('¿Está seguro de enviar esta cotización por email?')) {
            router.post(`/admin/quotes/${quote.id}/send-email`);
        }
    };

    const isExpired = (expiryDate: string) => {
        return new Date(expiryDate) < new Date();
    };

    const getExpiryStatus = (expiryDate: string) => {
        const expiry = new Date(expiryDate);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));

        if (diffDays < 0) return { text: 'Vencida', color: 'text-red-600' };
        if (diffDays <= 3) return { text: `Vence en ${diffDays} días`, color: 'text-orange-600' };
        return { text: `${diffDays} días restantes`, color: 'text-green-600' };
    };

    return (
        <AppLayout>
            <Head title="Cotizaciones" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cotizaciones</h1>
                        <p className="text-muted-foreground">Gestiona las cotizaciones de servicios</p>
                    </div>
                    <Link href="/admin/quotes/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Cotización
                        </Button>
                    </Link>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Buscar Cotizaciones
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                                <Filter className="mr-2 h-4 w-4" />
                                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="md:col-span-2">
                                    <Input
                                        placeholder="Buscar por número o cliente..."
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                    />
                                </div>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={null!}>Todos los estados</SelectItem>
                                        <SelectItem value="draft">Borrador</SelectItem>
                                        <SelectItem value="sent">Enviada</SelectItem>
                                        <SelectItem value="approved">Aprobada</SelectItem>
                                        <SelectItem value="rejected">Rechazada</SelectItem>
                                        <SelectItem value="expired">Vencida</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing} className="flex-1">
                                        Buscar
                                    </Button>
                                    <Button type="button" variant="outline" onClick={resetFilters}>
                                        Limpiar
                                    </Button>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium">Fecha desde:</label>
                                        <Input type="date" value={data.date_from} onChange={(e) => setData('date_from', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Fecha hasta:</label>
                                        <Input type="date" value={data.date_to} onChange={(e) => setData('date_to', e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Tabla de Cotizaciones */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Cotizaciones ({quotes.total} total)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Número</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Orden Vinculada</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Validez</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quotes.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-8 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileText className="h-8 w-8 text-gray-400" />
                                                    <p className="text-muted-foreground">No se encontraron cotizaciones</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        quotes.data.map((quote) => {
                                            const expiryStatus = getExpiryStatus(quote.expiry_date);
                                            return (
                                                <TableRow key={quote.id}>
                                                    <TableCell className="font-mono">{quote.quote_number}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{quote.customer.name}</p>
                                                            <p className="text-sm text-muted-foreground">{quote.customer.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {quote.repair_order ? (
                                                            <Link
                                                                href={`/admin/repair-orders/${quote.repair_order.id}`}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                #{quote.repair_order.order_number}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-mono font-medium">
                                                        ${parseFloat(quote.total).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={statusColors[quote.status as keyof typeof statusColors]}>
                                                            {statusLabels[quote.status as keyof typeof statusLabels]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`text-sm font-medium ${expiryStatus.color}`}>{expiryStatus.text}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(quote.created_at).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <Link href={`/admin/quotes/${quote.id}`}>
                                                                    <DropdownMenuItem>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Ver Detalles
                                                                    </DropdownMenuItem>
                                                                </Link>
                                                                <Link href={`/admin/quotes/${quote.id}/edit`}>
                                                                    <DropdownMenuItem>
                                                                        <FileText className="mr-2 h-4 w-4" />
                                                                        Editar
                                                                    </DropdownMenuItem>
                                                                </Link>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => window.open(`/admin/quotes/${quote.id}/download-pdf`, '_blank')}
                                                                >
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Descargar PDF
                                                                </DropdownMenuItem>
                                                                {quote.customer.email && (
                                                                    <DropdownMenuItem onClick={() => handleSendEmail(quote)}>
                                                                        <Mail className="mr-2 h-4 w-4" />
                                                                        Enviar por Email
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginación */}
                        {quotes.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando {quotes.data.length} de {quotes.total} cotizaciones
                                </p>
                                <div className="flex gap-2">
                                    {quotes.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
