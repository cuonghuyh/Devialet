<?php

// Load environment variables
$dotenv = parse_ini_file(__DIR__ . '/../.env');
foreach ($dotenv as $key => $value) {
    $_ENV[$key] = $value;
}

// Autoload
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Validator.php';
require_once __DIR__ . '/../core/JWT.php';
require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../core/Auth.php';

// Middleware
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';

// Services
require_once __DIR__ . '/../services/MailService.php';
require_once __DIR__ . '/../services/CloudinaryService.php';

// Controllers
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../controllers/OrderController.php';
require_once __DIR__ . '/../controllers/ReviewController.php';
require_once __DIR__ . '/../controllers/SettingsController.php';
require_once __DIR__ . '/../controllers/ContactController.php';
require_once __DIR__ . '/../controllers/PaymentCheckController.php';
require_once __DIR__ . '/../controllers/AdminController.php';
require_once __DIR__ . '/../controllers/AdminProductController.php';

// Composer autoload for PHPMailer and Cloudinary
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

$router = new Router();

// Apply CORS middleware to all routes
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Public routes
$router->get('/products', [ProductController::class, 'index']);
$router->get('/products/{id}', [ProductController::class, 'show']);
$router->get('/categories', [CategoryController::class, 'index']);
$router->post('/contact', [ContactController::class, 'submit']);

// Payment routes
$router->get('/payment/check', [PaymentCheckController::class, 'check']);
$router->post('/payment/verify', [PaymentCheckController::class, 'verify']);

// Review routes (public viewing)
$router->get('/products/{id}/reviews', [ReviewController::class, 'index']);

// Authentication routes
$router->post('/register', [AuthController::class, 'signup']);
$router->post('/login', [AuthController::class, 'login']);
$router->post('/verify-email', [AuthController::class, 'verifyEmail']);
$router->post('/resend-verification-otp', [AuthController::class, 'resendVerificationOTP']);
$router->post('/forgot-password/send-otp', [AuthController::class, 'sendOTP']);
$router->post('/forgot-password/verify-otp', [AuthController::class, 'verifyOTP']);
$router->post('/forgot-password/reset', [AuthController::class, 'resetPassword']);

// Protected routes (require authentication)
$router->get('/user', function() {
    $user = Auth::user();
    unset($user['password']);
    Response::success(['user' => $user]);
})->middleware(AuthMiddleware::class);

$router->post('/logout', [AuthController::class, 'logout'])->middleware(AuthMiddleware::class);

// Settings routes
$router->post('/settings/profile', [SettingsController::class, 'updateProfile'])->middleware(AuthMiddleware::class);
$router->post('/settings/avatar', [SettingsController::class, 'uploadAvatar'])->middleware(AuthMiddleware::class);
$router->delete('/settings/avatar', [SettingsController::class, 'removeAvatar'])->middleware(AuthMiddleware::class);

// Order routes
$router->post('/orders/checkout', [OrderController::class, 'checkout'])->middleware(AuthMiddleware::class);
$router->get('/orders', [OrderController::class, 'getOrders'])->middleware(AuthMiddleware::class);
$router->get('/orders/{id}', [OrderController::class, 'getOrder'])->middleware(AuthMiddleware::class);

// Review routes (protected)
$router->post('/reviews', [ReviewController::class, 'store'])->middleware(AuthMiddleware::class);
$router->put('/reviews/{id}', [ReviewController::class, 'update'])->middleware(AuthMiddleware::class);
$router->delete('/reviews/{id}', [ReviewController::class, 'destroy'])->middleware(AuthMiddleware::class);
$router->get('/products/{id}/my-review', [ReviewController::class, 'checkUserReview'])->middleware(AuthMiddleware::class);
$router->get('/reviews/reviewable-products', [ReviewController::class, 'getReviewableProducts'])->middleware(AuthMiddleware::class);
$router->get('/reviews/my-reviewed-products', [ReviewController::class, 'getMyReviewedProducts'])->middleware(AuthMiddleware::class);

// Admin routes
$router->get('/admin/dashboard/stats', [AdminController::class, 'getDashboardStats'])->middleware(AdminMiddleware::class);

// Admin product management
$router->get('/admin/products', [AdminProductController::class, 'index'])->middleware(AdminMiddleware::class);
$router->post('/admin/products', [AdminProductController::class, 'store'])->middleware(AdminMiddleware::class);
$router->get('/admin/products/{id}', [AdminProductController::class, 'show'])->middleware(AdminMiddleware::class);
$router->put('/admin/products/{id}', [AdminProductController::class, 'update'])->middleware(AdminMiddleware::class);
$router->post('/admin/products/{id}', [AdminProductController::class, 'update'])->middleware(AdminMiddleware::class);
$router->delete('/admin/products/{id}', [AdminProductController::class, 'destroy'])->middleware(AdminMiddleware::class);
$router->patch('/admin/products/{id}/stock', [AdminProductController::class, 'updateStock'])->middleware(AdminMiddleware::class);

// Admin order management
$router->get('/admin/orders', [AdminController::class, 'getOrders'])->middleware(AdminMiddleware::class);
$router->patch('/admin/orders/{id}/status', [AdminController::class, 'updateOrderStatus'])->middleware(AdminMiddleware::class);
$router->delete('/admin/orders/{id}', [AdminController::class, 'deleteOrder'])->middleware(AdminMiddleware::class);

// Admin user management
$router->get('/admin/users', [AdminController::class, 'getUsers'])->middleware(AdminMiddleware::class);

// Admin review management
$router->get('/admin/reviews', [AdminController::class, 'getReviews'])->middleware(AdminMiddleware::class);
$router->delete('/admin/reviews/{id}', [AdminController::class, 'deleteReview'])->middleware(AdminMiddleware::class);

// Dispatch router
$router->dispatch();
