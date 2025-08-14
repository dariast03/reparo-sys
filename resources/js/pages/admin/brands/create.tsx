import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Marcas',
        href: '/admin/brands',
    },
    {
        title: 'Nueva Marca',
        href: '/admin/brands/create',
    },
];

export default function BrandsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/brands');
    };

    return (
        <AppLayout>
            <Head title="Nueva Marca" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/brands">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Nueva Marca</h1>
                        <p className="text-muted-foreground">Crear una nueva marca de dispositivo</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Marca</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Nombre */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Nombre de la Marca <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ej: Apple, Samsung, Huawei..."
                                            className={errors.name ? 'border-red-500' : ''}
                                            maxLength={50}
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        <p className="text-xs text-muted-foreground">Máximo 50 caracteres</p>
                                    </div>

                                    {/* Estado */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">
                                            Estado <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'inactive')}>
                                            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">✅ Activa</SelectItem>
                                                <SelectItem value="inactive">❌ Inactiva</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                                    </div>
                                </div>

                                {/* Información adicional */}
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <h3 className="mb-2 font-medium text-blue-900">💡 Información</h3>
                                    <ul className="space-y-1 text-sm text-blue-800">
                                        <li>• Las marcas se utilizan para categorizar los dispositivos</li>
                                        <li>• Una vez creada, podrás asignar modelos de dispositivos a esta marca</li>
                                        <li>• Las marcas inactivas no aparecerán en los formularios de selección</li>
                                    </ul>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex justify-end gap-4 border-t pt-4">
                                    <Link href="/admin/brands">
                                        <Button variant="outline" type="button">
                                            Cancelar
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Guardando...' : 'Guardar Marca'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
