<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * GET /api/orders  (auth:sanctum)
     */
    public function index(Request $request)
    {
        $orders = Order::with(['details.product', 'payment'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['data' => $orders]);
    }

    /**
     * GET /api/orders/{id}  (auth:sanctum)
     */
    public function show(Request $request, $id)
    {
        $order = Order::with(['details.product', 'payment'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json(['data' => $order]);
    }

    /**
     * POST /api/orders  (auth:sanctum)
     *
     * Body:
     * {
     *   customer_name, phone, address,
     *   payment_method, total_amount,
     *   items: [{ product_id, quantity, price, subtotal }]
     * }
     *
     * Membuat: orders + order_details + payments (1 transaksi DB)
     */
    public function checkout(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'required|string',
            'payment_method' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.subtotal' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();

        $order = DB::transaction(function () use ($data, $user) {
            // Cek stok & hitung ulang total dari server (lebih aman)
            $computedTotal = 0;
            $lineItems = [];

            foreach ($data['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    abort(422, "Stok tidak cukup untuk produk: {$product->name}");
                }

                $price = (float) $product->price; // pakai harga DB, bukan client
                $qty = (int) $item['quantity'];
                $subtotal = $price * $qty;
                $computedTotal += $subtotal;

                $lineItems[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'price' => $price,
                    'subtotal' => $subtotal,
                ];
            }

            $orderNumber = 'WH-' . strtoupper(Str::random(8)) . '-' . now()->format('ymd');

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'total_amount' => $computedTotal,
                'status' => 'pending',
                'customer_name' => $data['customer_name'],
                'phone' => $data['phone'],
                'address' => $data['address'],
            ]);

            foreach ($lineItems as $line) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product']->id,
                    'quantity' => $line['quantity'],
                    'price' => $line['price'],
                    'subtotal' => $line['subtotal'],
                ]);

                // Kurangi stok
                $line['product']->decrement('stock', $line['quantity']);
            }

            // Payment record
            $method = $data['payment_method'];
            $payStatus = 'pending';
            // COD tetap pending sampai barang diterima
            // Transfer / e-wallet: pending sampai dikonfirmasi admin (atau gateway)

            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $method,
                'transaction_id' => null,
                'amount' => $computedTotal,
                'status' => $payStatus,
                'paid_at' => null,
            ]);

            return $order->load(['details.product', 'payment']);
        });

        return response()->json([
            'message' => 'Pesanan berhasil dibuat',
            'data' => $order,
        ], 201);
    }
}
