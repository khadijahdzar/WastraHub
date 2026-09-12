<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * Default: SEMUA produk active (tanpa silent limit).
     * Optional: ?per_page=12 untuk pagination.
     */
    public function index(Request $request)
    {
        $q = Product::with(['category', 'region'])
            ->where('status', 'active');

        if ($request->filled('category_id')) {
            $q->where('category_id', $request->integer('category_id'));
        }
        if ($request->filled('region_id')) {
            $q->where('region_id', $request->integer('region_id'));
        }
        if ($request->filled('type')) {
            $q->where('type', $request->string('type'));
        }
        if ($request->filled('q') || $request->filled('search')) {
            $term = $request->input('q', $request->input('search'));
            $q->where(function ($qq) use ($term) {
                $qq->where('name', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }
        if ($request->boolean('featured')) {
            $q->where(function ($qq) {
                $qq->where('is_featured', true)->orWhere('is_featured', 1);
            });
        }

        if ($request->filled('per_page')) {
            $perPage = min(max($request->integer('per_page'), 1), 200);
            $paginator = $q->latest()->paginate($perPage);

            return response()->json([
                'data' => $paginator->items(),
                'meta' => [
                    'total'        => $paginator->total(),
                    'per_page'     => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                    'last_page'    => $paginator->lastPage(),
                ],
            ]);
        }

        // Default: return ALL active products
        $products = $q->latest()->get();

        return response()->json([
            'data' => $products,
            'meta' => ['total' => $products->count()],
        ]);
    }

    public function featured()
    {
        $products = Product::with(['category', 'region'])
            ->where('status', 'active')
            ->where(function ($q) {
                $q->where('is_featured', true)->orWhere('is_featured', 1);
            })
            ->latest()
            ->get();

        if ($products->isEmpty()) {
            $products = Product::with(['category', 'region'])
                ->where('status', 'active')
                ->latest()
                ->take(8)
                ->get();
        }

        return response()->json(['data' => $products]);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'region'])->findOrFail($id);

        return response()->json(['data' => $product]);
    }
}