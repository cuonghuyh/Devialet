<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Admin\ProductManagementController;
use App\Http\Controllers\CartController;

Route::middleware('web')->group(function () {
    // Main SPA route - Load React app
    Route::get('/', function () {
        return view('welcome');
    });
    
    // Catch-all route for React Router
    Route::get('/{any}', function () {
        return view('welcome');
    })->where('any', '.*');

    Route::get('/products', [ProductController::class, 'index'])->name('products');
    Route::get('/products/{slug}', [ProductController::class, 'show'])->name('product.show');

    Route::get('/contact', [ContactController::class, 'show'])->name('contact');
    Route::post('/contact', [ContactController::class, 'submit']);

    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/signup', [AuthController::class, 'showSignup'])->name('signup');
    Route::post('/signup', [AuthController::class, 'signup']);

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

    Route::get('/settings', [AuthController::class, 'showSettings'])->name('settings')->middleware('auth');
    Route::post('/settings/avatar', [AuthController::class, 'updateAvatar'])->middleware('auth');
    Route::delete('/settings/avatar', [AuthController::class, 'removeAvatar'])->middleware('auth');
    Route::post('/settings/profile', [AuthController::class, 'updateProfile'])->middleware('auth');

    Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('forgot-password');
    Route::post('/forgot-password/send-otp', [AuthController::class, 'sendOTP']);
    Route::post('/forgot-password/verify-otp', [AuthController::class, 'verifyOTP']);
    Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword']);

    // Test Upload Route
    Route::get('/test-upload', function () {
        return view('test-upload');
    });
    Route::post('/test-upload', [ProductController::class, 'testUpload']);

    // Cart Routes
    Route::get('/cart', [CartController::class, 'index'])->name('cart')->middleware('auth');
    Route::post('/cart/add', [CartController::class, 'addToCart'])->name('cart.add');
    Route::get('/cart/data', [CartController::class, 'getCart'])->name('cart.get');
    Route::post('/cart/update/{itemId}', [CartController::class, 'updateQuantity'])->name('cart.update');
    Route::delete('/cart/remove/{itemId}', [CartController::class, 'removeItem'])->name('cart.remove');

    // Admin Routes (protected by admin middleware)
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/products', [ProductManagementController::class, 'index'])->name('admin.products');
        Route::post('/products', [ProductManagementController::class, 'store']);
        Route::get('/products/{id}', [ProductManagementController::class, 'show']);
        Route::post('/products/{id}', [ProductManagementController::class, 'update']);
        Route::delete('/products/{id}', [ProductManagementController::class, 'destroy']);
    });
});
