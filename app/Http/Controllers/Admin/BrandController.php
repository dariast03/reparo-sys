<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Brand::query();

        // Filtro de búsqueda
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'ILIKE', "%{$search}%");
        }

        // Filtro de estado
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $brands = $query
            ->withCount(['models', 'repairOrders'])
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/brands/index', [
            'brands' => $brands,
            'filters' => [
                'search' => $request->input('search'),
                'status' => $request->input('status'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/brands/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBrandRequest $request)
    {
        $brand = Brand::create($request->validated());

        return redirect()
            ->route('admin.brands.index')
            ->with('success', 'Marca creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Brand $brand): Response
    {
        $brand->load(['models', 'repairOrders' => function ($query) {
            $query->with('customer')->latest()->take(10);
        }]);

        return Inertia::render('admin/brands/show', [
            'brand' => $brand,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Brand $brand): Response
    {
        return Inertia::render('admin/brands/edit', [
            'brand' => $brand,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBrandRequest $request, Brand $brand)
    {
        $brand->update($request->validated());

        return redirect()
            ->route('admin.brands.index')
            ->with('success', 'Marca actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(Brand $brand)
    {
        // Verificar si la marca tiene modelos asociados
        if ($brand->models()->exists()) {
            return redirect()
                ->route('admin.brands.index')
                ->with('error', 'No se puede inactivar la marca porque tiene modelos asociados.');
        }

        // Verificar si la marca tiene órdenes de reparación asociadas
        if ($brand->repairOrders()->exists()) {
            return redirect()
                ->route('admin.brands.index')
                ->with('error', 'No se puede inactivar la marca porque tiene órdenes de reparación asociadas.');
        }

        $brand->update(['status' => 'inactive']);

        return redirect()
            ->route('admin.brands.index')
            ->with('success', 'Marca inactivada exitosamente.');
    }

    /**
     * Reactivate the specified resource.
     */
    public function reactivate(Brand $brand)
    {
        $brand->update(['status' => 'active']);

        return redirect()
            ->route('admin.brands.index')
            ->with('success', 'Marca reactivada exitosamente.');
    }
}
