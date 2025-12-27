<?php

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');

// Include routes
require_once __DIR__ . '/../routes/api.php';
