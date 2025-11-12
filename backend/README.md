# Devialet E-Commerce Platform

Modern full-stack e-commerce application with Laravel API backend and React frontend.

## 🏗️ Architecture

### Backend - Laravel API
RESTful API server built with Laravel 12.x

**Tech Stack:**
- PHP 8.x
- Laravel 12.x
- MySQL Database
- Sanctum Authentication
- Cloudinary Image Storage

**Location:** Root directory (`/`)

### Frontend - React SPA
Single Page Application with modern React

**Tech Stack:**
- React 19.x
- Vite
- Tailwind CSS v4
- Zustand (State Management)
- React Router v7
- Axios

**Location:** `/frontend` directory

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.x
- Composer
- Node.js 18+ & npm
- MySQL

### Backend Setup

1. **Install dependencies**
```bash
composer install
```

2. **Environment configuration**
```bash
cp .env.example .env
php artisan key:generate
```

3. **Configure database in `.env`**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=devialet
DB_USERNAME=root
DB_PASSWORD=
```

4. **Run migrations**
```bash
php artisan migrate --seed
```

5. **Start Laravel server**
```bash
php artisan serve
# API: http://localhost:8000
```

### Frontend Setup

1. **Navigate to frontend**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start dev server**
```bash
npm run dev
# Frontend: http://localhost:5174
```

---

## 📁 Project Structure

```
Devialet/
├── app/                    # Laravel Application
│   ├── Http/
│   │   ├── Controllers/   # API Controllers
│   │   └── Middleware/    # Custom Middleware
│   ├── Models/            # Eloquent Models
│   └── Services/          # Business Logic
├── config/                # Laravel Configuration
├── database/
│   ├── migrations/        # Database Migrations
│   └── seeders/          # Database Seeders
├── frontend/             # React Application
│   ├── src/
│   │   ├── components/   # Reusable Components
│   │   ├── pages/        # Page Components
│   │   ├── store/        # Zustand Stores
│   │   ├── styles/       # CSS Files
│   │   └── utils/        # Utility Functions
│   ├── public/           # Static Assets
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── routes/
│   ├── api.php           # API Routes
│   └── web.php
├── storage/              # File Storage
└── public/               # Laravel Public
```

---

## 🎯 Features

### Customer Features
- ✅ User Authentication (Register/Login/OTP)
- ✅ Product Browsing & Search
- ✅ Shopping Cart
- ✅ Order Management
- ✅ User Profile & Settings
- ✅ Contact Form

### Admin Features
- ✅ Product Management (CRUD)
- ✅ Category Management
- ✅ Order Management
- ✅ User Management
- ✅ Image Upload (Cloudinary)

---

## 🛠️ Development

### API Endpoints
Base URL: `http://localhost:8000/api`

**Authentication:**
- POST `/register` - User registration
- POST `/login` - User login
- POST `/logout` - User logout

**Products:**
- GET `/products` - List all products
- GET `/products/{id}` - Get product details
- POST `/products` - Create product (Admin)
- PUT `/products/{id}` - Update product (Admin)
- DELETE `/products/{id}` - Delete product (Admin)

**Cart:**
- GET `/cart` - Get user cart
- POST `/cart` - Add to cart
- PUT `/cart/{id}` - Update cart item
- DELETE `/cart/{id}` - Remove from cart

**Orders:**
- GET `/orders` - Get user orders
- POST `/orders` - Create order
- GET `/orders/{id}` - Get order details

### Frontend Routes
Base URL: `http://localhost:5174`

- `/` - Home Page
- `/products` - Products Listing
- `/products/:id` - Product Detail
- `/cart` - Shopping Cart
- `/orders` - Order History
- `/admin` - Admin Dashboard
- `/login` - Login Page
- `/signup` - Registration
- `/settings` - User Settings
- `/demo` - Tailwind CSS Demo

---

## 🎨 Styling with Tailwind CSS

This project uses Tailwind CSS v4 for styling. Check the guides:
- `frontend/TAILWIND_GUIDE.md` - Complete usage guide
- `frontend/TAILWIND_INSTALLED.md` - Installation details
- `/demo` route - Live component examples

---

## 🧪 Testing

### Backend Tests
```bash
php artisan test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 🚢 Production Build

### Frontend Build
```bash
cd frontend
npm run build
```

Build output will be in `frontend/dist/`

---

## 📝 Documentation Files

- `CLEANUP_SUMMARY.md` - Project cleanup history
- `frontend/TAILWIND_GUIDE.md` - Tailwind CSS usage guide
- `frontend/TAILWIND_INSTALLED.md` - Tailwind installation details
- `frontend/README.md` - Frontend specific docs

---

## 🔐 Security

- CSRF Protection
- Sanctum Token Authentication
- XSS Prevention
- SQL Injection Protection (Eloquent ORM)
- CORS Configuration

---

## 📧 Contact

For questions or support, use the contact form in the application.

---

## 📄 License

This project is proprietary software.

---

**Built with ❤️ using Laravel & React**
