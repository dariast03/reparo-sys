import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router, useForm } from '@inertiajs/react';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email?: string | null;
    document_number?: string | null;
    phone?: string | null;
    [key: string]: string | null | undefined | number;
}

export function QuickCustomerForm({ onSuccess }: { onSuccess: (customer: Customer) => void }) {
    const { data, setData, post, processing, errors, reset } = useForm<any>({
        first_name: '',
        last_name: '',
        email: undefined,
        document_number: undefined,
        phone: undefined,
    });

    const handleSaveCustomer = () => {
        post('/admin/customers', {
            onSuccess: () => {
                reset();
                // Recargar la página para obtener la lista actualizada de clientes
                router.reload();
            },
            onError: (error) => {
                console.log('🚀 ~ handleSaveCustomer ~ error:', error);
                // Manejar errores aquí
            },
        });
    };

    return (
        <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required />
                    {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido *</Label>
                    <Input id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required />
                    {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>
            <div className="flex justify-end space-x-2">
                <Button type="button" onClick={handleSaveCustomer} disabled={processing}>
                    {processing ? 'Guardando...' : 'Guardar Cliente'}
                </Button>
            </div>
        </div>
    );
}
