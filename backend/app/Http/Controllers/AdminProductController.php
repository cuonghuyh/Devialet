<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Services\CloudinaryService;

class AdminProductController extends Controller
{
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    /**
     * Lấy danh sách sản phẩm
     */
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($products);
    }

    /**
     * Tạo sản phẩm mới
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'description' => 'required|string',
            'stock' => 'required|integer|min:0',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        // Upload image
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $result = $this->cloudinaryService->upload($request->file('image')->getRealPath(), [
                'folder' => 'devialet/products'
            ]);
            $imageUrl = $result['secure_url'];
        }

        $product = Product::create([
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'sku' => $request->sku,
            'category_id' => $request->category_id,
            'price' => $request->price,
            'sale_price' => $request->sale_price,
            'description' => $request->description,
            'stock' => $request->stock,
            'images' => $imageUrl ? [$imageUrl] : [],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo sản phẩm thành công',
            'product' => $product->load('category'),
        ], 201);
    }

    /**
     * Hiển thị chi tiết sản phẩm
     */
    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json($product);
    }

    /**
     * Cập nhật sản phẩm
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku,' . $id,
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'description' => 'required|string',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        // Upload new image if provided
        $images = $product->images ?? [];
        if ($request->hasFile('image')) {
            $result = $this->cloudinaryService->upload($request->file('image')->getRealPath(), [
                'folder' => 'devialet/products'
            ]);
            $images = [$result['secure_url']];
        }

        $product->update([
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'sku' => $request->sku,
            'category_id' => $request->category_id,
            'price' => $request->price,
            'sale_price' => $request->sale_price,
            'description' => $request->description,
            'stock' => $request->stock,
            'images' => $images,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công',
            'product' => $product->load('category'),
        ]);
    }

    /**
     * Xóa sản phẩm
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa sản phẩm thành công',
        ]);
    }

    /**
     * Cập nhật số lượng tồn kho
     */
    public function updateStock(Request $request, $id)
    {
        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $product = Product::findOrFail($id);
        $product->stock_quantity = $request->stock_quantity;
        $product->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật tồn kho thành công',
            'product' => $product,
        ]);
    }
}
