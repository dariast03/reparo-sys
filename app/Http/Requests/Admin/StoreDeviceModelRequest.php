<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDeviceModelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand_id' => [
                'required',
                'integer',
                'exists:brands,id',
            ],
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('models')->where(function ($query) {
                    return $query->where('brand_id', request()->input('brand_id'));
                }),
            ],
            'device_type' => [
                'required',
                'string',
                Rule::in(['phone', 'tablet', 'laptop', 'smartwatch', 'other']),
            ],
            'status' => [
                'sometimes',
                'string',
                Rule::in(['active', 'inactive']),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'brand_id.required' => 'La marca es obligatoria.',
            'brand_id.exists' => 'La marca seleccionada no es válida.',
            'name.required' => 'El nombre del modelo es obligatorio.',
            'name.max' => 'El nombre del modelo no puede tener más de 100 caracteres.',
            'name.unique' => 'Ya existe un modelo con este nombre para la marca seleccionada.',
            'device_type.required' => 'El tipo de dispositivo es obligatorio.',
            'device_type.in' => 'El tipo de dispositivo seleccionado no es válido.',
            'status.in' => 'El estado seleccionado no es válido.',
        ];
    }
}
