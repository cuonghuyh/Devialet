<?php

class AuthMiddleware
{
    public function handle()
    {
        if (!Auth::checkToken()) {
            Response::unauthorized('Unauthorized. Please login.');
            return false;
        }
        return true;
    }
}
