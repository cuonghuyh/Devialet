<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;

class CartController extends Controller
{
    public function index()
    {
        $cart = Cart::with(['items.product.category'])
            ->where('user_id', auth()->id())
            ->first();

        if (!$cart) {
            $cart = Cart::create(['user_id' => auth()->id()]);
        }

        return view('cart', compact('cart'));
    }

    public function addToCart(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Vui lòng đăng nhập để thêm vào giỏ hàng'], 401);
        }

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1'
        ]);

        $product = Product::findOrFail($request->product_id);
        $quantity = $request->quantity ?? 1;

        // Check stock
        if ($product->stock < $quantity) {
            return response()->json(['error' => 'Sản phẩm không đủ số lượng trong kho'], 400);
        }

        // Get or create cart
        $cart = Cart::firstOrCreate(['user_id' => auth()->id()]);

        // Check if product already in cart
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            // Update quantity
            $newQuantity = $cartItem->quantity + $quantity;
            if ($product->stock < $newQuantity) {
                return response()->json(['error' => 'Sản phẩm không đủ số lượng trong kho'], 400);
            }
            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            // Create new cart item
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price' => $product->price
            ]);
        }

        $cart->load('items');

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm sản phẩm vào giỏ hàng',
            'cart_count' => $cart->item_count
        ]);
    }

    public function getCart()
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $cart = Cart::with(['items.product'])->where('user_id', auth()->id())->first();

        if (!$cart) {
            return response()->json(['items' => [], 'total' => 0, 'count' => 0]);
        }

        return response()->json([
            'items' => $cart->items,
            'total' => $cart->total,
            'count' => $cart->item_count
        ]);
    }

    public function updateQuantity(Request $request, $itemId)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cartItem = CartItem::findOrFail($itemId);
        $cart = $cartItem->cart;

        if ($cart->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($cartItem->product->stock < $request->quantity) {
            return response()->json(['error' => 'Sản phẩm không đủ số lượng trong kho'], 400);
        }

        $cartItem->quantity = $request->quantity;
        $cartItem->save();

        $cart->load('items');

        return response()->json([
            'success' => true,
            'cart_count' => $cart->item_count,
            'total' => $cart->total
        ]);
    }

    public function removeItem($itemId)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $cartItem = CartItem::findOrFail($itemId);
        $cart = $cartItem->cart;

        if ($cart->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cartItem->delete();

        $cart->load('items');

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa sản phẩm khỏi giỏ hàng',
            'cart_count' => $cart->item_count,
            'total' => $cart->total
        ]);
    }
}
