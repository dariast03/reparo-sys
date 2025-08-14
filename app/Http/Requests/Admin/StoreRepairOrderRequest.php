<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRepairOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => [
                'required',
                'integer',
                'exists:customers,id',
            ],
            'technician_user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],
            'brand_id' => [
                'required',
                'integer',
                'exists:brands,id',
            ],
            'model_id' => [
                'required',
                'integer',
                'exists:models,id',
            ],
            'device_serial' => [
                'nullable',
                'string',
                'max:100',
            ],
            'imei' => [
                'nullable',
                'string',
                'max:50',
            ],
            'device_color' => [
                'nullable',
                'string',
                'max:50',
            ],
            'unlock_pattern' => [
                'nullable',
                'string',
                'max:100',
            ],
            'problem_description' => [
                'required',
                'string',
            ],
            'customer_notes' => [
                'nullable',
                'string',
            ],
            'included_accessories' => [
                'nullable',
                'string',
            ],
            'priority' => [
                'required',
                'string',
                Rule::in(['low', 'normal', 'high', 'urgent']),
            ],
            'diagnosis_cost' => [
                'required',
                'numeric',
                'min:0',
            ],
            'repair_cost' => [
                'required',
                'numeric',
                'min:0',
            ],
            'total_cost' => [
                'required',
                'numeric',
                'min:0',
            ],
            'advance_payment' => [
                'required',
                'numeric',
                'min:0',
            ],
            'promised_date' => [
                'nullable',
                'date',
                'after:today',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'El cliente es obligatorio.',
            'customer_id.exists' => 'El cliente seleccionado no es válido.',
            'technician_user_id.exists' => 'El técnico seleccionado no es válido.',
            'brand_id.required' => 'La marca es obligatoria.',
            'brand_id.exists' => 'La marca seleccionada no es válida.',
            'model_id.required' => 'El modelo es obligatorio.',
            'model_id.exists' => 'El modelo seleccionado no es válido.',
            'device_serial.max' => 'El número de serie no puede tener más de 100 caracteres.',
            'imei.max' => 'El IMEI no puede tener más de 50 caracteres.',
            'device_color.max' => 'El color del dispositivo no puede tener más de 50 caracteres.',
            'unlock_pattern.max' => 'El patrón de desbloqueo no puede tener más de 100 caracteres.',
            'problem_description.required' => 'La descripción del problema es obligatoria.',
            'priority.required' => 'La prioridad es obligatoria.',
            'priority.in' => 'La prioridad seleccionada no es válida.',
            'diagnosis_cost.required' => 'El costo de diagnóstico es obligatorio.',
            'diagnosis_cost.numeric' => 'El costo de diagnóstico debe ser un número.',
            'diagnosis_cost.min' => 'El costo de diagnóstico no puede ser negativo.',
            'repair_cost.required' => 'El costo de reparación es obligatorio.',
            'repair_cost.numeric' => 'El costo de reparación debe ser un número.',
            'repair_cost.min' => 'El costo de reparación no puede ser negativo.',
            'total_cost.required' => 'El costo total es obligatorio.',
            'total_cost.numeric' => 'El costo total debe ser un número.',
            'total_cost.min' => 'El costo total no puede ser negativo.',
            'advance_payment.required' => 'El pago adelantado es obligatorio.',
            'advance_payment.numeric' => 'El pago adelantado debe ser un número.',
            'advance_payment.min' => 'El pago adelantado no puede ser negativo.',
            'promised_date.date' => 'La fecha prometida debe ser una fecha válida.',
            'promised_date.after' => 'La fecha prometida debe ser posterior a hoy.',
        ];
    }
}
