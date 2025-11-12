<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use App\Services\CloudinaryService;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Filter by category
        if ($request->has('filter')) {
            $categorySlug = $request->filter;
            $category = Category::where('slug', $categorySlug)->first();
            
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Search by name or description
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%");
            });
        }

        $products = $query->get();
        
        // Check if request wants JSON (API request)
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'products' => $products,
                'total' => $products->count()
            ]);
        }

        // Return Blade view for web
        $categories = Category::all();
        return view('products', compact('products', 'categories'));
    }

    public function show($id)
    {
        // Try to find by ID first (for API), then by slug (for web)
        $product = is_numeric($id) 
            ? Product::with('category')->findOrFail($id)
            : Product::with('category')->where('slug', $id)->firstOrFail();
        
        // Check if request wants JSON (API request)
        if (request()->wantsJson() || request()->is('api/*')) {
            return response()->json([
                'success' => true,
                'product' => $product
            ]);
        }

        // Return Blade view for web
        return view('product-detail', compact('product'));
    }

    public function testUpload(Request $request, CloudinaryService $cloudinary)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);

            if (!$request->hasFile('image')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No image file provided'
                ], 400);
            }

            $image = $request->file('image');
            
            $result = $cloudinary->upload($image->getRealPath(), [
                'folder' => 'devialet/test'
            ]);

            return response()->json([
                'success' => true,
                'url' => $result['secure_url'],
                'public_id' => $result['public_id'],
                'message' => 'Image uploaded successfully!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    // Admin methods for product management
    public function store(Request $request, CloudinaryService $cloudinary)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'category_id' => 'required|exists:categories,id',
                'description' => 'nullable|string',
                'stock' => 'required|integer|min:0',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);

            // Upload image to Cloudinary
            $imageUrl = null;
            if ($request->hasFile('image')) {
                $result = $cloudinary->upload($request->file('image')->getRealPath(), [
                    'folder' => 'devialet/products'
                ]);
                $imageUrl = $result['secure_url'];
            }

            // Generate slug from name
            $slug = \Illuminate\Support\Str::slug($request->name);
            
            // Ensure slug is unique
            $originalSlug = $slug;
            $count = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }

            $product = Product::create([
                'name' => $request->name,
                'slug' => $slug,
                'price' => $request->price,
                'category_id' => $request->category_id,
                'description' => $request->description,
                'stock' => $request->stock,
                'image_url' => $imageUrl,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'product' => $product->load('category')
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id, CloudinaryService $cloudinary)
    {
        try {
            $product = Product::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'category_id' => 'required|exists:categories,id',
                'description' => 'nullable|string',
                'stock' => 'required|integer|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);

            // Upload new image if provided
            if ($request->hasFile('image')) {
                $result = $cloudinary->upload($request->file('image')->getRealPath(), [
                    'folder' => 'devialet/products'
                ]);
                $product->image_url = $result['secure_url'];
            }

            // Update slug if name changed
            if ($request->name !== $product->name) {
                $slug = \Illuminate\Support\Str::slug($request->name);
                
                // Ensure slug is unique (excluding current product)
                $originalSlug = $slug;
                $count = 1;
                while (Product::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                    $slug = $originalSlug . '-' . $count;
                    $count++;
                }
                $product->slug = $slug;
            }

            $product->name = $request->name;
            $product->price = $request->price;
            $product->category_id = $request->category_id;
            $product->description = $request->description;
            $product->stock = $request->stock;
            $product->save();

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'product' => $product->load('category')
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product: ' . $e->getMessage()
            ], 500);
        }
    }
}