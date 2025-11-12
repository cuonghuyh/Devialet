<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactMail;

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

        // Send email notification
        try {
            // Send email to your Gmail (you need to set this in .env as MAIL_TO_ADDRESS)
            $recipientEmail = env('MAIL_TO_ADDRESS', 'your-email@gmail.com');
            Mail::to($recipientEmail)->send(new ContactMail($validated));
            
            // Check if it's an API request
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Thank you for contacting us! We will get back to you soon.'
                ]);
            }
            
            return redirect()->back()->with('success', 'Thank you for contacting us! We will get back to you soon.');
        } catch (\Exception $e) {
            // Check if it's an API request
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sorry, something went wrong. Please try again later.'
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Sorry, something went wrong. Please try again later: ' . $e->getMessage());
        }
    }
}
