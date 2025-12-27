<?php

class CategoryController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function index()
    {
        $categories = $this->db->fetchAll("SELECT * FROM categories ORDER BY name ASC");

        Response::success([
            'categories' => $categories
        ]);
    }
}
