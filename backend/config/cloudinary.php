<?php

/*
 * This file is part of the Laravel Cloudinary package.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

return [

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Cloud Name
    |--------------------------------------------------------------------------
    |
    | This is your Cloudinary cloud name.
    |
    */

    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),

    /*
    |--------------------------------------------------------------------------
    | Cloudinary API Key
    |--------------------------------------------------------------------------
    |
    | This is your Cloudinary API key.
    |
    */

    'api_key' => env('CLOUDINARY_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Cloudinary API Secret
    |--------------------------------------------------------------------------
    |
    | This is your Cloudinary API secret.
    |
    */

    'api_secret' => env('CLOUDINARY_API_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Secure URL
    |--------------------------------------------------------------------------
    |
    | This configuration option determines whether to use secure URLs (HTTPS).
    |
    */

    'secure' => env('CLOUDINARY_SECURE_URL', true),

    /*
    |--------------------------------------------------------------------------
    | Cloudinary HTTP Options
    |--------------------------------------------------------------------------
    |
    | Additional Guzzle HTTP options for API requests.
    |
    */

    'http_options' => [
        'verify' => env('APP_ENV') === 'production',
    ],

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Upload Preset
    |--------------------------------------------------------------------------
    |
    | Upload preset for unsigned uploads.
    |
    */

    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),

];
