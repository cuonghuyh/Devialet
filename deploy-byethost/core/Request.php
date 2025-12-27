<?php

class Request
{
    private $data;
    private $files;
    private $headers;

    public function __construct()
    {
        $this->parseRequest();
        $this->files = $_FILES;
        $this->headers = $this->getHeaders();
    }

    private function parseRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'GET') {
            $this->data = $_GET;
        } elseif ($method === 'POST') {
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            
            if (strpos($contentType, 'application/json') !== false) {
                $this->data = json_decode(file_get_contents('php://input'), true) ?? [];
            } else {
                $this->data = $_POST;
            }
        } elseif (in_array($method, ['PUT', 'PATCH', 'DELETE'])) {
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            
            if (strpos($contentType, 'application/json') !== false) {
                $this->data = json_decode(file_get_contents('php://input'), true) ?? [];
            } else {
                parse_str(file_get_contents('php://input'), $this->data);
            }
        }
    }

    private function getHeaders()
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $header = str_replace('HTTP_', '', $key);
                $header = str_replace('_', '-', $header);
                $headers[strtolower($header)] = $value;
            }
        }
        
        // Add Authorization header if exists
        if (isset($_SERVER['Authorization'])) {
            $headers['authorization'] = $_SERVER['Authorization'];
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers['authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (function_exists('apache_request_headers')) {
            $apacheHeaders = apache_request_headers();
            if (isset($apacheHeaders['Authorization'])) {
                $headers['authorization'] = $apacheHeaders['Authorization'];
            }
        }
        
        return $headers;
    }

    public function all()
    {
        return $this->data;
    }

    public function get($key, $default = null)
    {
        return $this->data[$key] ?? $default;
    }

    public function has($key)
    {
        return isset($this->data[$key]);
    }

    public function file($key)
    {
        return $this->files[$key] ?? null;
    }

    public function header($key)
    {
        return $this->headers[strtolower($key)] ?? null;
    }

    public function bearerToken()
    {
        $header = $this->header('authorization');
        if ($header && preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public function validate($rules)
    {
        $validator = new Validator();
        return $validator->validate($this->data, $rules);
    }

    public function method()
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    public function uri()
    {
        return $_SERVER['REQUEST_URI'];
    }

    public function ip()
    {
        return $_SERVER['REMOTE_ADDR'] ?? '';
    }
}
