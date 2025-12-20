ALTER TABLE orders 
ADD COLUMN customer_name VARCHAR(255) AFTER user_id,
ADD COLUMN customer_phone VARCHAR(255) AFTER customer_name,
ADD COLUMN customer_address TEXT AFTER customer_phone,
ADD COLUMN customer_email VARCHAR(255) NULL AFTER customer_address,
ADD COLUMN subtotal DECIMAL(10,2) AFTER customer_email,
ADD COLUMN shipping_fee DECIMAL(10,2) DEFAULT 0 AFTER subtotal,
ADD COLUMN total DECIMAL(10,2) AFTER shipping_fee,
ADD COLUMN payment_method VARCHAR(255) AFTER total,
ADD COLUMN payment_status ENUM('unpaid','paid','refunded') DEFAULT 'unpaid' AFTER status,
ADD COLUMN note TEXT NULL AFTER payment_status;
