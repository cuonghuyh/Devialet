<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\OTPMail;

class AuthController extends Controller
{
    // Hiển thị trang đăng ký
    public function showSignup()
    {
        return view('signup');
    }

    // Xử lý đăng ký
    public function signup(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email:rfc,dns',  // Kiểm tra DNS records của domain
                'max:255',
                'unique:users',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                'regex:/^(\+?84|0)(3|5|7|8|9)[0-9]{8}$/'
            ],
            'password' => 'required|string|min:8|confirmed',
        ], [
            'email.email' => 'Please enter a valid email address from a real email provider.',
            'email.regex' => 'The email format is invalid.',
            'phone.regex' => 'Please enter a valid Vietnamese phone number (e.g., 0901234567 or +84901234567).',
        ]);
        
        // Kiểm tra email đã tồn tại chưa
        if (User::where('email', $request->email)->exists()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This email is already registered.'
                ], 422);
            }
            return back()->withErrors([
                'email' => 'This email is already registered.'
            ])->withInput();
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        // API request
        if ($request->expectsJson()) {
            $token = $user->createToken('auth_token')->plainTextToken;
            
            return response()->json([
                'success' => true,
                'message' => 'Account created successfully!',
                'user' => $user,
                'token' => $token
            ], 201);
        }

        // Web request
        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect('/')->with('success', 'Account created successfully!');
    }

    // Hiển thị trang đăng nhập
    public function showLogin()
    {
        return view('login');
    }

    // Xử lý đăng nhập
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // API request
        if ($request->expectsJson()) {
            if (Auth::attempt($credentials)) {
                $user = Auth::user();
                $token = $user->createToken('auth_token')->plainTextToken;
                
                return response()->json([
                    'success' => true,
                    'message' => 'Logged in successfully!',
                    'user' => $user,
                    'token' => $token
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'The provided credentials do not match our records.'
            ], 401);
        }

        // Web request
        if (Auth::attempt($credentials, true)) {
            $request->session()->regenerate();
            
            return redirect()->intended('/')->with('success', 'Logged in successfully!');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    // Xử lý đăng xuất
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }

    // Hiển thị trang settings
    public function showSettings()
    {
        return view('settings');
    }

    // Cập nhật avatar
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();

        // Xóa avatar cũ nếu có
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Lưu avatar mới
        $path = $request->file('avatar')->store('avatars', 'public');
        
        $user->avatar = $path;
        $user->save();

        return response()->json(['success' => true, 'message' => 'Avatar updated successfully']);
    }

    // Xóa avatar
    public function removeAvatar()
    {
        $user = Auth::user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->avatar = null;
            $user->save();
        }

        return response()->json(['success' => true, 'message' => 'Avatar removed successfully']);
    }

    // Cập nhật profile
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email:rfc,dns',  // Kiểm tra DNS records của domain
                'max:255',
                'unique:users,email,' . $user->id,
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                'regex:/^(\+?84|0)(3|5|7|8|9)[0-9]{8}$/'
            ],
        ], [
            'email.email' => 'Please enter a valid email address from a real email provider.',
            'email.regex' => 'The email format is invalid.',
            'phone.regex' => 'Please enter a valid Vietnamese phone number (e.g., 0901234567 or +84901234567).',
        ]);
        
        // Kiểm tra MX record để chắc chắn domain có mail server
        $emailDomain = explode('@', $request->email)[1];
        if (!checkdnsrr($emailDomain, 'MX') && !checkdnsrr($emailDomain, 'A')) {
            return response()->json([
                'success' => false, 
                'message' => 'This email domain does not exist or cannot receive emails. Please use a valid email from Gmail, Outlook, Yahoo, etc.'
            ], 422);
        }

        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->save();

        return response()->json(['success' => true, 'message' => 'Profile updated successfully']);
    }

    // Hiển thị trang forgot password
    public function showForgotPassword(Request $request)
    {
        // CHỈ xóa session khi không có session reset nào đang active
        // Để tránh xóa session khi user đang ở giữa quá trình reset
        if (!$request->session()->has('reset_email') && 
            !$request->session()->has('verified_email')) {
            $request->session()->forget(['reset_email', 'verified_email', 'verified_otp']);
        }
        
        return view('forgot-password');
    }

    // Gửi OTP đến email
    public function sendOTP(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'This email is not registered in our system.',
        ]);

        // Xóa các OTP cũ của email này
        PasswordReset::where('email', $request->email)->delete();

        // Tạo OTP mới
        $otp = PasswordReset::generateOTP();
        
        PasswordReset::create([
            'email' => $request->email,
            'otp' => $otp,
            'expires_at' => now()->addMinutes(10), // OTP hết hạn sau 10 phút
        ]);

        // Lấy tên user để gửi email
        $user = User::where('email', $request->email)->first();
        $userName = $user->first_name . ' ' . $user->last_name;

        // Gửi email với OTP
        try {
            Mail::to($request->email)->send(new OTPMail($otp, $userName));
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Failed to send OTP email.'], 500);
            }
            return back()->with('error', 'Failed to send OTP email. Please try again.');
        }

        // Lưu email vào session để dùng cho bước tiếp theo (chỉ cho web)
        if (!$request->expectsJson()) {
            $request->session()->forget(['verified_email', 'verified_otp']); // Xóa session step 3 nếu có
            $request->session()->put('reset_email', $request->email);
        }

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'OTP has been sent to your email.']);
        }

        return redirect('/forgot-password')->with('success', 'OTP has been sent to your email. Please check your inbox.');
    }

    // Xác thực OTP
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        $reset = PasswordReset::where('email', $request->email)
                              ->where('otp', $request->otp)
                              ->first();

        if (!$reset) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Invalid OTP code. Please try again.'], 400);
            }
            return back()->with('error', 'Invalid OTP code. Please try again.');
        }

        if ($reset->isExpired()) {
            $reset->delete();
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'OTP has expired. Please request a new one.'], 400);
            }
            return back()->with('error', 'OTP has expired. Please request a new one.');
        }

        // Lưu thông tin vào session để dùng cho bước reset password (chỉ cho web)
        if (!$request->expectsJson()) {
            $request->session()->forget('reset_email'); // Xóa session step 2
            $request->session()->put('verified_email', $request->email);
            $request->session()->put('verified_otp', $request->otp);
        }

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'OTP verified successfully.']);
        }

        return redirect('/forgot-password')->with('success', 'OTP verified successfully. Please set your new password.');
    }

    // Reset password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Kiểm tra lại OTP
        $reset = PasswordReset::where('email', $request->email)
                              ->where('otp', $request->otp)
                              ->first();

        if (!$reset || $reset->isExpired()) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Invalid or expired OTP. Please start over.'], 400);
            }
            return back()->with('error', 'Invalid or expired OTP. Please start over.');
        }

        // Cập nhật password mới
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Xóa OTP đã sử dụng
        $reset->delete();

        // Xóa session (chỉ cho web)
        if (!$request->expectsJson()) {
            $request->session()->forget(['reset_email', 'verified_email', 'verified_otp']);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true, 
                'message' => 'Password reset successfully!'
            ]);
        }

        // Tự động đăng nhập
        Auth::login($user);

        return redirect('/')->with('success', 'Password reset successfully! You are now logged in.');
    }
}
