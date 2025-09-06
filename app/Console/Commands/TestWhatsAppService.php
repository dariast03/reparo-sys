<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WhatsAppService;

class TestWhatsAppService extends Command
{
    protected $signature = 'whatsapp:test {phone} {message}';
    protected $description = 'Test WhatsApp service by sending a message';

    public function handle()
    {
        $phone = $this->argument('phone');
        $message = $this->argument('message');

        $whatsappService = new WhatsAppService();

        if (!$whatsappService->isConfigured()) {
            $this->error('WhatsApp service is not properly configured. Please check your environment variables:');
            $this->line('- WHATSAPP_BASE_URL');
            $this->line('- WHATSAPP_SESSION_NAME');
            $this->line('- WHATSAPP_API_KEY');
            return 1;
        }

        $this->info("Sending WhatsApp message to: {$phone}");
        $this->info("Message: {$message}");

        $success = $whatsappService->sendTextMessage($phone, $message);

        if ($success) {
            $this->info('✅ WhatsApp message sent successfully!');
            return 0;
        } else {
            $this->error('❌ Failed to send WhatsApp message. Check the logs for more details.');
            return 1;
        }
    }
}
