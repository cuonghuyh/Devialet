# 🚀 Hướng dẫn Deploy Devialet lên Byethost - Chi tiết từng bước

## 📋 Tổng quan

Bạn sẽ deploy backend PHP thuần lên **Byethost** (free hosting) và frontend lên **Vercel** (free).

---

## PHẦN 1: CHUẨN BỊ

### Bước 1: Đăng ký Byethost

1. Truy cập: https://byet.host/
2. Click **"Sign Up"**
3. Điền thông tin và tạo tài khoản
4. Xác nhận email
5. Tạo website mới (Free Hosting)

### Bước 2: Lấy thông tin Byethost

Sau khi tạo website, vào **cPanel** và lưu lại:

**FTP Info:**
- FTP Host: `ftpupload.net` hoặc `ftp.byethost.com`
- FTP Username: `b12_xxxxx`
- FTP Password: (password bạn đặt)

**MySQL Info:**
- MySQL Host: `sql123.byethost.com` (hoặc tương tự)
- Database Name: `b12_xxxxx_devialet`
- MySQL Username: `b12_xxxxx`
- MySQL Password: (password bạn đặt)

---

## PHẦN 2: CHUẨN BỊ FILES

### Bước 1: Chạy script chuẩn bị

**Trên Windows:**
```bash
cd backend-php
prepare-deploy.bat
```

**Trên Linux/Mac:**
```bash
cd backend-php
chmod +x prepare-deploy.sh
./prepare-deploy.sh
```

Script này sẽ tạo thư mục `deploy-byethost` với tất cả files cần thiết.

### Bước 2: Cấu hình .env

Mở file `deploy-byethost/.env` và **SUA THÔNG TIN SAU**:

```env
# Thay YOUR_DOMAIN bằng domain Byethost của bạn
APP_URL=https://devialet.byet.host

# Database - ĐIỀN THÔNG TIN TỪ BYETHOST
DB_HOST=sql123.byethost.com
DB_DATABASE=b12_12345678_devialet
DB_USERNAME=b12_12345678
DB_PASSWORD=your-mysql-password

# JWT Secret - ĐỔI THÀNH CHUỖI NGẪU NHIÊN
JWT_SECRET=abc123xyz456randomsecretkey789
```

**Cách tạo JWT_SECRET ngẫu nhiên:**
```bash
# Trên terminal
openssl rand -base64 32
```

Hoặc dùng: https://randomkeygen.com/

---

## PHẦN 3: SETUP DATABASE

### Bước 1: Tạo Database trên Byethost

1. Vào **cPanel** của Byethost
2. Tìm **MySQL Databases**
3. Tạo database mới tên `devialet` hoặc tương tự
4. Tạo user và gán quyền cho database
5. Lưu lại thông tin

### Bước 2: Import Database Schema

1. Vào **phpMyAdmin** trên Byethost cPanel
2. Chọn database vừa tạo
3. Click tab **Import**
4. Chọn file `backend/database/create_database.sql`
5. Click **Go**

**Hoặc** chạy SQL thủ công (copy/paste vào SQL tab):

```sql
-- Copy từ file backend/database/create_database.sql
-- Hoặc từ migrations của Laravel
```

---

## PHẦN 4: UPLOAD FILES LÊN BYETHOST

### Cách 1: Upload qua FileZilla (Khuyến nghị)

1. **Download FileZilla**: https://filezilla-project.org/
2. Kết nối FTP:
   - Host: `ftpupload.net`
   - Username: `b12_xxxxx`
   - Password: (mật khẩu của bạn)
   - Port: `21`

3. **Upload files:**
   - Bên trái (Local): Mở thư mục `deploy-byethost`
   - Bên phải (Remote): Vào thư mục `htdocs`
   - Chọn **TẤT CẢ** files/folders bên trái
   - Kéo thả qua bên phải
   - Đợi upload hoàn tất (có thể mất 10-30 phút)

### Cách 2: Upload qua File Manager

1. Vào **cPanel** → **File Manager**
2. Vào thư mục `htdocs`
3. Zip thư mục `deploy-byethost` thành file `.zip`
4. Upload file zip
5. Extract trên server
6. Di chuyển files ra ngoài `htdocs`

---

## PHẦN 5: CẤU HÌNH PERMISSIONS

Sau khi upload, set permissions cho files:

1. Vào **File Manager** trên cPanel
2. Chọn tất cả **folders**: Right click → **Permissions** → Set `755`
3. Chọn tất cả **files**: Right click → **Permissions** → Set `644`

**Quan trọng:**
- `htdocs/.htaccess` → 644
- `htdocs/public/.htaccess` → 644
- `htdocs/.env` → 644 (hoặc 640 cho bảo mật cao hơn)

---

## PHẦN 6: TEST API

### Test các endpoints:

1. **Test products:**
   ```
   https://devialet.byet.host/api/products
   ```

2. **Test categories:**
   ```
   https://devialet.byet.host/api/categories
   ```

3. **Test health check:**
   ```
   https://devialet.byet.host/public/index.php
   ```

**Nếu thấy lỗi 500:**
- Kiểm tra `.htaccess` files
- Kiểm tra permissions
- Xem error logs trong cPanel

**Nếu không load được:**
- Kiểm tra URL có đúng không
- Kiểm tra files đã upload đầy đủ chưa
- Thử truy cập trực tiếp: `/public/index.php`

---

## PHẦN 7: DEPLOY FRONTEND

### Cách 1: Deploy lên Vercel (Khuyến nghị)

1. **Cập nhật API URL:**

Sửa file `frontend/.env`:
```env
VITE_API_URL=https://devialet.byet.host/api
```

Hoặc tạo `frontend/.env.production`:
```env
VITE_API_URL=https://devialet.byet.host/api
```

2. **Push code lên GitHub:**
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/devialet-frontend.git
git push -u origin main
```

3. **Deploy trên Vercel:**
   - Truy cập: https://vercel.com/
   - Login with GitHub
   - Click **"New Project"**
   - Chọn repository `devialet-frontend`
   - Configure:
     - Framework: **Vite**
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL = https://devialet.byet.host/api
     ```
   - Click **Deploy**

### Cách 2: Deploy cùng Backend

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Copy files từ `dist/` sang backend:
```bash
# Copy toàn bộ dist vào public của backend
cp -r dist/* ../deploy-byethost/public/
```

3. Upload lại lên Byethost

Truy cập: `https://devialet.byet.host/`

---

## PHẦN 8: CẤU HÌNH CORS

Nếu frontend deploy riêng, cập nhật CORS trong backend:

File `deploy-byethost/config/app.php`:
```php
'allowed_origins' => [
    'https://devialet.vercel.app',  // Frontend URL
    'http://localhost:5173',
],
```

Upload lại file này lên Byethost.

---

## 🎯 CHECKLIST HOÀN THÀNH

- [ ] Đã đăng ký Byethost và có thông tin FTP, MySQL
- [ ] Đã chạy `prepare-deploy.bat` tạo package
- [ ] Đã cấu hình `.env` với thông tin Byethost
- [ ] Đã tạo database và import schema
- [ ] Đã upload tất cả files lên `htdocs`
- [ ] Đã set permissions cho files/folders
- [ ] API hoạt động: `/api/products` trả về data
- [ ] Đã deploy frontend (Vercel hoặc cùng backend)
- [ ] Frontend kết nối được với backend
- [ ] Test đăng ký/đăng nhập
- [ ] Test upload ảnh (Cloudinary)
- [ ] Test gửi email

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Giới hạn Byethost Free:
- ❌ **Không có Node.js** - Chỉ PHP
- ⏱️ **30 giây timeout** - API phải nhanh
- 💾 **1GB storage** - Đủ cho project này
- 🌐 **1GB bandwidth/month** - Hạn chế traffic
- 📧 **Không có SMTP riêng** - Dùng Gmail SMTP

### Nếu cần nhiều resource hơn:
- Nâng cấp Byethost premium ($3.99/tháng)
- Hoặc chuyển sang: Heroku, Railway, Render (có free tier)

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Database connection failed"
✅ Kiểm tra thông tin database trong `.env`
✅ Đảm bảo database đã được tạo
✅ Test kết nối MySQL qua phpMyAdmin

### Lỗi: "500 Internal Server Error"
✅ Kiểm tra `.htaccess` trong htdocs và public
✅ Xem error logs: cPanel → Error Logs
✅ Kiểm tra PHP version (cần PHP 8.0+)

### Lỗi: "vendor/autoload.php not found"
✅ Upload lại thư mục `vendor` đầy đủ
✅ Chạy `composer install` trước khi zip

### API không trả về JSON:
✅ Thêm `header('Content-Type: application/json');` trong index.php
✅ Kiểm tra CORS settings

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check error logs trong cPanel
2. Test từng endpoint riêng lẻ
3. Xem documentation: [DEPLOY-BYETHOST.md](DEPLOY-BYETHOST.md)

**Success!** 🎉 Dự án đã online tại:
- Backend: `https://devialet.byet.host/api/`
- Frontend: `https://devialet.vercel.app/`
