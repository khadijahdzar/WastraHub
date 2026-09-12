<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ReviewController extends Controller
{
    /**
     * GET /api/admin/reviews — semua ulasan, terbaru dulu
     */
    public function index()
    {
        $reviews = Review::with(['user', 'product'])
            ->latest()
            ->get()
            ->map(function ($r) {
                return [
                    'id'         => $r->id,
                    'product_id' => $r->product_id,
                    'user_id'    => $r->user_id,
                    'rating'     => $r->rating,
                    'comment'    => $r->review ?? $r->comment ?? '',
                    'review'     => $r->review ?? $r->comment ?? '',
                    'approved'   => Schema::hasColumn('reviews', 'approved')
                        ? (bool) $r->approved
                        : true,
                    'created_at' => $r->created_at,
                    'user'       => $r->user,
                    'product'    => $r->product,
                    'name'       => $r->user->name ?? 'Pengguna',
                    'product_name' => $r->product->name ?? 'Produk',
                ];
            });

        return response()->json([
            'data' => $reviews,
        ]);
    }

    public function show($id)
    {
        $review = Review::with(['user', 'product'])->findOrFail($id);

        return response()->json([
            'data' => $review,
        ]);
    }

    /**
     * PATCH /api/admin/reviews/{id}/approve
     */
    public function approve($id)
    {
        $review = Review::findOrFail($id);

        if (Schema::hasColumn('reviews', 'approved')) {
            $review->approved = true;
            $review->save();
        }

        return response()->json([
            'message' => 'Review disetujui',
            'data'    => $review->load('user', 'product'),
        ]);
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json([
            'message' => 'Review berhasil dihapus',
        ]);
    }
}
