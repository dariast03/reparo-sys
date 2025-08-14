<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        // Create 50 customers with realistic data
        for ($i = 0; $i < 50; $i++) {
            Customer::create([
                'first_name' => $faker->firstName,
                'last_name' => $faker->lastName . ' ' . $faker->lastName,
                'document_number' => $faker->unique()->numberBetween(1000000, 99999999),
                'document_type' => $faker->randomElement(['ci', 'passport', 'driver_license', 'nit']),
                'phone' => $faker->randomElement([
                    '7' . $faker->numerify('#######'),
                    '6' . $faker->numerify('#######'),
                    '+591 7' . $faker->numerify('#######'),
                    '+591 6' . $faker->numerify('#######'),
                ]),
                'email' => $faker->optional(0.7)->safeEmail,
                'address' => $faker->optional(0.8)->address,
                'birth_date' => $faker->optional(0.6)->dateTimeBetween('1950-01-01', '2005-12-31')->format('Y-m-d'),
                'gender' => $faker->optional(0.8)->randomElement(['male', 'female', 'other']),
                'notes' => $faker->optional(0.3)->sentence,
                'status' => $faker->randomElement(['active', 'active', 'active', 'active', 'inactive']), // 80% active
                'created_at' => $faker->dateTimeBetween('-2 years', 'now'),
            ]);
        }

        // Create some specific test customers
        $testCustomers = [
            [
                'first_name' => 'Juan Carlos',
                'last_name' => 'Pérez García',
                'document_number' => '12345678',
                'document_type' => 'ci',
                'phone' => '70123456',
                'email' => 'juan.perez@email.com',
                'address' => 'Av. 6 de Agosto #123, La Paz',
                'birth_date' => '1985-03-15',
                'gender' => 'male',
                'notes' => 'Cliente frecuente, maneja iPhone y dispositivos Apple',
                'status' => 'active',
            ],
            [
                'first_name' => 'María Elena',
                'last_name' => 'Rodríguez López',
                'document_number' => '87654321',
                'document_type' => 'ci',
                'phone' => '60987654',
                'email' => 'maria.rodriguez@gmail.com',
                'address' => 'Calle Murillo #456, El Alto',
                'birth_date' => '1990-07-22',
                'gender' => 'female',
                'notes' => 'Especialista en reparaciones Samsung',
                'status' => 'active',
            ],
            [
                'first_name' => 'Carlos Alberto',
                'last_name' => 'Mamani Quispe',
                'document_number' => '11223344',
                'document_type' => 'ci',
                'phone' => '75555666',
                'email' => null,
                'address' => 'Zona Sur, Calle 21 #789',
                'birth_date' => '1978-12-05',
                'gender' => 'male',
                'notes' => 'Prefiere reparaciones en horario de mañana',
                'status' => 'active',
            ],
            [
                'first_name' => 'Ana Lucía',
                'last_name' => 'Vargas Mendoza',
                'document_number' => '55667788',
                'document_type' => 'ci',
                'phone' => '69876543',
                'email' => 'ana.vargas@hotmail.com',
                'address' => null,
                'birth_date' => null,
                'gender' => 'female',
                'notes' => null,
                'status' => 'inactive',
            ],
        ];

        foreach ($testCustomers as $customer) {
            Customer::create($customer);
        }
    }
}
