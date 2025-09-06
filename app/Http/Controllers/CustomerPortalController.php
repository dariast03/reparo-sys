<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\RepairOrder;
use App\Models\Quote;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerPortalController extends Controller
{
    /**
     * Show customer portal by QR code
     */
    public function show($qrCode)
    {
        $customer = Customer::where('qr_code', $qrCode)->firstOrFail();

        // Get customer's complete history
        $repairOrders = RepairOrder::with(['brand', 'model', 'technician', 'receptionUser'])
            ->where('customer_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $quotes = Quote::with(['user', 'repairOrder'])
            ->where('customer_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $sales = Sale::with(['seller', 'saleDetails.product'])
            ->where('customer_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Statistics
        $statistics = [
            'total_repair_orders' => $repairOrders->count(),
            'pending_repairs' => $repairOrders->whereNotIn('status', ['delivered', 'cancelled'])->count(),
            'total_quotes' => $quotes->count(),
            'total_sales' => $sales->count(),
            'total_spent' => $sales->sum('total'),
            'active_repairs' => $repairOrders->whereIn('status', ['received', 'diagnosing', 'waiting_parts', 'repairing'])->count(),
        ];

        // Check if user is authenticated and has permission for admin actions
        $canCreateOrder = Auth::check() && (
            //Auth::user()->hasPermissionTo('reparaciones.create') ||
            Auth::user()->hasRole(['admin', 'reception', 'technician'])
        );

        $canCreateQuote = Auth::check() && (
            //Auth::user()->hasPermissionTo('quotes.create') ||
            Auth::user()->hasRole(['admin', 'sales'])
        );

        return Inertia::render('customer-portal/show', [
            'customer' => $customer,
            'repairOrders' => $repairOrders,
            'quotes' => $quotes,
            'sales' => $sales,
            'statistics' => $statistics,
            'canCreateOrder' => $canCreateOrder,
            'canCreateQuote' => $canCreateQuote,
        ]);
    }

    /**
     * Redirect to create repair order with customer preselected
     */
    public function createRepairOrder($qrCode)
    {
        $customer = Customer::where('qr_code', $qrCode)->firstOrFail();

        // Check permission
        if (!Auth::check() || !(Auth::user()->hasPermissionTo('reparaciones.create') ||
            Auth::user()->hasRole(['admin', 'reception', 'technician']))) {
            abort(403, 'No tienes permisos para crear órdenes de reparación');
        }

        return redirect()->route('admin.repair-orders.create', ['customer_id' => $customer->id]);
    }

    /**
     * Redirect to create quote with customer preselected
     */
    public function createQuote($qrCode)
    {
        $customer = Customer::where('qr_code', $qrCode)->firstOrFail();

        // Check permission
        if (!Auth::check() || !(Auth::user()->hasPermissionTo('quotes.create') ||
            Auth::user()->hasRole(['admin', 'sales']))) {
            abort(403, 'No tienes permisos para crear cotizaciones');
        }

        return redirect()->route('admin.quotes.create', ['customer_id' => $customer->id]);
    }
}
