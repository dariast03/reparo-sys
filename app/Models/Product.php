<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'brand_id',
        'code',
        'name',
        'description',
        'compatible_model',
        'current_stock',
        'minimum_stock',
        'purchase_price',
        'sale_price',
        'profit_margin',
        'product_type',
        'physical_location',
        'status',
    ];

    protected $casts = [
        'current_stock' => 'integer',
        'minimum_stock' => 'integer',
        'purchase_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'profit_margin' => 'decimal:2',
        'product_type' => 'string',
        'status' => 'string',
    ];

    protected $appends = [
        'price',
        'stock',
        'sale_price_number',
    ];

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function orderParts(): HasMany
    {
        return $this->hasMany(OrderPart::class);
    }

    public function saleDetails(): HasMany
    {
        return $this->hasMany(SaleDetail::class);
    }

    public function quoteDetails(): HasMany
    {
        return $this->hasMany(QuoteDetail::class);
    }

    public function purchaseDetails(): HasMany
    {
        return $this->hasMany(PurchaseDetail::class);
    }

    // Accessors
    public function getIsLowStockAttribute(): bool
    {
        return $this->current_stock <= $this->minimum_stock;
    }

    public function getProfitAmountAttribute(): float
    {
        return $this->sale_price - $this->purchase_price;
    }

    // Compatibility accessors for frontend
    public function getPriceAttribute()
    {
        return $this->sale_price;
    }

    public function getStockAttribute()
    {
        return $this->current_stock;
    }

    public function getSalePriceNumberAttribute()
    {
        return (float) $this->sale_price;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('current_stock', '<=', 'minimum_stock');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('product_type', $type);
    }
}
