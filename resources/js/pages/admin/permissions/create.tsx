import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
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
        title: 'Create',
        href: '/admin/permissions/create',
    },
];

export default function CreatePermission() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/permissions');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Permission" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Create Permission</h1>
                    <p className="text-muted-foreground">Add a new permission to the system</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permission Details</CardTitle>
                            <CardDescription>Enter the details for the new permission</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="users.view"
                                    required
                                />
                                <p className="text-muted-foreground text-sm">Use a descriptive name like "users.view" or "roles.create"</p>
                                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                            <Button variant="outline" type="button" asChild>
                                <a href="/admin/permissions">Cancel</a>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Permission'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
