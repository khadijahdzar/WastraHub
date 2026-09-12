<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'region_id',
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'image',
        'material',
        'type',
        'technique',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    protected $appends = ['image_url'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        $image = $this->image;
        if (!$image) {
            return null;
        }
        if (
            str_starts_with($image, 'http://') ||
            str_starts_with($image, 'https://') ||
            str_starts_with($image, 'data:')
        ) {
            return $image;
        }
        if (str_starts_with($image, '/')) {
            return url($image);
        }
        if (Storage::disk('public')->exists($image)) {
            return Storage::disk('public')->url($image);
        }
        // backend/public/images/products/{file}
        return url('/images/products/' . ltrim($image, '/'));
    }
}