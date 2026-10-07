<?php
require_once '../../config/database.php';

if (isLoggedIn()) {
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'] ?? '',
            'email' => $_SESSION['user_email'] ?? ''
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
}
