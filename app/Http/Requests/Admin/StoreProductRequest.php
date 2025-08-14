<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => [
                'required',
                'integer',
                'exists:product_categories,id',
            ],
            'code' => [
                'nullable',
                'string',
                'max:50',
                'unique:products,code',
            ],
            'name' => [
                'required',
                'string',
                'max:200',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'brand' => [
                'nullable',
                'string',
                'max:100',
            ],
            'compatible_model' => [
                'nullable',
                'string',
                'max:100',
            ],
            'current_stock' => [
                'required',
                'integer',
                'min:0',
            ],
            'minimum_stock' => [
                'required',
                'integer',
                'min:0',
            ],
            'purchase_price' => [
                'required',
                'numeric',
                'min:0',
            ],
            'sale_price' => [
                'required',
                'numeric',
                'min:0',
            ],
            'product_type' => [
                'required',
                'string',
                Rule::in(['part', 'accessory', 'tool', 'consumable', 'other']),
            ],
            'physical_location' => [
                'nullable',
                'string',
                'max:100',
            ],
            'status' => [
                'sometimes',
                'string',
                Rule::in(['active', 'inactive', 'discontinued']),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'La categoría es obligatoria.',
            'category_id.exists' => 'La categoría seleccionada no es válida.',
            'code.unique' => 'El código del producto ya existe.',
            'name.required' => 'El nombre del producto es obligatorio.',
            'name.max' => 'El nombre del producto no puede tener más de 200 caracteres.',
            'current_stock.required' => 'El stock actual es obligatorio.',
            'current_stock.min' => 'El stock actual no puede ser negativo.',
            'minimum_stock.required' => 'El stock mínimo es obligatorio.',
            'minimum_stock.min' => 'El stock mínimo no puede ser negativo.',
            'purchase_price.required' => 'El precio de compra es obligatorio.',
            'purchase_price.min' => 'El precio de compra no puede ser negativo.',
            'sale_price.required' => 'El precio de venta es obligatorio.',
            'sale_price.min' => 'El precio de venta no puede ser negativo.',
            'product_type.required' => 'El tipo de producto es obligatorio.',
            'product_type.in' => 'El tipo de producto seleccionado no es válido.',
        ];
    }
}
