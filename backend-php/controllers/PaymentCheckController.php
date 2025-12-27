<?php

class PaymentCheckController
{
    private $request;

    public function __construct()
    {
        $this->request = new Request();
    }

    public function check()
    {
        // Proxy to bypass CORS
        $url = $this->request->get('url');
        
        if (!$url) {
            Response::error('URL parameter is required', 400);
        }

        $response = file_get_contents($url);
        
        header('Content-Type: application/json');
        echo $response;
        exit;
    }

    public function verify()
    {
        $data = $this->request->all();
        
        // Implement payment verification logic here
        Response::success(['verified' => true]);
    }
}
