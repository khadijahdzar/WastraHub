<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_products' => Product::count(),
            'total_users'    => User::where('role', 'user')->count(),
            'total_orders'   => Order::count(),
            'total_revenue'  => Order::whereIn('status', ['paid', 'processing', 'shipped', 'completed'])
                ->sum('total_amount'),
            'pending_orders' => Order::where('status', 'pending')->count(),
        ]);
    }
}
