<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string'
        ]);


        $review = Review::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'review' => $request->review
        ]);


        return response()->json([
            'message' => 'Review berhasil ditambahkan',
            'review' => $review->load('product', 'user')
        ]);
    }


    public function productReviews($id)
    {
        $reviews = Review::with('user')
            ->where('product_id', $id)
            ->latest()
            ->get();


        return response()->json($reviews);
    }


    public function destroy($id)
    {
        $review = Review::where('user_id', Auth::id())
            ->findOrFail($id);


        $review->delete();


        return response()->json([
            'message' => 'Review berhasil dihapus'
        ]);
    }
}