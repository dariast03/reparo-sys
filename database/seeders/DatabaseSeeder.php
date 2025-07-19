<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the roles and permissions seeder
        $this->call(RolesAndPermissionsSeeder::class);

        // Create admin user
        $admin = User::factory()->create([
            'name' => 'Root',
            'username' => 'root',
            'email' => 'root@gmail.com',
            'password' => Hash::make('12345678'),
        ]);

        // Assign admin role to admin user
        $admin->assignRole('root');
    }
}
