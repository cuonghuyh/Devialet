<?php

class Session
{
    public static function start()
    {
        if (session_status() === PHP_SESSION_NONE) {
            $config = require __DIR__ . '/../config/app.php';
            
            session_name($config['session_name']);
            session_set_cookie_params([
                'lifetime' => $config['session_lifetime'] * 60,
                'path' => '/',
                'domain' => '',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            
            session_start();
        }
    }

    public static function set($key, $value)
    {
        self::start();
        $_SESSION[$key] = $value;
    }

    public static function get($key, $default = null)
    {
        self::start();
        return $_SESSION[$key] ?? $default;
    }

    public static function has($key)
    {
        self::start();
        return isset($_SESSION[$key]);
    }

    public static function remove($key)
    {
        self::start();
        unset($_SESSION[$key]);
    }

    public static function destroy()
    {
        self::start();
        session_destroy();
        $_SESSION = [];
    }

    public static function regenerate()
    {
        self::start();
        session_regenerate_id(true);
    }
}
