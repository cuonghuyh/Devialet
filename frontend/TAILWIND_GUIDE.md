# Hướng dẫn sử dụng Tailwind CSS

## ✅ Đã cài đặt thành công

Tailwind CSS đã được cài đặt và cấu hình cho dự án của bạn.

## 📁 Files đã tạo/cập nhật

- `tailwind.config.js` - Cấu hình Tailwind
- `postcss.config.js` - Cấu hình PostCSS
- `src/index.css` - Đã thêm Tailwind directives

## 🎨 Cách sử dụng

### 1. Sử dụng Tailwind classes trong JSX

```jsx
// Thay vì viết CSS riêng
<div className="container">
  <h1 className="title">Hello World</h1>
</div>

// Dùng Tailwind utility classes
<div className="max-w-7xl mx-auto px-4">
  <h1 className="text-4xl font-bold text-blue-600">Hello World</h1>
</div>
```

### 2. Ví dụ thực tế

```jsx
// Button component
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click Me
</button>

// Card component
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
  <h2 className="text-2xl font-semibold mb-4">Card Title</h2>
  <p className="text-gray-600">Card content goes here</p>
</div>

// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="bg-gray-100 p-4">Item 1</div>
  <div className="bg-gray-100 p-4">Item 2</div>
  <div className="bg-gray-100 p-4">Item 3</div>
</div>

// Flexbox Layout
<div className="flex items-center justify-between p-4">
  <span>Left Content</span>
  <span>Right Content</span>
</div>
```

### 3. Responsive Design

```jsx
// Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
<div className="text-sm md:text-base lg:text-lg xl:text-xl">
  Responsive Text
</div>

<div className="hidden md:block">
  Hiển thị trên màn hình lớn hơn
</div>

<div className="block md:hidden">
  Chỉ hiển thị trên mobile
</div>
```

### 4. Custom Colors (đã cấu hình)

```jsx
<div className="bg-primary-500 text-white">
  Custom Primary Color
</div>

<div className="text-primary-700 hover:text-primary-900">
  Primary Color Text
</div>
```

## 🚀 Bắt đầu migrate CSS hiện tại

### Ví dụ Migration:

**Trước (CSS cũ):**
```css
.navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-link {
  color: #374151;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.3s;
}

.nav-link:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}
```

**Sau (Tailwind):**
```jsx
<nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
  <a href="/" className="text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-all duration-300">
    Link
  </a>
</nav>
```

## 💡 Tips & Best Practices

1. **Sử dụng `@apply` cho component phức tạp**
```css
/* src/index.css */
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
}
```

2. **Tổ chức classes với clsx hoặc classnames**
```bash
npm install clsx
```

```jsx
import clsx from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded-md font-medium',
  isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
  Button
</button>
```

3. **Sử dụng Tailwind IntelliSense Extension**
   - Cài extension "Tailwind CSS IntelliSense" trong VS Code
   - Autocomplete cho classes
   - Hover để xem CSS tương ứng

## 🎯 Kế hoạch Migration

1. ✅ Cài đặt Tailwind CSS
2. 🔄 Migrate từng component một
3. 🗑️ Xóa CSS files cũ khi đã migrate xong
4. 🎨 Tối ưu hóa và tùy chỉnh theme

## 📚 Tài liệu tham khảo

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Tailwind Play (Playground)](https://play.tailwindcss.com/)

## 🔧 Chạy development server

```bash
npm run dev
```

Tailwind sẽ tự động compile các classes bạn sử dụng trong quá trình development!
