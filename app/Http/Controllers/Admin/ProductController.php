<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Brand;
use App\Models\DeviceModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Search filter
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($categoryQuery) use ($search) {
                        $categoryQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Product type filter
        if ($request->has('product_type') && $request->get('product_type') !== 'all') {
            $query->where('product_type', $request->get('product_type'));
        }

        // Category filter
        if ($request->has('category_id') && $request->get('category_id') !== 'all') {
            $query->where('category_id', $request->get('category_id'));
        }

        // Stock filter
        if ($request->has('stock_status') && $request->get('stock_status') !== 'all') {
            if ($request->get('stock_status') === 'low') {
                $query->whereColumn('current_stock', '<=', 'minimum_stock');
            } elseif ($request->get('stock_status') === 'out') {
                $query->where('current_stock', 0);
            } elseif ($request->get('stock_status') === 'available') {
                $query->where('current_stock', '>', 0);
            }
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'status', 'product_type', 'category_id', 'stock_status']),
            'categories' => ProductCategory::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/products/create', [
            'categories' => ProductCategory::active()->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'deviceModels' => DeviceModel::with('brand')->orderBy('name')->get(['id', 'name', 'brand_id']),
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();

        // Auto-generate code if not provided
        if (empty($data['code'])) {
            $data['code'] = $this->generateProductCode($data['category_id']);
        }

        // Calculate profit margin if purchase and sale prices are provided
        if ($data['purchase_price'] > 0 && $data['sale_price'] > 0) {
            $data['profit_margin'] = (($data['sale_price'] - $data['purchase_price']) / $data['purchase_price']) * 100;
        }

        Product::create($data);

        return redirect()->route('admin.products.index')
            ->with('success', 'Producto creado exitosamente.');
    }

    public function show(Product $product)
    {
        $product->load(['category', 'inventoryMovements.user', 'saleDetails', 'purchaseDetails']);

        return Inertia::render('admin/products/show', [
            'product' => $product,
            'recentMovements' => $product->inventoryMovements()
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
        ]);
    }

    public function edit(Product $product)
    {
        $product->load('category');

        return Inertia::render('admin/products/edit', [
            'product' => $product,
            'categories' => ProductCategory::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();

        // Calculate profit margin if purchase and sale prices are provided
        if ($data['purchase_price'] > 0 && $data['sale_price'] > 0) {
            $data['profit_margin'] = (($data['sale_price'] - $data['purchase_price']) / $data['purchase_price']) * 100;
        }

        $product->update($data);

        return redirect()->route('admin.products.index')
            ->with('success', 'Producto actualizado exitosamente.');
    }

    public function destroy(Product $product)
    {
        // Check if the product has associated transactions
        if ($product->saleDetails()->count() > 0 || $product->purchaseDetails()->count() > 0) {
            return back()->with('error', 'No se puede eliminar el producto porque tiene transacciones asociadas.');
        }

        $product->update(['status' => 'inactive']);

        return back()->with('success', 'Producto desactivado exitosamente.');
    }

    public function reactivate(Product $product)
    {
        $product->update(['status' => 'active']);

        return back()->with('success', 'Producto reactivado exitosamente.');
    }

    private function generateProductCode($categoryId): string
    {
        $category = ProductCategory::find($categoryId);
        $prefix = strtoupper(substr($category->name, 0, 3));
        $count = Product::where('category_id', $categoryId)->count() + 1;

        return $prefix . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
