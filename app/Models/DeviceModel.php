<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeviceModel extends Model
{
    protected $table = 'models';
    public $timestamps = false;

    protected $fillable = [
        'brand_id',
        'name',
        'device_type',
        'status',
    ];

    protected $casts = [
        'device_type' => 'string',
        'status' => 'string',
        'created_at' => 'timestamp',
    ];

    // Relationships
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function repairOrders(): HasMany
    {
        return $this->hasMany(RepairOrder::class, 'model_id');
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        return $this->brand->name . ' ' . $this->name;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByDeviceType($query, $type)
    {
        return $query->where('device_type', $type);
    }
}
