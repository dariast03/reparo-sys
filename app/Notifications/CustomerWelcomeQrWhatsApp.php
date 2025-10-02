<?php

namespace App\Notifications;

use App\Models\Customer;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;
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
                'qr_code' => $customer->qr_code,
                'qr_image_path' => $customer->qr_image_path,
                'qr_image_url' => $customer->qr_image_url
            ]);

            // Use the already stored QR image URL
            $fullImageUrl = $customer->qr_image_url;

            Log::info('CustomerWelcomeQrWhatsApp: Using stored QR image', [
                'customer_id' => $customer->id,
                'image_url' => $fullImageUrl,
                'file_exists' => $customer->qr_image_path ? Storage::disk('public')->exists($customer->qr_image_path) : false
            ]);

            $message = "¡Hola *{$customer->full_name}*!\n\n" .
                "🎉 Te damos la bienvenida a *" . config('app.name') . "* 🎉\n\n" .
                "Aquí tienes tu *código QR personal* para acceder rápidamente a tus órdenes de reparación.\n\n" .
                "*Con este código QR podrás:*\n" .
                "✅ Ver el estado de tus reparaciones\n" .
                "✅ Recibir notificaciones de progreso\n" .
                "✅ Acceder a tu historial de servicios\n\n" .
                "Si no deseas escanear el código, también puedes acceder usando este enlace:\n" .
                "*{$customer->qr_url}*\n\n" .
                "💡 *Tip:* ¡Guarda este mensaje para futuras consultas y tener todo a mano!";


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
