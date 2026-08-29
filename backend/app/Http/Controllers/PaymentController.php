<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required',
            'payment_method' => 'required'
        ]);


        $order = Order::where('user_id', Auth::id())
            ->findOrFail($request->order_id);


        if ($order->payment) {
            return response()->json([
                'message' => 'Pembayaran sudah dibuat'
            ], 400);
        }


        $payment = Payment::create([
            'order_id' => $order->id,
            'payment_method' => $request->payment_method,
            'amount' => $order->total_amount,
            'status' => 'pending'
        ]);


        return response()->json([
            'message' => 'Pembayaran berhasil dibuat',
            'payment' => $payment
        ]);
    }


    public function show($id)
    {
        $payment = Payment::with('order')
            ->whereHas('order', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->findOrFail($id);


        return response()->json($payment);
    }


    public function confirm($id)
    {
        $payment = Payment::findOrFail($id);


        $payment->update([
            'status' => 'paid',
            'paid_at' => now()
        ]);


        $payment->order->update([
            'status' => 'paid'
        ]);


        return response()->json([
            'message' => 'Pembayaran berhasil dikonfirmasi',
            'payment' => $payment->load('order')
        ]);
    }
}