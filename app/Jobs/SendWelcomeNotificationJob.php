<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\Customer;
use App\Services\NotificationService;

class SendWelcomeNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Customer $customer;
    protected array $channels;

    /**
     * Create a new job instance.
     */
    public function __construct(Customer $customer, array $channels = ['email', 'whatsapp'])
    {
        $this->customer = $customer;
        $this->channels = $channels;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $notificationService = new NotificationService();
            $results = $notificationService->sendWelcomeQr($this->customer, $this->channels);
            $summary = $notificationService->getNotificationSummary($results);

            Log::info('Welcome notification job completed', [
                'customer_id' => $this->customer->id,
                'channels' => $this->channels,
                'success_count' => $summary['success_count'],
                'failure_count' => $summary['failure_count'],
                'results' => $results
            ]);

        } catch (\Exception $e) {
            Log::error('Welcome notification job failed', [
                'customer_id' => $this->customer->id,
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
        Log::error('Welcome notification job failed permanently', [
            'customer_id' => $this->customer->id,
            'channels' => $this->channels,
            'error' => $exception->getMessage()
        ]);
    }
}
