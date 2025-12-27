<?php

class AdminMiddleware
{
    public function handle()
    {
        if (!Auth::checkToken()) {
            Response::unauthorized('Unauthorized. Please login.');
            return false;
        }

        $user = Auth::user();
        if (!$user || $user['role'] !== 'admin') {
            Response::forbidden('Access denied. Admin only.');
            return false;
        }

        return true;
    }
}
