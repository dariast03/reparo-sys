<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(Request $request): Response
    {
        $query = Customer::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$search}%"]);
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by document type
        if ($request->filled('document_type')) {
            $query->where('document_type', $request->document_type);
        }

        $customers = $query->orderBy('first_name')
            ->orderBy('last_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'status', 'document_type']),
        ]);
    }

    /**
     * Show the form for creating a new customer.
     */
    public function create(): Response
    {
        return Inertia::render('admin/customers/create');
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(StoreCustomerRequest $request)
    {
        $validated = $request->validated();

        try {
            $customer = Customer::create($validated);

            return redirect()
                ->route('admin.customers.show', $customer)
                ->with('success', 'Cliente registrado exitosamente.');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Error al registrar el cliente: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer): Response
    {
        // Load relationships for customer history
        $customer->load([
            'repairOrders' => function ($query) {
                $query->orderBy('created_at', 'desc')->take(10);
            },
            'sales' => function ($query) {
                $query->orderBy('created_at', 'desc')->take(10);
            },
            'quotes' => function ($query) {
                $query->orderBy('created_at', 'desc')->take(10);
            }
        ]);

        // Get summary statistics
        $statistics = [
            'total_repair_orders' => $customer->repairOrders()->count(),
            'total_sales' => $customer->sales()->count(),
            'total_quotes' => $customer->quotes()->count(),
            'pending_repair_orders' => $customer->repairOrders()->whereNotIn('status', ['delivered', 'cancelled'])->count(),
            'total_spent' => $customer->sales()->sum('total'),
        ];

        return Inertia::render('admin/customers/show', [
            'customer' => $customer,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(Customer $customer): Response
    {
        return Inertia::render('admin/customers/edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $validated = $request->validated();

        try {
            $customer->update($validated);

            return redirect()
                ->route('admin.customers.show', $customer)
                ->with('success', 'Cliente actualizado exitosamente.');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Error al actualizar el cliente: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified customer from storage (soft delete).
     */
    public function destroy(Customer $customer)
    {
        try {
            // Check if customer has pending repair orders
            $pendingOrders = $customer->repairOrders()
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->count();

            if ($pendingOrders > 0) {
                return back()->withErrors([
                    'error' => 'No se puede inactivar el cliente porque tiene órdenes de reparación pendientes.'
                ]);
            }

            // Soft delete by changing status
            $customer->update(['status' => 'inactive']);

            return redirect()
                ->route('admin.customers.index')
                ->with('success', 'Cliente inactivado exitosamente.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Error al inactivar el cliente: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Reactivate an inactive customer.
     */
    public function reactivate(Customer $customer)
    {
        try {
            $customer->update(['status' => 'active']);

            return redirect()
                ->route('admin.customers.show', $customer)
                ->with('success', 'Cliente reactivado exitosamente.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Error al reactivar el cliente: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Search customers via AJAX for autocomplete.
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $customers = Customer::active()
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%")
                    ->orWhere('document_number', 'like', "%{$query}%")
                    ->orWhere('phone', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$query}%"]);
            })
            ->select('id', 'first_name', 'last_name', 'document_number', 'phone', 'email')
            ->limit(20)
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->full_name,
                    'document' => $customer->document_number,
                    'phone' => $customer->phone,
                    'email' => $customer->email,
                ];
            });

        return response()->json($customers);
    }
}
