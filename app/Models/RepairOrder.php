<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RepairOrder extends Model
{
    protected $fillable = [
        'order_number',
        'customer_id',
        'reception_user_id',
        'technician_user_id',
        'brand_id',
        'model_id',
        'device_serial',
        'imei',
        'device_color',
        'unlock_pattern',
        'problem_description',
        'customer_notes',
        'technical_notes',
        'initial_diagnosis',
        'final_diagnosis',
        'solution_applied',
        'included_accessories',
        'status',
        'priority',
        'diagnosis_cost',
        'repair_cost',
        'total_cost',
        'advance_payment',
        'pending_balance',
        'promised_date',
        'diagnosis_date',
        'repair_date',
        'delivery_date',
    ];

    protected $casts = [
        'status' => 'string',
        'priority' => 'string',
        'diagnosis_cost' => 'decimal:2',
        'repair_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'advance_payment' => 'decimal:2',
        'pending_balance' => 'decimal:2',
        'received_date' => 'timestamp',
        'promised_date' => 'datetime',
        'diagnosis_date' => 'datetime',
        'repair_date' => 'datetime',
        'delivery_date' => 'datetime',
        'updated_at' => 'timestamp',
    ];

    // Relationships
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function receptionUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reception_user_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_user_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(DeviceModel::class, 'model_id');
    }

    public function orderParts(): HasMany
    {
        return $this->hasMany(OrderPart::class);
    }

    public function history(): HasMany
    {
        return $this->hasMany(OrderHistory::class);
    }

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['received', 'diagnosing', 'waiting_parts', 'repairing']);
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['repaired', 'delivered']);
    }
}
