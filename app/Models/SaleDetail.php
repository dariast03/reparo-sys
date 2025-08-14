<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleDetail extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'quantity',
        'unit_price',
        'item_discount',
        'total_price',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'item_discount' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    // Accessors para convertir decimales a números
    protected $appends = ['unit_price_number', 'item_discount_number', 'total_price_number'];

    public function getUnitPriceNumberAttribute()
    {
        return (float) $this->unit_price;
    }

    public function getItemDiscountNumberAttribute()
    {
        return (float) $this->item_discount;
    }

    public function getTotalPriceNumberAttribute()
    {
        return (float) $this->total_price;
    }

    // Relationships
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
