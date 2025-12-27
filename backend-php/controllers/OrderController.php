<?php

class OrderController
{
    private $db;
    private $request;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->request = new Request();
    }

    public function checkout()
    {
        $data = $this->request->all();
        
        $this->request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_address' => 'required|string',
            'customer_email' => 'nullable|email|max:255',
            'payment_method' => 'required|in:cod,bank_transfer,credit_card,momo,vietqr',
            'note' => 'nullable|string',
            'cart_items' => 'required|array',
        ]);

        $cartItems = $data['cart_items'];
        
        if (empty($cartItems)) {
            Response::error('Cart is empty', 400);
        }

        try {
            $this->db->beginTransaction();

            $user = Auth::user();
            $orderItems = [];
            $subtotal = 0;

            // Validate products and stock
            foreach ($cartItems as $item) {
                if (!isset($item['productId']) || !isset($item['quantity'])) {
                    throw new Exception('Invalid cart item format');
                }

                $product = $this->db->fetch("SELECT * FROM products WHERE id = ?", [$item['productId']]);
                
                if (!$product) {
                    throw new Exception('Product not found');
                }

                if ($product['stock'] < $item['quantity']) {
                    throw new Exception("Product {$product['name']} is out of stock. Available: {$product['stock']}");
                }

                $price = $product['discount_price'] ?? $product['price'];
                $itemSubtotal = $price * $item['quantity'];
                $subtotal += $itemSubtotal;

                $orderItems[] = [
                    'product' => $product,
                    'price' => $price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $itemSubtotal,
                ];
            }

            $shippingFee = 0;
            $total = $subtotal + $shippingFee;

            // Determine payment status
            $paymentStatus = in_array($data['payment_method'], ['vietqr', 'momo']) ? 'paid' : 'unpaid';

            // Generate order number
            $orderNumber = 'ORD' . strtoupper(uniqid());

            // Create order
            $this->db->execute(
                "INSERT INTO orders (user_id, order_number, customer_name, customer_phone, customer_address, customer_email, subtotal, shipping_fee, total, payment_method, status, payment_status, note, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW(), NOW())",
                [
                    $user['id'],
                    $orderNumber,
                    $data['customer_name'],
                    $data['customer_phone'],
                    $data['customer_address'],
                    $data['customer_email'] ?? $user['email'],
                    $subtotal,
                    $shippingFee,
                    $total,
                    $data['payment_method'],
                    $paymentStatus,
                    $data['note'] ?? null
                ]
            );

            $orderId = $this->db->lastInsertId();

            // Create order items and update stock
            foreach ($orderItems as $item) {
                $this->db->execute(
                    "INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal, created_at, updated_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
                    [
                        $orderId,
                        $item['product']['id'],
                        $item['product']['name'],
                        $item['price'],
                        $item['quantity'],
                        $item['subtotal']
                    ]
                );

                // Update product stock
                $this->db->execute(
                    "UPDATE products SET stock = stock - ?, updated_at = NOW() WHERE id = ?",
                    [$item['quantity'], $item['product']['id']]
                );
            }

            $this->db->commit();

            // Get created order with items
            $order = $this->db->fetch("SELECT * FROM orders WHERE id = ?", [$orderId]);
            $items = $this->db->fetchAll("SELECT * FROM order_items WHERE order_id = ?", [$orderId]);

            Response::success([
                'order' => array_merge($order, ['items' => $items])
            ], 'Order created successfully!', 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::error($e->getMessage(), 400);
        }
    }

    public function getOrders()
    {
        $user = Auth::user();

        $orders = $this->db->fetchAll(
            "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
            [$user['id']]
        );

        // Get items for each order
        foreach ($orders as &$order) {
            $order['items'] = $this->db->fetchAll(
                "SELECT * FROM order_items WHERE order_id = ?",
                [$order['id']]
            );
        }

        Response::success(['orders' => $orders]);
    }

    public function getOrder($id)
    {
        $user = Auth::user();

        $order = $this->db->fetch(
            "SELECT * FROM orders WHERE id = ? AND user_id = ?",
            [$id, $user['id']]
        );

        if (!$order) {
            Response::notFound('Order not found');
        }

        $order['items'] = $this->db->fetchAll(
            "SELECT oi.*, p.image_url 
             FROM order_items oi 
             LEFT JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?",
            [$id]
        );

        Response::success(['order' => $order]);
    }
}
