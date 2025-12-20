<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'category_id',
        'price',
        'sale_price',
        'description',
        'stock',
        'sku',
        'images',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'is_active' => 'boolean',
        'images' => 'array',
    ];

    /**
     * Quan hệ với category
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Quan hệ với reviews
     */
    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    /**
     * Tính rating trung bình
     */
    public function averageRating()
    {
        return $this->reviews()->avg('rating');
    }

    /**
     * Đếm số lượng reviews
     */
    public function reviewsCount()
    {
        return $this->reviews()->count();
    }

    /**
     * Get main image URL
     */
    public function getImageAttribute()
    {
        // Return first image from images array, or image_url if exists
        if (!empty($this->images) && is_array($this->images)) {
            return $this->images[0];
        }
        return $this->attributes['image_url'] ?? null;
    }

    /**
     * Get image_url for backward compatibility
     */
    public function getImageUrlAttribute()
    {
        return $this->image;
    }

    /**
     * Append image and image_url to JSON
     */
    protected $appends = ['image', 'image_url'];
}
