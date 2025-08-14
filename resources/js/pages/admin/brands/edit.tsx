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
        title: 'Editar Marca',
        href: '#',
    },
];

interface Brand {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    models_count: number;
    repair_orders_count: number;
    created_at: string;
    updated_at: string;
}

interface BrandsEditProps {
    brand: Brand;
}

export default function BrandsEdit({ brand }: BrandsEditProps) {
    const { data, setData, patch, processing, errors } = useForm({
        name: brand.name,
        status: brand.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/brands/${brand.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Editar Marca: ${brand.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/brands">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Editar Marca</h1>
                        <p className="text-muted-foreground">Modificar información de la marca: {brand.name}</p>
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

                                {/* Información de uso */}
                                {(brand.models_count > 0 || brand.repair_orders_count > 0) && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                        <h3 className="mb-2 font-medium text-amber-900">⚠️ Información de Uso</h3>
                                        <div className="space-y-1 text-sm text-amber-800">
                                            <p>Esta marca está siendo utilizada en:</p>
                                            <ul className="ml-4 list-inside list-disc">
                                                <li>
                                                    {brand.models_count} {brand.models_count === 1 ? 'modelo' : 'modelos'} de dispositivo
                                                </li>
                                                <li>
                                                    {brand.repair_orders_count} {brand.repair_orders_count === 1 ? 'orden' : 'órdenes'} de reparación
                                                </li>
                                            </ul>
                                            <p className="mt-2">Ten cuidado al cambiar el estado a inactivo.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Información adicional */}
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <h3 className="mb-2 font-medium text-blue-900">💡 Información</h3>
                                    <ul className="space-y-1 text-sm text-blue-800">
                                        <li>• Cambiar el nombre afectará todas las referencias existentes</li>
                                        <li>• Las marcas inactivas no aparecerán en los formularios de selección</li>
                                        <li>• No se puede eliminar una marca que tiene modelos o reparaciones asociadas</li>
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
                                        {processing ? 'Guardando...' : 'Guardar Cambios'}
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
