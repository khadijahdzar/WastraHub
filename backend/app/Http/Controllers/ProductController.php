<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * Public list — hanya produk active
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'region'])
            ->where('status', 'active');

        // Optional filters
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('region_id')) {
            $query->where('region_id', $request->region_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($builder) use ($q) {
                $builder->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('material', 'like', "%{$q}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    /**
     * GET /api/products/{product}
     */
    public function show(Product $product)
    {
        return response()->json(
            $product->load(['category', 'region'])
        );
    }
}
