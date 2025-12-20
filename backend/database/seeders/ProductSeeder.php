<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy categories
        $speakers = Category::where('slug', 'speakers')->first();
        $headphones = Category::where('slug', 'headphones')->first();
        $amplifiers = Category::where('slug', 'amplifiers')->first();

        $products = [
            [
                'name' => 'Phantom I 108dB',
                'slug' => 'phantom-i-108db',
                'category_id' => $speakers->id,
                'price' => 3990.00,
                'sale_price' => 3490.00,
                'description' => '108dB, 4500 Watts, Ultra-dense sound. The most powerful speaker with crystal-clear audio.',
                'stock' => 15,
                'sku' => 'DEV-PHI-108',
                'images' => json_encode(['https://via.placeholder.com/400x400?text=Phantom+I']),
                'is_active' => true,
            ],
            [
                'name' => 'Phantom II 98dB',
                'slug' => 'phantom-ii-98db',
                'category_id' => $speakers->id,
                'price' => 2490.00,
                'sale_price' => null,
                'description' => '98dB, 3000 Watts, Precise sound. Perfect balance between power and precision.',
                'stock' => 25,
                'sku' => 'DEV-PH2-98',
                'images' => json_encode(['https://via.placeholder.com/400x400?text=Phantom+II']),
                'is_active' => true,
            ],
            [
                'name' => 'Dione Soundbar',
                'slug' => 'dione',
                'category_id' => $speakers->id,
                'price' => 2190.00,
                'sale_price' => 1990.00,
                'description' => 'Dolby Atmos Soundbar, 5.1.2 channels for immersive home theater experience.',
                'stock' => 30,
                'sku' => 'DEV-DIONE',
                'images' => json_encode(['https://via.placeholder.com/400x400?text=Dione']),
                'is_active' => true,
            ],
            [
                'name' => 'Mania Portable',
                'slug' => 'mania',
                'category_id' => $speakers->id,
                'price' => 790.00,
                'sale_price' => null,
                'description' => 'Portable smart speaker with 360° sound. Perfect for any occasion.',
                'stock' => 50,
                'sku' => 'DEV-MANIA',
                'images' => json_encode(['https://via.placeholder.com/400x400?text=Mania']),
                'is_active' => true,
            ],
            [
                'name' => 'Gemini II Earbuds',
                'slug' => 'gemini-ii',
                'category_id' => $amplifiers->id,
                'price' => 299.00,
                'sale_price' => 269.00,
                'description' => 'True Wireless Earbuds with premium sound quality and comfort.',
                'stock' => 100,
                'sku' => 'DEV-GEM2',
                'images' => json_encode(['https://via.placeholder.com/400x400?text=Gemini+II']),
                'is_active' => true,
            ],
            [
                'name' => 'Expert Pro 440W',
                'slug' => 'expert-pro',
                'category_id' => $amplifiers->id,
                'price' => 6490.00,
                'sale_price' => 5990.00,
                'description' => 'Reference amplifier 440W. Built for the most demanding audio setups.',
                'stock' => 8,
                'sku' => 'DEV-EXP440',
                'images' => json_encode(['https://via.placeholder.com/400x400?text=Expert+Pro']),
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
