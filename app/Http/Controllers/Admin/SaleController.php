<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSaleRequest;
use App\Http\Requests\Admin\UpdateSaleRequest;
use App\Models\Sale;
use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use App\Models\SaleDetail;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $sales = Sale::with(['customer', 'seller', 'saleDetails'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('sale_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($search) {
                            $customerQuery->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->payment_method, function ($query, $method) {
                $query->where('payment_method', $method);
            })
            ->when($request->seller_id, function ($query, $sellerId) {
                $query->where('seller_user_id', $sellerId);
            })
            ->when($request->date_from, function ($query, $dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($query, $dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $sellers = User::role(['admin'])
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/sales/index', [
            'sales' => $sales,
            'sellers' => $sellers,
            'filters' => $request->only(['search', 'status', 'payment_method', 'seller_id', 'date_from', 'date_to']),
        ]);
    }

    public function create(Request $request)
    {
        $customers = Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email', 'phone']);
        $products = Product::where('current_stock', '>', 0)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'sale_price', 'current_stock']);

        // Generate sale number
        $lastSale = Sale::latest('id')->first();
        $nextNumber = $lastSale ? ((int) substr($lastSale->sale_number, 3)) + 1 : 1;
        $saleNumber = 'VEN' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

        return Inertia::render('admin/sales/create', [
            'customers' => $customers,
            'products' => $products,
            'saleNumber' => $saleNumber,
        ]);
    }

    public function store(StoreSaleRequest $request)
    {
        $validated = $request->validated();

        // Asignar automáticamente el vendedor autenticado
        $validated['seller_user_id'] = Auth::id();

        // Generate sale number if not provided
        if (!isset($validated['sale_number'])) {
            $lastSale = Sale::latest('id')->first();
            $nextNumber = $lastSale ? ((int) substr($lastSale->sale_number, 3)) + 1 : 1;
            $validated['sale_number'] = 'VEN' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
        }

        // Calculate pending balance for credit sales
        if ($validated['sale_type'] === 'credit') {
            $validated['pending_balance'] = $validated['total'] - ($validated['advance_payment'] ?? 0);
            $validated['status'] = $validated['pending_balance'] > 0 ? 'pending' : 'paid';
        } else {
            $validated['pending_balance'] = 0;
            $validated['status'] = 'paid';
        }

        DB::transaction(function () use ($validated, $request) {
            $sale = Sale::create($validated);

            // Create sale details and update inventory
            if (isset($validated['items']) && is_array($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    $saleDetail = $sale->saleDetails()->create($item);

                    // Update product stock
                    $product = Product::find($item['product_id']);
                    if ($product) {
                        $stockBefore = $product->current_stock;
                        $product->current_stock -= $item['quantity'];
                        $stockAfter = $product->current_stock;
                        $product->save();

                        // Create inventory movement
                        InventoryMovement::create([
                            'product_id' => $product->id,
                            'movement_type' => 'out',
                            'quantity' => $item['quantity'], // Positive quantity
                            'unit_price' => $item['unit_price'],
                            'total_cost' => $item['total_price'],
                            'reason' => 'sale',
                            'notes' => "Venta #{$sale->sale_number}",
                            'stock_before' => $stockBefore,
                            'stock_after' => $stockAfter,
                            'user_id' => Auth::id(),
                        ]);
                    }
                }
            }

            return $sale;
        });

        return redirect()->route('admin.sales.index')
            ->with('success', 'Venta creada exitosamente.');
    }

    public function show(Sale $sale)
    {
        $sale->load(['customer', 'seller', 'saleDetails.product']);

        return Inertia::render('admin/sales/show', [
            'sale' => $sale,
        ]);
    }

    public function edit(Sale $sale)
    {
        // Solo permitir editar ventas del día actual
        if (!$sale->created_at->isToday()) {
            return redirect()->route('admin.sales.index')
                ->with('error', 'Solo se pueden editar ventas del día actual.');
        }

        $customers = Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email', 'phone']);
        $products = Product::where('current_stock', '>', 0)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'sale_price', 'current_stock']);

        $sale->load(['saleDetails']);

        return Inertia::render('admin/sales/edit', [
            'sale' => $sale,
            'customers' => $customers,
            'products' => $products,
        ]);
    }

    public function update(UpdateSaleRequest $request, Sale $sale)
    {
        // Solo permitir editar ventas del día actual
        if (!$sale->created_at->isToday()) {
            return redirect()->route('admin.sales.index')
                ->with('error', 'Solo se pueden editar ventas del día actual.');
        }

        $validated = $request->validated();

        // Calculate pending balance for credit sales
        if ($validated['sale_type'] === 'credit') {
            $validated['pending_balance'] = $validated['total'] - ($validated['advance_payment'] ?? 0);
            $validated['status'] = $validated['pending_balance'] > 0 ? 'pending' : 'paid';
        } else {
            $validated['pending_balance'] = 0;
            $validated['status'] = 'paid';
        }

        // Cargar la relación saleDetails
        $sale->load('saleDetails');

        DB::transaction(function () use ($validated, $sale) {
            // Reverse previous inventory movements
            foreach ($sale->saleDetails as $detail) {
                $product = Product::find($detail->product_id);
                if ($product) {
                    $product->current_stock += $detail->quantity;
                    $product->save();
                }
            }

            // Delete old details (inventory movements will be recreated)
            $sale->saleDetails()->delete();

            // Update sale
            $sale->update($validated);

            // Create new sale details and update inventory
            if (isset($validated['items']) && is_array($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    $sale->saleDetails()->create($item);

                    // Update product stock
                    $product = Product::find($item['product_id']);
                    if ($product) {
                        $stockBefore = $product->current_stock;
                        $product->current_stock -= $item['quantity'];
                        $stockAfter = $product->current_stock;
                        $product->save();

                        // Create inventory movement
                        InventoryMovement::create([
                            'product_id' => $product->id,
                            'movement_type' => 'out',
                            'quantity' => $item['quantity'],
                            'unit_price' => $item['unit_price'],
                            'total_cost' => $item['total_price'],
                            'reason' => 'sale_update',
                            'notes' => "Venta #{$sale->sale_number} (actualizada)",
                            'stock_before' => $stockBefore,
                            'stock_after' => $stockAfter,
                            'user_id' => Auth::id(),
                        ]);
                    }
                }
            }
        });

        return redirect()->route('admin.sales.index')
            ->with('success', 'Venta actualizada exitosamente.');
    }

    public function cancel(Request $request, Sale $sale)
    {
        // Solo permitir anular ventas del día actual
        if (!$sale->created_at->isToday()) {
            return response()->json(['error' => 'Solo se pueden anular ventas del día actual.'], 422);
        }

        $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        // Cargar la relación saleDetails
        $sale->load('saleDetails');

        DB::transaction(function () use ($sale, $request) {
            // Reverse inventory movements
            foreach ($sale->saleDetails as $detail) {
                $product = Product::find($detail->product_id);
                if ($product) {
                    $stockBefore = $product->current_stock;
                    $product->current_stock += $detail->quantity;
                    $stockAfter = $product->current_stock;
                    $product->save();

                    // Create reversal inventory movement
                    InventoryMovement::create([
                        'product_id' => $product->id,
                        'movement_type' => 'in',
                        'quantity' => $detail->quantity,
                        'unit_price' => $detail->unit_price,
                        'total_cost' => $detail->total_price,
                        'reason' => 'sale_cancellation',
                        'notes' => "Anulación venta #{$sale->sale_number}: " . $request->cancellation_reason,
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'user_id' => Auth::id(),
                    ]);
                }
            }

            // Update sale status
            $sale->update([
                'status' => 'cancelled',
                'notes' => ($sale->notes ? $sale->notes . "\n\n" : '') .
                    "ANULADA: " . $request->cancellation_reason . " (Usuario: " . Auth::user()->name . ")"
            ]);
        });

        return response()->json(['message' => 'Venta anulada exitosamente.']);
    }

    public function creditPayment(Request $request, Sale $sale)
    {
        $request->validate([
            'payment_amount' => 'required|numeric|min:0.01|max:' . $sale->pending_balance,
            'payment_method' => 'required|in:cash,card,transfer,qr',
            'notes' => 'nullable|string|max:500',
        ]);

        $newBalance = $sale->pending_balance - $request->payment_amount;

        $sale->update([
            'advance_payment' => $sale->advance_payment + $request->payment_amount,
            'pending_balance' => $newBalance,
            'status' => $newBalance <= 0 ? 'paid' : 'pending',
            'notes' => ($sale->notes ? $sale->notes . "\n\n" : '') .
                "Pago: $" . number_format($request->payment_amount, 2) .
                " vía " . $request->payment_method .
                ($request->notes ? " - " . $request->notes : ''),
        ]);

        return response()->json([
            'message' => 'Pago registrado exitosamente.',
            'new_balance' => $newBalance,
            'status' => $sale->status,
        ]);
    }

    public function printInvoice(Sale $sale)
    {
        $sale->load(['customer', 'seller', 'saleDetails.product']);

        $pdf = PDF::loadView('admin.sales.invoice', compact('sale'));

        return $pdf->download("factura-{$sale->sale_number}.pdf");
    }

    public function printReceipt(Sale $sale)
    {
        $sale->load(['customer', 'seller', 'saleDetails.product']);

        $pdf = PDF::loadView('admin.sales.receipt', compact('sale'));

        return $pdf->download("recibo-{$sale->sale_number}.pdf");
    }

    // API endpoints for search
    public function searchProducts(Request $request)
    {
        $query = $request->get('q', '');

        $products = Product::where('status', 'active')
            ->where('current_stock', '>', 0)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('code', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get(['id', 'code', 'name', 'sale_price', 'current_stock']);

        return response()->json($products);
    }
}
