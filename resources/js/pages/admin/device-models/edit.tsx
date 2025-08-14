import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Modelos de Dispositivos',
        href: '/admin/device-models',
    },
    {
        title: 'Editar Modelo',
        href: '#',
    },
];

interface Brand {
    id: number;
    name: string;
}

interface DeviceModel {
    id: number;
    brand_id: number;
    name: string;
    device_type: string;
    status: string;
    brand: Brand;
}

interface DeviceModelEditProps {
    deviceModel: DeviceModel;
    brands: Brand[];
}

const deviceTypeOptions = [
    { value: 'phone', label: 'Teléfono', icon: '📱' },
    { value: 'tablet', label: 'Tablet', icon: '📱' },
    { value: 'laptop', label: 'Laptop', icon: '💻' },
    { value: 'smartwatch', label: 'Smartwatch', icon: '⌚' },
    { value: 'other', label: 'Otro', icon: '📟' },
];

export default function DeviceModelEdit({ deviceModel, brands }: DeviceModelEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        brand_id: deviceModel.brand_id.toString(),
        name: deviceModel.name,
        device_type: deviceModel.device_type,
        status: deviceModel.status,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/device-models/${deviceModel.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Editar Modelo: ${deviceModel.brand.name} ${deviceModel.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/device-models">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Editar Modelo de Dispositivo</h1>
                        <p className="text-muted-foreground">
                            Modificando: {deviceModel.brand.name} {deviceModel.name}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Modelo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="brand_id">Marca *</Label>
                                            <Select value={data.brand_id} onValueChange={(value) => setData('brand_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona una marca" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brands.map((brand) => (
                                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.brand_id && <p className="text-sm text-red-600">{errors.brand_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre del Modelo *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Ej: iPhone 15 Pro, Galaxy S24, etc."
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="device_type">Tipo de Dispositivo *</Label>
                                            <Select value={data.device_type} onValueChange={(value) => setData('device_type', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el tipo de dispositivo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {deviceTypeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <span className="flex items-center gap-2">
                                                                <span>{option.icon}</span>
                                                                <span>{option.label}</span>
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.device_type && <p className="text-sm text-red-600">{errors.device_type}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">Estado</Label>
                                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">✅ Activo</SelectItem>
                                                    <SelectItem value="inactive">❌ Inactivo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Guardando...' : 'Actualizar Modelo'}
                                        </Button>
                                        <Link href="/admin/device-models">
                                            <Button type="button" variant="outline">
                                                Cancelar
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>💡 Consejos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 font-medium">Nombres de Modelos</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Usa nombres específicos y reconocibles. Ej: "iPhone 15 Pro Max", "Galaxy S24 Ultra"
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-2 font-medium">Unicidad</h4>
                                    <p className="text-sm text-muted-foreground">
                                        No puede existir el mismo modelo para una marca. Cada combinación marca-modelo debe ser única.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-2 font-medium">Cambio de Estado</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Al desactivar un modelo, no aparecerá en formularios nuevos pero mantendrá los registros existentes.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
