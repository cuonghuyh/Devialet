<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentCheckController extends Controller
{
    // Google Apps Script API URL
    private $googleScriptUrl = 'https://script.google.com/macros/s/AKfycbw4R3Zat3bKrggr-h3wLTvCgXbnS3k76_6gJnZfFYRFWWQy6VpBVMF-hgMIOW7t9CdB/exec';

    /**
     * Proxy endpoint to check payment status from Google Apps Script
     * This bypasses CORS restrictions by making the request server-side
     */
    public function check(Request $request)
    {
        try {
            $response = Http::withoutVerifying()
                ->timeout(10)
                ->get($this->googleScriptUrl);
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch payment data'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error connecting to payment service: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify if a specific payment has been made
     */
    public function verify(Request $request)
    {
        $request->validate([
            'order_number' => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        try {
            $response = Http::withoutVerifying()
                ->timeout(10)
                ->get($this->googleScriptUrl);
            
            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['data']) && is_array($data['data'])) {
                    $orderNumber = $request->order_number;
                    $requiredAmount = $request->amount;
                    
                    // Check last transaction
                    $transactions = $data['data'];
                    if (count($transactions) > 0) {
                        $lastTransaction = end($transactions);
                        $lastPrice = $lastTransaction['Giá trị'] ?? 0;
                        $lastContent = $lastTransaction['Mô tả'] ?? '';
                        
                        // Verify payment matches
                        if ($lastPrice >= $requiredAmount && str_contains($lastContent, $orderNumber)) {
                            return response()->json([
                                'success' => true,
                                'verified' => true,
                                'message' => 'Payment verified successfully'
                            ]);
                        }
                    }
                }
                
                return response()->json([
                    'success' => true,
                    'verified' => false,
                    'message' => 'Payment not found'
                ]);
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch payment data'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error connecting to payment service: ' . $e->getMessage()
            ], 500);
        }
    }
}
