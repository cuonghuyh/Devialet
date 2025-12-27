<?php

return [
    'cloud_name' => $_ENV['CLOUDINARY_CLOUD_NAME'] ?? '',
    'api_key' => $_ENV['CLOUDINARY_API_KEY'] ?? '',
    'api_secret' => $_ENV['CLOUDINARY_API_SECRET'] ?? '',
    'url' => $_ENV['CLOUDINARY_URL'] ?? '',
    'verify_ssl' => ($_ENV['CLOUDINARY_VERIFY_SSL'] ?? 'true') === 'true',
];
