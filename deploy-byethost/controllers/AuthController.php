<?php

class AuthController
{
    private $db;
    private $request;
    private $mailService;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->request = new Request();
        $this->mailService = new MailService();
    }

    public function signup()
    {
        $data = $this->request->all();
        
        // Validation
        $this->request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
            'phone' => 'required|string|max:20|regex:/^(\+?84|0)(3|5|7|8|9)[0-9]{8}$/',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|string',
        ]);

        // Check password confirmation
        if ($data['password'] !== $data['password_confirmation']) {
            Response::error('Password confirmation does not match', 422);
        }

        // Check if email exists
        $existing = $this->db->fetch("SELECT id FROM users WHERE email = ?", [$data['email']]);
        if ($existing) {
            Response::error('This email is already registered.', 422);
        }

        // Create user
        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
        
        $this->db->execute(
            "INSERT INTO users (first_name, last_name, email, phone, password, role, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, 'user', NOW(), NOW())",
            [$data['first_name'], $data['last_name'], $data['email'], $data['phone'], $hashedPassword]
        );

        $userId = $this->db->lastInsertId();
        $user = $this->db->fetch("SELECT * FROM users WHERE id = ?", [$userId]);

        // Generate and save OTP
        $otp = $this->generateOTP();
        $this->db->execute("DELETE FROM email_verifications WHERE email = ?", [$data['email']]);
        $this->db->execute(
            "INSERT INTO email_verifications (email, otp, expires_at, created_at, updated_at) 
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), NOW(), NOW())",
            [$data['email'], $otp]
        );

        // Send OTP email
        $userName = $user['first_name'] . ' ' . $user['last_name'];
        $this->mailService->sendOTP($data['email'], $otp, $userName);

        Response::success([
            'email' => $user['email'],
            'requires_verification' => true
        ], 'Account created! Please check your email to verify your account.', 201);
    }

    public function login()
    {
        $data = $this->request->all();
        
        $this->request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = $this->db->fetch("SELECT * FROM users WHERE email = ?", [$data['email']]);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            Response::error('The provided credentials do not match our records.', 401);
        }

        // Create token
        $token = Auth::createToken($user);

        unset($user['password']);

        Response::success([
            'user' => $user,
            'token' => $token
        ], 'Logged in successfully!');
    }

    public function logout()
    {
        // For API, token is handled on client side (removed from storage)
        Response::success([], 'Logged out successfully!');
    }

    public function verifyEmail()
    {
        $data = $this->request->all();
        
        $this->request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
        ]);

        $verification = $this->db->fetch(
            "SELECT * FROM email_verifications WHERE email = ? AND otp = ? AND expires_at > NOW()",
            [$data['email'], $data['otp']]
        );

        if (!$verification) {
            Response::error('Invalid or expired OTP code.', 400);
        }

        // Update user
        $this->db->execute(
            "UPDATE users SET email_verified_at = NOW(), updated_at = NOW() WHERE email = ?",
            [$data['email']]
        );

        // Delete verification
        $this->db->execute("DELETE FROM email_verifications WHERE email = ?", [$data['email']]);

        // Get user and create token
        $user = $this->db->fetch("SELECT * FROM users WHERE email = ?", [$data['email']]);
        $token = Auth::createToken($user);

        unset($user['password']);

        Response::success([
            'user' => $user,
            'token' => $token
        ], 'Email verified successfully!');
    }

    public function resendVerificationOTP()
    {
        $data = $this->request->all();
        
        $this->request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = $this->db->fetch("SELECT * FROM users WHERE email = ?", [$data['email']]);

        if ($user['email_verified_at']) {
            Response::error('Email is already verified.', 400);
        }

        // Generate new OTP
        $otp = $this->generateOTP();
        $this->db->execute("DELETE FROM email_verifications WHERE email = ?", [$data['email']]);
        $this->db->execute(
            "INSERT INTO email_verifications (email, otp, expires_at, created_at, updated_at) 
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), NOW(), NOW())",
            [$data['email'], $otp]
        );

        // Send email
        $userName = $user['first_name'] . ' ' . $user['last_name'];
        $this->mailService->sendOTP($data['email'], $otp, $userName);

        Response::success([], 'Verification code sent to your email.');
    }

    public function sendOTP()
    {
        $data = $this->request->all();
        
        $this->request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = $this->db->fetch("SELECT * FROM users WHERE email = ?", [$data['email']]);

        if (!$user) {
            Response::error('This email is not registered in our system.', 404);
        }

        // Generate OTP
        $otp = $this->generateOTP();
        $this->db->execute("DELETE FROM password_resets WHERE email = ?", [$data['email']]);
        $this->db->execute(
            "INSERT INTO password_resets (email, otp, expires_at, created_at, updated_at) 
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), NOW(), NOW())",
            [$data['email'], $otp]
        );

        // Send email
        $userName = $user['first_name'] . ' ' . $user['last_name'];
        $this->mailService->sendPasswordResetOTP($data['email'], $otp, $userName);

        Response::success([], 'OTP has been sent to your email.');
    }

    public function verifyOTP()
    {
        $data = $this->request->all();
        
        $this->request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
        ]);

        $reset = $this->db->fetch(
            "SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW()",
            [$data['email'], $data['otp']]
        );

        if (!$reset) {
            Response::error('Invalid or expired OTP code.', 400);
        }

        Response::success([], 'OTP verified successfully.');
    }

    public function resetPassword()
    {
        $data = $this->request->all();
        
        $this->request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|string',
        ]);

        if ($data['password'] !== $data['password_confirmation']) {
            Response::error('Password confirmation does not match', 422);
        }

        // Verify OTP again
        $reset = $this->db->fetch(
            "SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW()",
            [$data['email'], $data['otp']]
        );

        if (!$reset) {
            Response::error('Invalid or expired OTP. Please start over.', 400);
        }

        // Update password
        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
        $this->db->execute(
            "UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?",
            [$hashedPassword, $data['email']]
        );

        // Delete used OTP
        $this->db->execute("DELETE FROM password_resets WHERE email = ?", [$data['email']]);

        Response::success([], 'Password reset successfully!');
    }

    private function generateOTP()
    {
        return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
