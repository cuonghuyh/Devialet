<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ContactMail;
use App\Models\Contact;

class ContactController extends Controller
{
    public function show()
    {
        return view('contact');
    }

    public function submit(Request $request)
    {
        // Validate form data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string',
            'message' => 'required|string|max:5000',
        ]);

        // Save contact to database
        try {
            Contact::create($validated);
        } catch (\Exception $e) {
            Log::error('Failed to save contact to database: ' . $e->getMessage());
        }

        // Send email notification
        try {
            $recipientEmail = env('MAIL_TO_ADDRESS', 'huynhkhang24032004@gmail.com');
            Mail::to($recipientEmail)->send(new ContactMail($validated));
            
            Log::info('Contact email sent successfully to: ' . $recipientEmail);
            
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong 24h.'
                ]);
            }
            
            return redirect()->back()->with('success', 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong 24h.');
        } catch (\Exception $e) {
            Log::error('Contact email failed: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể gửi email. Lỗi: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Không thể gửi email. Lỗi: ' . $e->getMessage());
        }
    }
}
