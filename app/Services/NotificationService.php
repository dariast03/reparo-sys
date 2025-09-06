<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\RepairOrder;
use App\Models\Quote;
use App\Mail\CustomerWelcomeQrMail;
use App\Notifications\CustomerWelcomeQrWhatsApp;
use App\Notifications\RepairOrderStatusWhatsApp;
use App\Notifications\QuoteSentWhatsApp;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send welcome notification with QR code to customer
     *
     * @param Customer $customer
     * @param array $channels Channels to send notification ['email', 'whatsapp']
     * @return array Results of notification attempts
     */
    public function sendWelcomeQr(Customer $customer, array $channels = ['email', 'whatsapp']): array
    {
        $results = [];

        // Send via email
        if (in_array('email', $channels) && $customer->email) {
            try {
                Mail::to($customer->email)->send(new CustomerWelcomeQrMail($customer));
                $results['email'] = [
                    'success' => true,
                    'message' => 'Email enviado exitosamente a ' . $customer->email
                ];
                Log::info('Welcome QR email sent successfully', ['customer_id' => $customer->id, 'email' => $customer->email]);
            } catch (\Exception $e) {
                $results['email'] = [
                    'success' => false,
                    'message' => 'Error al enviar email: ' . $e->getMessage()
                ];
                Log::error('Failed to send welcome QR email', [
                    'customer_id' => $customer->id,
                    'email' => $customer->email,
                    'error' => $e->getMessage()
                ]);
            }
        } elseif (in_array('email', $channels)) {
            $results['email'] = [
                'success' => false,
                'message' => 'Cliente no tiene email registrado'
            ];
        }

        // Send via WhatsApp
        if (in_array('whatsapp', $channels) && $customer->phone) {
            Log::info('NotificationService: Starting WhatsApp welcome notification', [
                'customer_id' => $customer->id,
                'phone' => $customer->phone,
                'channels' => $channels
            ]);

            try {
                $whatsappNotification = new CustomerWelcomeQrWhatsApp();

                Log::info('NotificationService: WhatsApp notification instance created', [
                    'customer_id' => $customer->id,
                    'notification_class' => get_class($whatsappNotification)
                ]);

                $success = $whatsappNotification->send($customer);

                Log::info('NotificationService: WhatsApp notification send completed', [
                    'customer_id' => $customer->id,
                    'phone' => $customer->phone,
                    'success' => $success
                ]);

                $results['whatsapp'] = [
                    'success' => $success,
                    'message' => $success
                        ? 'WhatsApp enviado exitosamente a ' . $customer->phone
                        : 'Error al enviar WhatsApp'
                ];

                if ($success) {
                    Log::info('Welcome QR WhatsApp sent successfully', ['customer_id' => $customer->id, 'phone' => $customer->phone]);
                } else {
                    Log::warning('Failed to send welcome QR WhatsApp', ['customer_id' => $customer->id, 'phone' => $customer->phone]);
                }
            } catch (\Exception $e) {
                Log::error('NotificationService: WhatsApp notification exception', [
                    'customer_id' => $customer->id,
                    'phone' => $customer->phone,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                $results['whatsapp'] = [
                    'success' => false,
                    'message' => 'Error al enviar WhatsApp: ' . $e->getMessage()
                ];
            }
        } elseif (in_array('whatsapp', $channels)) {
            $results['whatsapp'] = [
                'success' => false,
                'message' => 'Cliente no tiene teléfono registrado'
            ];
        }

        return $results;
    }

    /**
     * Send repair order status update notification
     *
     * @param RepairOrder $repairOrder
     * @param array $channels Channels to send notification ['email', 'whatsapp']
     * @return array Results of notification attempts
     */
    public function sendRepairOrderStatus(RepairOrder $repairOrder, array $channels = ['whatsapp']): array
    {
        $results = [];
        $customer = $repairOrder->customer;

        // Send via WhatsApp
        if (in_array('whatsapp', $channels) && $customer->phone) {
            try {
                $whatsappNotification = new RepairOrderStatusWhatsApp();
                $success = $whatsappNotification->send($repairOrder);

                $results['whatsapp'] = [
                    'success' => $success,
                    'message' => $success
                        ? 'Notificación WhatsApp enviada exitosamente a ' . $customer->phone
                        : 'Error al enviar notificación WhatsApp'
                ];

                if ($success) {
                    Log::info('Repair order status WhatsApp sent successfully', [
                        'repair_order_id' => $repairOrder->id,
                        'customer_id' => $customer->id,
                        'phone' => $customer->phone,
                        'status' => $repairOrder->status
                    ]);
                } else {
                    Log::warning('Failed to send repair order status WhatsApp', [
                        'repair_order_id' => $repairOrder->id,
                        'customer_id' => $customer->id,
                        'phone' => $customer->phone
                    ]);
                }
            } catch (\Exception $e) {
                $results['whatsapp'] = [
                    'success' => false,
                    'message' => 'Error al enviar notificación WhatsApp: ' . $e->getMessage()
                ];
                Log::error('Failed to send repair order status WhatsApp', [
                    'repair_order_id' => $repairOrder->id,
                    'customer_id' => $customer->id,
                    'phone' => $customer->phone,
                    'error' => $e->getMessage()
                ]);
            }
        } elseif (in_array('whatsapp', $channels)) {
            $results['whatsapp'] = [
                'success' => false,
                'message' => 'Cliente no tiene teléfono registrado'
            ];
        }

        // For now, we don't have a repair order status email implementation
        // but you can add it here if needed
        if (in_array('email', $channels)) {
            $results['email'] = [
                'success' => false,
                'message' => 'Notificación por email no implementada para cambios de estado'
            ];
        }

        return $results;
    }

    /**
     * Send quote notification to customer
     *
     * @param Quote $quote
     * @param string $pdfUrl URL of the generated PDF
     * @param array $channels Channels to send notification ['email', 'whatsapp']
     * @return array Results of notification attempts
     */
    public function sendQuoteNotification(Quote $quote, string $pdfUrl, array $channels = ['whatsapp']): array
    {
        $results = [];
        $customer = $quote->customer;

        Log::info('NotificationService: Starting quote notification', [
            'quote_id' => $quote->id,
            'customer_id' => $customer->id,
            'channels' => $channels,
            'pdf_url' => $pdfUrl
        ]);

        // Send via WhatsApp
        if (in_array('whatsapp', $channels) && $customer->phone) {
            Log::info('NotificationService: Starting WhatsApp quote notification', [
                'quote_id' => $quote->id,
                'customer_id' => $customer->id,
                'phone' => $customer->phone,
                'channels' => $channels
            ]);

            try {
                $whatsappNotification = new QuoteSentWhatsApp();

                Log::info('NotificationService: WhatsApp quote notification instance created', [
                    'quote_id' => $quote->id,
                    'customer_id' => $customer->id,
                    'notification_class' => get_class($whatsappNotification)
                ]);

                $success = $whatsappNotification->send($quote, $pdfUrl);

                Log::info('NotificationService: WhatsApp quote notification send completed', [
                    'quote_id' => $quote->id,
                    'customer_id' => $customer->id,
                    'phone' => $customer->phone,
                    'success' => $success
                ]);

                $results['whatsapp'] = [
                    'success' => $success,
                    'message' => $success
                        ? 'Cotización enviada exitosamente por WhatsApp a ' . $customer->phone
                        : 'Error al enviar cotización por WhatsApp'
                ];

                if ($success) {
                    Log::info('Quote WhatsApp sent successfully', [
                        'quote_id' => $quote->id,
                        'customer_id' => $customer->id,
                        'phone' => $customer->phone
                    ]);
                } else {
                    Log::warning('Failed to send quote WhatsApp', [
                        'quote_id' => $quote->id,
                        'customer_id' => $customer->id,
                        'phone' => $customer->phone
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('NotificationService: WhatsApp quote notification exception', [
                    'quote_id' => $quote->id,
                    'customer_id' => $customer->id,
                    'phone' => $customer->phone,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                $results['whatsapp'] = [
                    'success' => false,
                    'message' => 'Error al enviar cotización por WhatsApp: ' . $e->getMessage()
                ];
            }
        } elseif (in_array('whatsapp', $channels)) {
            $results['whatsapp'] = [
                'success' => false,
                'message' => 'Cliente no tiene teléfono registrado'
            ];
        }

        // For now, we don't have a quote email implementation
        // but you can add it here if needed using the existing QuoteSent mail class
        if (in_array('email', $channels)) {
            $results['email'] = [
                'success' => false,
                'message' => 'Envío de cotización por email disponible usando el servicio existente'
            ];
        }

        return $results;
    }

    /**
     * Get notification summary message
     *
     * @param array $results
     * @return array
     */
    public function getNotificationSummary(array $results): array
    {
        $successful = array_filter($results, fn($result) => $result['success']);
        $failed = array_filter($results, fn($result) => !$result['success']);

        return [
            'success_count' => count($successful),
            'failure_count' => count($failed),
            'successful_channels' => array_keys($successful),
            'failed_channels' => array_keys($failed),
            'messages' => array_map(fn($result) => $result['message'], $results)
        ];
    }
}
