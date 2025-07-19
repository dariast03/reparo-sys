import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Permission, type Role } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Roles',
        href: '/admin/roles',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface EditRoleProps {
    role: Role & { permissions: Permission[] };
    permissions: Permission[];
}

export default function EditRole({ role, permissions }: EditRoleProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions.map((permission) => permission.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/roles/${role.id}`);
    };

    const handlePermissionToggle = (permissionId: number) => {
        const currentPermissions = [...data.permissions];
        const index = currentPermissions.indexOf(permissionId);

        if (index === -1) {
            currentPermissions.push(permissionId);
        } else {
            currentPermissions.splice(index, 1);
        }

        setData('permissions', currentPermissions);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role: ${role.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Edit Role: {role.name}</h1>
                    <p className="text-muted-foreground">Update role information</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Details</CardTitle>
                            <CardDescription>Update the details for this role</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {permissions.map((permission) => (
                                        <div className="flex items-center gap-2" key={permission.id}>
                                            <Checkbox
                                                id={`permission-${permission.id}`}
                                                checked={data.permissions.includes(permission.id)}
                                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                            />
                                            <Label htmlFor={`permission-${permission.id}`} className="cursor-pointer">
                                                {permission.title}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.permissions && <p className="text-sm text-destructive">{errors.permissions}</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                            <Button variant="outline" type="button" asChild>
                                <a href="/admin/roles">Cancel</a>
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-purple-600 hover:bg-purple-700">
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
