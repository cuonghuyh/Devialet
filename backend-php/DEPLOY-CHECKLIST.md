# Quick Deploy Checklist

## ✅ Trước khi deploy

- [ ] Chạy `composer install --no-dev --optimize-autoloader`
- [ ] Test local xem API hoạt động chưa
- [ ] Chuẩn bị thông tin Byethost (database, FTP)
- [ ] Đổi JWT_SECRET trong .env.production

## 📦 Upload files

- [ ] Upload tất cả files trong `deploy-byethost/` lên `htdocs/`
- [ ] Kiểm tra thư mục `vendor/` đã upload đầy đủ
- [ ] Kiểm tra file `.env` có đúng thông tin

## 🗄️ Database

- [ ] Tạo database trên Byethost cPanel
- [ ] Import schema từ `backend/database/create_database.sql`
- [ ] Test kết nối database

## 🔧 Cấu hình

- [ ] Cập nhật `.env` với thông tin database Byethost
- [ ] Cập nhật APP_URL trong `.env`
- [ ] Set APP_DEBUG=false
- [ ] Đổi JWT_SECRET

## 🧪 Testing

- [ ] Test API: `https://domain.byet.host/api/products`
- [ ] Test login/register
- [ ] Test upload ảnh (Cloudinary)
- [ ] Test gửi email

## 🎯 Frontend

- [ ] Cập nhật API URL trong frontend
- [ ] Build frontend: `npm run build`
- [ ] Deploy frontend (Vercel/Netlify hoặc cùng backend)

## 📝 Ghi chú

**Database info từ Byethost:**
- Host: ___________________
- Database: ___________________
- Username: ___________________
- Password: ___________________

**FTP info:**
- Host: ___________________
- Username: ___________________
- Password: ___________________

**Deployment URL:**
- Backend: https://___________________
- Frontend: https://___________________
