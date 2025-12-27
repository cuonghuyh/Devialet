<?php

return [
    'name' => $_ENV['APP_NAME'] ?? 'Laravel',
    'env' => $_ENV['APP_ENV'] ?? 'production',
    'debug' => ($_ENV['APP_DEBUG'] ?? 'false') === 'true',
    'url' => $_ENV['APP_URL'] ?? 'http://localhost',
    'key' => $_ENV['APP_KEY'] ?? '',
    
    // Session
    'session_lifetime' => $_ENV['SESSION_LIFETIME'] ?? 120,
    'session_name' => 'devialet_session',
    
    // JWT
    'jwt_secret' => $_ENV['JWT_SECRET'] ?? 'your-secret-key-change-this-in-production',
    'jwt_expiration' => 60 * 60 * 24 * 30, // 30 days
    
    // CORS
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        'https://devialet.netlify.app',
        'http://devialet.netlify.app',
        'https://devialet-shop.netlify.app',
        'https://devialet-shop.vercel.app',
        'https://devialet.vercel.app',
        'https://devialet.ct.ws',
        'http://devialet.ct.ws',
    ],
];
