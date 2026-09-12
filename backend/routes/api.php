<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\RegionController;

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\ReportController;

// ==========================
// PUBLIC ROUTES
// ==========================

// Categories (read-only public)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Products (read-only public)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Regions (read-only public)
Route::get('/regions', [RegionController::class, 'index']);
Route::get('/regions/{region}', [RegionController::class, 'show']);

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public product reviews
Route::get('/products/{id}/reviews', [ReviewController::class, 'productReviews']);

// ==========================
// USER AUTH ROUTES
// ==========================

Route::middleware('auth:sanctum')->group(function () {

    // Current user
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::delete('/cart/item/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);              // ← WAJIB ditambah
    Route::post('/orders/checkout', [OrderController::class, 'checkout']);  // sudah ada (boleh tetap)
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/pay', [OrderController::class, 'pay']);

    // Payments
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::patch('/payments/{id}/confirm', [PaymentController::class, 'confirm']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
});

// ==========================
// ADMIN ROUTES
// ==========================

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Test
    Route::get('/test', function () {
        return response()->json(['message' => 'Admin berhasil masuk']);
    });

    // Dashboard & Stats
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/stats', [DashboardController::class, 'index']);

    // Products CRUD
    Route::apiResource('products', AdminProductController::class);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::delete('/orders/{id}', [AdminOrderController::class, 'destroy']);

    // Customers
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);

    // Reviews
    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::get('/reviews/{id}', [AdminReviewController::class, 'show']);
    Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);

    // Reports
    Route::get('/reports', [ReportController::class, 'index']);

    // Categories CRUD (admin only)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::patch('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
});
