<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'tax_id',
        'delivery_time_days',
        'rating',
        'status',
        'notes',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'delivery_time_days' => 'integer',
    ];

    /**
     * Relación con compras
     */
    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    /**
     * Scope para filtrar por estado activo
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope para filtrar por estado inactivo
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }
}
