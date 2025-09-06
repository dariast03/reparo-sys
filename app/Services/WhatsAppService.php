<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class WhatsAppService
{
    protected string $baseUrl;
    protected string $sessionName;
    protected string $apiKey;
    /**
     * Verify if an image URL is accessible
     *
     * @param string $imageUrl
     * @return array
     */
    public function verifyImageUrl(string $imageUrl): array
    {
        try {
            Log::info('WhatsApp: Verifying image URL accessibility', [
                'image_url' => $imageUrl
            ]);

            $response = Http::timeout(10)->get($imageUrl);

            $result = [
                'accessible' => $response->successful(),
                'status_code' => $response->status(),
                'content_type' => $response->header('Content-Type'),
                'content_length' => $response->header('Content-Length'),
                'size_bytes' => strlen($response->body())
            ];

            Log::info('WhatsApp: Image URL verification result', [
                'image_url' => $imageUrl,
                'result' => $result
            ]);

            return $result;

        } catch (\Exception $e) {
            Log::error('WhatsApp: Image URL verification failed', [
                'image_url' => $imageUrl,
                'error' => $e->getMessage()
            ]);

            return [
                'accessible' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function __construct()
    {
        $this->baseUrl = config('services.whatsapp.base_url');
        $this->sessionName = config('services.whatsapp.session_name');
        $this->apiKey = config('services.whatsapp.api_key');
    }

    /**
     * Send a text message via WhatsApp
     *
     * @param string $phoneNumber Phone number in international format (e.g., 59165811117)
     * @param string $message The text message to send
     * @return bool
     */
    public function sendTextMessage(string $phoneNumber, string $message): bool
    {
        try {
            $url = "{$this->baseUrl}/api/{$this->sessionName}/messages/send";

            $jid = $this->formatPhoneNumber($phoneNumber);

            $payload = [
                'jid' => $jid,
                'type' => 'number',
                'message' => [
                    'text' => $message
                ]
            ];

            $headers = [
                'x-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ];

            // Log request details
            Log::info('WhatsApp text message request starting', [
                'phone' => $phoneNumber,
                'jid' => $jid,
                'url' => $url,
                'headers' => [
                    'x-api-key' => substr($this->apiKey, 0, 20) . '...',
                    'Content-Type' => 'application/json',
                ],
                'payload' => $payload,
                'message_length' => strlen($message)
            ]);

            $response = Http::withHeaders($headers)->post($url, $payload);

            // Log response details
            Log::info('WhatsApp text message response received', [
                'phone' => $phoneNumber,
                'status_code' => $response->status(),
                'successful' => $response->successful(),
                'response_body' => $response->body(),
                'response_headers' => $response->headers(),
                'json_response' => $response->json()
            ]);

            if ($response->successful()) {
                Log::info('WhatsApp text message sent successfully', [
                    'phone' => $phoneNumber,
                    'jid' => $jid,
                    'final_status' => 'success'
                ]);
                return true;
            }

            Log::error('Failed to send WhatsApp text message - API Error', [
                'phone' => $phoneNumber,
                'jid' => $jid,
                'status' => $response->status(),
                'response_body' => $response->body(),
                'error_details' => $response->json(),
                'final_status' => 'failed_api_error'
            ]);

            return false;
        } catch (Exception $e) {
            Log::error('WhatsApp text service error - Exception', [
                'phone' => $phoneNumber,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'final_status' => 'failed_exception'
            ]);
            return false;
        }
    }        /**
     * Send an image message via WhatsApp
     *
     * @param string $phoneNumber Phone number in international format
     * @param string $imageUrl URL of the image to send
     * @param string $caption Optional caption for the image
     * @return bool
     */
    public function sendImageMessage(string $phoneNumber, string $imageUrl, string $caption = ''): bool
    {
        try {
            $url = "{$this->baseUrl}/api/{$this->sessionName}/messages/send";

            $jid = $this->formatPhoneNumber($phoneNumber);

            $payload = [
                'jid' => $jid,
                'type' => 'number',
                'message' => [
                    'image' => [
                        'url' => $imageUrl
                    ],
                    'caption' => $caption
                ]
            ];

            $headers = [
                'x-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ];

            // Log request details
            Log::info('WhatsApp image message request starting', [
                'phone' => $phoneNumber,
                'jid' => $jid,
                'url' => $url,
                'image_url' => $imageUrl,
                'caption_length' => strlen($caption),
                'headers' => [
                    'x-api-key' => substr($this->apiKey, 0, 20) . '...',
                    'Content-Type' => 'application/json',
                ],
                'payload' => $payload
            ]);

            $response = Http::withHeaders($headers)->post($url, $payload);

            // Log response details
            Log::info('WhatsApp image message response received', [
                'phone' => $phoneNumber,
                'image_url' => $imageUrl,
                'status_code' => $response->status(),
                'successful' => $response->successful(),
                'response_body' => $response->body(),
                'response_headers' => $response->headers(),
                'json_response' => $response->json()
            ]);

            if ($response->successful()) {
                Log::info('WhatsApp image message sent successfully', [
                    'phone' => $phoneNumber,
                    'jid' => $jid,
                    'image_url' => $imageUrl,
                    'final_status' => 'success'
                ]);
                return true;
            }

            Log::error('Failed to send WhatsApp image message - API Error', [
                'phone' => $phoneNumber,
                'jid' => $jid,
                'image_url' => $imageUrl,
                'status' => $response->status(),
                'response_body' => $response->body(),
                'error_details' => $response->json(),
                'final_status' => 'failed_api_error'
            ]);

            return false;
        } catch (Exception $e) {
            Log::error('WhatsApp image service error - Exception', [
                'phone' => $phoneNumber,
                'image_url' => $imageUrl,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'final_status' => 'failed_exception'
            ]);
            return false;
        }
    }

    /**
     * Format phone number to WhatsApp JID format
     *
     * @param string $phoneNumber
     * @return string
     */
    protected function formatPhoneNumber(string $phoneNumber): string
    {
        // Remove any non-numeric characters
        $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);

        // Add @s.whatsapp.net suffix
        return $phoneNumber . '@s.whatsapp.net';
    }

    /**
     * Check if WhatsApp service is properly configured
     *
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty($this->baseUrl) &&
               !empty($this->sessionName) &&
               !empty($this->apiKey);
    }

    /**
     * Send a document (PDF) message via WhatsApp
     *
     * @param string $phoneNumber Phone number in international format
     * @param string $documentUrl URL of the document to send
     * @param string $fileName Name of the file
     * @param string $caption Optional caption for the document
     * @param string $mimeType MIME type of the document (default: application/pdf)
     * @return bool
     */
    public function sendDocumentMessage(string $phoneNumber, string $documentUrl, string $fileName, string $caption = '', string $mimeType = 'application/pdf'): bool
    {
        try {
            $url = "{$this->baseUrl}/api/{$this->sessionName}/messages/send";

            $jid = $this->formatPhoneNumber($phoneNumber);

            // First verify if document is accessible
            $documentVerification = $this->verifyDocumentUrl($documentUrl);
            if (!$documentVerification['accessible']) {
                Log::error('WhatsApp document not accessible before sending', [
                    'phone' => $phoneNumber,
                    'document_url' => $documentUrl,
                    'verification_result' => $documentVerification
                ]);
            }

            $payload = [
                'jid' => $jid,
                'type' => 'number',
                'message' => [
                    'document' => [
                        'url' => $documentUrl
                    ],
                    'mimetype' => $mimeType,
                    'fileName' => $fileName,
                    'caption' => $caption
                ]
            ];

            $headers = [
                'x-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ];

            // Log request details
            Log::info('WhatsApp document message request starting', [
                'phone' => $phoneNumber,
                'jid' => $jid,
                'url' => $url,
                'document_url' => $documentUrl,
                'file_name' => $fileName,
                'mime_type' => $mimeType,
                'caption_length' => strlen($caption),
                'document_verification' => $documentVerification,
                'headers' => [
                    'x-api-key' => substr($this->apiKey, 0, 20) . '...',
                    'Content-Type' => 'application/json',
                ],
                'payload' => $payload
            ]);

            $response = Http::withHeaders($headers)->post($url, $payload);

            // Log response details
            Log::info('WhatsApp document message response received', [
                'phone' => $phoneNumber,
                'document_url' => $documentUrl,
                'file_name' => $fileName,
                'status_code' => $response->status(),
                'successful' => $response->successful(),
                'response_body' => $response->body(),
                'response_headers' => $response->headers(),
                'json_response' => $response->json()
            ]);

            if ($response->successful()) {
                Log::info('WhatsApp document message sent successfully', [
                    'phone' => $phoneNumber,
                    'jid' => $jid,
                    'document_url' => $documentUrl,
                    'file_name' => $fileName,
                    'final_status' => 'success'
                ]);
                return true;
            }

            Log::error('Failed to send WhatsApp document message - API Error', [
                'phone' => $phoneNumber,
                'jid' => $jid,
                'document_url' => $documentUrl,
                'file_name' => $fileName,
                'status' => $response->status(),
                'response_body' => $response->body(),
                'error_details' => $response->json(),
                'final_status' => 'failed_api_error'
            ]);

            return false;
        } catch (Exception $e) {
            Log::error('WhatsApp document service error - Exception', [
                'phone' => $phoneNumber,
                'document_url' => $documentUrl,
                'file_name' => $fileName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'final_status' => 'failed_exception'
            ]);
            return false;
        }
    }

    /**
     * Verify if a document URL is accessible
     *
     * @param string $documentUrl
     * @return array
     */
    public function verifyDocumentUrl(string $documentUrl): array
    {
        try {
            Log::info('WhatsApp: Verifying document URL accessibility', [
                'document_url' => $documentUrl
            ]);

            $response = Http::timeout(10)->head($documentUrl); // Use HEAD to avoid downloading the whole file

            $result = [
                'accessible' => $response->successful(),
                'status_code' => $response->status(),
                'content_type' => $response->header('Content-Type'),
                'content_length' => $response->header('Content-Length')
            ];

            Log::info('WhatsApp: Document URL verification result', [
                'document_url' => $documentUrl,
                'result' => $result
            ]);

            return $result;

        } catch (\Exception $e) {
            Log::error('WhatsApp: Document URL verification failed', [
                'document_url' => $documentUrl,
                'error' => $e->getMessage()
            ]);

            return [
                'accessible' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
