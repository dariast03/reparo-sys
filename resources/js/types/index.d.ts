import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Role {
    id: number;
    name: string;
    title?: string;
    description?: string;
    is_active?: boolean;
    permissions?: Permission[];
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: number;
    name: string;
    title?: string;
    description?: string;
    is_active?: boolean;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address?: string;
    created_at: string;
    updated_at: string;
    full_name?: string;
}

export interface Product {
    id: number;
    code: string;
    name: string;
    description?: string;
    brand_id?: number;
    category_id?: number;
    sale_price: string;
    current_stock: number;
    minimum_stock?: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    // Accessors for compatibility
    price?: number;
    stock?: number;
    sale_price_number?: number;
    // Relations
    brand?: Brand;
    category?: ProductCategory;
}

export interface SaleDetail {
    id: number;
    sale_id: number;
    product_id: number;
    quantity: number;
    unit_price: string;
    item_discount: string;
    total_price: string;
    created_at: string;
    updated_at: string;
    // Numeric accessors
    unit_price_number: number;
    item_discount_number: number;
    total_price_number: number;
    // Relations
    product?: Product;
}

export interface Sale {
    id: number;
    sale_number: string;
    customer_id?: number;
    seller_user_id: number;
    sale_type: 'cash' | 'credit';
    subtotal: string;
    discount: string;
    taxes: string;
    total: string;
    advance_payment: string;
    pending_balance: string;
    status: 'paid' | 'pending' | 'cancelled';
    payment_method: 'cash' | 'card' | 'transfer' | 'qr' | 'mixed';
    notes?: string;
    sale_date?: number;
    created_at: string;
    updated_at: string;
    // Numeric accessors
    subtotal_number: number;
    discount_number: number;
    taxes_number: number;
    total_number: number;
    advance_payment_number: number;
    pending_balance_number: number;
    // Relations
    customer?: Customer;
    seller?: User;
    sale_details?: SaleDetail[];
    saleDetails?: SaleDetail[];
}

export interface Brand {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface ProductCategory {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface DeviceModel {
    id: number;
    brand_id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    // Relations
    brand?: Brand;
}

export interface InventoryMovement {
    id: number;
    product_id: number;
    movement_type: 'in' | 'out';
    quantity: number;
    unit_price: string;
    total_cost: string;
    reason: string;
    notes?: string;
    stock_before: number;
    stock_after: number;
    movement_date: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    // Numeric accessors
    unit_price_number?: number;
    total_cost_number?: number;
    // Relations
    product?: Product;
    user?: User;
}
