<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
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

    public function getQrUrlAttribute()
    {
        if (!$this->qr_code) {
            return null;
        }
        return url("/cliente/{$this->qr_code}");
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

    public function getQrDataUriAttribute()
    {
        $base64 = $this->qr_base64;
        if (!$base64) {
            return null;
        }

        return 'data:image/png;base64,' . $base64;
    }

    public function regenerateQrCode()
    {
        $this->qr_code = $this->generateUniqueQrCode();
        $this->save();
        return $this->qr_code;
    }
}
