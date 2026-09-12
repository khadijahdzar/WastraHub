<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating'     => 'required|integer|min:1|max:5',
            // terima "review" atau "comment"
            'review'     => 'nullable|string|max:2000',
            'comment'    => 'nullable|string|max:2000',
        ]);

        $text = $data['review'] ?? $data['comment'] ?? null;

        $payload = [
            'user_id'    => Auth::id(),
            'product_id' => $data['product_id'],
            'rating'     => $data['rating'],
            'review'     => $text,
        ];

        // jika kolom approved ada di DB
        if (Schema::hasColumn('reviews', 'approved')) {
            $payload['approved'] = false; // pending sampai admin approve
        }

        $review = Review::create($payload);

        return response()->json([
            'message' => 'Review berhasil ditambahkan',
            'data'    => $review->load('product', 'user'),
            'review'  => $review->load('product', 'user'),
        ], 201);
    }

    public function productReviews($id)
    {
        $reviews = Review::with('user')
            ->where('product_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $reviews,
        ]);
    }

    public function destroy($id)
    {
        $review = Review::where('user_id', Auth::id())->findOrFail($id);
        $review->delete();

        return response()->json([
            'message' => 'Review berhasil dihapus',
        ]);
    }
}
