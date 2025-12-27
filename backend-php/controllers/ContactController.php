<?php

class ContactController
{
    private $db;
    private $request;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->request = new Request();
    }

    public function submit()
    {
        $data = $this->request->all();

        $this->request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $this->db->execute(
            "INSERT INTO contacts (name, email, subject, message, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())",
            [$data['name'], $data['email'], $data['subject'], $data['message']]
        );

        Response::success([], 'Message sent successfully!', 201);
    }
}
