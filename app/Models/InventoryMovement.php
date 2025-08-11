<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryMovement extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'user_id',
        'repair_order_id',
        'movement_type',
        'quantity',
        'unit_price',
        'total_cost',
        'reason',
        'notes',
        'stock_before',
        'stock_after',
    ];

    protected $casts = [
        'movement_type' => 'string',
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'stock_before' => 'integer',
        'stock_after' => 'integer',
        'movement_date' => 'timestamp',
    ];

    // Relationships
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('movement_type', $type);
    }

    public function scopeIn($query)
    {
        return $query->where('movement_type', 'in');
    }

    public function scopeOut($query)
    {
        return $query->where('movement_type', 'out');
    }
}
