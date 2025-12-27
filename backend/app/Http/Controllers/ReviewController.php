<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductReview;
use App\Models\Product;

class ReviewController extends Controller
{
    /**
     * Lấy danh sách reviews của một sản phẩm
     */
    public function index($productId)
    {
        $reviews = ProductReview::with('user')
            ->where('product_id', $productId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate average and count directly from fetched reviews (no extra queries)
        $totalReviews = $reviews->count();
        $averageRating = $totalReviews > 0 ? $reviews->avg('rating') : 0;

        $formattedReviews = $reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at->format('d/m/Y H:i'),
                'user' => [
                    'id' => $review->user->id,
                    'name' => $review->user->first_name . ' ' . $review->user->last_name,
                    'avatar' => $review->user->avatar,
                ],
            ];
        });

        return response()->json([
            'reviews' => $formattedReviews,
            'average_rating' => round($averageRating, 1),
            'total_reviews' => $totalReviews,
        ]);
    }

    /**
     * Tạo review mới
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        // Kiểm tra user đã mua sản phẩm chưa (order với status delivered)
        $hasPurchased = \App\Models\Order::where('user_id', auth()->id())
            ->where('status', 'delivered')
            ->whereHas('items', function ($query) use ($request) {
                $query->where('product_id', $request->product_id);
            })
            ->exists();

        if (!$hasPurchased) {
            return response()->json([
                'error' => 'Bạn chỉ có thể đánh giá sản phẩm đã mua và đã giao hàng'
            ], 403);
        }

        // Kiểm tra user đã review product này chưa
        $existingReview = ProductReview::where('user_id', auth()->id())
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'error' => 'Bạn đã đánh giá sản phẩm này rồi'
            ], 400);
        }

        $review = ProductReview::create([
            'user_id' => auth()->id(),
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        $review->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá thành công',
            'review' => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at->format('d/m/Y H:i'),
                'user' => [
                    'id' => $review->user->id,
                    'name' => $review->user->first_name . ' ' . $review->user->last_name,
                    'avatar' => $review->user->avatar,
                ],
            ],
        ]);
    }

    /**
     * Cập nhật review
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = ProductReview::findOrFail($id);

        // Chỉ cho phép user tự update review của mình
        if ($review->user_id !== auth()->id()) {
            return response()->json([
                'error' => 'Bạn không có quyền chỉnh sửa đánh giá này'
            ], 403);
        }

        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật đánh giá thành công',
        ]);
    }

    /**
     * Xóa review
     */
    public function destroy($id)
    {
        $review = ProductReview::findOrFail($id);

        // Chỉ cho phép user tự xóa review của mình
        if ($review->user_id !== auth()->id()) {
            return response()->json([
                'error' => 'Bạn không có quyền xóa đánh giá này'
            ], 403);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa đánh giá thành công',
        ]);
    }

    /**
     * Kiểm tra user đã review product chưa
     */
    public function checkUserReview($productId)
    {
        // Kiểm tra đã mua và giao hàng chưa
        $hasPurchased = \App\Models\Order::where('user_id', auth()->id())
            ->where('status', 'delivered')
            ->whereHas('items', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->exists();

        $review = ProductReview::where('user_id', auth()->id())
            ->where('product_id', $productId)
            ->first();

        return response()->json([
            'can_review' => $hasPurchased,
            'has_reviewed' => $review !== null,
            'review' => $review ? [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
            ] : null,
        ]);
    }

    /**
     * Lấy danh sách product IDs mà user đã review
     */
    public function getMyReviewedProducts()
    {
        $productIds = ProductReview::where('user_id', auth()->id())
            ->pluck('product_id')
            ->toArray();

        return response()->json([
            'reviewed_product_ids' => $productIds,
        ]);
    }

    /**
     * Lấy danh sách sản phẩm user có thể review
     */
    public function getReviewableProducts()
    {
        $userId = auth()->id();

        // Lấy các sản phẩm từ đơn hàng đã giao
        $productIds = \App\Models\OrderItem::whereHas('order', function ($query) use ($userId) {
            $query->where('user_id', $userId)
                  ->where('status', 'delivered');
        })
        ->pluck('product_id')
        ->unique();

        // Lấy thông tin sản phẩm
        $products = Product::whereIn('id', $productIds)
            ->with('category')
            ->get()
            ->map(function ($product) use ($userId) {
                $hasReviewed = ProductReview::where('user_id', $userId)
                    ->where('product_id', $product->id)
                    ->exists();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'image_url' => $product->image_url,
                    'category' => $product->category ? $product->category->name : null,
                    'has_reviewed' => $hasReviewed,
                ];
            });

        return response()->json([
            'products' => $products,
        ]);
    }
}
