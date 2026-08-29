<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{

    // ==========================
    // ADMIN - LIHAT SEMUA ORDER
    // ==========================
    public function index()
    {
        return response()->json(
            Order::with([
                'user',
                'orderDetails.product',
                'payment'
            ])->latest()->get()
        );
    }



    // ==========================
    // ADMIN - DETAIL ORDER
    // ==========================
    public function show($id)
    {
        $order = Order::with([
            'user',
            'orderDetails.product',
            'payment'
        ])->findOrFail($id);


        return response()->json($order);
    }




    // ==========================
    // ADMIN - UPDATE STATUS ORDER
    // ==========================
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,paid,processing,shipped,completed,cancelled'
        ]);


        $order = Order::findOrFail($id);


        $order->update([
            'status' => $request->status
        ]);


        return response()->json([
            'message' => 'Status order berhasil diperbarui',
            'order' => $order
        ]);
    }

}