<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\RepairOrder;
use App\Services\NotificationService;

class SendRepairOrderStatusNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected RepairOrder $repairOrder;
    protected array $channels;
    protected ?string $oldStatus;

    /**
     * Create a new job instance.
     */
    public function __construct(RepairOrder $repairOrder, array $channels = ['whatsapp'], ?string $oldStatus = null)
    {
        $this->repairOrder = $repairOrder;
        $this->channels = $channels;
        $this->oldStatus = $oldStatus;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $notificationService = new NotificationService();
            $results = $notificationService->sendRepairOrderStatus($this->repairOrder, $this->channels);
            $summary = $notificationService->getNotificationSummary($results);

            Log::info('Repair order status notification job completed', [
                'repair_order_id' => $this->repairOrder->id,
                'customer_id' => $this->repairOrder->customer_id,
                'old_status' => $this->oldStatus,
                'new_status' => $this->repairOrder->status,
                'channels' => $this->channels,
                'success_count' => $summary['success_count'],
                'failure_count' => $summary['failure_count'],
                'results' => $results
            ]);

        } catch (\Exception $e) {
            Log::error('Repair order status notification job failed', [
                'repair_order_id' => $this->repairOrder->id,
                'customer_id' => $this->repairOrder->customer_id,
                'old_status' => $this->oldStatus,
                'new_status' => $this->repairOrder->status,
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
        Log::error('Repair order status notification job failed permanently', [
            'repair_order_id' => $this->repairOrder->id,
            'customer_id' => $this->repairOrder->customer_id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->repairOrder->status,
            'channels' => $this->channels,
            'error' => $exception->getMessage()
        ]);
    }
}
