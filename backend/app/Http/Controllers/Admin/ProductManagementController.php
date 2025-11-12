<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\CloudinaryService;

class ProductManagementController extends Controller
{
    /**
     * Display admin product management page
     */
    public function index()
    {
        $products = Product::with('category')->orderBy('created_at', 'desc')->get();
        $categories = Category::all();
        
        return view('admin.products', compact('products', 'categories'));
    }

    /**
     * Store a new product
     */
    public function store(Request $request, CloudinaryService $cloudinary)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'price' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'details' => 'nullable|string',
                'stock' => 'nullable|integer|min:0',
                'featured' => 'boolean',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            ]);

            $data = $request->except('image');
            $data['slug'] = Str::slug($request->name);
            $data['featured'] = $request->has('featured');

            // Upload image to Cloudinary
            if ($request->hasFile('image')) {
                try {
                    $image = $request->file('image');
                    $result = $cloudinary->upload($image->getRealPath(), [
                        'folder' => 'devialet/products'
                    ]);
                    
                    $data['image_url'] = $result['secure_url'];
                    $data['cloudinary_public_id'] = $result['public_id'];
                } catch (\Exception $e) {
                    \Log::error('Cloudinary upload failed: ' . $e->getMessage());
                    return response()->json([
                        'success' => false, 
                        'message' => 'Failed to upload image: ' . $e->getMessage()
                    ], 500);
                }
            }

            Product::create($data);

            return response()->json(['success' => true, 'message' => 'Product created successfully!']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Product creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save product: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing product
     */
    public function update(Request $request, $id, CloudinaryService $cloudinary)
    {
        try {
            $product = Product::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'price' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'details' => 'nullable|string',
                'stock' => 'nullable|integer|min:0',
                'featured' => 'boolean',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);

            $data = $request->except('image');
            $data['slug'] = Str::slug($request->name);
            $data['featured'] = $request->has('featured');

            // Upload new image to Cloudinary if provided
            if ($request->hasFile('image')) {
                try {
                    // Delete old image from Cloudinary
                    if ($product->cloudinary_public_id) {
                        try {
                            $cloudinary->destroy($product->cloudinary_public_id);
                        } catch (\Exception $e) {
                            \Log::error('Failed to delete old image from Cloudinary: ' . $e->getMessage());
                        }
                    }

                    // Upload new image
                    $image = $request->file('image');
                    $result = $cloudinary->upload($image->getRealPath(), [
                        'folder' => 'devialet/products'
                    ]);
                    
                    $data['image_url'] = $result['secure_url'];
                    $data['cloudinary_public_id'] = $result['public_id'];
                } catch (\Exception $e) {
                    \Log::error('Cloudinary upload failed: ' . $e->getMessage());
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to upload image: ' . $e->getMessage()
                    ], 500);
                }
            }

            $product->update($data);

            return response()->json(['success' => true, 'message' => 'Product updated successfully!']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Product update failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a product
     */
    public function destroy($id, CloudinaryService $cloudinary)
    {
        $product = Product::findOrFail($id);

        // Delete image from Cloudinary
        if ($product->cloudinary_public_id) {
            try {
                $cloudinary->destroy($product->cloudinary_public_id);
            } catch (\Exception $e) {
                \Log::error('Failed to delete image from Cloudinary: ' . $e->getMessage());
            }
        }

        $product->delete();

        return response()->json(['success' => true, 'message' => 'Product deleted successfully!']);
    }

    /**
     * Get product data for editing
     */
    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json($product);
    }
}
