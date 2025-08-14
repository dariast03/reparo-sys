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
        title: 'Nueva Categoría',
        href: '/admin/categories/create',
    },
];

interface CategoryForm {
    name: string;
    description: string;
    status: 'active' | 'inactive';
    [key: string]: string;
}

export default function CreateCategory() {
    const { data, setData, post, processing, errors } = useForm<CategoryForm>({
        name: '',
        description: '',
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/categories');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Categoría" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/categories">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Nueva Categoría</h1>
                        <p className="text-muted-foreground">Crea una nueva categoría de productos</p>
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
                                            {processing ? 'Guardando...' : 'Crear Categoría'}
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
                                <CardTitle className="text-sm">💡 Consejos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <div>
                                    <strong>Nombre descriptivo:</strong> Usa nombres claros como "Pantallas LCD", "Baterías" o "Cargadores USB-C".
                                </div>
                                <div>
                                    <strong>Organización:</strong> Las categorías ayudan a organizar mejor tu inventario y facilitan las búsquedas.
                                </div>
                                <div>
                                    <strong>Estado:</strong> Puedes crear categorías inactivas para organizarte, pero solo las activas aparecerán en
                                    los formularios.
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">📊 Próximos pasos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div>1. Crear la categoría</div>
                                <div>2. Agregar productos a esta categoría</div>
                                <div>3. Configurar precios y stock</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
