<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuoteRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'quote_number' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('quotes', 'quote_number')->ignore(request()->route('quote')),
            ],
            'customer_id' => 'required|exists:customers,id',
            'user_id' => 'required|exists:users,id',
            'repair_order_id' => 'nullable|exists:repair_orders,id',
            'work_description' => 'required|string|max:1000',
            'labor_cost' => 'required|numeric|min:0',
            'parts_cost' => 'required|numeric|min:0',
            'additional_cost' => 'nullable|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'taxes' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'validity_days' => 'required|integer|min:1|max:365',
            'status' => 'required|in:draft,sent,approved,rejected,expired',
            'notes' => 'nullable|string|max:1000',
            'items' => 'nullable|array',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total_price' => 'required|numeric|min:0',
            'items.*.type' => 'required|in:product,labor,service',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'customer_id' => 'cliente',
            'user_id' => 'usuario',
            'repair_order_id' => 'orden de reparación',
            'work_description' => 'descripción del trabajo',
            'labor_cost' => 'costo de mano de obra',
            'parts_cost' => 'costo de repuestos',
            'additional_cost' => 'costo adicional',
            'subtotal' => 'subtotal',
            'discount' => 'descuento',
            'taxes' => 'impuestos',
            'total' => 'total',
            'validity_days' => 'días de validez',
            'status' => 'estado',
            'notes' => 'notas',
            'items.*.description' => 'descripción del ítem',
            'items.*.quantity' => 'cantidad',
            'items.*.unit_price' => 'precio unitario',
            'items.*.total_price' => 'precio total',
            'items.*.type' => 'tipo de ítem',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'customer_id.required' => 'Debe seleccionar un cliente.',
            'customer_id.exists' => 'El cliente seleccionado no es válido.',
            'work_description.required' => 'La descripción del trabajo es obligatoria.',
            'labor_cost.required' => 'El costo de mano de obra es obligatorio.',
            'parts_cost.required' => 'El costo de repuestos es obligatorio.',
            'total.required' => 'El total es obligatorio.',
            'validity_days.required' => 'Los días de validez son obligatorios.',
            'validity_days.min' => 'Los días de validez deben ser al menos 1.',
            'validity_days.max' => 'Los días de validez no pueden ser más de 365.',
        ];
    }
}
