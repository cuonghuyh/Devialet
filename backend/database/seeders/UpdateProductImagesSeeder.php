<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class UpdateProductImagesSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'id' => 3,
                'name' => 'Dione',
                'image_url' => 'https://images.unsplash.com/photo-1545548547-79f7c85e5f1b?w=600&h=400&fit=crop'
            ],
            [
                'id' => 4,
                'name' => 'Mania',
                'image_url' => 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=400&fit=crop'
            ],
            [
                'id' => 5,
                'name' => 'Gemini II',
                'image_url' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=400&fit=crop'
            ],
            [
                'id' => 6,
                'name' => 'Expert Pro',
                'image_url' => 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop'
            ],
        ];

        foreach ($products as $productData) {
            Product::where('id', $productData['id'])->update([
                'image_url' => $productData['image_url']
            ]);
        }

        $this->command->info('Product images updated successfully!');
    }
}
