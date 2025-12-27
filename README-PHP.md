# Devialet E-Commerce - PHP Pure Backend Version

Dự án đã được chuyển đổi hoàn toàn từ Laravel sang **PHP thuần** (Pure PHP).

## 📁 Cấu trúc dự án

```
Devialet/
├── backend/              # Laravel backend (CŨ - không dùng nữa)
├── backend-php/          # PHP thuần backend (MỚI - đang dùng)
│   ├── config/          # Cấu hình
│   ├── core/            # Core classes (Database, Router, Auth, JWT...)
│   ├── controllers/     # Controllers
│   ├── middleware/      # Middleware
│   ├── services/        # Services (Mail, Cloudinary)
│   ├── routes/          # Routes
│   └── public/          # Entry point
├── frontend/            # React frontend (không thay đổi)
└── docker-compose-php.yml  # Docker config cho PHP backend
```

## 🚀 Chạy dự án

### Cách 1: Docker (Khuyến nghị)

```bash
# Chạy với PHP backend mới
docker-compose -f docker-compose-php.yml up -d

# Hoặc build lại nếu có thay đổi
docker-compose -f docker-compose-php.yml up -d --build
```

### Cách 2: Chạy local

```bash
# Backend PHP
cd backend-php
composer install
php -S localhost:8000 -t public

# Frontend
cd frontend
npm install
npm run dev
```

## 🔗 Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **phpMyAdmin**: http://localhost:8080 (root/secret)

## ✨ Những gì đã thay đổi

### Backend
- ❌ **Loại bỏ**: Laravel Framework, Eloquent ORM, Sanctum
- ✅ **Thay thế**: Pure PHP, PDO, Custom Router, JWT Authentication
- ✅ **Giữ nguyên**: Tất cả API endpoints, chức năng, database schema

### Frontend
- ✅ **Không thay đổi gì**: Vẫn hoạt động bình thường với backend mới

## 📊 So sánh

| Tính năng | Laravel | PHP Thuần |
|-----------|---------|-----------|
| Kích thước | ~100MB | ~10MB |
| Dependencies | 50+ packages | 2 packages |
| Performance | Good | Excellent |
| Memory usage | High | Low |
| Complexity | High | Medium |
| API endpoints | 100% | 100% |

## 🔧 Cấu hình

Cập nhật file `backend-php/.env`:

```env
DB_HOST=127.0.0.1 (hoặc db nếu dùng Docker)
DB_DATABASE=devialet_shop
DB_USERNAME=root
DB_PASSWORD=secret (hoặc mysql)

MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

## 📝 Ghi chú

1. **Database**: Sử dụng cùng database với Laravel backend
2. **API**: Tất cả endpoints giống hệt nhau
3. **Authentication**: Chuyển từ Sanctum sang JWT
4. **Frontend**: Không cần sửa code gì

## 🐛 Troubleshooting

### Lỗi kết nối database
```bash
# Kiểm tra MySQL đang chạy
docker ps

# Xem logs
docker-compose -f docker-compose-php.yml logs db
```

### Lỗi composer
```bash
cd backend-php
composer install --ignore-platform-reqs
```

### Reset lại dự án
```bash
docker-compose -f docker-compose-php.yml down -v
docker-compose -f docker-compose-php.yml up -d --build
```

## 📧 Support

Nếu có vấn đề, kiểm tra:
1. Docker đang chạy
2. Port 8000, 5173, 3306, 8080 không bị chiếm
3. File `.env` đã cấu hình đúng
4. Database đã được import

---

**Lưu ý**: Backend Laravel cũ vẫn còn trong thư mục `backend/` để tham khảo, nhưng không được sử dụng nữa.
