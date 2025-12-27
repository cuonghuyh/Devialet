<?php

class Response
{
    public static function json($data, $status = 200)
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public static function success($data = [], $message = null, $status = 200)
    {
        $response = ['success' => true];
        
        if ($message) {
            $response['message'] = $message;
        }
        
        $response = array_merge($response, $data);
        
        self::json($response, $status);
    }

    public static function error($message, $status = 400, $errors = [])
    {
        $response = [
            'success' => false,
            'message' => $message
        ];
        
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        
        self::json($response, $status);
    }

    public static function unauthorized($message = 'Unauthorized')
    {
        self::error($message, 401);
    }

    public static function forbidden($message = 'Forbidden')
    {
        self::error($message, 403);
    }

    public static function notFound($message = 'Not found')
    {
        self::error($message, 404);
    }

    public static function validationError($errors)
    {
        self::error('Validation failed', 422, $errors);
    }
}
