<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Customer;
use App\Services\NotificationService;
use Barryvdh\DomPDF\Facade\Pdf;

class TestCustomerNotification extends Command
{
    protected $signature = 'notification:test-customer {customer_id} {--type=welcome : Type of notification (welcome|status|quote)} {--repair_order_id= : Repair order ID for status notifications} {--quote_id= : Quote ID for quote notifications}';
    protected $description = 'Test customer notifications (email and WhatsApp)';

    public function handle()
    {
        $customerId = $this->argument('customer_id');
        $type = $this->option('type');
        $repairOrderId = $this->option('repair_order_id');

        $customer = Customer::find($customerId);

        if (!$customer) {
            $this->error("Customer with ID {$customerId} not found.");
            return 1;
        }

        $this->info("Testing notifications for customer: {$customer->full_name}");
        $this->info("Email: " . ($customer->email ?: 'Not set'));
        $this->info("Phone: " . ($customer->phone ?: 'Not set'));
        $this->line('');

        $notificationService = new NotificationService();

        if ($type === 'welcome') {
            $this->info('Sending welcome notification with QR code...');

            $channels = [];
            if ($customer->email) $channels[] = 'email';
            if ($customer->phone) $channels[] = 'whatsapp';

            if (empty($channels)) {
                $this->error('Customer has no email or phone number configured.');
                return 1;
            }

            $results = $notificationService->sendWelcomeQr($customer, $channels);
            $summary = $notificationService->getNotificationSummary($results);

            $this->displayResults($results, $summary);

        } elseif ($type === 'status') {
            if (!$repairOrderId) {
                $this->error('Repair order ID is required for status notifications. Use --repair_order_id=ID');
                return 1;
            }

            $repairOrder = $customer->repairOrders()->find($repairOrderId);

            if (!$repairOrder) {
                $this->error("Repair order with ID {$repairOrderId} not found for this customer.");
                return 1;
            }

            $this->info("Sending status notification for repair order #{$repairOrder->order_number}...");
            $this->info("Current status: {$repairOrder->status}");
            $this->line('');

            if (!$customer->phone) {
                $this->error('Customer has no phone number configured for WhatsApp notifications.');
                return 1;
            }

            $results = $notificationService->sendRepairOrderStatus($repairOrder, ['whatsapp']);
            $summary = $notificationService->getNotificationSummary($results);

            $this->displayResults($results, $summary);

        } elseif ($type === 'quote') {
            $quoteId = $this->option('quote_id');

            if (!$quoteId) {
                $this->error('Quote ID is required for quote notifications. Use --quote_id=ID');
                return 1;
            }

            $quote = $customer->quotes()->find($quoteId);

            if (!$quote) {
                $this->error("Quote with ID {$quoteId} not found for this customer.");
                return 1;
            }

            $this->info("Sending quote notification for quote #{$quote->quote_number}...");
            $this->info("Total amount: $" . number_format((float) $quote->total_amount, 2));
            $this->line('');

            if (!$customer->phone) {
                $this->error('Customer has no phone number configured for WhatsApp notifications.');
                return 1;
            }

            // Generate test PDF URL
            $quote->load(['customer', 'user', 'quoteDetails']);
            $pdfUrl = $this->generateTestPdfUrl($quote);

            $results = $notificationService->sendQuoteNotification($quote, $pdfUrl, ['whatsapp']);
            $summary = $notificationService->getNotificationSummary($results);

            $this->displayResults($results, $summary);

        } else {
            $this->error('Invalid notification type. Use --type=welcome, --type=status, or --type=quote');
            return 1;
        }

        return 0;
    }

    private function displayResults(array $results, array $summary): void
    {
        $this->line('Results:');
        foreach ($results as $channel => $result) {
            $status = $result['success'] ? '✅' : '❌';
            $this->line("  {$channel}: {$status} {$result['message']}");
        }

        $this->line('');
        $this->info("Summary: {$summary['success_count']} successful, {$summary['failure_count']} failed");

        if ($summary['success_count'] > 0) {
            $this->info('Successful channels: ' . implode(', ', $summary['successful_channels']));
        }

        if ($summary['failure_count'] > 0) {
            $this->error('Failed channels: ' . implode(', ', $summary['failed_channels']));
        }
    }

    /**
     * Generate a test PDF URL for quote testing
     */
    private function generateTestPdfUrl($quote): string
    {
        try {
            // Generate PDF using the same view as the controller
            $pdf = Pdf::loadView('pdfs.quote', compact('quote'));
            $fileName = "temp/test-quotes/cotizacion-test-{$quote->quote_number}-" . time() . ".pdf";
            $pdfContent = $pdf->output();

            // Save to public storage
            \Illuminate\Support\Facades\Storage::disk('public')->put($fileName, $pdfContent);

            // Return public URL
            return url('storage/' . $fileName);
        } catch (\Exception $e) {
            $this->error('Failed to generate test PDF: ' . $e->getMessage());
            return 'https://example.com/test.pdf'; // Fallback URL for testing
        }
    }
}
