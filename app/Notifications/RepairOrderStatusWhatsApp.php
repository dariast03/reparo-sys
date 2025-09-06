<?php

namespace App\Notifications;

use App\Models\RepairOrder;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;

class RepairOrderStatusWhatsApp
{
    protected WhatsAppService $whatsAppService;

    public function __construct()
    {
        $this->whatsAppService = new WhatsAppService();
    }

    /**
     * Send repair order status update to customer via WhatsApp
     *
     * @param RepairOrder $repairOrder
     * @return bool
     */
    public function send(RepairOrder $repairOrder): bool
    {
        try {
            $customer = $repairOrder->customer;

            if (!$customer->phone || !$this->whatsAppService->isConfigured()) {
                return false;
            }

            $message = $this->generateStatusMessage($repairOrder);

            return $this->whatsAppService->sendTextMessage($customer->phone, $message);

        } catch (\Exception $e) {
            Log::error('Failed to send WhatsApp status update for repair order ' . $repairOrder->id . ': ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate status message based on repair order status
     *
     * @param RepairOrder $repairOrder
     * @return string
     */
    protected function generateStatusMessage(RepairOrder $repairOrder): string
    {
        $customer = $repairOrder->customer;
        $statusMessages = [
            'received' => [
                'title' => '📥 Orden Recibida',
                'message' => 'Hemos recibido tu dispositivo y comenzaremos con el diagnóstico pronto.'
            ],
            'diagnosing' => [
                'title' => '🔍 En Diagnóstico',
                'message' => 'Nuestros técnicos están realizando el diagnóstico de tu dispositivo.'
            ],
            'waiting_parts' => [
                'title' => '⏳ Esperando Repuestos',
                'message' => 'Hemos identificado el problema y estamos esperando los repuestos necesarios.'
            ],
            'repairing' => [
                'title' => '🔧 En Reparación',
                'message' => 'Tu dispositivo está siendo reparado por nuestros técnicos especializados.'
            ],
            'quality_check' => [
                'title' => '✅ Control de Calidad',
                'message' => 'La reparación está completa y estamos realizando las pruebas finales.'
            ],
            'repaired' => [
                'title' => '✨ Reparación Completada',
                'message' => '¡Excelentes noticias! Tu dispositivo ha sido reparado exitosamente y está listo para retirar.'
            ],
            'delivered' => [
                'title' => '📱 Dispositivo Entregado',
                'message' => 'Tu dispositivo ha sido entregado. ¡Gracias por confiar en nosotros!'
            ],
            'cancelled' => [
                'title' => '❌ Orden Cancelada',
                'message' => 'Tu orden de reparación ha sido cancelada. Contacta con nosotros si tienes dudas.'
            ],
        ];

        $statusInfo = $statusMessages[$repairOrder->status] ?? [
            'title' => '📋 Actualización de Estado',
            'message' => 'El estado de tu orden ha sido actualizado.'
        ];

        $baseMessage = "Hola {$customer->first_name}! 👋\n\n";
        $baseMessage .= "{$statusInfo['title']}\n";
        $baseMessage .= "Orden: #{$repairOrder->order_number}\n";
        $baseMessage .= "Dispositivo: {$repairOrder->brand->name} {$repairOrder->model->name}\n\n";
        $baseMessage .= "{$statusInfo['message']}\n\n";

        // Add additional info based on status
        if ($repairOrder->status === 'repaired' || $repairOrder->status === 'quality_check') {
            if ($repairOrder->total_cost) {
                $baseMessage .= "💰 Costo total: $" . number_format((float) $repairOrder->total_cost, 2) . "\n";
            }
            if ($repairOrder->pending_balance > 0) {
                $baseMessage .= "💳 Saldo pendiente: $" . number_format((float) $repairOrder->pending_balance, 2) . "\n";
            }
        }

        if ($repairOrder->promised_date && in_array($repairOrder->status, ['diagnosing', 'waiting_parts', 'repairing'])) {
            $baseMessage .= "📅 Fecha estimada: " . $repairOrder->promised_date->format('d/m/Y H:i') . "\n";
        }

        if ($repairOrder->technical_notes && in_array($repairOrder->status, ['repaired', 'quality_check'])) {
            $baseMessage .= "\n📝 Notas técnicas: " . $repairOrder->technical_notes . "\n";
        }

        $baseMessage .= "\n---\n";
        $baseMessage .= "🏪 " . config('app.name') . "\n";
        $baseMessage .= "Para más detalles, usa tu código QR personal o contáctanos directamente.";

        return $baseMessage;
    }
}
