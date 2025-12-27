<?php

class AdminProductController
{
    private $db;
    private $request;
    private $cloudinary;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->request = new Request();
        $this->cloudinary = new CloudinaryService();
    }

    public function index()
    {
        $search = $this->request->get('search');
        $categoryId = $this->request->get('category_id');
        $perPage = $this->request->get('per_page', 20);
        $page = $this->request->get('page', 1);
        $offset = ($page - 1) * $perPage;

        $sql = "SELECT p.*, c.name as category_name FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE 1=1";
        $params = [];

        if ($search) {
            $sql .= " AND (p.name LIKE ? OR p.sku LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        if ($categoryId && $categoryId !== 'all') {
            $sql .= " AND p.category_id = ?";
            $params[] = $categoryId;
        }

        $countSql = "SELECT COUNT(*) as total FROM products p WHERE 1=1";
        $countParams = [];
        
        if ($search) {
            $countSql .= " AND (p.name LIKE ? OR p.sku LIKE ?)";
            $countParams[] = "%{$search}%";
            $countParams[] = "%{$search}%";
        }
        if ($categoryId && $categoryId !== 'all') {
            $countSql .= " AND p.category_id = ?";
            $countParams[] = $categoryId;
        }

        $total = $this->db->fetch($countSql, $countParams)['total'];

        $sql .= " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
        $params[] = (int)$perPage;
        $params[] = (int)$offset;

        $products = $this->db->fetchAll($sql, $params);

        Response::success([
            'data' => $products,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
        ]);
    }

    public function store()
    {
        $data = $this->request->all();

        $this->request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'category_id' => 'required|integer|exists:categories,id',
            'price' => 'required|numeric',
            'discount_price' => 'nullable|numeric',
            'description' => 'required|string',
            'stock' => 'required|integer',
        ]);

        // Upload image
        $imageUrl = null;
        $file = $this->request->file('image');
        
        if ($file && $file['error'] === UPLOAD_ERR_OK) {
            $imageUrl = $this->cloudinary->upload($file['tmp_name'], 'devialet/products');
        }

        // Create product
        $slug = $this->generateSlug($data['name']);
        
        $this->db->execute(
            "INSERT INTO products (name, slug, sku, category_id, price, discount_price, description, stock, image_url, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
            [
                $data['name'],
                $slug,
                $data['sku'],
                $data['category_id'],
                $data['price'],
                $data['discount_price'] ?? null,
                $data['description'],
                $data['stock'],
                $imageUrl
            ]
        );

        $productId = $this->db->lastInsertId();
        $product = $this->db->fetch(
            "SELECT p.*, c.name as category_name FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.id = ?",
            [$productId]
        );

        Response::success(['product' => $product], 'Tạo sản phẩm thành công', 201);
    }

    public function show($id)
    {
        $product = $this->db->fetch(
            "SELECT p.*, c.name as category_name FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.id = ?",
            [$id]
        );

        if (!$product) {
            Response::notFound('Product not found');
        }

        Response::success($product);
    }

    public function update($id)
    {
        $data = $this->request->all();

        $product = $this->db->fetch("SELECT * FROM products WHERE id = ?", [$id]);
        
        if (!$product) {
            Response::notFound('Product not found');
        }

        // Validation with unique check excluding current product
        $rules = [
            'name' => 'required|string|max:255',
            'category_id' => 'required|integer|exists:categories,id',
            'price' => 'required|numeric',
            'discount_price' => 'nullable|numeric',
            'description' => 'required|string',
            'stock' => 'required|integer',
        ];

        // Check SKU uniqueness manually
        if (isset($data['sku']) && $data['sku'] !== $product['sku']) {
            $existing = $this->db->fetch(
                "SELECT id FROM products WHERE sku = ? AND id != ?",
                [$data['sku'], $id]
            );
            if ($existing) {
                Response::error('SKU already exists', 422);
            }
        }

        $this->request->validate($rules);

        // Upload new image if provided
        $imageUrl = $product['image_url'];
        $file = $this->request->file('image');
        
        if ($file && $file['error'] === UPLOAD_ERR_OK) {
            $imageUrl = $this->cloudinary->upload($file['tmp_name'], 'devialet/products');
        }

        // Update product
        $slug = $this->generateSlug($data['name']);
        
        $this->db->execute(
            "UPDATE products SET name = ?, slug = ?, sku = ?, category_id = ?, price = ?, discount_price = ?, description = ?, stock = ?, image_url = ?, updated_at = NOW() 
             WHERE id = ?",
            [
                $data['name'],
                $slug,
                $data['sku'] ?? $product['sku'],
                $data['category_id'],
                $data['price'],
                $data['discount_price'] ?? null,
                $data['description'],
                $data['stock'],
                $imageUrl,
                $id
            ]
        );

        $updatedProduct = $this->db->fetch(
            "SELECT p.*, c.name as category_name FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.id = ?",
            [$id]
        );

        Response::success(['product' => $updatedProduct], 'Cập nhật sản phẩm thành công');
    }

    public function destroy($id)
    {
        $product = $this->db->fetch("SELECT * FROM products WHERE id = ?", [$id]);
        
        if (!$product) {
            Response::notFound('Product not found');
        }

        $this->db->execute("DELETE FROM products WHERE id = ?", [$id]);

        Response::success([], 'Xóa sản phẩm thành công');
    }

    public function updateStock($id)
    {
        $data = $this->request->all();

        $this->request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $product = $this->db->fetch("SELECT * FROM products WHERE id = ?", [$id]);
        
        if (!$product) {
            Response::notFound('Product not found');
        }

        $this->db->execute(
            "UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ?",
            [$data['stock'], $id]
        );

        $updatedProduct = $this->db->fetch("SELECT * FROM products WHERE id = ?", [$id]);

        Response::success(['product' => $updatedProduct], 'Cập nhật tồn kho thành công');
    }

    private function generateSlug($name)
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
        
        // Check if slug exists
        $existing = $this->db->fetch("SELECT id FROM products WHERE slug = ?", [$slug]);
        
        if ($existing) {
            $slug .= '-' . time();
        }
        
        return $slug;
    }
}
