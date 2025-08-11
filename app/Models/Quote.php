<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quote extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'quote_number',
        'customer_id',
        'user_id',
        'repair_order_id',
        'work_description',
        'labor_cost',
        'parts_cost',
        'additional_cost',
        'subtotal',
        'discount',
        'taxes',
        'total',
        'validity_days',
        'status',
        'notes',
        'expiry_date',
        'response_date',
    ];

    protected $casts = [
        'labor_cost' => 'decimal:2',
        'parts_cost' => 'decimal:2',
        'additional_cost' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'taxes' => 'decimal:2',
        'total' => 'decimal:2',
        'validity_days' => 'integer',
        'status' => 'string',
        'quote_date' => 'timestamp',
        'expiry_date' => 'date',
        'response_date' => 'datetime',
        'updated_at' => 'timestamp',
    ];

    // Relationships
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }

    public function quoteDetails(): HasMany
    {
        return $this->hasMany(QuoteDetail::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now()->toDateString());
    }

    public function scopeValid($query)
    {
        return $query->where('expiry_date', '>=', now()->toDateString());
    }
}
