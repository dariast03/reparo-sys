import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    document_number: string;
    document_type: string;
    phone: string;
    email: string;
    address: string;
    birth_date: string;
    gender: string;
    notes: string;
}

interface EditCustomerProps {
    customer: Customer;
}

const documentTypeOptions = [
    { value: 'ci', label: 'Cédula de Identidad' },
    { value: 'passport', label: 'Pasaporte' },
    { value: 'driver_license', label: 'Licencia de Conducir' },
    { value: 'foreigner_id', label: 'Carnet de Extranjero' },
    { value: 'nit', label: 'NIT' },
    { value: 'military_id', label: 'Libreta Militar' },
    { value: 'other', label: 'Otro' },
];

const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'other', label: 'Otro' },
];

export default function EditCustomer({ customer }: EditCustomerProps) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        document_number: customer.document_number || '',
        document_type: customer.document_type || 'ci',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        birth_date: customer.birth_date || '',
        gender: customer.gender || '',
        notes: customer.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/customers/${customer.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title={`Editar Cliente - ${customer.first_name} ${customer.last_name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/customers/${customer.id}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Editar Cliente</h1>
                        <p className="text-muted-foreground">
                            Actualiza la información de {customer.first_name} {customer.last_name}
                        </p>
                    </div>
                </div>

                {/* Error Alert */}
                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                        <AlertDescription>Por favor, corrige los errores en el formulario antes de continuar.</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Básica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">
                                        Nombres <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        placeholder="Ingresa los nombres"
                                        className={errors.first_name ? 'border-red-500' : ''}
                                    />
                                    {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name">
                                        Apellidos <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        placeholder="Ingresa los apellidos"
                                        className={errors.last_name ? 'border-red-500' : ''}
                                    />
                                    {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="document_type">
                                        Tipo de Documento <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.document_type} onValueChange={(value) => setData('document_type', value)}>
                                        <SelectTrigger className={errors.document_type ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecciona el tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {documentTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.document_type && <p className="text-sm text-red-500">{errors.document_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="document_number">
                                        Número de Documento <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="document_number"
                                        value={data.document_number}
                                        onChange={(e) => setData('document_number', e.target.value)}
                                        placeholder="Ingresa el número de documento"
                                        className={errors.document_number ? 'border-red-500' : ''}
                                    />
                                    {errors.document_number && <p className="text-sm text-red-500">{errors.document_number}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Teléfono <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Ingresa el número de teléfono"
                                    className={errors.phone ? 'border-red-500' : ''}
                                />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Ingresa la dirección completa"
                                    rows={3}
                                    className={errors.address ? 'border-red-500' : ''}
                                />
                                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Adicional</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                        className={errors.birth_date ? 'border-red-500' : ''}
                                    />
                                    {errors.birth_date && <p className="text-sm text-red-500">{errors.birth_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Género</Label>
                                    <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                        <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecciona el género" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {genderOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Información adicional sobre el cliente"
                                    rows={4}
                                    className={errors.notes ? 'border-red-500' : ''}
                                />
                                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Link href={`/admin/customers/${customer.id}`}>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>Guardando...</>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Actualizar Cliente
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
