<?php
require_once '../../config/database.php';
requireLogin();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$type = sanitize($data['type'] ?? '');
$category = sanitize($data['category'] ?? '');
$amount = floatval($data['amount'] ?? 0);
$description = sanitize($data['description'] ?? '');
$transaction_date = sanitize($data['date'] ?? '');

if (!in_array($type, ['income', 'expense']) || empty($category) || $amount <= 0 || empty($transaction_date)) {
    echo json_encode(['success' => false, 'message' => 'Invalid transaction data']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO transactions (user_id, type, category, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([getUserId(), $type, $category, $amount, $description, $transaction_date])) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create transaction']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
