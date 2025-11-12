<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!

*/
// Public routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/contact', [\App\Http\Controllers\ContactController::class, 'submit']);
// Authentication routes
Route::post('/register', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
// Password reset routes
Route::post('/forgot-password/send-otp', [AuthController::class, 'sendOTP']);
Route::post('/forgot-password/verify-otp', [AuthController::class, 'verifyOTP']);
Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword']);
// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    // Cart routes
    Route::get('/cart', [CartController::class, 'getCart']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::put('/cart/update/{itemId}', [CartController::class, 'updateQuantity']);
    Route::delete('/cart/remove/{itemId}', [CartController::class, 'removeItem']);
    // Settings routes
    Route::post('/settings/profile', [\App\Http\Controllers\SettingsController::class, 'updateProfile']);
    Route::post('/settings/avatar', [\App\Http\Controllers\SettingsController::class, 'uploadAvatar']);
    Route::delete('/settings/avatar', [\App\Http\Controllers\SettingsController::class, 'removeAvatar']);
    // Order routes
    Route::post('/orders/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'getOrders']);
    Route::get('/orders/{id}', [OrderController::class, 'getOrder']);
    // Admin routes (require admin role)
    Route::middleware(\App\Http\Middleware\IsAdmin::class)->group(function () {
        Route::post('/admin/products', [ProductController::class, 'store']);
        Route::post('/admin/products/{id}', [ProductController::class, 'update']); // POST with _method=PUT
        Route::put('/admin/products/{id}', [ProductController::class, 'update']); // Direct PUT
        Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);
    });
});
