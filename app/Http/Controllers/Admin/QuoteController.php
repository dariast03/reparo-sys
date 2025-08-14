<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreQuoteRequest;
use App\Http\Requests\Admin\UpdateQuoteRequest;
use App\Models\Quote;
use App\Models\Customer;
use App\Models\RepairOrder;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Mail\QuoteSent;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        $quotes = Quote::with(['customer', 'user', 'repairOrder'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('quote_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($search) {
                            $customerQuery->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
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

        return Inertia::render('admin/quotes/index', [
            'quotes' => $quotes,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function create(Request $request)
    {
        $customers = Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email', 'document_number']);
        $repairOrders = RepairOrder::with('customer')
            ->whereIn('status', ['received', 'diagnosing'])
            ->orderBy('created_at', 'desc')
            ->get(['id', 'order_number', 'customer_id']);
        $products = Product::where('current_stock', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'sale_price', 'current_stock']);
        $users = User::orderBy('name')->get(['id', 'name']);

        // Generate quote number
        $lastQuote = Quote::latest('id')->first();
        $nextNumber = $lastQuote ? ((int) substr($lastQuote->quote_number, 3)) + 1 : 1;
        $quoteNumber = 'COT' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

        return Inertia::render('admin/quotes/create', [
            'customers' => $customers,
            'repairOrders' => $repairOrders,
            'products' => $products,
            'users' => $users,
            'quoteNumber' => $quoteNumber,
        ]);
    }

    public function store(StoreQuoteRequest $request)
    {
        $validated = $request->validated();

        // Asignar automáticamente el usuario autenticado
        $validated['user_id'] = Auth::id();

        // Generate quote number if not provided
        if (!isset($validated['quote_number'])) {
            $lastQuote = Quote::latest('id')->first();
            $nextNumber = $lastQuote ? ((int) substr($lastQuote->quote_number, 3)) + 1 : 1;
            $validated['quote_number'] = 'COT' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
        }

        // Calculate expiry date
        $validityDays = (int) ($validated['validity_days'] ?? 15);
        $validated['expiry_date'] = now()->addDays($validityDays);

        $quote = Quote::create($validated);

        // Create quote details if provided
        if (isset($validated['items']) && is_array($validated['items'])) {
            foreach ($validated['items'] as $item) {
                $quote->quoteDetails()->create($item);
            }
        }

        return redirect()->route('admin.quotes.show', $quote)
            ->with('success', 'Cotización creada exitosamente.');
    }

    public function show(Quote $quote)
    {
        $quote->load(['customer', 'user', 'repairOrder', 'quoteDetails']);

        return Inertia::render('admin/quotes/show', [
            'quote' => $quote,
        ]);
    }

    public function edit(Quote $quote)
    {
        $customers = Customer::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email']);
        $repairOrders = RepairOrder::with('customer')
            ->whereIn('status', ['received', 'diagnosing'])
            ->orderBy('created_at', 'desc')
            ->get(['id', 'order_number', 'customer_id']);
        $products = Product::where('current_stock', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'sale_price', 'current_stock']);
        $users = User::orderBy('name')->get(['id', 'name']);

        $quote->load(['quoteDetails']);

        return Inertia::render('admin/quotes/edit', [
            'quote' => $quote,
            'customers' => $customers,
            'repairOrders' => $repairOrders,
            'products' => $products,
            'users' => $users,
        ]);
    }

    public function update(UpdateQuoteRequest $request, Quote $quote)
    {
        $validated = $request->validated();

        // Update expiry date if validity days changed
        if (isset($validated['validity_days'])) {
            $validityDays = (int) $validated['validity_days'];
            $validated['expiry_date'] = now()->addDays($validityDays);
        }

        $quote->update($validated);

        // Update quote details if provided
        if (isset($validated['items']) && is_array($validated['items'])) {
            $quote->quoteDetails()->delete();
            foreach ($validated['items'] as $item) {
                $quote->quoteDetails()->create($item);
            }
        }

        return redirect()->route('admin.quotes.show', $quote)
            ->with('success', 'Cotización actualizada exitosamente.');
    }

    public function destroy(Quote $quote)
    {
        $quote->delete();

        return redirect()->route('admin.quotes.index')
            ->with('success', 'Cotización eliminada exitosamente.');
    }

    public function sendEmail(Quote $quote)
    {
        $quote->load(['customer', 'user', 'quoteDetails']);

        if (!$quote->customer->email) {
            return back()->with('error', 'El cliente no tiene email registrado.');
        }

        try {
            // Generate PDF
            $pdf = $this->generatePDF($quote);

            // Send email
            Mail::to($quote->customer->email)->send(new QuoteSent($quote, $pdf));

            $quote->update(['status' => 'sent']);

            return back()->with('success', 'Cotización enviada por email exitosamente.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al enviar la cotización: ' . $e->getMessage());
        }
    }

    public function downloadPDF(Quote $quote)
    {
        $quote->load(['customer', 'user', 'quoteDetails']);

        $pdf = $this->generatePDF($quote);

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="cotizacion-' . $quote->quote_number . '.pdf"',
        ]);
    }

    public function updateStatus(Request $request, Quote $quote)
    {
        $request->validate([
            'status' => 'required|in:draft,sent,approved,rejected,expired',
            'response_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $quote->status;

        $quote->update([
            'status' => $request->status,
            'response_date' => $request->response_date ?? ($request->status !== 'draft' ? now() : null),
            'notes' => $request->notes,
        ]);

        // If approved and linked to repair order, update repair order status
        if ($request->status === 'approved' && $quote->repair_order_id) {
            $repairOrder = $quote->repairOrder;
            if ($repairOrder && in_array($repairOrder->status, ['received', 'diagnosing'])) {
                $repairOrder->update(['status' => 'repairing']);

                // Send notification to technician
                if ($repairOrder->technician_user_id) {
                    $technician = User::find($repairOrder->technician_user_id);
                    if ($technician && $technician->email) {
                        // TODO: Send notification email to technician
                    }
                }
            }
        }

        $statusMessages = [
            'approved' => 'Cotización aprobada exitosamente.',
            'rejected' => 'Cotización marcada como rechazada.',
            'sent' => 'Cotización marcada como enviada.',
            'expired' => 'Cotización marcada como vencida.',
        ];

        $message = $statusMessages[$request->status] ?? 'Estado actualizado exitosamente.';

        return back()->with('success', $message);
    }

    private function generatePDF(Quote $quote)
    {
        $pdf = Pdf::loadView('pdfs.quote', compact('quote'));
        return $pdf;
    }
}
