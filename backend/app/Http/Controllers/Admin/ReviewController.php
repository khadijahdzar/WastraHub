<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{


    // ==========================
    // ADMIN - LIHAT SEMUA REVIEW
    // ==========================
    public function index()
    {
        $reviews = Review::with([
            'user',
            'product'
        ])
        ->latest()
        ->get();


        return response()->json($reviews);
    }




    // ==========================
    // ADMIN - LIHAT DETAIL REVIEW
    // ==========================
    public function show($id)
    {
        $review = Review::with([
            'user',
            'product'
        ])
        ->findOrFail($id);


        return response()->json($review);
    }





    // ==========================
    // ADMIN - HAPUS REVIEW
    // ==========================
    public function destroy($id)
    {
        $review = Review::findOrFail($id);


        $review->delete();


        return response()->json([
            'message'=>'Review berhasil dihapus'
        ]);
    }

}