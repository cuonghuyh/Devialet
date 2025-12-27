# Deploy Devialet Backend lên Byethost

## Bước 1: Chuẩn bị tài khoản Byethost

1. Đăng ký tài khoản tại: https://byet.host/
2. Tạo website mới
3. Lưu lại thông tin:
   - FTP Host
   - FTP Username
   - FTP Password
   - MySQL Database Name
   - MySQL Username
   - MySQL Password
   - MySQL Host

## Bước 2: Chuẩn bị files

### 2.1. Cài đặt dependencies trước

```bash
cd backend-php
composer install --no-dev --optimize-autoloader
```

### 2.2. Files cần upload

Upload **TẤT CẢ** các file trong thư mục `backend-php/` lên Byethost qua FTP:

```
htdocs/                    (thư mục gốc trên Byethost)
├── config/
├── core/
├── controllers/
├── middleware/
├── services/
├── routes/
├── public/
│   ├── index.php
│   └── .htaccess
├── vendor/               (từ composer install)
├── .env                  (CẤU HÌNH LẠI cho Byethost)
└── .htaccess            (redirect to public/)
```

**QUAN TRỌNG**: 
- Upload vào thư mục `htdocs` hoặc `public_html` (tùy hosting)
- Đảm bảo thư mục `vendor/` được upload đầy đủ

## Bước 3: Cấu hình .env cho Byethost

Cập nhật file `.env` với thông tin Byethost của bạn:

```env
APP_NAME=Devialet
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.byet.host

# Database - THAY ĐỔI theo thông tin Byethost
DB_HOST=sql123.byethost.com         # MySQL host từ Byethost
DB_PORT=3306
DB_DATABASE=b12_12345678_devialet   # Database name từ Byethost
DB_USERNAME=b12_12345678            # MySQL username từ Byethost
DB_PASSWORD=your-mysql-password     # MySQL password từ Byethost

# Session
SESSION_LIFETIME=120

# Mail - Sử dụng Gmail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="your-email@gmail.com"
MAIL_FROM_NAME="${APP_NAME}"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_VERIFY_SSL=true

# JWT Secret - ĐỔI THÀNH KEY KHÁC
JWT_SECRET=change-this-to-random-string-production
```

## Bước 4: Setup Database

### 4.1. Tạo database trên Byethost

1. Vào cPanel của Byethost
2. Vào MySQL Databases
3. Tạo database mới
4. Lưu lại thông tin database

### 4.2. Import database schema

1. Vào phpMyAdmin trên Byethost
2. Chọn database vừa tạo
3. Import file SQL từ Laravel backend: `backend/database/create_database.sql`

**Hoặc** tạo bảng thủ công với schema từ Laravel migrations.

## Bước 5: Cấu hình .htaccess

### File `.htaccess` ở thư mục gốc (htdocs/)

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

### File `public/.htaccess` (đã có sẵn)

Đã được tạo tự động, không cần sửa.

## Bước 6: Cấu hình CORS cho Frontend

Nếu frontend deploy riêng, cập nhật `config/app.php`:

```php
'allowed_origins' => [
    'https://your-frontend-domain.com',
    'http://localhost:5173',
],
```

## Bước 7: Test API

Truy cập:
- `https://your-domain.byet.host/api/products` - Test API
- `https://your-domain.byet.host/api/categories` - Test categories

## Bước 8: Deploy Frontend

### Cách 1: Deploy cùng backend

```bash
cd frontend
npm run build
```

Copy thư mục `dist/` vào `public/` của backend:
- `backend-php/public/assets/` - Copy assets
- `backend-php/public/index.html` - Copy index.html

### Cách 2: Deploy riêng (Vercel, Netlify)

Cập nhật `frontend/.env`:

```env
VITE_API_URL=https://your-backend.byet.host/api
```

## Lưu ý quan trọng

### ⚠️ Giới hạn của Byethost Free

1. **Bandwidth**: Giới hạn 1GB/tháng
2. **Storage**: 1GB
3. **Database**: 1 database, 5MB
4. **Execution time**: 30 giây
5. **Không có email SMTP riêng** - dùng Gmail

### 🔒 Bảo mật

1. Đổi `JWT_SECRET` thành chuỗi ngẫu nhiên mạnh
2. Set `APP_DEBUG=false` ở production
3. Không commit file `.env` lên Git
4. Sử dụng HTTPS (Byethost cung cấp free SSL)

### 🚀 Tối ưu

1. Bật OPcache trên Byethost (nếu có)
2. Sử dụng CDN cho static files
3. Optimize images trước khi upload
4. Minify code production

## Troubleshooting

### Lỗi 500 Internal Server Error

1. Kiểm tra file `.htaccess`
2. Kiểm tra permissions: 755 cho folders, 644 cho files
3. Xem error logs trong cPanel

### Lỗi database connection

1. Kiểm tra thông tin database trong `.env`
2. Đảm bảo MySQL host đúng (thường là `sqlXXX.byethost.com`)
3. Kiểm tra database đã được tạo

### Lỗi composer dependencies

Upload lại thư mục `vendor/` đầy đủ từ local đã chạy `composer install`

### API không hoạt động

1. Kiểm tra mod_rewrite enabled
2. Kiểm tra `.htaccess` trong public/
3. Test trực tiếp: `https://domain/public/index.php`

## FTP Upload Script (Optional)

Nếu muốn tự động hóa upload:

```bash
# Sử dụng FileZilla hoặc WinSCP
# Hoặc dùng lftp command line

lftp -u username,password ftp.byethost.com
cd htdocs
mirror -R backend-php/ ./
bye
```

## Hoàn tất!

Sau khi hoàn thành các bước trên, API của bạn sẽ chạy tại:
`https://your-domain.byet.host/api/`

Frontend có thể kết nối đến backend này để sử dụng.
