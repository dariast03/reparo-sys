import { NavGroup } from '@/types';
import {
    BarChart3,
    ClipboardList,
    DollarSign,
    Key,
    LayoutGrid,
    MonitorSmartphone,
    Package,
    Shield,
    User,
    UserCog,
    Users,
    Wrench,
} from 'lucide-react';

export const navMenuItems: NavGroup[] = [
    {
        title: 'Principal',
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Gestión',
        items: [
            {
                title: 'Reparaciones',
                href: '/reparaciones',
                icon: Wrench,
            },
            {
                title: 'Clientes',
                href: '/clientes',
                icon: User,
            },
            {
                title: 'Dispositivos',
                href: '/dispositivos',
                icon: MonitorSmartphone,
            },
            {
                title: 'Técnicos',
                href: '/tecnicos',
                icon: UserCog,
            },
            {
                title: 'Inventario',
                href: '/inventario',
                icon: Package,
            },
            {
                title: 'Ingresos',
                href: '/ingresos',
                icon: DollarSign,
            },
            {
                title: 'Reportes',
                href: '/reportes',
                icon: BarChart3,
            },
        ],
    },
    {
        title: 'Administración',
        items: [
            {
                title: 'Panel Admin',
                href: '/admin/dashboard',
                icon: ClipboardList,
            },
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
        ],
    },
];
