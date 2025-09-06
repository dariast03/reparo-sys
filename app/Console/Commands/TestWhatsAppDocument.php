<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WhatsAppService;

class TestWhatsAppDocument extends Command
{
    protected $signature = 'whatsapp:test-document {phone} {document_url} {file_name} {--caption= : Optional caption for the document}';
    protected $description = 'Test WhatsApp document sending functionality';

    public function handle()
    {
        $phone = $this->argument('phone');
        $documentUrl = $this->argument('document_url');
        $fileName = $this->argument('file_name');
        $caption = $this->option('caption') ?: '📄 Documento de prueba - ' . config('app.name');

        $whatsappService = new WhatsAppService();

        if (!$whatsappService->isConfigured()) {
            $this->error('WhatsApp service is not properly configured. Please check your environment variables:');
            $this->line('- WHATSAPP_BASE_URL');
            $this->line('- WHATSAPP_SESSION_NAME');
            $this->line('- WHATSAPP_API_KEY');
            return 1;
        }

        $this->info("Testing WhatsApp document sending...");
        $this->info("Phone: {$phone}");
        $this->info("Document URL: {$documentUrl}");
        $this->info("File Name: {$fileName}");
        $this->info("Caption: {$caption}");
        $this->line('');

        // Verify document URL first
        $this->info("🔍 Verifying document accessibility...");
        $verification = $whatsappService->verifyDocumentUrl($documentUrl);

        if ($verification['accessible']) {
            $this->info("✅ Document is accessible");
            $this->line("Status Code: " . $verification['status_code']);
            $this->line("Content Type: " . ($verification['content_type'] ?: 'Unknown'));
            $this->line("Content Length: " . ($verification['content_length'] ?: 'Unknown'));
        } else {
            $this->warn("⚠️  Document may not be accessible:");
            $this->line("Status Code: " . ($verification['status_code'] ?: 'Unknown'));
            $this->line("Error: " . ($verification['error'] ?? 'Connection failed'));
        }

        $this->line('');
        $this->info("📤 Sending document via WhatsApp...");

        $success = $whatsappService->sendDocumentMessage($phone, $documentUrl, $fileName, $caption);

        if ($success) {
            $this->info('✅ WhatsApp document sent successfully!');
            $this->info('Check the logs for detailed request/response information.');
            return 0;
        } else {
            $this->error('❌ Failed to send WhatsApp document. Check the logs for more details.');
            return 1;
        }
    }
}
