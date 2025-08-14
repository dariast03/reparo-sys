<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRepairOrderRequest;
use App\Http\Requests\Admin\UpdateRepairOrderRequest;
use App\Models\Brand;
use App\Models\Customer;
use App\Models\DeviceModel;
use App\Models\RepairOrder;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RepairOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = RepairOrder::with(['customer', 'brand', 'model', 'technician', 'receptionUser']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('device_serial', 'like', "%{$search}%")
                    ->orWhere('imei', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($customerQuery) use ($search) {
                        $customerQuery->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('document_number', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Priority filter
        if ($request->has('priority') && $request->get('priority') !== 'all') {
            $query->where('priority', $request->get('priority'));
        }

        // Brand filter
        if ($request->has('brand_id') && $request->get('brand_id') !== 'all') {
            $query->where('brand_id', $request->get('brand_id'));
        }

        // Technician filter
        if ($request->has('technician_id') && $request->get('technician_id') !== 'all') {
            $query->where('technician_user_id', $request->get('technician_id'));
        }

        $repairOrders = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('admin/repair-orders/index', [
            'repairOrders' => $repairOrders,
            'filters' => $request->only(['search', 'status', 'priority', 'brand_id', 'technician_id']),
            'brands' => Brand::active()->orderBy('name')->get(['id', 'name']),
            'technicians' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/repair-orders/create', [
            'customers' => Customer::where('status', 'active')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'document_number']),
            'brands' => Brand::active()->orderBy('name')->get(['id', 'name']),
            'technicians' => User::orderBy('name')->get(['id', 'name']),
            'orderNumber' => $this->generateOrderNumber(),
        ]);
    }

    public function store(StoreRepairOrderRequest $request)
    {
        $data = $request->validated();
        $data['reception_user_id'] = Auth::id();
        $data['order_number'] = $this->generateOrderNumber();
        $data['received_date'] = now();

        // Calculate pending balance
        $data['pending_balance'] = $data['total_cost'] - $data['advance_payment'];

        $repairOrder = RepairOrder::create($data);

        return redirect()->route('admin.repair-orders.show', $repairOrder)
            ->with('success', 'Orden de reparación creada exitosamente.');
    }

    public function show(RepairOrder $repairOrder)
    {
        $repairOrder->load([
            'customer',
            'brand',
            'model',
            'technician',
            'receptionUser',
            'orderParts.product',
            'history.user',
            'quotes'
        ]);

        return Inertia::render('admin/repair-orders/show', [
            'repairOrder' => $repairOrder,
        ]);
    }

    public function edit(RepairOrder $repairOrder)
    {
        $repairOrder->load(['customer', 'brand', 'model', 'technician']);

        return Inertia::render('admin/repair-orders/edit', [
            'repairOrder' => $repairOrder,
            'customers' => Customer::where('status', 'active')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'document_number']),
            'brands' => Brand::active()->orderBy('name')->get(['id', 'name']),
            'models' => DeviceModel::where('brand_id', $repairOrder->brand_id)->active()->get(['id', 'name']),
            'technicians' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateRepairOrderRequest $request, RepairOrder $repairOrder)
    {
        $data = $request->validated();

        // Calculate pending balance
        $data['pending_balance'] = $data['total_cost'] - $data['advance_payment'];

        $repairOrder->update($data);

        return redirect()->route('admin.repair-orders.show', $repairOrder)
            ->with('success', 'Orden de reparación actualizada exitosamente.');
    }

    public function destroy(RepairOrder $repairOrder)
    {
        // Only allow cancellation if order is not delivered
        if ($repairOrder->status === 'delivered') {
            return back()->with('error', 'No se puede cancelar una orden ya entregada.');
        }

        $repairOrder->update(['status' => 'cancelled']);

        return back()->with('success', 'Orden de reparación cancelada exitosamente.');
    }

    public function getModelsByBrand(Request $request)
    {
        $brandId = $request->get('brand_id');
        $models = DeviceModel::where('brand_id', $brandId)->active()->orderBy('name')->get(['id', 'name']);

        return response()->json($models);
    }

    private function generateOrderNumber(): string
    {
        $year = date('Y');
        $month = date('m');

        // Get the last order number for this month
        $lastOrder = RepairOrder::where('order_number', 'like', "ORD-{$year}{$month}%")
            ->orderBy('order_number', 'desc')
            ->first();

        if ($lastOrder) {
            $lastNumber = (int) substr($lastOrder->order_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf("ORD-%s%s%04d", $year, $month, $newNumber);
    }
}
