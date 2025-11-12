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
            // Speakers
            [
                'name' => 'Phantom I',
                'slug' => 'phantom-i',
                'category_id' => $speakers->id,
                'price' => 3990.00,
                'description' => '108dB, 4500 Watts, Ultra-dense sound',
                'details' => 'The Phantom I is our most powerful speaker, delivering an incredible 4500 watts of power with crystal-clear sound at 108dB. Features advanced acoustic technology and premium materials.',
                'image' => '/images/phantom-i.jpg',
                'stock' => 15,
                'featured' => true,
            ],
            [
                'name' => 'Phantom II',
                'slug' => 'phantom-ii',
                'category_id' => $speakers->id,
                'price' => 2490.00,
                'description' => '103dB, 3000 Watts, Precise sound',
                'details' => 'The Phantom II offers exceptional audio quality with 3000 watts of power. Perfect balance between power and precision for audiophiles.',
                'image' => '/images/phantom-ii.jpg',
                'stock' => 25,
                'featured' => true,
            ],
            [
                'name' => 'Dione',
                'slug' => 'dione',
                'category_id' => $speakers->id,
                'price' => 2190.00,
                'description' => 'Dolby Atmos Soundbar, 5.1.2 channels',
                'details' => 'Premium soundbar with Dolby Atmos support, featuring 5.1.2 channels for immersive home theater experience.',
                'image' => '/images/dione.jpg',
                'stock' => 30,
                'featured' => false,
            ],
            
            // Headphones
            [
                'name' => 'Mania',
                'slug' => 'mania',
                'category_id' => $headphones->id,
                'price' => 790.00,
                'description' => 'Wireless ANC Headphones, 30h battery',
                'details' => 'Premium wireless headphones with active noise cancellation and 30-hour battery life. Exceptional comfort and sound quality.',
                'image' => '/images/mania.jpg',
                'stock' => 50,
                'featured' => true,
            ],
            [
                'name' => 'Gemini II',
                'slug' => 'gemini-ii',
                'category_id' => $headphones->id,
                'price' => 299.00,
                'description' => 'True Wireless Earbuds, Premium sound',
                'details' => 'Compact true wireless earbuds with premium audio quality. Perfect for on-the-go listening with superior comfort.',
                'image' => '/images/gemini-ii.jpg',
                'stock' => 100,
                'featured' => false,
            ],
            
            // Amplifiers
            [
                'name' => 'Expert Pro',
                'slug' => 'expert-pro',
                'category_id' => $amplifiers->id,
                'price' => 6490.00,
                'description' => 'Reference amplifier, 250W per channel',
                'details' => 'Professional-grade reference amplifier delivering 250 watts per channel. Built for the most demanding audio setups.',
                'image' => '/images/expert-pro.jpg',
                'stock' => 8,
                'featured' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
