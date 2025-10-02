<?php

namespace App\Console\Commands;

use App\Models\Customer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class GenerateQrImagesForExistingCustomers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'customers:generate-qr-images';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate QR code images for existing customers that don\'t have them';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $customers = Customer::whereNotNull('qr_code')
            ->whereNull('qr_image_path')
            ->get();

        if ($customers->isEmpty()) {
            $this->info('No customers found that need QR images generated.');
            return;
        }

        $this->info("Found {$customers->count()} customers that need QR images generated.");
        $this->newLine();

        $progressBar = $this->output->createProgressBar($customers->count());
        $progressBar->start();

        foreach ($customers as $customer) {
            $this->generateAndSaveQrImage($customer);
            $customer->save();
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);
        $this->info('QR images generated successfully for all existing customers!');
    }

    private function generateAndSaveQrImage(Customer $customer)
    {
        if (!$customer->qr_code) {
            return;
        }

        $qrUrl = url("/cliente/{$customer->qr_code}");

        // Generate QR as PNG
        $qrImage = QrCode::format('png')
            ->size(300)
            ->margin(4)
            ->generate($qrUrl);

        // Save to storage
        $fileName = $customer->qr_code . '.png';
        $path = 'qr-codes/' . $fileName;

        Storage::disk('public')->put($path, $qrImage);

        $customer->qr_image_path = $path;
    }
}
