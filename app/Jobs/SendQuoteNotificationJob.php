<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\Quote;
use App\Services\NotificationService;

class SendQuoteNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Quote $quote;
    protected string $pdfUrl;
    protected array $channels;

    /**
     * Create a new job instance.
     */
    public function __construct(Quote $quote, string $pdfUrl, array $channels = ['whatsapp'])
    {
        $this->quote = $quote;
        $this->pdfUrl = $pdfUrl;
        $this->channels = $channels;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $notificationService = new NotificationService();
            $results = $notificationService->sendQuoteNotification($this->quote, $this->pdfUrl, $this->channels);
            $summary = $notificationService->getNotificationSummary($results);

            Log::info('Quote notification job completed', [
                'quote_id' => $this->quote->id,
                'customer_id' => $this->quote->customer_id,
                'pdf_url' => $this->pdfUrl,
                'channels' => $this->channels,
                'success_count' => $summary['success_count'],
                'failure_count' => $summary['failure_count'],
                'results' => $results
            ]);

        } catch (\Exception $e) {
            Log::error('Quote notification job failed', [
                'quote_id' => $this->quote->id,
                'customer_id' => $this->quote->customer_id,
                'pdf_url' => $this->pdfUrl,
                'channels' => $this->channels,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Quote notification job failed permanently', [
            'quote_id' => $this->quote->id,
            'customer_id' => $this->quote->customer_id,
            'pdf_url' => $this->pdfUrl,
            'channels' => $this->channels,
            'error' => $exception->getMessage()
        ]);
    }
}
