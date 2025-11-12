# 🚀 Quick Start Guide

## Bắt đầu nhanh với Devialet E-Commerce

### 📋 Prerequisites Checklist

- [ ] PHP 8.x installed
- [ ] Composer installed
- [ ] Node.js 18+ & npm installed
- [ ] MySQL running
- [ ] Code editor (VS Code recommended)

---

## ⚡ Setup trong 5 phút

### 1️⃣ Backend Setup (2 phút)

```bash
# Cài dependencies
composer install

# Copy .env
cp .env.example .env
php artisan key:generate

# Tạo database 'devialet' trong MySQL

# Chạy migrations
php artisan migrate --seed

# Start server
php artisan serve
```

✅ Backend ready tại: **http://localhost:8000**

---

### 2️⃣ Frontend Setup (3 phút)

```bash
# Vào thư mục frontend
cd frontend

# Cài dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend ready tại: **http://localhost:5174**

---

## 🎯 Test Application

### Đăng nhập với test account

Nếu đã chạy seeder, bạn có thể đăng nhập với:

**Admin Account:**
- Email: `admin@devialet.com`
- Password: `password`

**User Account:**
- Email: `user@devialet.com`
- Password: `password`

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5174 | React SPA |
| Backend API | http://localhost:8000/api | Laravel API |
| Tailwind Demo | http://localhost:5174/demo | UI Components |

---

## 📱 Quick Tour

### For Users:
1. Go to http://localhost:5174
2. Browse products
3. Add to cart
4. Login/Register
5. Checkout

### For Admins:
1. Login with admin account
2. Go to `/admin`
3. Manage products, categories, orders

---

## 🎨 Tailwind CSS

Dự án đã được setup với **Tailwind CSS v4**!

📖 Xem hướng dẫn: `frontend/TAILWIND_GUIDE.md`  
🎨 Xem demo: http://localhost:5174/demo

### Example Usage:

```jsx
// Button với Tailwind
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click Me
</button>

// Card với Tailwind
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
  <h2 className="text-2xl font-semibold mb-4">Card Title</h2>
  <p className="text-gray-600">Content here</p>
</div>
```

---

## 🛠️ Development Workflow

### Terminal 1 - Backend
```bash
php artisan serve
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Make changes:
- Backend: Edit files in `app/`, `routes/`, etc.
- Frontend: Edit files in `frontend/src/`
- Vite auto-reload on save ✨

---

## 📝 Useful Commands

### Backend
```bash
# Tạo migration mới
php artisan make:migration create_table_name

# Tạo model
php artisan make:model ModelName -m

# Tạo controller
php artisan make:controller ControllerName

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Frontend
```bash
# Install new package
npm install package-name

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🐛 Troubleshooting

### Backend không chạy?
- Check PHP version: `php -v`
- Check database connection trong `.env`
- Run: `composer install`

### Frontend không chạy?
- Check Node version: `node -v`
- Delete `node_modules` và run `npm install`
- Check port 5174 không bị chiếm

### CORS errors?
- Check `config/cors.php`
- Đảm bảo backend đang chạy

### Tailwind classes không hoạt động?
- Restart dev server
- Check `tailwind.config.js` content paths
- Run `npm run dev` lại

---

## 📚 Documentation

- 📖 [Main README](README.md) - Project overview
- 🧹 [Cleanup Summary](CLEANUP_SUMMARY.md) - What was removed
- 🎨 [Tailwind Guide](frontend/TAILWIND_GUIDE.md) - CSS framework
- 💡 [Tailwind Setup](frontend/TAILWIND_INSTALLED.md) - Installation info

---

## 🎓 Learning Resources

### Laravel
- [Laravel Docs](https://laravel.com/docs)
- [Laravel API](https://laravel.com/api/master)

### React
- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)

### Zustand (State Management)
- [Zustand Docs](https://zustand-demo.pmnd.rs)

---

## 🚀 Next Steps

1. ✅ Setup complete
2. 🎨 Explore Tailwind demo at `/demo`
3. 📝 Read documentation files
4. 🔧 Start customizing
5. 🚢 Build your features!

---

**Happy Coding! 🎉**

Need help? Check the documentation files or review the code structure.
