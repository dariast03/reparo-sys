import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, FolderOpen, Package, Pencil } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string;
    brand: {
        name: string;
    };
    status: 'active' | 'inactive';
    created_at: string;
}

interface ProductCategory {
    id: number;
    name: string;
    description: string | null;
    status: 'active' | 'inactive';
    products_count: number;
    products: Product[];
    created_at: string;
    updated_at: string;
}

interface ShowCategoryProps {
    category: ProductCategory;
}

export default function ShowCategory({ category }: ShowCategoryProps) {
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
    ];

    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                Activa
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                Inactiva
            </Badge>
        );
    };

    const getProductStatusBadge = (status: string) => {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Categoría: ${category.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/categories">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="flex items-center gap-3 text-3xl font-bold">
                                <FolderOpen className="h-8 w-8 text-muted-foreground" />
                                {category.name}
                                {getStatusBadge(category.status)}
                            </h1>
                            <p className="text-muted-foreground">Detalles de la categoría de productos</p>
                        </div>
                    </div>
                    <Link href={`/admin/categories/${category.id}/edit`}>
                        <Button>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Categoría
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* Información General */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información General</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                        <p className="text-lg font-medium">{category.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                        <div className="mt-1">{getStatusBadge(category.status)}</div>
                                    </div>
                                </div>

                                {category.description && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                                        <p className="mt-1 text-sm leading-relaxed">{category.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Productos de la Categoría */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Productos de esta Categoría
                                        <Badge variant="secondary">{category.products_count}</Badge>
                                    </CardTitle>
                                    {category.products_count > 0 && (
                                        <Link href={`/admin/products?category=${category.id}`}>
                                            <Button variant="outline" size="sm">
                                                Ver todos los productos
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {category.products && category.products.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>SKU</TableHead>
                                                <TableHead>Marca</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Fecha</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {category.products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <Link
                                                            href={`/admin/products/${product.id}`}
                                                            className="font-medium transition-colors hover:text-blue-600"
                                                        >
                                                            {product.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="rounded bg-gray-100 px-2 py-1 text-xs">{product.sku}</code>
                                                    </TableCell>
                                                    <TableCell>{product.brand.name}</TableCell>
                                                    <TableCell>{getProductStatusBadge(product.status)}</TableCell>
                                                    <TableCell>{new Date(product.created_at).toLocaleDateString('es-ES')}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-medium text-muted-foreground">No hay productos en esta categoría</h3>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            Los productos que agregues a esta categoría aparecerán aquí.
                                        </p>
                                        <Link href="/admin/products/create">
                                            <Button>
                                                <Package className="mr-2 h-4 w-4" />
                                                Agregar Primer Producto
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Estadísticas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">📊 Estadísticas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">Total de Productos</span>
                                    </div>
                                    <span className="text-lg font-bold text-blue-600">{category.products_count}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información de Fechas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CalendarDays className="h-5 w-5" />
                                    Fechas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                                    <p className="text-sm">{new Date(category.created_at).toLocaleString('es-ES')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                                    <p className="text-sm">{new Date(category.updated_at).toLocaleString('es-ES')}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Acciones Rápidas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">⚡ Acciones Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href={`/admin/categories/${category.id}/edit`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar Categoría
                                    </Button>
                                </Link>
                                <Link href="/admin/products/create">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Package className="mr-2 h-4 w-4" />
                                        Agregar Producto
                                    </Button>
                                </Link>
                                <Link href="/admin/categories">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FolderOpen className="mr-2 h-4 w-4" />
                                        Ver Todas las Categorías
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
