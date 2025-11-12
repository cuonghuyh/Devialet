-- Tạo database cho Devialet
CREATE DATABASE IF NOT EXISTS devialet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE devialet;

-- Bảng users sẽ được tạo tự động bởi Laravel migration
-- Nhưng bạn có thể xem structure ở đây:

/*
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
*/
