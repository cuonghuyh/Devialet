<?php

class CloudinaryService
{
    private $config;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../config/cloudinary.php';
        
        \Cloudinary::config([
            'cloud_name' => $this->config['cloud_name'],
            'api_key' => $this->config['api_key'],
            'api_secret' => $this->config['api_secret'],
            'secure' => true
        ]);
    }

    public function upload($filePath, $folder = 'products')
    {
        try {
            $result = \Cloudinary\Uploader::upload($filePath, [
                'folder' => $folder,
                'resource_type' => 'auto'
            ]);

            return $result['secure_url'] ?? null;
        } catch (Exception $e) {
            error_log("Cloudinary upload failed: " . $e->getMessage());
            return null;
        }
    }

    public function delete($publicId)
    {
        try {
            $result = \Cloudinary\Uploader::destroy($publicId);
            return $result['result'] === 'ok';
        } catch (Exception $e) {
            error_log("Cloudinary delete failed: " . $e->getMessage());
            return false;
        }
    }
}
