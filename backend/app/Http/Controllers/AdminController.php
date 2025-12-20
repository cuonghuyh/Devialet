<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\ProductReview;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Lấy thống kê tổng quan
     */
    public function getDashboardStats()
    {
        $totalOrders = Order::count();
        $totalRevenue = Order::where('status', 'delivered')->sum('total');
        $totalProducts = Product::count();
        $totalUsers = User::where('role', 'user')->count();
        $pendingOrders = Order::where('status', 'pending')->count();
        
        // Doanh thu theo tháng (6 tháng gần nhất)
        $revenueByMonth = Order::where('status', 'delivered')
            ->where('created_at', '>=', now()->subMonths(6))
            ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, SUM(total) as revenue')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        // Sản phẩm bán chạy
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'delivered')
            ->select('products.id', 'products.name', 'products.image_url', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('products.id', 'products.name', 'products.image_url')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();

        // Đơn hàng gần đây
        $recentOrders = Order::with('user', 'items')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'total' => $order->total,
                    'status' => $order->status,
                    'created_at' => $order->created_at->format('d/m/Y H:i'),
                    'items_count' => $order->items->count(),
                ];
            });

        return response()->json([
            'stats' => [
                'total_orders' => $totalOrders,
                'total_revenue' => round($totalRevenue, 2),
                'total_products' => $totalProducts,
                'total_users' => $totalUsers,
                'pending_orders' => $pendingOrders,
            ],
            'revenue_by_month' => $revenueByMonth,
            'top_products' => $topProducts,
            'recent_orders' => $recentOrders,
        ]);
    }

    /**
     * Lấy danh sách đơn hàng với filter
     */
    public function getOrders(Request $request)
    {
        $query = Order::with('user', 'items.product');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($orders);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đơn hàng thành công',
            'order' => $order,
        ]);
    }

    /**
     * Lấy danh sách người dùng
     */
    public function getUsers(Request $request)
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($users);
    }

    /**
     * Xóa đánh giá
     */
    public function deleteReview($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa đánh giá thành công',
        ]);
    }

    /**
     * Lấy danh sách đánh giá
     */
    public function getReviews(Request $request)
    {
        $query = ProductReview::with('user', 'product');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $reviews = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($reviews);
    }
}
