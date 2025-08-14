<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): Response
    {
        $query = Supplier::query();

        // Aplicar filtros
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('contact_person', 'ILIKE', "%{$search}%")
                    ->orWhere('email', 'ILIKE', "%{$search}%")
                    ->orWhere('phone', 'ILIKE', "%{$search}%")
                    ->orWhere('tax_id', 'ILIKE', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('rating')) {
            $rating = (float) $request->input('rating');
            $query->where('rating', '>=', $rating);
        }

        // Ordenar por nombre
        $query->orderBy('name');

        $suppliers = $query->paginate(10)->withQueryString();

        return Inertia::render('admin/suppliers/index', [
            'suppliers' => $suppliers,
            'filters' => [
                'search' => $request->input('search'),
                'status' => $request->input('status'),
                'rating' => $request->input('rating'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new supplier.
     */
    public function create(): Response
    {
        return Inertia::render('admin/suppliers/create');
    }

    /**
     * Store a newly created supplier.
     */
    public function store(StoreSupplierRequest $request)
    {
        $supplier = Supplier::create($request->validated());

        return redirect()
            ->route('admin.suppliers.index')
            ->with('success', 'Proveedor creado exitosamente.');
    }

    /**
     * Display the specified supplier.
     */
    public function show(Supplier $supplier): Response
    {
        $supplier->load('purchases');

        return Inertia::render('admin/suppliers/show', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Show the form for editing the supplier.
     */
    public function edit(Supplier $supplier): Response
    {
        return Inertia::render('admin/suppliers/edit', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Update the specified supplier.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $supplier->update($request->validated());

        return redirect()
            ->route('admin.suppliers.index')
            ->with('success', 'Proveedor actualizado exitosamente.');
    }

    /**
     * Remove the specified supplier (soft delete).
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->update(['status' => 'inactive']);

        return redirect()
            ->route('admin.suppliers.index')
            ->with('success', 'Proveedor desactivado exitosamente.');
    }

    /**
     * Reactivate the specified supplier.
     */
    public function reactivate(Supplier $supplier)
    {
        $supplier->update(['status' => 'active']);

        return redirect()
            ->route('admin.suppliers.index')
            ->with('success', 'Proveedor reactivado exitosamente.');
    }
}
