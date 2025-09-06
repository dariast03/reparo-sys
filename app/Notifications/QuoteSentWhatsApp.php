<?php

namespace App\Notifications;

use App\Models\Quote;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;

class QuoteSentWhatsApp
{
    protected WhatsAppService $whatsAppService;

    public function __construct()
    {
        $this->whatsAppService = new WhatsAppService();
    }

    /**
     * Send quote document to customer via WhatsApp
     *
     * @param Quote $quote
     * @param string $pdfUrl URL of the PDF document
     * @return bool
     */
    public function send(Quote $quote, string $pdfUrl): bool
    {
        try {
            $customer = $quote->customer;

            Log::info('QuoteSentWhatsApp: Starting quote document process', [
                'quote_id' => $quote->id,
                'customer_id' => $customer->id,
                'customer_phone' => $customer->phone,
                'pdf_url' => $pdfUrl,
                'has_phone' => !empty($customer->phone),
                'whatsapp_configured' => $this->whatsAppService->isConfigured()
            ]);

            if (!$customer->phone) {
                Log::warning('QuoteSentWhatsApp: Customer has no phone number', [
                    'quote_id' => $quote->id,
                    'customer_id' => $customer->id
                ]);
                return false;
            }

            if (!$this->whatsAppService->isConfigured()) {
                Log::error('QuoteSentWhatsApp: WhatsApp service not configured', [
                    'quote_id' => $quote->id,
                    'customer_id' => $customer->id
                ]);
                return false;
            }

            // Generate file name and caption
            $fileName = $this->generateFileName($quote);
            $caption = $this->generateCaption($quote);

            Log::info('QuoteSentWhatsApp: Sending WhatsApp document message', [
                'quote_id' => $quote->id,
                'customer_id' => $customer->id,
                'phone' => $customer->phone,
                'pdf_url' => $pdfUrl,
                'file_name' => $fileName,
                'caption_length' => strlen($caption)
            ]);

            // Send the document
            $success = $this->whatsAppService->sendDocumentMessage(
                $customer->phone,
                $pdfUrl,
                $fileName,
                $caption,
                'application/pdf'
            );

            Log::info('QuoteSentWhatsApp: WhatsApp send result', [
                'quote_id' => $quote->id,
                'customer_id' => $customer->id,
                'phone' => $customer->phone,
                'success' => $success
            ]);

            return $success;

        } catch (\Exception $e) {
            Log::error('QuoteSentWhatsApp: Exception occurred', [
                'quote_id' => $quote->id,
                'customer_id' => $quote->customer_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Generate file name for the quote PDF
     *
     * @param Quote $quote
     * @return string
     */
    protected function generateFileName(Quote $quote): string
    {
        $customer = $quote->customer;
        $date = $quote->created_at->format('Y-m-d');

        return "Cotizacion_{$quote->quote_number}_{$customer->last_name}_{$date}.pdf";
    }

    /**
     * Generate caption message for the quote
     *
     * @param Quote $quote
     * @return string
     */
    protected function generateCaption(Quote $quote): string
    {
        $customer = $quote->customer;
        $repairOrder = $quote->repairOrder;

        $message = "📄 **Cotización - " . config('app.name') . "**\n\n";
        $message .= "Hola {$customer->first_name}! 👋\n\n";
        $message .= "Te enviamos la cotización solicitada:\n\n";
        $message .= "📋 **Detalles:**\n";
        $message .= "• Cotización: #{$quote->quote_number}\n";

        if ($repairOrder) {
            $message .= "• Orden: #{$repairOrder->order_number}\n";
            $message .= "• Dispositivo: {$repairOrder->brand->name} {$repairOrder->model->name}\n";
        }

        $message .= "• Fecha: " . $quote->created_at->format('d/m/Y H:i') . "\n";
        $message .= "• Total: $" . number_format((float) $quote->total_amount, 2) . "\n\n";

        if ($quote->valid_until) {
            $message .= "⏰ **Válida hasta:** " . $quote->valid_until->format('d/m/Y') . "\n\n";
        }

        $message .= "📱 Para proceder con la reparación o si tienes alguna consulta, no dudes en contactarnos.\n\n";
        $message .= "¡Gracias por confiar en nosotros! ✨\n\n";
        $message .= "---\n";
        $message .= "🏪 " . config('app.name');

        return $message;
    }
}
