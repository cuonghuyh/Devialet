<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_address' => 'required|string',
            'customer_email' => 'nullable|email|max:255',
            'payment_method' => 'required|in:cod,bank_transfer,credit_card,momo,vietqr',
            'note' => 'nullable|string',
            'cart_items' => 'required|array|min:1',
            'cart_items.*.productId' => 'required|integer|exists:products,id',
            'cart_items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            // Get cart items from request (stored in localStorage on frontend)
            $cartItems = $validated['cart_items'];
            
            if (empty($cartItems)) {
                return response()->json(['error' => 'Cart is empty'], 400);
            }

            // Fetch products and validate stock
            $orderItems = [];
            $subtotal = 0;
            
            foreach ($cartItems as $cartItem) {
                $product = Product::find($cartItem['productId']);
                
                if (!$product) {
                    return response()->json([
                        'error' => "Product not found"
                    ], 400);
                }
                
                if ($product->stock < $cartItem['quantity']) {
                    return response()->json([
                        'error' => "Product {$product->name} is out of stock. Available: {$product->stock}"
                    ], 400);
                }
                
                $price = $product->discount_price ?? $product->price;
                $itemSubtotal = $price * $cartItem['quantity'];
                $subtotal += $itemSubtotal;
                
                $orderItems[] = [
                    'product' => $product,
                    'price' => $price,
                    'quantity' => $cartItem['quantity'],
                    'subtotal' => $itemSubtotal,
                ];
            }

            $shipping_fee = 0; // Free shipping
            $total = $subtotal + $shipping_fee;
            
            // Determine payment status based on payment method
            // VietQR and MoMo are considered paid immediately (user confirms payment)
            $paymentStatus = in_array($validated['payment_method'], ['vietqr', 'momo']) ? 'paid' : 'unpaid';

            // Create order
            $order = Order::create([
                'user_id' => auth()->id(),
                'order_number' => Order::generateOrderNumber(),
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_address' => $validated['customer_address'],
                'customer_email' => $validated['customer_email'] ?? auth()->user()->email,
                'subtotal' => $subtotal,
                'shipping_fee' => $shipping_fee,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'status' => 'pending',
                'payment_status' => $paymentStatus,
                'note' => $validated['note'] ?? null,
            ]);

            // Create order items and update product stock
            foreach ($orderItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']->id,
                    'product_name' => $item['product']->name,
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                ]);

                // Decrease product stock
                $item['product']->stock -= $item['quantity'];
                $item['product']->save();
            }

            DB::commit();

            // Load order with items and user for complete response
            $order->load(['items.product', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'order' => $order,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getOrders()
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $orders = Order::with('items.product')
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['orders' => $orders]);
    }

    public function getOrder($id)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $order = Order::with('items.product')
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json(['order' => $order]);
    }
}
