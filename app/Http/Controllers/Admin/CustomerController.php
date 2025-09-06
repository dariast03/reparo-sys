<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\RepairOrder;
use App\Mail\CustomerWelcomeQrMail;
use App\Services\NotificationService;
use App\Jobs\SendWelcomeNotificationJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
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
    public function store(StoreCustomerRequest $request, NotificationService $notificationService)
    {
        $validated = $request->validated();

        try {
            $customer = Customer::create($validated);

            // Dispatch welcome notifications job (async)
            $channels = [];
            if ($customer->email) $channels[] = 'email';
            if ($customer->phone) $channels[] = 'whatsapp';

            if (!empty($channels)) {
                SendWelcomeNotificationJob::dispatch($customer, $channels);
            }

            // Prepare success message
            $successMessage = 'Cliente registrado exitosamente.';
            if (!empty($channels)) {
                $channelNames = [];
                if (in_array('email', $channels)) $channelNames[] = 'correo electrónico';
                if (in_array('whatsapp', $channels)) $channelNames[] = 'WhatsApp';

                $successMessage .= ' Se están enviando las notificaciones de bienvenida por ' . implode(' y ', $channelNames) . '.';
            }

            return redirect()
                ->route('admin.customers.show', $customer)
                ->with('success', $successMessage);
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

    /**
     * Send QR notifications to customer (email and/or WhatsApp)
     */
    public function sendQrEmail(Customer $customer, NotificationService $notificationService)
    {
        try {
            // Determine available channels
            $channels = [];
            if ($customer->email) $channels[] = 'email';
            if ($customer->phone) $channels[] = 'whatsapp';

            if (empty($channels)) {
                return back()->withErrors([
                    'error' => 'El cliente no tiene email ni teléfono registrado.'
                ]);
            }

            // Send notifications
            $notificationResults = $notificationService->sendWelcomeQr($customer, $channels);
            $summary = $notificationService->getNotificationSummary($notificationResults);

            if ($summary['success_count'] > 0) {
                $successChannels = implode(' y ', $summary['successful_channels']);
                $message = 'Código QR enviado exitosamente por ' . $successChannels . '.';

                if ($summary['failure_count'] > 0) {
                    $failedChannels = implode(' y ', $summary['failed_channels']);
                    $message .= ' No se pudo enviar por ' . $failedChannels . '.';
                }

                return back()->with('success', $message);
            } else {
                return back()->withErrors([
                    'error' => 'No se pudo enviar el código QR. ' . implode(' ', $summary['messages'])
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to send QR notifications to customer ' . $customer->id . ': ' . $e->getMessage());

            return back()->withErrors([
                'error' => 'Error al enviar las notificaciones: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Send repair order status notification to customer
     */
    public function sendRepairOrderStatus(Customer $customer, Request $request, NotificationService $notificationService)
    {
        try {
            $repairOrderId = $request->get('repair_order_id');

            if (!$repairOrderId) {
                return back()->withErrors([
                    'error' => 'ID de orden de reparación requerido.'
                ]);
            }

            $repairOrder = RepairOrder::where('id', $repairOrderId)
                ->where('customer_id', $customer->id)
                ->with('customer', 'brand', 'model')
                ->first();

            if (!$repairOrder) {
                return back()->withErrors([
                    'error' => 'Orden de reparación no encontrada.'
                ]);
            }

            // Send notification
            $notificationResults = $notificationService->sendRepairOrderStatus($repairOrder, ['whatsapp']);
            $summary = $notificationService->getNotificationSummary($notificationResults);

            if ($summary['success_count'] > 0) {
                return back()->with('success', 'Notificación de estado enviada exitosamente por WhatsApp.');
            } else {
                return back()->withErrors([
                    'error' => 'No se pudo enviar la notificación. ' . implode(' ', $summary['messages'])
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to send repair order status notification to customer ' . $customer->id . ': ' . $e->getMessage());

            return back()->withErrors([
                'error' => 'Error al enviar la notificación: ' . $e->getMessage()
            ]);
        }
    }
}
