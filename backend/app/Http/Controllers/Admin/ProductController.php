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
     * Ambil SEMUA produk (tanpa limit). Support ?all=1 & ?per_page=
     */
    public function index(Request $request)
    {
        $q = Product::with(['category', 'region'])->latest();

        if ($request->filled('status')) {
            $q->where('status', $request->string('status'));
        }

        if ($request->filled('search') || $request->filled('q')) {
            $term = $request->input('search', $request->input('q'));
            $q->where(function ($w) use ($term) {
                $w->where('name', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }

        // Default: semua data (admin butuh full list)
        if ($request->boolean('all', true) && !$request->filled('per_page')) {
            $products = $q->get();

            return response()->json([
                'data'  => $products,
                'total' => $products->count(),
            ]);
        }

        $perPage = min(max((int) $request->input('per_page', 50), 1), 200);
        $paginator = $q->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
            ],
            'total' => $paginator->total(),
        ]);
    }

    /**
     * POST /api/admin/products
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'region_id'   => 'nullable|exists:regions,id',
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|unique:products,slug',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'image'       => 'nullable|string',
            'material'    => 'nullable|string|max:255',
            'type'        => 'required|string|in:Batik Tulis,Batik Cap,Batik Premium,Batik Modern',
            'technique'   => 'nullable|string|max:100',
            'status'      => 'required|in:active,inactive',
        ]);

        if (empty($data['slug'])) {
            $base = Str::slug($data['name']);
            $slug = $base;
            $i = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $base . '-' . $i++;
            }
            $data['slug'] = $slug;
        }

        if (empty($data['technique']) && !empty($data['type'])) {
            $data['technique'] = str_replace('Batik ', '', $data['type']);
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
        return response()->json([
            'data' => $product->load(['category', 'region']),
        ]);
    }

    /**
     * PUT/PATCH /api/admin/products/{product}
     */
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'region_id'   => 'sometimes|nullable|exists:regions,id',
            'name'        => 'sometimes|string|max:255',
            'slug'        => 'sometimes|string|unique:products,slug,' . $product->id,
            'description' => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'image'       => 'nullable|string',
            'material'    => 'nullable|string|max:255',
            'type'        => 'sometimes|string|in:Batik Tulis,Batik Cap,Batik Premium,Batik Modern',
            'technique'   => 'nullable|string|max:100',
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