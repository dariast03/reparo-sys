import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Truck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Proveedores',
        href: '/admin/suppliers',
    },
    {
        title: 'Editar Proveedor',
        href: '#',
    },
];

interface Supplier {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    tax_id: string | null;
    delivery_time_days: number;
    rating: number;
    status: 'active' | 'inactive';
    notes: string | null;
    created_at: string;
    updated_at: string;
}

interface EditSupplierProps {
    supplier: Supplier;
}

interface EditSupplierForm {
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    tax_id: string;
    delivery_time_days: number;
    rating: number;
    status: 'active' | 'inactive';
    notes: string;
}

export default function EditSupplier({ supplier }: EditSupplierProps) {
    const { data, setData, put, processing, errors } = useForm<EditSupplierForm>({
        name: supplier.name,
        contact_person: supplier.contact_person || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        tax_id: supplier.tax_id || '',
        delivery_time_days: supplier.delivery_time_days,
        rating: supplier.rating,
        status: supplier.status,
        notes: supplier.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/suppliers/${supplier.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Editar Proveedor - ${supplier.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/suppliers">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Editar Proveedor</h1>
                            <p className="text-muted-foreground">Modifica la información del proveedor</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Información Básica */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        Información Básica
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Nombre del Proveedor <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Ej: Distribuidora Tech S.A."
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact_person">Persona de Contacto</Label>
                                            <Input
                                                id="contact_person"
                                                value={data.contact_person}
                                                onChange={(e) => setData('contact_person', e.target.value)}
                                                placeholder="Ej: Juan Pérez"
                                                className={errors.contact_person ? 'border-red-500' : ''}
                                            />
                                            {errors.contact_person && <p className="text-sm text-red-500">{errors.contact_person}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Teléfono</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="Ej: +591 7654321"
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Ej: contacto@proveedor.com"
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tax_id">RUC/NIT</Label>
                                            <Input
                                                id="tax_id"
                                                value={data.tax_id}
                                                onChange={(e) => setData('tax_id', e.target.value)}
                                                placeholder="Ej: 123456789"
                                                className={errors.tax_id ? 'border-red-500' : ''}
                                            />
                                            {errors.tax_id && <p className="text-sm text-red-500">{errors.tax_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">
                                                Estado <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={data.status} onValueChange={(value: 'active' | 'inactive') => setData('status', value)}>
                                                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">✅ Activo</SelectItem>
                                                    <SelectItem value="inactive">❌ Inactivo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Dirección</Label>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Ej: Av. Principal #123, Zona Centro"
                                            className={errors.address ? 'border-red-500' : ''}
                                            rows={3}
                                        />
                                        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notas Adicionales</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Información adicional sobre el proveedor..."
                                            className={errors.notes ? 'border-red-500' : ''}
                                            rows={3}
                                        />
                                        {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Configuraciones */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configuraciones</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="delivery_time_days">Tiempo de Entrega (días)</Label>
                                        <Input
                                            id="delivery_time_days"
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={data.delivery_time_days}
                                            onChange={(e) => setData('delivery_time_days', parseInt(e.target.value) || 0)}
                                            className={errors.delivery_time_days ? 'border-red-500' : ''}
                                        />
                                        {errors.delivery_time_days && <p className="text-sm text-red-500">{errors.delivery_time_days}</p>}
                                        <p className="text-xs text-muted-foreground">Días promedio de entrega de productos</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rating">Calificación</Label>
                                        <Input
                                            id="rating"
                                            type="number"
                                            min="1"
                                            max="5"
                                            step="0.1"
                                            value={data.rating}
                                            onChange={(e) => setData('rating', parseFloat(e.target.value) || 0)}
                                            className={errors.rating ? 'border-red-500' : ''}
                                        />
                                        {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
                                        <p className="text-xs text-muted-foreground">Calificación de 1 a 5 estrellas</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Acciones */}
                            <Card className="mt-6">
                                <CardContent className="pt-6">
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={processing} className="flex-1">
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Guardando...' : 'Actualizar Proveedor'}
                                        </Button>
                                        <Link href="/admin/suppliers">
                                            <Button type="button" variant="outline">
                                                Cancelar
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
