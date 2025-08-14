<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['brand', 'category'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($request->brand_id, function ($query, $brandId) {
                $query->where('brand_id', $brandId);
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->stock_level, function ($query, $level) {
                switch ($level) {
                    case 'low':
                        $query->whereColumn('current_stock', '<=', 'minimum_stock');
                        break;
                    case 'zero':
                        $query->where('current_stock', '<=', 0);
                        break;
                    case 'available':
                        $query->where('current_stock', '>', 0);
                        break;
                }
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $brands = \App\Models\Brand::orderBy('name')->get(['id', 'name']);
        $categories = \App\Models\ProductCategory::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/inventory/stock/index', [
            'products' => $products,
            'brands' => $brands,
            'categories' => $categories,
            'filters' => $request->only(['search', 'brand_id', 'category_id', 'status', 'stock_level']),
        ]);
    }

    public function show(Product $product)
    {
        $product->load(['brand', 'category']);

        $recentMovements = InventoryMovement::with(['user'])
            ->where('product_id', $product->id)
            ->orderBy('movement_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $stockHistory = InventoryMovement::where('product_id', $product->id)
            ->selectRaw('DATE(movement_date) as date, SUM(CASE WHEN movement_type = "in" THEN quantity ELSE -quantity END) as net_movement')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();

        return Inertia::render('admin/inventory/stock/show', [
            'product' => $product,
            'recentMovements' => $recentMovements,
            'stockHistory' => $stockHistory,
        ]);
    }

    public function adjust(Request $request, Product $product)
    {
        $request->validate([
            'adjustment_type' => 'required|in:add,subtract,set',
            'quantity' => 'required|numeric|min:0',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $product) {
            $stockBefore = $product->current_stock;

            switch ($request->adjustment_type) {
                case 'add':
                    $product->current_stock += $request->quantity;
                    $movementType = 'in';
                    $movementQuantity = $request->quantity;
                    break;
                case 'subtract':
                    $product->current_stock -= $request->quantity;
                    $movementType = 'out';
                    $movementQuantity = $request->quantity;
                    break;
                case 'set':
                    $difference = $request->quantity - $stockBefore;
                    $product->current_stock = $request->quantity;
                    $movementType = $difference >= 0 ? 'in' : 'out';
                    $movementQuantity = abs($difference);
                    break;
            }

            $stockAfter = $product->current_stock;
            $product->save();

            // Create inventory movement record
            InventoryMovement::create([
                'product_id' => $product->id,
                'movement_type' => $movementType,
                'quantity' => $movementQuantity,
                'unit_price' => 0,
                'total_cost' => 0,
                'reason' => $request->reason,
                'notes' => $request->notes,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'movement_date' => now(),
                'user_id' => Auth::id(),
            ]);
        });

        return response()->json([
            'message' => 'Stock ajustado exitosamente.',
            'new_stock' => $product->current_stock,
        ]);
    }

    public function bulkAdjust(Request $request)
    {
        $request->validate([
            'adjustments' => 'required|array|min:1',
            'adjustments.*.product_id' => 'required|exists:products,id',
            'adjustments.*.adjustment_type' => 'required|in:add,subtract,set',
            'adjustments.*.quantity' => 'required|numeric|min:0',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->adjustments as $adjustment) {
                $product = Product::find($adjustment['product_id']);
                if (!$product) continue;

                $stockBefore = $product->current_stock;

                switch ($adjustment['adjustment_type']) {
                    case 'add':
                        $product->current_stock += $adjustment['quantity'];
                        $movementType = 'in';
                        $movementQuantity = $adjustment['quantity'];
                        break;
                    case 'subtract':
                        $product->current_stock -= $adjustment['quantity'];
                        $movementType = 'out';
                        $movementQuantity = $adjustment['quantity'];
                        break;
                    case 'set':
                        $difference = $adjustment['quantity'] - $stockBefore;
                        $product->current_stock = $adjustment['quantity'];
                        $movementType = $difference >= 0 ? 'in' : 'out';
                        $movementQuantity = abs($difference);
                        break;
                }

                $stockAfter = $product->current_stock;
                $product->save();

                // Create inventory movement record
                InventoryMovement::create([
                    'product_id' => $product->id,
                    'movement_type' => $movementType,
                    'quantity' => $movementQuantity,
                    'unit_price' => 0,
                    'total_cost' => 0,
                    'reason' => $request->reason,
                    'notes' => $request->notes . " (Ajuste masivo)",
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'movement_date' => now(),
                    'user_id' => Auth::id(),
                ]);
            }
        });

        return response()->json([
            'message' => 'Ajustes de stock aplicados exitosamente.',
        ]);
    }
}
