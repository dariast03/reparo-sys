<?php

namespace App\Notifications;

use App\Models\Customer;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class CustomerWelcomeQrWhatsApp
{
    protected WhatsAppService $whatsAppService;

    public function __construct()
    {
        $this->whatsAppService = new WhatsAppService();
    }

    /**
     * Send welcome QR message to customer via WhatsApp
     *
     * @param Customer $customer
     * @return bool
     */
    public function send(Customer $customer): bool
    {
        try {
            Log::info('CustomerWelcomeQrWhatsApp: Starting welcome QR process', [
                'customer_id' => $customer->id,
                'customer_phone' => $customer->phone,
                'has_phone' => !empty($customer->phone),
                'whatsapp_configured' => $this->whatsAppService->isConfigured()
            ]);

            if (!$customer->phone) {
                Log::warning('CustomerWelcomeQrWhatsApp: Customer has no phone number', [
                    'customer_id' => $customer->id
                ]);
                return false;
            }

            if (!$this->whatsAppService->isConfigured()) {
                Log::error('CustomerWelcomeQrWhatsApp: WhatsApp service not configured', [
                    'customer_id' => $customer->id,
                    'base_url' => config('services.whatsapp.base_url'),
                    'session_name' => config('services.whatsapp.session_name') ? 'set' : 'not set',
                    'api_key' => config('services.whatsapp.api_key') ? 'set' : 'not set'
                ]);
                return false;
            }

            Log::info('CustomerWelcomeQrWhatsApp: Generating QR code', [
                'customer_id' => $customer->id,
                'qr_url' => $customer->qr_url,
                'qr_code' => $customer->qr_code
            ]);

            // Generate QR code and save temporarily
            $qrCodePng = QrCode::format('png')
                ->size(300)
                ->margin(2)
                ->generate($customer->qr_url);

            // Save QR code to temporary storage
            $fileName = "temp/qr-{$customer->qr_code}-" . time() . ".png";
            $fileSaved = Storage::disk('public')->put($fileName, $qrCodePng);

            Log::info('CustomerWelcomeQrWhatsApp: QR code file saved', [
                'customer_id' => $customer->id,
                'file_name' => $fileName,
                'file_saved' => $fileSaved,
                'file_size' => strlen($qrCodePng)
            ]);

            // Get the public URL of the image
            $fullImageUrl = url('storage/' . $fileName);

            Log::info('CustomerWelcomeQrWhatsApp: Generated image URL', [
                'customer_id' => $customer->id,
                'image_url' => $fullImageUrl,
                'file_exists' => Storage::disk('public')->exists($fileName)
            ]);

            $message = "Estimado/a {$customer->full_name},\n\n" .
                      "Te damos la bienvenida a" . config('app.name') . "!\n\n" .
                      "Aquí tienes tu código QR personal para acceder rápidamente a tus órdenes de reparación.\n\n" .
                      "Con este código QR puedes:\n" .
                      "✅ Ver el estado de tus reparaciones\n" .
                      "✅ Recibir notificaciones de progreso\n" .
                      "✅ Acceder a tu historial de servicios\n\n" .
                      "¡Guarda este mensaje para futuras consultas!";

            Log::info('CustomerWelcomeQrWhatsApp: Sending WhatsApp image message', [
                'customer_id' => $customer->id,
                'phone' => $customer->phone,
                'image_url' => $fullImageUrl,
                'message_length' => strlen($message)
            ]);

            // Send the image with caption
            $success = $this->whatsAppService->sendImageMessage(
                $customer->phone,
                $fullImageUrl,
                $message
            );

            Log::info('CustomerWelcomeQrWhatsApp: WhatsApp send result', [
                'customer_id' => $customer->id,
                'phone' => $customer->phone,
                'success' => $success
            ]);

            // Clean up temporary file after a delay (you might want to use a job for this)
            // For now, we'll delete it immediately after sending
            /* $fileDeleted = Storage::disk('public')->delete($fileName);

            Log::info('CustomerWelcomeQrWhatsApp: Temporary file cleanup', [
                'customer_id' => $customer->id,
                'file_name' => $fileName,
                'file_deleted' => $fileDeleted
            ]); */

            return $success;

        } catch (\Exception $e) {
            Log::error('CustomerWelcomeQrWhatsApp: Exception occurred', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }
}
