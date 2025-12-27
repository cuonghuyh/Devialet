<?php

class ReviewController
{
    private $db;
    private $request;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->request = new Request();
    }

    public function index($productId)
    {
        $reviews = $this->db->fetchAll(
            "SELECT r.*, u.first_name, u.last_name, u.avatar 
             FROM product_reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.product_id = ? 
             ORDER BY r.created_at DESC",
            [$productId]
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
            'reviews' => $formattedReviews,
            'average_rating' => $averageRating,
            'total_reviews' => $totalReviews,
        ]);
    }

    public function store()
    {
        $user = Auth::user();
        $data = $this->request->all();

        $this->request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        // Check if user purchased product
        $hasPurchased = $this->db->fetch(
            "SELECT o.id FROM orders o 
             JOIN order_items oi ON o.id = oi.order_id 
             WHERE o.user_id = ? AND o.status = 'delivered' AND oi.product_id = ?",
            [$user['id'], $data['product_id']]
        );

        if (!$hasPurchased) {
            Response::error('Bạn chỉ có thể đánh giá sản phẩm đã mua và đã giao hàng', 403);
        }

        // Check if already reviewed
        $existing = $this->db->fetch(
            "SELECT id FROM product_reviews WHERE user_id = ? AND product_id = ?",
            [$user['id'], $data['product_id']]
        );

        if ($existing) {
            Response::error('Bạn đã đánh giá sản phẩm này rồi', 400);
        }

        // Create review
        $this->db->execute(
            "INSERT INTO product_reviews (user_id, product_id, rating, comment, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())",
            [$user['id'], $data['product_id'], $data['rating'], $data['comment'] ?? null]
        );

        $reviewId = $this->db->lastInsertId();
        $review = $this->db->fetch(
            "SELECT r.*, u.first_name, u.last_name, u.avatar 
             FROM product_reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.id = ?",
            [$reviewId]
        );

        Response::success([
            'review' => [
                'id' => $review['id'],
                'rating' => $review['rating'],
                'comment' => $review['comment'],
                'created_at' => date('d/m/Y H:i', strtotime($review['created_at'])),
                'user' => [
                    'id' => $review['user_id'],
                    'name' => $review['first_name'] . ' ' . $review['last_name'],
                    'avatar' => $review['avatar'],
                ],
            ]
        ], 'Đánh giá thành công', 201);
    }

    public function update($id)
    {
        $user = Auth::user();
        $data = $this->request->all();

        $this->request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        // Check ownership
        $review = $this->db->fetch(
            "SELECT * FROM product_reviews WHERE id = ? AND user_id = ?",
            [$id, $user['id']]
        );

        if (!$review) {
            Response::notFound('Review not found or unauthorized');
        }

        // Update
        $this->db->execute(
            "UPDATE product_reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?",
            [$data['rating'], $data['comment'] ?? null, $id]
        );

        Response::success([], 'Cập nhật đánh giá thành công');
    }

    public function destroy($id)
    {
        $user = Auth::user();

        $review = $this->db->fetch(
            "SELECT * FROM product_reviews WHERE id = ? AND user_id = ?",
            [$id, $user['id']]
        );

        if (!$review) {
            Response::notFound('Review not found or unauthorized');
        }

        $this->db->execute("DELETE FROM product_reviews WHERE id = ?", [$id]);

        Response::success([], 'Xóa đánh giá thành công');
    }

    public function checkUserReview($productId)
    {
        $user = Auth::user();

        $review = $this->db->fetch(
            "SELECT * FROM product_reviews WHERE user_id = ? AND product_id = ?",
            [$user['id'], $productId]
        );

        Response::success([
            'has_review' => $review !== false,
            'review' => $review ?: null
        ]);
    }

    public function getReviewableProducts()
    {
        $user = Auth::user();

        // Products that user has purchased but not reviewed
        $products = $this->db->fetchAll(
            "SELECT DISTINCT p.* FROM products p
             JOIN order_items oi ON p.id = oi.product_id
             JOIN orders o ON oi.order_id = o.id
             WHERE o.user_id = ? AND o.status = 'delivered'
             AND p.id NOT IN (
                 SELECT product_id FROM product_reviews WHERE user_id = ?
             )",
            [$user['id'], $user['id']]
        );

        Response::success(['products' => $products]);
    }

    public function getMyReviewedProducts()
    {
        $user = Auth::user();

        $reviews = $this->db->fetchAll(
            "SELECT r.*, p.name as product_name, p.image_url 
             FROM product_reviews r 
             JOIN products p ON r.product_id = p.id 
             WHERE r.user_id = ? 
             ORDER BY r.created_at DESC",
            [$user['id']]
        );

        Response::success(['reviews' => $reviews]);
    }
}
