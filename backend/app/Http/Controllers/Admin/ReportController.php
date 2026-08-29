<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\OrderDetail;

class ReportController extends Controller
{
    // ==========================
    // ADMIN REPORT
    // ==========================
    public function index()
    {
        $totalRevenue = Order::where('status', 'paid')->sum('total_amount');

        $totalOrders = Order::count();

        $pendingOrders = Order::where('status', 'pending')->count();

        $processingOrders = Order::where('status', 'processing')->count();

        $shippedOrders = Order::where('status', 'shipped')->count();

        $completedOrders = Order::where('status', 'completed')->count();

        $cancelledOrders = Order::where('status', 'cancelled')->count();

        $totalProducts = Product::count();

        $totalCustomers = User::where('role', 'user')->count();

        $bestSellingProducts = OrderDetail::selectRaw('
                product_id,
                SUM(quantity) as total_sold
            ')
            ->with('product')
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();

        return response()->json([
            'total_revenue'      => $totalRevenue,
            'total_orders'       => $totalOrders,
            'pending_orders'     => $pendingOrders,
            'processing_orders'  => $processingOrders,
            'shipped_orders'     => $shippedOrders,
            'completed_orders'   => $completedOrders,
            'cancelled_orders'   => $cancelledOrders,
            'total_products'     => $totalProducts,
            'total_customers'    => $totalCustomers,
            'best_selling_products' => $bestSellingProducts,
        ]);
    }
}