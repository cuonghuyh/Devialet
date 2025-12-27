<?php

class SettingsController
{
    private $db;
    private $request;
    private $cloudinary;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->request = new Request();
        $this->cloudinary = new CloudinaryService();
    }

    public function updateProfile()
    {
        $user = Auth::user();
        $data = $this->request->all();

        $this->request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
            'phone' => 'required|string|max:20|regex:/^(\+?84|0)(3|5|7|8|9)[0-9]{8}$/',
        ]);

        // Check email uniqueness (except current user)
        $existing = $this->db->fetch(
            "SELECT id FROM users WHERE email = ? AND id != ?",
            [$data['email'], $user['id']]
        );

        if ($existing) {
            Response::error('This email is already taken by another user.', 422);
        }

        // Update user
        $this->db->execute(
            "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, updated_at = NOW() 
             WHERE id = ?",
            [$data['first_name'], $data['last_name'], $data['email'], $data['phone'], $user['id']]
        );

        Response::success([], 'Profile updated successfully');
    }

    public function uploadAvatar()
    {
        $user = Auth::user();
        $file = $this->request->file('avatar');

        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            Response::error('Avatar file is required', 422);
        }

        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (!in_array($file['type'], $allowedTypes)) {
            Response::error('Avatar must be an image (jpeg, png, jpg, gif)', 422);
        }

        // Upload to Cloudinary
        $avatarUrl = $this->cloudinary->upload($file['tmp_name'], 'avatars');

        if (!$avatarUrl) {
            Response::error('Failed to upload avatar', 500);
        }

        // Update user
        $this->db->execute(
            "UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?",
            [$avatarUrl, $user['id']]
        );

        Response::success(['avatar' => $avatarUrl], 'Avatar uploaded successfully');
    }

    public function removeAvatar()
    {
        $user = Auth::user();

        $this->db->execute(
            "UPDATE users SET avatar = NULL, updated_at = NOW() WHERE id = ?",
            [$user['id']]
        );

        Response::success([], 'Avatar removed successfully');
    }
}
