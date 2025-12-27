<?php

class AdminController
{
    private $db;
    private $request;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->request = new Request();
    }

    public function getDashboardStats()
    {
        $totalOrders = $this->db->fetch("SELECT COUNT(*) as count FROM orders")['count'];
        $totalRevenue = $this->db->fetch("SELECT SUM(total) as total FROM orders WHERE status = 'delivered'")['total'] ?? 0;
        $totalProducts = $this->db->fetch("SELECT COUNT(*) as count FROM products")['count'];
        $totalUsers = $this->db->fetch("SELECT COUNT(*) as count FROM users WHERE role = 'user'")['count'];
        $pendingOrders = $this->db->fetch("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'")['count'];

        // Revenue by month (last 6 months)
        $revenueByMonth = $this->db->fetchAll(
            "SELECT MONTH(created_at) as month, YEAR(created_at) as year, SUM(total) as revenue 
             FROM orders 
             WHERE status = 'delivered' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY year, month 
             ORDER BY year DESC, month DESC"
        );

        // Top products
        $topProducts = $this->db->fetchAll(
            "SELECT p.id, p.name, p.image_url, SUM(oi.quantity) as total_sold 
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN orders o ON oi.order_id = o.id
             WHERE o.status = 'delivered'
             GROUP BY p.id, p.name, p.image_url
             ORDER BY total_sold DESC
             LIMIT 5"
        );

        // Recent orders
        $recentOrders = $this->db->fetchAll(
            "SELECT o.id, o.order_number, o.customer_name, o.total, o.status, o.created_at,
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
             FROM orders o
             ORDER BY o.created_at DESC
             LIMIT 10"
        );

        $formattedOrders = array_map(function($order) {
            return [
                'id' => $order['id'],
                'order_number' => $order['order_number'],
                'customer_name' => $order['customer_name'],
                'total' => $order['total'],
                'status' => $order['status'],
                'created_at' => date('d/m/Y H:i', strtotime($order['created_at'])),
                'items_count' => $order['items_count'],
            ];
        }, $recentOrders);

        Response::success([
            'stats' => [
                'total_orders' => $totalOrders,
                'total_revenue' => round($totalRevenue, 2),
                'total_products' => $totalProducts,
                'total_users' => $totalUsers,
                'pending_orders' => $pendingOrders,
            ],
            'revenue_by_month' => $revenueByMonth,
            'top_products' => $topProducts,
            'recent_orders' => $formattedOrders,
        ]);
    }

    public function getOrders()
    {
        $status = $this->request->get('status');
        $search = $this->request->get('search');
        $perPage = $this->request->get('per_page', 20);
        $page = $this->request->get('page', 1);
        $offset = ($page - 1) * $perPage;

        $sql = "SELECT * FROM orders WHERE 1=1";
        $params = [];

        if ($status && $status !== 'all') {
            $sql .= " AND status = ?";
            $params[] = $status;
        }

        if ($search) {
            $sql .= " AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $countSql = "SELECT COUNT(*) as total FROM orders WHERE 1=1";
        $countParams = $params;
        
        if ($status && $status !== 'all') {
            $countSql .= " AND status = ?";
        }
        if ($search) {
            $countSql .= " AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)";
        }

        $total = $this->db->fetch($countSql, $countParams)['total'];

        $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = (int)$perPage;
        $params[] = (int)$offset;

        $orders = $this->db->fetchAll($sql, $params);

        // Get items for each order
        foreach ($orders as &$order) {
            $order['items'] = $this->db->fetchAll(
                "SELECT * FROM order_items WHERE order_id = ?",
                [$order['id']]
            );
        }

        Response::success([
            'data' => $orders,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
        ]);
    }

    public function updateOrderStatus($id)
    {
        $data = $this->request->all();

        $this->request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $order = $this->db->fetch("SELECT * FROM orders WHERE id = ?", [$id]);
        
        if (!$order) {
            Response::notFound('Order not found');
        }

        $this->db->execute(
            "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?",
            [$data['status'], $id]
        );

        $updatedOrder = $this->db->fetch("SELECT * FROM orders WHERE id = ?", [$id]);

        Response::success([
            'order' => $updatedOrder
        ], 'Cập nhật trạng thái đơn hàng thành công');
    }

    public function deleteOrder($id)
    {
        $order = $this->db->fetch("SELECT * FROM orders WHERE id = ?", [$id]);
        
        if (!$order) {
            Response::notFound('Order not found');
        }

        try {
            $this->db->beginTransaction();

            // Restore product stock
            $items = $this->db->fetchAll("SELECT * FROM order_items WHERE order_id = ?", [$id]);
            
            foreach ($items as $item) {
                $this->db->execute(
                    "UPDATE products SET stock = stock + ?, updated_at = NOW() WHERE id = ?",
                    [$item['quantity'], $item['product_id']]
                );
            }

            // Delete order items
            $this->db->execute("DELETE FROM order_items WHERE order_id = ?", [$id]);

            // Delete order
            $this->db->execute("DELETE FROM orders WHERE id = ?", [$id]);

            $this->db->commit();

            Response::success([], 'Xóa đơn hàng thành công');

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::error('Failed to delete order', 500);
        }
    }

    public function getUsers()
    {
        $search = $this->request->get('search');

        $sql = "SELECT id, first_name, last_name, email, phone, avatar, role, created_at FROM users WHERE 1=1";
        $params = [];

        if ($search) {
            $sql .= " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $sql .= " ORDER BY created_at DESC";

        $users = $this->db->fetchAll($sql, $params);

        $formattedUsers = array_map(function($user) {
            return [
                'id' => $user['id'],
                'name' => trim($user['first_name'] . ' ' . $user['last_name']),
                'email' => $user['email'],
                'phone' => $user['phone'],
                'avatar' => $user['avatar'],
                'role' => $user['role'],
                'created_at' => $user['created_at'],
            ];
        }, $users);

        Response::success(['data' => $formattedUsers]);
    }

    public function getReviews()
    {
        $productId = $this->request->get('product_id');
        $perPage = $this->request->get('per_page', 20);
        $page = $this->request->get('page', 1);
        $offset = ($page - 1) * $perPage;

        $sql = "SELECT r.*, u.first_name, u.last_name, u.email, p.name as product_name 
                FROM product_reviews r
                JOIN users u ON r.user_id = u.id
                JOIN products p ON r.product_id = p.id
                WHERE 1=1";
        $params = [];

        if ($productId) {
            $sql .= " AND r.product_id = ?";
            $params[] = $productId;
        }

        $countSql = str_replace("r.*, u.first_name, u.last_name, u.email, p.name as product_name", "COUNT(*) as total", $sql);
        $total = $this->db->fetch($countSql, $params)['total'];

        $sql .= " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
        $params[] = (int)$perPage;
        $params[] = (int)$offset;

        $reviews = $this->db->fetchAll($sql, $params);

        Response::success([
            'data' => $reviews,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
        ]);
    }

    public function deleteReview($id)
    {
        $review = $this->db->fetch("SELECT * FROM product_reviews WHERE id = ?", [$id]);
        
        if (!$review) {
            Response::notFound('Review not found');
        }

        $this->db->execute("DELETE FROM product_reviews WHERE id = ?", [$id]);

        Response::success([], 'Xóa đánh giá thành công');
    }
}
