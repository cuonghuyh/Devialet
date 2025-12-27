<?php

class Auth
{
    private static $user = null;

    public static function attempt($email, $password)
    {
        $db = Database::getInstance();
        $user = $db->fetch("SELECT * FROM users WHERE email = ? LIMIT 1", [$email]);

        if ($user && password_verify($password, $user['password'])) {
            self::$user = $user;
            return true;
        }

        return false;
    }

    public static function login($user)
    {
        self::$user = $user;
        Session::set('user_id', $user['id']);
        Session::regenerate();
    }

    public static function logout()
    {
        self::$user = null;
        Session::destroy();
    }

    public static function check()
    {
        if (self::$user !== null) {
            return true;
        }

        $userId = Session::get('user_id');
        if ($userId) {
            $db = Database::getInstance();
            $user = $db->fetch("SELECT * FROM users WHERE id = ? LIMIT 1", [$userId]);
            if ($user) {
                self::$user = $user;
                return true;
            }
        }

        return false;
    }

    public static function user()
    {
        if (!self::check()) {
            return null;
        }
        return self::$user;
    }

    public static function id()
    {
        $user = self::user();
        return $user ? $user['id'] : null;
    }

    public static function checkToken()
    {
        $request = new Request();
        $token = $request->bearerToken();

        if (!$token) {
            return false;
        }

        $payload = JWT::decode($token);
        
        if (!$payload || !isset($payload['user_id'])) {
            return false;
        }

        $db = Database::getInstance();
        $user = $db->fetch("SELECT * FROM users WHERE id = ? LIMIT 1", [$payload['user_id']]);
        
        if ($user) {
            self::$user = $user;
            return true;
        }

        return false;
    }

    public static function createToken($user)
    {
        return JWT::encode([
            'user_id' => $user['id'],
            'email' => $user['email']
        ]);
    }
}
