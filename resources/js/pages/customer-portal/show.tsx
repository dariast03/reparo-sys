import React, { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    User,
    Phone,
    Mail,
    Calendar,
    MapPin,
    Wrench,
    FileText,
    ShoppingBag,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    Eye,
    Activity,
    TrendingUp,
    Download,
    QrCode
} from 'lucide-react'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

interface Customer {
    id: number
    first_name: string
    last_name: string
    full_name: string
    document_number: string
    document_type: string
    phone?: string
    email?: string
    address?: string
    birth_date?: string
    qr_code: string
    qr_base64: string
    qr_data_uri: string
    status: string
}

interface RepairOrder {
    id: number
    order_number: string
    status: string
    priority: string
    brand: { name: string }
    model: { name: string }
    device_serial?: string
    imei?: string
    problem_description: string
    diagnosis_cost: number
    repair_cost: number
    total_cost: number
    advance_payment: number
    pending_balance: number
    created_at: string
    promised_date?: string
    technician?: { name: string }
    reception_user: { name: string }
}

interface Quote {
    id: number
    quote_number: string
    status: string
    total: number
    created_at: string
    expires_at: string
    user: { name: string }
    repair_order?: { order_number: string }
}

interface Sale {
    id: number
    sale_number: string
    payment_method: string
    total: number
    created_at: string
    seller: { name: string }
    sale_details: Array<{
        product: { name: string }
        quantity: number
        unit_price: number
        subtotal: number
    }>
}

interface Statistics {
    total_repair_orders: number
    pending_repairs: number
    total_quotes: number
    total_sales: number
    total_spent: number
    active_repairs: number
}

interface PageProps {
    customer: Customer
    repairOrders: RepairOrder[]
    quotes: Quote[]
    sales: Sale[]
    statistics: Statistics
    canCreateOrder: boolean
    canCreateQuote: boolean
}

const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
        'received': 'bg-blue-500',
        'diagnosing': 'bg-yellow-500',
        'waiting_parts': 'bg-orange-500',
        'repairing': 'bg-purple-500',
        'repaired': 'bg-green-500',
        'unrepairable': 'bg-red-500',
        'waiting_customer': 'bg-cyan-500',
        'delivered': 'bg-green-600',
        'cancelled': 'bg-gray-500'
    }
    return statusColors[status] || 'bg-gray-500'
}

const getStatusText = (status: string) => {
    const statusText: Record<string, string> = {
        'received': 'Recibido',
        'diagnosing': 'Diagnosticando',
        'waiting_parts': 'Esperando repuestos',
        'repairing': 'Reparando',
        'repaired': 'Reparado',
        'unrepairable': 'Irreparable',
        'waiting_customer': 'Esperando cliente',
        'delivered': 'Entregado',
        'cancelled': 'Cancelado'
    }
    return statusText[status] || status
}

const getPriorityColor = (priority: string) => {
    const priorityColors: Record<string, string> = {
        'low': 'text-green-600 bg-green-50',
        'normal': 'text-blue-600 bg-blue-50',
        'high': 'text-orange-600 bg-orange-50',
        'urgent': 'text-red-600 bg-red-50'
    }
    return priorityColors[priority] || 'text-gray-600 bg-gray-50'
}

const getPriorityText = (priority: string) => {
    const priorityText: Record<string, string> = {
        'low': 'Baja',
        'normal': 'Normal',
        'high': 'Alta',
        'urgent': 'Urgente'
    }
    return priorityText[priority] || priority
}

export default function CustomerPortalShow({ customer, repairOrders, quotes, sales, statistics, canCreateOrder, canCreateQuote }: PageProps) {
    const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null)

    return (
        <>
            <Head>
                <title>{`Portal Cliente - ${customer.full_name}`}</title>
                <meta name="description" content={`Portal del cliente ${customer.full_name} - Sistema de reparaciones`} />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-semibold">
                                        {customer.first_name[0]}{customer.last_name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{customer.full_name}</h1>
                                    <p className="text-gray-600">Cliente desde {format(new Date(), 'MMMM yyyy', { locale: es })}</p>
                                    <Badge variant="outline" className="mt-1">
                                        <QrCode className="h-3 w-3 mr-1" />
                                        {customer.qr_code}
                                    </Badge>
                                </div>
                            </div>

                            {(canCreateOrder || canCreateQuote) && (
                                <div className="flex gap-2">
                                    {canCreateOrder && (
                                        <Button asChild>
                                            <Link href={`/cliente/${customer.qr_code}/nueva-orden`}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Nueva Orden
                                            </Link>
                                        </Button>
                                    )}
                                    {canCreateQuote && (
                                        <Button variant="outline" asChild>
                                            <Link href={`/cliente/${customer.qr_code}/nueva-cotizacion`}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Nueva Cotización
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Customer Info */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Reparaciones</p>
                                                <p className="text-2xl font-bold text-gray-900">{statistics.total_repair_orders}</p>
                                            </div>
                                            <Wrench className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                                                <p className="text-2xl font-bold text-orange-600">{statistics.pending_repairs}</p>
                                            </div>
                                            <Clock className="h-8 w-8 text-orange-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Cotizaciones</p>
                                                <p className="text-2xl font-bold text-gray-900">{statistics.total_quotes}</p>
                                            </div>
                                            <FileText className="h-8 w-8 text-purple-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Gastado</p>
                                                <p className="text-2xl font-bold text-green-600">${statistics.total_spent.toLocaleString()}</p>
                                            </div>
                                            <TrendingUp className="h-8 w-8 text-green-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Customer Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Información Personal
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-gray-600">Documento:</span>
                                        <span>{customer.document_type} {customer.document_number}</span>
                                    </div>

                                    {customer.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span>{customer.phone}</span>
                                        </div>
                                    )}

                                    {customer.email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span>{customer.email}</span>
                                        </div>
                                    )}

                                    {customer.address && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span>{customer.address}</span>
                                        </div>
                                    )}

                                    {customer.birth_date && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>{format(new Date(customer.birth_date), 'dd/MM/yyyy')}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* QR Code */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <QrCode className="h-5 w-5" />
                                        Código QR
                                    </CardTitle>
                                    <CardDescription>
                                        Comparte este código para acceso rápido a tu información
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-center p-4 bg-white rounded-lg border">
                                        <img
                                            src={customer.qr_data_uri}
                                            alt={`QR Code for ${customer.first_name} ${customer.last_name}`}
                                            className="w-48 h-48"
                                        />
                                    </div>
                                    <p className="text-center text-sm text-gray-600 mt-2">{customer.qr_code}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <Tabs defaultValue="repairs" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="repairs" className="flex items-center gap-2">
                                        <Wrench className="h-4 w-4" />
                                        Reparaciones
                                    </TabsTrigger>
                                    <TabsTrigger value="quotes" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Cotizaciones
                                    </TabsTrigger>
                                    <TabsTrigger value="sales" className="flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4" />
                                        Ventas
                                    </TabsTrigger>
                                </TabsList>

                                {/* Repair Orders Tab */}
                                <TabsContent value="repairs" className="space-y-4">
                                    {repairOrders.length === 0 ? (
                                        <Card>
                                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                                <Wrench className="h-16 w-16 text-gray-300 mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay reparaciones</h3>
                                                <p className="text-gray-600 mb-4">Aún no tienes órdenes de reparación registradas.</p>
                                                {canCreateOrder && (
                                                    <Button asChild>
                                                        <Link href={`/cliente/${customer.qr_code}/nueva-orden`}>
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Crear Primera Orden
                                                        </Link>
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        repairOrders.map((order) => (
                                            <Card key={order.id} className="hover:shadow-md transition-shadow">
                                                <CardHeader>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="flex items-center gap-2">
                                                                #{order.order_number}
                                                                <Badge className={`text-white ${getStatusColor(order.status)}`}>
                                                                    {getStatusText(order.status)}
                                                                </Badge>
                                                                <Badge variant="outline" className={getPriorityColor(order.priority)}>
                                                                    {getPriorityText(order.priority)}
                                                                </Badge>
                                                            </CardTitle>
                                                            <CardDescription>
                                                                {order.brand.name} {order.model.name}
                                                                {order.device_serial && ` • S/N: ${order.device_serial}`}
                                                            </CardDescription>
                                                        </div>
                                                        <Sheet>
                                                            <SheetTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Ver Detalles
                                                                </Button>
                                                            </SheetTrigger>
                                                            <SheetContent className="w-[400px] sm:w-[540px]">
                                                                <SheetHeader>
                                                                    <SheetTitle>Orden #{order.order_number}</SheetTitle>
                                                                    <SheetDescription>
                                                                        Detalles completos de la orden de reparación
                                                                    </SheetDescription>
                                                                </SheetHeader>
                                                                <div className="mt-6 space-y-4">
                                                                    <div>
                                                                        <h4 className="font-medium text-sm text-gray-900 mb-2">Estado y Prioridad</h4>
                                                                        <div className="flex gap-2">
                                                                            <Badge className={`text-white ${getStatusColor(order.status)}`}>
                                                                                {getStatusText(order.status)}
                                                                            </Badge>
                                                                            <Badge variant="outline" className={getPriorityColor(order.priority)}>
                                                                                {getPriorityText(order.priority)}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>

                                                                    <Separator />

                                                                    <div>
                                                                        <h4 className="font-medium text-sm text-gray-900 mb-2">Dispositivo</h4>
                                                                        <p className="text-sm text-gray-600">{order.brand.name} {order.model.name}</p>
                                                                        {order.device_serial && (
                                                                            <p className="text-sm text-gray-600">S/N: {order.device_serial}</p>
                                                                        )}
                                                                        {order.imei && (
                                                                            <p className="text-sm text-gray-600">IMEI: {order.imei}</p>
                                                                        )}
                                                                    </div>

                                                                    <Separator />

                                                                    <div>
                                                                        <h4 className="font-medium text-sm text-gray-900 mb-2">Problema Reportado</h4>
                                                                        <p className="text-sm text-gray-600">{order.problem_description}</p>
                                                                    </div>

                                                                    <Separator />

                                                                    <div>
                                                                        <h4 className="font-medium text-sm text-gray-900 mb-2">Costos</h4>
                                                                        <div className="space-y-2 text-sm">
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-600">Diagnóstico:</span>
                                                                                <span>${order.diagnosis_cost.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-600">Reparación:</span>
                                                                                <span>${order.repair_cost.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="flex justify-between font-medium">
                                                                                <span>Total:</span>
                                                                                <span>${order.total_cost.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-600">Adelanto:</span>
                                                                                <span>${order.advance_payment.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="flex justify-between font-medium text-orange-600">
                                                                                <span>Saldo Pendiente:</span>
                                                                                <span>${order.pending_balance.toLocaleString()}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <Separator />

                                                                    <div>
                                                                        <h4 className="font-medium text-sm text-gray-900 mb-2">Información Adicional</h4>
                                                                        <div className="space-y-1 text-sm text-gray-600">
                                                                            <p>Recepcionista: {order.reception_user.name}</p>
                                                                            {order.technician && <p>Técnico: {order.technician.name}</p>}
                                                                            <p>Fecha de ingreso: {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                                                                            {order.promised_date && (
                                                                                <p>Fecha prometida: {format(new Date(order.promised_date), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </SheetContent>
                                                        </Sheet>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-gray-600 mb-3">{order.problem_description}</p>

                                                    <div className="flex justify-between items-center text-sm">
                                                        <div className="text-gray-600">
                                                            <span className="font-medium">Total: </span>
                                                            <span className="text-lg font-bold text-gray-900">${order.total_cost.toLocaleString()}</span>
                                                            {order.pending_balance > 0 && (
                                                                <span className="ml-2 text-orange-600">
                                                                    (Pendiente: ${order.pending_balance.toLocaleString()})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: es })}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>

                                {/* Quotes Tab */}
                                <TabsContent value="quotes" className="space-y-4">
                                    {quotes.length === 0 ? (
                                        <Card>
                                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay cotizaciones</h3>
                                                <p className="text-gray-600">Aún no tienes cotizaciones registradas.</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        quotes.map((quote) => (
                                            <Card key={quote.id}>
                                                <CardHeader>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle>Cotización #{quote.quote_number}</CardTitle>
                                                            <CardDescription>
                                                                {quote.repair_order && `Orden: ${quote.repair_order.order_number} • `}
                                                                Vendedor: {quote.user.name}
                                                            </CardDescription>
                                                        </div>
                                                        <Badge variant={quote.status === 'sent' ? 'default' : 'secondary'}>
                                                            {quote.status === 'sent' ? 'Enviada' : quote.status}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="text-lg font-bold">${quote.total.toLocaleString()}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: es })}
                                                            {quote.expires_at && (
                                                                <span className="ml-2">
                                                                    • Vence: {format(new Date(quote.expires_at), 'dd/MM/yyyy', { locale: es })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>

                                {/* Sales Tab */}
                                <TabsContent value="sales" className="space-y-4">
                                    {sales.length === 0 ? (
                                        <Card>
                                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay ventas</h3>
                                                <p className="text-gray-600">Aún no tienes compras registradas.</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        sales.map((sale) => (
                                            <Card key={sale.id}>
                                                <CardHeader>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle>Venta #{sale.sale_number}</CardTitle>
                                                            <CardDescription>
                                                                Vendedor: {sale.seller.name} • {sale.payment_method}
                                                            </CardDescription>
                                                        </div>
                                                        <div className="text-lg font-bold">${sale.total.toLocaleString()}</div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        {sale.sale_details.map((detail, index) => (
                                                            <div key={index} className="flex justify-between text-sm">
                                                                <span>{detail.product.name} x{detail.quantity}</span>
                                                                <span>${detail.subtotal?.toLocaleString() ?? "-"}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4 text-sm text-gray-500">
                                                        {format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
