<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminProductController;
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

// Review routes (public - anyone can view)
Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);
// Authentication routes
Route::post('/register', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// Social Authentication routes (removed)
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
    
    // Review routes (protected - must be logged in)
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    Route::get('/products/{productId}/my-review', [ReviewController::class, 'checkUserReview']);
    Route::get('/reviews/reviewable-products', [ReviewController::class, 'getReviewableProducts']);
    // Admin routes (require admin role)
    Route::middleware(\App\Http\Middleware\IsAdmin::class)->prefix('admin')->group(function () {
        // Dashboard stats
        Route::get('/dashboard/stats', [AdminController::class, 'getDashboardStats']);
        
        // Product management
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::get('/products/{id}', [AdminProductController::class, 'show']);
        Route::post('/products/{id}', [AdminProductController::class, 'update']); // POST with _method=PUT for form-data
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
        Route::patch('/products/{id}/stock', [AdminProductController::class, 'updateStock']);
        
        // Order management
        Route::get('/orders', [AdminController::class, 'getOrders']);
        Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
        
        // User management
        Route::get('/users', [AdminController::class, 'getUsers']);
        
        // Review management
        Route::get('/reviews', [AdminController::class, 'getReviews']);
        Route::delete('/reviews/{id}', [AdminController::class, 'deleteReview']);
    });
});
