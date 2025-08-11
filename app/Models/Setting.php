<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'setting_key',
        'setting_value',
        'description',
        'data_type',
    ];

    protected $casts = [
        'data_type' => 'string',
        'updated_at' => 'timestamp',
    ];

    // Helper methods
    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('setting_key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return match ($setting->data_type) {
            'integer' => (int) $setting->setting_value,
            'decimal' => (float) $setting->setting_value,
            'boolean' => filter_var($setting->setting_value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($setting->setting_value, true),
            default => $setting->setting_value,
        };
    }

    public static function setValue(string $key, $value, string $dataType = 'string', string $description = null): void
    {
        $settingValue = match ($dataType) {
            'json' => json_encode($value),
            'boolean' => $value ? '1' : '0',
            default => (string) $value,
        };

        static::updateOrCreate(
            ['setting_key' => $key],
            [
                'setting_value' => $settingValue,
                'data_type' => $dataType,
                'description' => $description,
            ]
        );
    }
}
