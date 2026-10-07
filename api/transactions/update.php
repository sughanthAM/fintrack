<?php
require_once '../../config/database.php';
requireLogin();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$id = $data['id'] ?? null;
$type = sanitize($data['type'] ?? '');
$category = sanitize($data['category'] ?? '');
$amount = floatval($data['amount'] ?? 0);
$description = sanitize($data['description'] ?? '');
$transaction_date = sanitize($data['date'] ?? '');

if (!$id || !in_array($type, ['income', 'expense']) || empty($category) || $amount <= 0 || empty($transaction_date)) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE transactions SET type=?, category=?, amount=?, description=?, transaction_date=? WHERE id=? AND user_id=?");
    if ($stmt->execute([$type, $category, $amount, $description, $transaction_date, $id, getUserId()])) {
        echo json_encode(['success' => true, 'message' => 'Transaction updated']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update transaction']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
