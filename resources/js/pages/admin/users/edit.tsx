import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Role, type User } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administrador',
        href: '/admin',
    },
    {
        title: 'Usuarios',
        href: '/admin/users',
    },
    {
        title: 'Editar',
        href: '#',
    },
];

interface EditUserProps {
    user: User & { roles: Role[] };
    roles: Role[];
}

export default function EditUser({ user, roles }: EditUserProps) {
    const { data, setData, put, processing, errors, setError } = useForm({
        name: user.name,
        username: user.username || '',
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles.map((role) => role.id),
    });

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres.';
        }
        if (!/[a-z]/.test(password)) {
            return 'La contraseña debe contener al menos una letra minúscula.';
        }
        if (!/[A-Z]/.test(password)) {
            return 'La contraseña debe contener al menos una letra mayúscula.';
        }
        if (!/\d/.test(password)) {
            return 'La contraseña debe contener al menos un número.';
        }
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) {
            return 'La contraseña debe contener al menos un símbolo.';
        }
        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.password) {
            const passwordError = validatePassword(data.password);
            if (passwordError) {
                setError('password', passwordError);
                return;
            }
            if (data.password !== data.password_confirmation) {
                setError('password_confirmation', 'Las contraseñas no coinciden.');
                return;
            }
        }
        put(`/admin/users/${user.id}`);
    };

    const handleRoleToggle = (roleId: number) => {
        const currentRoles = [...data.roles];
        const index = currentRoles.indexOf(roleId);

        if (index === -1) {
            currentRoles.push(roleId);
        } else {
            currentRoles.splice(index, 1);
        }

        setData('roles', currentRoles);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Usuario: ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Editar Usuario: {user.name}</h1>
                    <p className="text-muted-foreground">Actualizar la información del usuario</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles del Usuario</CardTitle>
                            <CardDescription>Actualice los detalles de este usuario</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => {
                                        setData('name', e.target.value);
                                        if (!data.username) {
                                            setData('username', e.target.value.replace(/\s+/g, '_').toLowerCase());
                                        }
                                    }}
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Nombre de Usuario (Opcional)</Label>
                                <Input
                                    id="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="juanperez"
                                />
                                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña (dejar en blanco para mantener la actual)</Label>
                                <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Roles</Label>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {roles.map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={data.roles.includes(role.id)}
                                                onCheckedChange={() => handleRoleToggle(role.id)}
                                            />
                                            <Label htmlFor={`role-${role.id}`} className="text-sm font-normal">
                                                {role.title}
                                                {role.description && <span className="ml-1 text-xs text-muted-foreground">({role.description})</span>}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.roles && <p className="text-sm text-destructive">{errors.roles}</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                            <Button variant="outline" type="button" asChild>
                                <a href="/admin/users">Cancelar</a>
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
