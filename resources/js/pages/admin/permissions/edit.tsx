import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Permission } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Permissions',
        href: '/admin/permissions',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface EditPermissionProps {
    permission: Permission;
}

export default function EditPermission({ permission }: EditPermissionProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: permission.name,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/permissions/${permission.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Permission: ${permission.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Edit Permission: {permission.name}</h1>
                    <p className="text-muted-foreground">Update permission information</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permission Details</CardTitle>
                            <CardDescription>Update the details for this permission</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                <p className="text-muted-foreground text-sm">Use a descriptive name like "users.view" or "roles.create"</p>
                                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                            <Button variant="outline" type="button" asChild>
                                <a href="/admin/permissions">Cancel</a>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
