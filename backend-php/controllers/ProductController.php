<?php

class ProductController
{
    private $db;
    private $request;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->request = new Request();
    }

    public function index()
    {
        $filter = $this->request->get('filter');
        $search = $this->request->get('search');

        $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE 1=1";
        
        $params = [];

        // Filter by category
        if ($filter) {
            $category = $this->db->fetch("SELECT id FROM categories WHERE slug = ?", [$filter]);
            if ($category) {
                $sql .= " AND p.category_id = ?";
                $params[] = $category['id'];
            }
        }

        // Search
        if ($search) {
            $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $sql .= " ORDER BY p.created_at DESC";

        $products = $this->db->fetchAll($sql, $params);

        // Parse images and add image_url for each product
        $products = array_map(function($product) {
            $images = $product['images'];
            if ($images) {
                // Try to decode JSON (handle double-encoded JSON)
                $decoded = json_decode($images, true);
                // If still a string, try decoding again
                if (is_string($decoded)) {
                    $decoded = json_decode($decoded, true);
                }
                if (is_array($decoded) && count($decoded) > 0) {
                    $product['image_url'] = $decoded[0];
                } else if (is_string($decoded)) {
                    $product['image_url'] = $decoded;
                } else {
                    $product['image_url'] = $images;
                }
            } else {
                $product['image_url'] = 'https://via.placeholder.com/400x400?text=No+Image';
            }
            return $product;
        }, $products);

        Response::success([
            'products' => $products,
            'total' => count($products)
        ]);
    }

    public function show($id)
    {
        $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.id = ?";
        
        $product = $this->db->fetch($sql, [$id]);

        if (!$product) {
            Response::notFound('Product not found');
        }

        // Parse images and add image_url
        $images = $product['images'];
        if ($images) {
            $decoded = json_decode($images, true);
            // Handle double-encoded JSON
            if (is_string($decoded)) {
                $decoded = json_decode($decoded, true);
            }
            if (is_array($decoded) && count($decoded) > 0) {
                $product['image_url'] = $decoded[0];
            } else if (is_string($decoded)) {
                $product['image_url'] = $decoded;
            } else {
                $product['image_url'] = $images;
            }
        } else {
            $product['image_url'] = 'https://via.placeholder.com/400x400?text=No+Image';
        }

        // Get reviews
        $reviews = $this->db->fetchAll(
            "SELECT r.*, u.first_name, u.last_name, u.avatar 
             FROM product_reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.product_id = ? 
             ORDER BY r.created_at DESC",
            [$id]
        );

        $totalReviews = count($reviews);
        $averageRating = $totalReviews > 0 ? round(array_sum(array_column($reviews, 'rating')) / $totalReviews, 1) : 0;

        $formattedReviews = array_map(function($review) {
            return [
                'id' => $review['id'],
                'rating' => $review['rating'],
                'comment' => $review['comment'],
                'created_at' => date('d/m/Y H:i', strtotime($review['created_at'])),
                'user' => [
                    'id' => $review['user_id'],
                    'name' => $review['first_name'] . ' ' . $review['last_name'],
                    'avatar' => $review['avatar'],
                ],
            ];
        }, $reviews);

        Response::success([
            'product' => $product,
            'reviews' => $formattedReviews,
            'average_rating' => $averageRating,
            'total_reviews' => $totalReviews,
        ]);
    }
}
