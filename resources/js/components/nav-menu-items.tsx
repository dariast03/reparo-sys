import { NavGroup } from '@/types';
import { DollarSign, FileText, History, Home, Key, Package, Settings, Shield, Smartphone, Store, User, Users, Warehouse, Wrench } from 'lucide-react';

export const navMenuItems: NavGroup[] = [
    {
        title: 'Principal',
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: Home,
            },
        ],
    },
    {
        title: 'Operaciones',
        items: [
            {
                title: 'Órdenes de Reparación',
                href: '/admin/repair-orders',
                icon: Wrench,
            },
            {
                title: 'Cotizaciones',
                href: '/admin/quotes',
                icon: FileText,
            },
            {
                title: 'Clientes',
                href: '/admin/customers',
                icon: User,
            },
        ],
    },
    {
        title: 'Inventario',
        items: [
            {
                title: 'Productos',
                href: '/admin/products',
                icon: Package,
            },
            {
                title: 'Categorías',
                href: '/admin/categories',
                icon: Store,
            },
            {
                title: 'Marcas',
                href: '/admin/brands',
                icon: Smartphone,
            },
            {
                title: 'Modelos',
                href: '/admin/device-models',
                icon: Smartphone,
            },
            {
                title: 'Movimientos',
                href: '/admin/inventory/movements',
                icon: History,
            },
            {
                title: 'Gestión Stock',
                href: '/admin/inventory/stock',
                icon: Warehouse,
            },
        ],
    },
    {
        title: 'Ventas',
        items: [
            {
                title: 'Ventas',
                href: '/admin/sales',
                icon: DollarSign,
            },
        ],
    },
    /*  {
        title: 'Reportes',
        items: [
            {
                title: 'Reportes',
                href: '/admin/reports',
                icon: BarChart3,
            },
        ],
    }, */
    {
        title: 'Administración',
        items: [
            {
                title: 'Usuarios',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Roles',
                href: '/admin/roles',
                icon: Shield,
            },
            {
                title: 'Permisos',
                href: '/admin/permissions',
                icon: Key,
            },
            {
                title: 'Configuración',
                href: '/admin/settings',
                icon: Settings,
            },
        ],
    },
];
