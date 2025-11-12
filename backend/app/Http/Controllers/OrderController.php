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
            'payment_method' => 'required|in:cod,bank_transfer,credit_card',
            'note' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Get user's cart
            $cart = Cart::with('items.product')->where('user_id', auth()->id())->first();

            if (!$cart || $cart->items->count() === 0) {
                return response()->json(['error' => 'Cart is empty'], 400);
            }

            // Check stock for all items
            foreach ($cart->items as $item) {
                if ($item->product->stock < $item->quantity) {
                    return response()->json([
                        'error' => "Product {$item->product->name} is out of stock"
                    ], 400);
                }
            }

            // Calculate totals
            $subtotal = $cart->items->sum(function ($item) {
                return $item->price * $item->quantity;
            });
            $shipping_fee = 0; // Free shipping
            $total = $subtotal + $shipping_fee;

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
                'payment_status' => $validated['payment_method'] === 'cod' ? 'unpaid' : 'unpaid',
                'note' => $validated['note'] ?? null,
            ]);

            // Create order items and update product stock
            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->price * $item->quantity,
                ]);

                // Decrease product stock
                $product = Product::find($item->product_id);
                $product->stock -= $item->quantity;
                $product->save();
            }

            // Clear cart
            $cart->items()->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'order' => $order->load('items'),
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
