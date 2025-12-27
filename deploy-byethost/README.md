# Devialet E-Commerce - Pure PHP Backend

Backend API được viết hoàn toàn bằng PHP thuần (không sử dụng framework), thay thế cho Laravel backend.

## Tính năng

- ✅ Authentication (Register, Login, Logout, Email Verification, Password Reset)
- ✅ Product Management (CRUD)
- ✅ Category Management
- ✅ Order Management (Checkout, Order History)
- ✅ Review System
- ✅ Admin Dashboard
- ✅ User Management
- ✅ JWT Token Authentication
- ✅ Image Upload (Cloudinary)
- ✅ Email Service (PHPMailer)
- ✅ CORS Support

## Cấu trúc thư mục

```
backend-php/
├── config/           # Configuration files
│   ├── app.php
│   ├── database.php
│   ├── mail.php
│   └── cloudinary.php
├── core/            # Core system classes
│   ├── Database.php
│   ├── Router.php
│   ├── Request.php
│   ├── Response.php
│   ├── Validator.php
│   ├── JWT.php
│   ├── Session.php
│   └── Auth.php
├── middleware/      # Middleware classes
│   ├── AuthMiddleware.php
│   ├── AdminMiddleware.php
│   └── CorsMiddleware.php
├── controllers/     # Controller classes
│   ├── AuthController.php
│   ├── ProductController.php
│   ├── CategoryController.php
│   ├── OrderController.php
│   ├── ReviewController.php
│   ├── SettingsController.php
│   ├── ContactController.php
│   ├── PaymentCheckController.php
│   ├── AdminController.php
│   └── AdminProductController.php
├── services/        # Service classes
│   ├── MailService.php
│   └── CloudinaryService.php
├── routes/          # Route definitions
│   └── api.php
├── public/          # Public folder (document root)
│   ├── index.php
│   └── .htaccess
├── .env             # Environment variables
├── composer.json    # Composer dependencies
├── Dockerfile       # Docker configuration
└── README.md
```

## Yêu cầu hệ thống

- PHP >= 8.0
- MySQL >= 5.7
- Composer
- Apache với mod_rewrite enabled

## Cài đặt

### 1. Clone và cài đặt dependencies

```bash
cd backend-php
composer install
```

### 2. Cấu hình môi trường

Sao chép file `.env` và cập nhật thông tin:

```bash
cp .env.example .env
```

Cấu hình database, email, Cloudinary trong file `.env`

### 3. Import database

Sử dụng database schema từ Laravel backend hiện tại (các bảng giống nhau)

### 4. Chạy ứng dụng

#### Sử dụng PHP Built-in Server:

```bash
php -S localhost:8000 -t public
```

#### Sử dụng Apache:

Cấu hình virtual host trỏ DocumentRoot đến thư mục `public/`

#### Sử dụng Docker:

```bash
docker build -t devialet-php-backend .
docker run -p 8000:80 devialet-php-backend
```

## API Endpoints

### Authentication
- `POST /api/register` - Đăng ký
- `POST /api/login` - Đăng nhập
- `POST /api/logout` - Đăng xuất
- `POST /api/verify-email` - Xác thực email
- `POST /api/resend-verification-otp` - Gửi lại OTP
- `POST /api/forgot-password/send-otp` - Gửi OTP reset password
- `POST /api/forgot-password/verify-otp` - Xác thực OTP
- `POST /api/forgot-password/reset` - Reset password

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/{id}` - Chi tiết sản phẩm

### Categories
- `GET /api/categories` - Lấy danh sách danh mục

### Orders (Authenticated)
- `POST /api/orders/checkout` - Tạo đơn hàng
- `GET /api/orders` - Lịch sử đơn hàng
- `GET /api/orders/{id}` - Chi tiết đơn hàng

### Reviews (Authenticated)
- `GET /api/products/{id}/reviews` - Xem đánh giá
- `POST /api/reviews` - Tạo đánh giá
- `PUT /api/reviews/{id}` - Cập nhật đánh giá
- `DELETE /api/reviews/{id}` - Xóa đánh giá

### Admin (Admin only)
- `GET /api/admin/dashboard/stats` - Thống kê dashboard
- `GET /api/admin/products` - Quản lý sản phẩm
- `POST /api/admin/products` - Tạo sản phẩm
- `PUT /api/admin/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/admin/products/{id}` - Xóa sản phẩm
- `GET /api/admin/orders` - Quản lý đơn hàng
- `PATCH /api/admin/orders/{id}/status` - Cập nhật trạng thái
- `GET /api/admin/users` - Quản lý người dùng
- `GET /api/admin/reviews` - Quản lý đánh giá

## So sánh với Laravel

| Feature | Laravel | Pure PHP |
|---------|---------|----------|
| Framework | ✅ Laravel 12 | ❌ No framework |
| ORM | ✅ Eloquent | ❌ PDO |
| Routing | ✅ Built-in | ✅ Custom Router |
| Middleware | ✅ Built-in | ✅ Custom |
| Validation | ✅ Built-in | ✅ Custom Validator |
| Authentication | ✅ Sanctum | ✅ JWT |
| Email | ✅ Mail Facade | ✅ PHPMailer |
| File Upload | ✅ Storage | ✅ Cloudinary |
| Performance | Good | Better (lighter) |
| Code Size | Large | Smaller |
| Maintainability | Excellent | Good |

## Lưu ý

- Tất cả các chức năng từ Laravel backend đã được implement lại
- API endpoints giống hệt Laravel version
- Database schema không thay đổi
- Frontend không cần thay đổi gì cả
- Token authentication sử dụng JWT thay vì Sanctum

## License

MIT
