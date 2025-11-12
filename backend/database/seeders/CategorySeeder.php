<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Speakers',
                'slug' => 'speakers',
                'description' => 'Premium wireless speakers with exceptional sound quality',
            ],
            [
                'name' => 'Headphones',
                'slug' => 'headphones',
                'description' => 'High-fidelity headphones for immersive audio experience',
            ],
            [
                'name' => 'Amplifiers',
                'slug' => 'amplifiers',
                'description' => 'Professional-grade amplifiers for audiophiles',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
