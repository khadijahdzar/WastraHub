<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * GET /api/admin/products
     */
    public function index()
    {
        $products = Product::with(['category', 'region'])
            ->latest()
            ->get();

        return response()->json($products);
    }

    /**
     * POST /api/admin/products
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'region_id'   => 'required|exists:regions,id',
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|unique:products,slug',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'image'       => 'nullable|string',
            'material'    => 'nullable|string|max:255',
            'type'        => 'required|string|in:Batik Tulis,Batik Cap,Batik Premium,Batik Modern',
            'status'      => 'required|in:active,inactive',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $product = Product::create($data);

        return response()->json([
            'message' => 'Product berhasil dibuat',
            'data'    => $product->load(['category', 'region']),
        ], 201);
    }

    /**
     * GET /api/admin/products/{product}
     */
    public function show(Product $product)
    {
        return response()->json(
            $product->load(['category', 'region'])
        );
    }

    /**
     * PUT/PATCH /api/admin/products/{product}
     */
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'region_id'   => 'sometimes|exists:regions,id',
            'name'        => 'sometimes|string|max:255',
            'slug'        => 'sometimes|string|unique:products,slug,' . $product->id,
            'description' => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'image'       => 'nullable|string',
            'material'    => 'nullable|string|max:255',
            'type'        => 'sometimes|string|in:Batik Tulis,Batik Cap,Batik Premium,Batik Modern',
            'status'      => 'sometimes|in:active,inactive',
        ]);

        $product->update($data);

        return response()->json([
            'message' => 'Product berhasil diperbarui',
            'data'    => $product->fresh()->load(['category', 'region']),
        ]);
    }

    /**
     * DELETE /api/admin/products/{product}
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product berhasil dihapus',
        ]);
    }
}
