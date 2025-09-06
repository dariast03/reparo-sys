<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Http;

class WhatsAppConfigCheck extends Command
{
    protected $signature = 'whatsapp:config-check';
    protected $description = 'Check WhatsApp service configuration and connectivity';

    public function handle()
    {
        $this->info('🔍 Checking WhatsApp Service Configuration...');
        $this->line('');

        // Check configuration
        $baseUrl = config('services.whatsapp.base_url');
        $sessionName = config('services.whatsapp.session_name');
        $apiKey = config('services.whatsapp.api_key');

        $this->info('📋 Configuration Values:');
        $this->line("Base URL: " . ($baseUrl ?: '❌ NOT SET'));
        $this->line("Session Name: " . ($sessionName ?: '❌ NOT SET'));
        $this->line("API Key: " . ($apiKey ? '✅ SET (' . substr($apiKey, 0, 20) . '...)' : '❌ NOT SET'));
        $this->line('');

        if (!$baseUrl || !$sessionName || !$apiKey) {
            $this->error('❌ Configuration incomplete! Please set all required environment variables:');
            $this->line('- WHATSAPP_BASE_URL');
            $this->line('- WHATSAPP_SESSION_NAME');
            $this->line('- WHATSAPP_API_KEY');
            return 1;
        }

        // Check service instantiation
        try {
            $whatsappService = new WhatsAppService();
            $isConfigured = $whatsappService->isConfigured();

            $this->info("✅ Service Configuration: " . ($isConfigured ? 'VALID' : 'INVALID'));
        } catch (\Exception $e) {
            $this->error("❌ Service Instantiation Failed: " . $e->getMessage());
            return 1;
        }

        // Test connectivity to API endpoint
        $this->info('🌐 Testing API Connectivity...');
        try {
            $url = "{$baseUrl}/api/{$sessionName}/messages/send";

            $this->line("Testing URL: {$url}");

            // Make a test request (this will likely fail due to invalid data, but we can check connectivity)
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(10)->post($url, [
                'jid' => 'test@s.whatsapp.net',
                'type' => 'number',
                'message' => ['text' => 'connectivity test']
            ]);

            $this->info("Response Status: {$response->status()}");
            $this->info("Response Body: " . $response->body());

            if ($response->status() === 500 && str_contains($response->body(), 'An error occured during message send')) {
                $this->warn('⚠️  API is reachable but returned a server error. This is likely due to session/authentication issues.');
                $this->info('The API endpoint is working, but the session may not be active or properly configured.');
            } elseif ($response->status() === 401) {
                $this->error('❌ API Key authentication failed. Check your WHATSAPP_API_KEY.');
            } elseif ($response->status() === 404) {
                $this->error('❌ API endpoint not found. Check your BASE_URL and SESSION_NAME.');
            } else {
                $this->info("✅ API Response received (status: {$response->status()})");
            }

        } catch (\Exception $e) {
            $this->error("❌ Connectivity Test Failed: " . $e->getMessage());
            $this->warn('This could indicate network issues, invalid URL, or server problems.');
        }

        $this->line('');
        $this->info('🛠️  Recommendations:');
        $this->line('1. Verify your WhatsApp session is active in the web interface');
        $this->line('2. Check that your API key is valid and has proper permissions');
        $this->line('3. Ensure the session name matches exactly what\'s configured in the system');
        $this->line('4. Test with a real phone number using: php artisan whatsapp:test [phone] [message]');

        return 0;
    }
}
