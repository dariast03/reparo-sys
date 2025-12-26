<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class Customer extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'document_number',
        'document_type',
        'phone',
        'email',
        'address',
        'birth_date',
        'gender',
        'notes',
        'status',
        'qr_code',
        'qr_image_path',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'document_type' => 'string',
        'gender' => 'string',
        'status' => 'string',
    ];

    protected $appends = [
        'full_name',
        'qr_url',
        'qr_base64',
        'qr_data_uri',
        'qr_image_url',
    ];

    // Relationships
    public function repairOrders(): HasMany
    {
        return $this->hasMany(RepairOrder::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getNameAttribute(): string
    {
        return $this->getFullNameAttribute();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // QR Code Methods
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            if (empty($customer->qr_code)) {
                $customer->qr_code = $customer->generateUniqueQrCode();
                $customer->generateAndSaveQrImage();
            }
        });
    }

    private function generateUniqueQrCode()
    {
        do {
            $qrCode = 'CL-' . strtoupper(Str::random(8));
        } while (self::where('qr_code', $qrCode)->exists());

        return $qrCode;
    }

    private function generateAndSaveQrImage()
    {
        if (!$this->qr_code) {
            return;
        }

        $qrUrl = url("/cliente/{$this->qr_code}");

        // Generate QR as PNG
        $qrImage = QrCode::format('png')
            ->size(300)
            ->margin(4)
            ->generate($qrUrl);

        // Save to storage
        $fileName = $this->qr_code . '.png';
        $path = 'qr-codes/' . $fileName;

        Storage::disk('public')->put($path, $qrImage);
        Storage::disk("local")->put($path, $qrImage);

        $this->qr_image_path = $path;
    }

    public function getQrUrlAttribute()
    {
        if (!$this->qr_code) {
            return null;
        }
        return url("/cliente/{$this->qr_code}");
    }

    public function getQrDataUriAttribute()
    {
        $base64 = $this->qr_base64;
        if (!$base64) {
            return null;
        }

        return 'data:image/png;base64,' . $base64;
    }

    public function getQrBase64Attribute()
    {
        if (!$this->qr_code) {
            return null;
        }

        try {
            // Generate QR as PNG and encode to base64
            $qrImage = QrCode::format('png')
                ->size(200)
                ->margin(2)
                ->generate($this->qr_url);

            return base64_encode($qrImage);
        } catch (\Exception $e) {
            // Fallback to SVG if PNG generation fails
            $qrSvg = QrCode::format('svg')
                ->size(200)
                ->margin(2)
                ->generate($this->qr_url);

            return base64_encode($qrSvg);
        }
    }

    public function getQrImageUrlAttribute()
    {
        if (!$this->qr_image_path) {
            return null;
        }
        return asset('storage/' . $this->qr_image_path);
    }

    public function regenerateQrCode()
    {
        // Delete old QR image if exists
        if ($this->qr_image_path && Storage::disk('public')->exists($this->qr_image_path)) {
            Storage::disk('public')->delete($this->qr_image_path);
        }

        $this->qr_code = $this->generateUniqueQrCode();
        $this->generateAndSaveQrImage();
        $this->save();
        return $this->qr_code;
    }
}
