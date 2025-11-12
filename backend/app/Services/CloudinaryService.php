<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;

class CloudinaryService
{
    protected $cloudName;
    protected $apiKey;
    protected $apiSecret;
    protected $httpClient;

    public function __construct()
    {
        $this->cloudName = config('cloudinary.cloud_name') ?: env('CLOUDINARY_CLOUD_NAME');
        $this->apiKey = config('cloudinary.api_key') ?: env('CLOUDINARY_API_KEY');
        $this->apiSecret = config('cloudinary.api_secret') ?: env('CLOUDINARY_API_SECRET');
        
        // Create Guzzle client with SSL verification disabled (Windows fix)
        $this->httpClient = new Client([
            'verify' => false, // Disable SSL verification for local development
        ]);
    }

    public function upload($filePath, $options = [])
    {
        $url = "https://api.cloudinary.com/v1_1/{$this->cloudName}/image/upload";
        
        $timestamp = time();
        $params = [
            'timestamp' => $timestamp,
            'folder' => $options['folder'] ?? '',
        ];
        
        // Generate signature
        $signature = $this->generateSignature($params);
        
        // Prepare multipart form data
        $multipart = [
            [
                'name' => 'file',
                'contents' => fopen($filePath, 'r'),
            ],
            [
                'name' => 'timestamp',
                'contents' => $timestamp,
            ],
            [
                'name' => 'api_key',
                'contents' => $this->apiKey,
            ],
            [
                'name' => 'signature',
                'contents' => $signature,
            ],
        ];
        
        if (!empty($params['folder'])) {
            $multipart[] = [
                'name' => 'folder',
                'contents' => $params['folder'],
            ];
        }
        
        $response = $this->httpClient->post($url, [
            'multipart' => $multipart,
        ]);
        
        return json_decode($response->getBody(), true);
    }

    public function destroy($publicId, $options = [])
    {
        $url = "https://api.cloudinary.com/v1_1/{$this->cloudName}/image/destroy";
        
        $timestamp = time();
        $params = [
            'timestamp' => $timestamp,
            'public_id' => $publicId,
        ];
        
        $signature = $this->generateSignature($params);
        
        $response = $this->httpClient->post($url, [
            'form_params' => [
                'public_id' => $publicId,
                'timestamp' => $timestamp,
                'api_key' => $this->apiKey,
                'signature' => $signature,
            ],
        ]);
        
        return json_decode($response->getBody(), true);
    }

    protected function generateSignature($params)
    {
        // Sort parameters
        ksort($params);
        
        // Build string to sign
        $parts = [];
        foreach ($params as $key => $value) {
            if (!empty($value)) {
                $parts[] = $key . '=' . $value;
            }
        }
        $toSign = implode('&', $parts) . $this->apiSecret;
        
        return sha1($toSign);
    }
}
