<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Adjust based on your authorization logic
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => [
                'required',
                'string',
                'max:100',
                'min:2',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/'
            ],
            'last_name' => [
                'required',
                'string',
                'max:100',
                'min:2',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/'
            ],
            'document_number' => [
                'required',
                'string',
                'max:50',
                'min:3',
                Rule::unique('customers', 'document_number')
                    ->ignore($this->route('customer'))
            ],
            'document_type' => [
                'required',
                'in:ci,passport,driver_license,foreigner_id,nit,military_id,other'
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                'min:7',
                'regex:/^[0-9\+\-\s\(\)]+$/'
            ],
            'email' => [
                'nullable',
                'email:rfc,dns',
                'max:100'
            ],
            'address' => [
                'nullable',
                'string',
                'max:500'
            ],
            'birth_date' => [
                'nullable',
                'date',
                'before:today',
                'after:1900-01-01'
            ],
            'gender' => [
                'nullable',
                'in:male,female,other'
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000'
            ],
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'nombres',
            'last_name' => 'apellidos',
            'document_number' => 'número de documento',
            'document_type' => 'tipo de documento',
            'phone' => 'teléfono',
            'email' => 'correo electrónico',
            'address' => 'dirección',
            'birth_date' => 'fecha de nacimiento',
            'gender' => 'género',
            'notes' => 'notas',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'first_name.regex' => 'El campo :attribute solo puede contener letras y espacios.',
            'last_name.regex' => 'El campo :attribute solo puede contener letras y espacios.',
            'phone.regex' => 'El campo :attribute debe ser un número de teléfono válido.',
            'email.email' => 'El campo :attribute debe ser una dirección de correo electrónico válida.',
            'birth_date.before' => 'La :attribute debe ser anterior a hoy.',
            'birth_date.after' => 'La :attribute debe ser posterior al año 1900.',
            'document_number.unique' => 'Ya existe un cliente registrado con este número de documento.',
        ];
    }
}
