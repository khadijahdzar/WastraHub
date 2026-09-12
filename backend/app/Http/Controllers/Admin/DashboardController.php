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
        $totalRevenue = (float) Order::whereIn('status', ['paid', 'processing', 'shipped', 'completed'])
            ->sum('total_amount');
        $totalOrders = Order::count();
        $totalUsers = User::where('role', 'user')->count();
        $totalProducts = Product::count();
        $activeProducts = Product::where('status', 'active')->count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $completedOrders = Order::where('status', 'completed')->count();

        return response()->json([
            'revenue'          => $totalRevenue,
            'total_revenue'    => $totalRevenue,
            'orders'           => $totalOrders,
            'total_orders'     => $totalOrders,
            'customers'        => $totalUsers,
            'total_customers'  => $totalUsers,
            'total_users'      => $totalUsers,
            'products'         => $totalProducts,
            'total_products'   => $totalProducts,
            'active_products'  => $activeProducts,
            'pending_orders'   => $pendingOrders,
            'completed_orders' => $completedOrders,
        ]);
    }
}
