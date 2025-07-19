import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Role } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Users',
        href: '/admin/users',
    },
    {
        title: 'Create',
        href: '/admin/users/create',
    },
];

interface CreateUserProps {
    roles: Role[];
}

export default function CreateUser({ roles }: CreateUserProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users');
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
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Create User</h1>
                    <p className="text-muted-foreground">Add a new user to the system</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Details</CardTitle>
                            <CardDescription>Enter the details for the new user</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Username (Optional)</Label>
                                <Input
                                    id="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="johndoe"
                                />
                                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="john@example.com"
                                    required
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
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
                                <a href="/admin/users">Cancel</a>
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                {processing ? 'Creating...' : 'Create User'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
