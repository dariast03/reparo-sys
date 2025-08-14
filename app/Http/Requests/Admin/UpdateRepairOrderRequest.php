<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRepairOrderRequest extends FormRequest
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
            'technical_notes' => [
                'nullable',
                'string',
            ],
            'initial_diagnosis' => [
                'nullable',
                'string',
            ],
            'final_diagnosis' => [
                'nullable',
                'string',
            ],
            'solution_applied' => [
                'nullable',
                'string',
            ],
            'included_accessories' => [
                'nullable',
                'string',
            ],
            'status' => [
                'required',
                'string',
                Rule::in(['received', 'diagnosing', 'waiting_parts', 'repairing', 'repaired', 'unrepairable', 'waiting_customer', 'delivered', 'cancelled']),
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
            ],
            'diagnosis_date' => [
                'nullable',
                'date',
            ],
            'repair_date' => [
                'nullable',
                'date',
            ],
            'delivery_date' => [
                'nullable',
                'date',
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
            'problem_description.required' => 'La descripción del problema es obligatoria.',
            'status.required' => 'El estado es obligatorio.',
            'status.in' => 'El estado seleccionado no es válido.',
            'priority.required' => 'La prioridad es obligatoria.',
            'priority.in' => 'La prioridad seleccionada no es válida.',
            'diagnosis_cost.required' => 'El costo de diagnóstico es obligatorio.',
            'diagnosis_cost.numeric' => 'El costo de diagnóstico debe ser un número.',
            'repair_cost.required' => 'El costo de reparación es obligatorio.',
            'repair_cost.numeric' => 'El costo de reparación debe ser un número.',
            'total_cost.required' => 'El costo total es obligatorio.',
            'total_cost.numeric' => 'El costo total debe ser un número.',
            'advance_payment.required' => 'El pago adelantado es obligatorio.',
            'advance_payment.numeric' => 'El pago adelantado debe ser un número.',
        ];
    }
}
