<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists
        $existingAdmin = User::where('email', 'admin@devialet.com')->first();
        
        if (!$existingAdmin) {
            User::create([
                'first_name' => 'Admin',
                'last_name' => 'Devialet',
                'email' => 'admin@devialet.com',
                'phone' => '0901234567',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]);
            
            $this->command->info('✓ Admin account created successfully!');
            $this->command->info('Email: admin@devialet.com');
            $this->command->info('Password: admin123');
        } else {
            $this->command->info('Admin account already exists.');
        }
    }
}
