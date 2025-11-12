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
        'description',
        'details',
        'image',
        'image_url',
        'cloudinary_public_id',
        'stock',
        'featured',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'featured' => 'boolean',
    ];

    /**
     * Quan hệ với category
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
