<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::all();
        
        // Check if request wants JSON (API request)
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'categories' => $categories,
                'total' => $categories->count()
            ]);
        }

        // Return Blade view for web
        return view('categories', compact('categories'));
    }

    public function show($id)
    {
        // Try to find by ID first (for API), then by slug (for web)
        $category = is_numeric($id) 
            ? Category::findOrFail($id)
            : Category::where('slug', $id)->firstOrFail();
        
        // Check if request wants JSON (API request)
        if (request()->wantsJson() || request()->is('api/*')) {
            return response()->json([
                'success' => true,
                'category' => $category
            ]);
        }

        // Return Blade view for web
        return view('category', compact('category'));
    }
}
