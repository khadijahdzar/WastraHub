<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * GET /api/admin/orders
     * Semua order + shape yang selaras frontend admin.
     */
    public function index()
    {
        $orders = Order::with([
            'user',
            'orderDetails.product',
            'payment',
        ])
            ->latest()
            ->get()
            ->map(fn (Order $order) => $this->transform($order));

        return response()->json([
            'data'  => $orders,
            'total' => $orders->count(),
        ]);
    }

    /**
     * GET /api/admin/orders/{id}
     */
    public function show($id)
    {
        $order = Order::with([
            'user',
            'orderDetails.product',
            'payment',
        ])->findOrFail($id);

        return response()->json([
            'data' => $this->transform($order),
        ]);
    }

    /**
     * PATCH /api/admin/orders/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,paid,processing,shipped,completed,cancelled',
        ]);

        $order = Order::with(['payment'])->findOrFail($id);
        $order->update(['status' => $request->status]);

        // Sinkron payment bila ada
        if ($request->status === 'paid' && $order->payment) {
            $order->payment->update([
                'status'  => 'paid',
                'paid_at' => now(),
            ]);
        }

        if ($request->status === 'cancelled' && $order->payment) {
            $order->payment->update(['status' => 'refunded']);
        }

        $order->load(['user', 'orderDetails.product', 'payment']);

        return response()->json([
            'message' => 'Status order berhasil diperbarui',
            'data'    => $this->transform($order),
        ]);
    }

    /**
     * DELETE /api/admin/orders/{id}
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);

        if (!in_array($order->status, ['completed', 'cancelled'], true)) {
            return response()->json([
                'message' => 'Hanya pesanan selesai atau dibatalkan yang dapat dihapus.',
            ], 422);
        }

        $order->delete();

        return response()->json([
            'message' => 'Riwayat pesanan berhasil dihapus.',
        ]);
    }

    /**
     * Normalisasi agar frontend selalu dapat:
     * order_number, customer_name, total_amount, details, phone, address
     */
    private function transform(Order $order): array
    {
        $details = $order->orderDetails ?? $order->details ?? collect();

        $mappedDetails = collect($details)->map(function ($d) {
            return [
                'id'         => $d->id ?? null,
                'product_id' => $d->product_id ?? null,
                'quantity'   => $d->quantity ?? $d->qty ?? 1,
                'price'      => $d->price ?? 0,
                'product'    => $d->product ? [
                    'id'    => $d->product->id,
                    'name'  => $d->product->name,
                    'image' => $d->product->image_url ?? $d->product->image ?? null,
                ] : null,
            ];
        })->values();

        return [
            'id'            => $order->id,
            'order_number'  => $order->order_number
                ?? $order->code
                ?? ('WH-' . $order->id),
            'user_id'       => $order->user_id,
            'status'        => $order->status,
            'total_amount'  => (float) ($order->total_amount ?? $order->total ?? 0),
            'total'         => (float) ($order->total_amount ?? $order->total ?? 0),
            'customer_name' => $order->customer_name
                ?? $order->user?->name
                ?? 'Pembeli',
            'phone'         => $order->phone ?? $order->user?->phone ?? '',
            'address'       => $order->address ?? $order->shipping_address ?? '',
            'created_at'    => optional($order->created_at)?->toISOString()
                ?? $order->created_at,
            'updated_at'    => optional($order->updated_at)?->toISOString()
                ?? $order->updated_at,
            // alias yang dipakai frontend
            'details'       => $mappedDetails,
            'order_details' => $mappedDetails,
            'items'         => $mappedDetails,
            'payment'       => $order->payment,
            'user'          => $order->user ? [
                'id'    => $order->user->id,
                'name'  => $order->user->name,
                'email' => $order->user->email,
            ] : null,
        ];
    }
}