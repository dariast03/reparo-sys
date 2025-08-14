<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
    ];

    protected $casts = [
        'birth_date' => 'date',
        'document_type' => 'string',
        'gender' => 'string',
        'status' => 'string',
    ];

    protected $appends = [
        'full_name',
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
}
