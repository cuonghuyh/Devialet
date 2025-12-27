<?php

class Router
{
    private $routes = [];
    private $middlewares = [];

    public function get($path, $handler)
    {
        $this->addRoute('GET', $path, $handler);
        return $this;
    }

    public function post($path, $handler)
    {
        $this->addRoute('POST', $path, $handler);
        return $this;
    }

    public function put($path, $handler)
    {
        $this->addRoute('PUT', $path, $handler);
        return $this;
    }

    public function patch($path, $handler)
    {
        $this->addRoute('PATCH', $path, $handler);
        return $this;
    }

    public function delete($path, $handler)
    {
        $this->addRoute('DELETE', $path, $handler);
        return $this;
    }

    private function addRoute($method, $path, $handler)
    {
        $this->routes[$method][$path] = [
            'handler' => $handler,
            'middlewares' => []
        ];
    }

    public function middleware($middleware)
    {
        $lastMethod = array_key_last($this->routes);
        if ($lastMethod) {
            $lastPath = array_key_last($this->routes[$lastMethod]);
            $this->routes[$lastMethod][$lastPath]['middlewares'][] = $middleware;
        }
        return $this;
    }

    public function dispatch()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove /api prefix if exists
        $uri = preg_replace('#^/api#', '', $uri);
        
        if (!isset($this->routes[$method])) {
            $this->sendResponse(['error' => 'Method not allowed'], 405);
            return;
        }

        foreach ($this->routes[$method] as $path => $route) {
            $pattern = $this->getPattern($path);
            
            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches);
                
                // Run middlewares
                foreach ($route['middlewares'] as $middleware) {
                    $middlewareInstance = new $middleware();
                    $result = $middlewareInstance->handle();
                    if ($result !== true) {
                        return;
                    }
                }
                
                // Execute handler
                if (is_callable($route['handler'])) {
                    call_user_func_array($route['handler'], $matches);
                } elseif (is_array($route['handler'])) {
                    [$controller, $method] = $route['handler'];
                    $controllerInstance = new $controller();
                    call_user_func_array([$controllerInstance, $method], $matches);
                }
                return;
            }
        }

        $this->sendResponse(['error' => 'Route not found'], 404);
    }

    private function getPattern($path)
    {
        $pattern = preg_replace('#\{([a-zA-Z0-9_]+)\}#', '([^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    private function sendResponse($data, $status = 200)
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
    }
}
