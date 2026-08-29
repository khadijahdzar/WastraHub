<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{

    // ==========================
    // ADMIN - LIHAT SEMUA CUSTOMER
    // ==========================
    public function index()
    {
        $customers = User::where('role', 'user')
            ->withCount([
                'orders',
                'reviews'
            ])
            ->get();


        return response()->json($customers);
    }



    // ==========================
    // ADMIN - DETAIL CUSTOMER
    // ==========================
    public function show($id)
    {
        $customer = User::where('role', 'user')
            ->with([
                'orders',
                'reviews.product'
            ])
            ->withCount([
                'orders',
                'reviews'
            ])
            ->findOrFail($id);


        return response()->json($customer);
    }

}