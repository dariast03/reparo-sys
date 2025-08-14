<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryMovementController extends Controller
{
    public function index(Request $request)
    {
        $movements = InventoryMovement::with(['product', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                })
                    ->orWhere('notes', 'like', "%{$search}%");
            })
            ->when($request->product_id, function ($query, $productId) {
                $query->where('product_id', $productId);
            })
            ->when($request->movement_type, function ($query, $type) {
                $query->where('movement_type', $type);
            })
            ->when($request->reason, function ($query, $reason) {
                $query->where('reason', $reason);
            })
            ->when($request->date_from, function ($query, $dateFrom) {
                $query->whereDate('movement_date', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($query, $dateTo) {
                $query->whereDate('movement_date', '<=', $dateTo);
            })
            ->orderBy('movement_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $products = Product::orderBy('name')
            ->get(['id', 'name', 'code']);

        $reasons = InventoryMovement::select('reason')
            ->distinct()
            ->whereNotNull('reason')
            ->pluck('reason')
            ->sort();

        return Inertia::render('admin/inventory/movements/index', [
            'movements' => $movements,
            'products' => $products,
            'reasons' => $reasons,
            'filters' => $request->only(['search', 'product_id', 'movement_type', 'reason', 'date_from', 'date_to']),
        ]);
    }

    public function show(InventoryMovement $movement)
    {
        $movement->load(['product', 'user']);

        return Inertia::render('admin/inventory/movements/show', [
            'movement' => $movement,
        ]);
    }

    public function productMovements(Product $product)
    {
        $product->load(['brand', 'category']);

        $movements = InventoryMovement::with(['user'])
            ->where('product_id', $product->id)
            ->orderBy('movement_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('admin/inventory/movements/product', [
            'product' => $product,
            'movements' => $movements,
        ]);
    }
}
