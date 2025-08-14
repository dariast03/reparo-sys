import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface ProductCategory {
    id: number;
    name: string;
    description: string | null;
    status: 'active' | 'inactive';
    products_count: number;
    created_at: string;
    updated_at: string;
}

interface EditCategoryProps {
    category: ProductCategory;
}

interface CategoryForm {
    name: string;
    description: string;
    status: 'active' | 'inactive';
    [key: string]: string;
}

export default function EditCategory({ category }: EditCategoryProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Gestión de Categorías',
            href: '/admin/categories',
        },
        {
            title: category.name,
            href: `/admin/categories/${category.id}`,
        },
        {
            title: 'Editar',
            href: `/admin/categories/${category.id}/edit`,
        },
    ];

    const { data, setData, patch, processing, errors } = useForm<CategoryForm>({
        name: category.name,
        description: category.description || '',
        status: category.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/categories/${category.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${category.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/categories">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Editar Categoría</h1>
                        <p className="text-muted-foreground">Modifica la información de "{category.name}"</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de la Categoría</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Nombre de la Categoría <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Ej: Pantallas, Baterías, Cargadores..."
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">
                                                Estado <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={data.status} onValueChange={(value: 'active' | 'inactive') => setData('status', value)}>
                                                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Selecciona el estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">✅ Activa</SelectItem>
                                                    <SelectItem value="inactive">❌ Inactiva</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descripción</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe brevemente esta categoría de productos..."
                                            className={errors.description ? 'border-red-500' : ''}
                                            rows={4}
                                        />
                                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                        <p className="text-xs text-muted-foreground">Opcional. Máximo 1000 caracteres.</p>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={processing}>
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Guardando...' : 'Actualizar Categoría'}
                                        </Button>
                                        <Link href="/admin/categories">
                                            <Button type="button" variant="outline">
                                                Cancelar
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">📊 Estadísticas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Productos asociados:</span>
                                    <span className="font-medium">{category.products_count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Creada:</span>
                                    <span className="font-medium">{new Date(category.created_at).toLocaleDateString('es-ES')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Actualizada:</span>
                                    <span className="font-medium">{new Date(category.updated_at).toLocaleDateString('es-ES')}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">⚠️ Importante</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                {category.products_count > 0 && (
                                    <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
                                        <p className="text-orange-800">
                                            Esta categoría tiene <strong>{category.products_count} productos</strong> asociados. Si la desactivas, los
                                            productos seguirán asociados pero la categoría no aparecerá en los formularios.
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <strong>Cambio de nombre:</strong> Al cambiar el nombre, se actualizará en todos los productos asociados.
                                </div>
                                <div>
                                    <strong>Estado inactivo:</strong> Las categorías inactivas no aparecen en los formularios de productos.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
