<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'sale_number',
        'customer_id',
        'seller_user_id',
        'sale_type',
        'subtotal',
        'discount',
        'taxes',
        'total',
        'advance_payment',
        'pending_balance',
        'status',
        'payment_method',
        'notes',
    ];

    protected $casts = [
        'sale_type' => 'string',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'taxes' => 'decimal:2',
        'total' => 'decimal:2',
        'advance_payment' => 'decimal:2',
        'pending_balance' => 'decimal:2',
        'status' => 'string',
        'payment_method' => 'string',
        'sale_date' => 'timestamp',
        'updated_at' => 'timestamp',
    ];

    // Relationships
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_user_id');
    }

    public function saleDetails(): HasMany
    {
        return $this->hasMany(SaleDetail::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
