<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed admin user first
        $this->call([
            AdminSeeder::class,
        ]);
        
        // Seed categories và products
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
        ]);
    }
}
