<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100|unique:suppliers,name',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100|unique:suppliers,email',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:50|unique:suppliers,tax_id',
            'delivery_time_days' => 'nullable|integer|min:1|max:365',
            'rating' => 'nullable|numeric|min:1|max:5',
            'status' => 'required|in:active,inactive',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'contact_person' => 'persona de contacto',
            'phone' => 'teléfono',
            'email' => 'email',
            'address' => 'dirección',
            'tax_id' => 'RUC/NIT',
            'delivery_time_days' => 'tiempo de entrega',
            'rating' => 'calificación',
            'status' => 'estado',
            'notes' => 'notas',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del proveedor es obligatorio.',
            'name.unique' => 'Ya existe un proveedor con este nombre.',
            'email.unique' => 'Ya existe un proveedor con este email.',
            'tax_id.unique' => 'Ya existe un proveedor con este RUC/NIT.',
            'delivery_time_days.min' => 'El tiempo de entrega debe ser al menos 1 día.',
            'delivery_time_days.max' => 'El tiempo de entrega no puede ser mayor a 365 días.',
            'rating.min' => 'La calificación debe ser al menos 1.',
            'rating.max' => 'La calificación no puede ser mayor a 5.',
        ];
    }
}
