<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function index()
    {
        $cart = Cart::with('cartItems.product')
            ->where('user_id', Auth::id())
            ->where('status', 'active')
            ->first();

        return response()->json($cart);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = Cart::firstOrCreate([
            'user_id' => Auth::id(),
            'status' => 'active'
        ]);

        $product = Product::findOrFail($request->product_id);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $request->quantity;
            $cartItem->save();
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'price' => $product->price
            ]);
        }

        return response()->json([
            'message' => 'Produk berhasil ditambahkan ke keranjang'
        ]);
    }

    public function destroy($id)
    {
        CartItem::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Item berhasil dihapus'
        ]);
    }

    public function clear()
    {
        $cart = Cart::where('user_id', Auth::id())
            ->where('status', 'active')
            ->first();

        if ($cart) {
            $cart->cartItems()->delete();
        }

        return response()->json([
            'message' => 'Keranjang berhasil dikosongkan'
        ]);
    }
}