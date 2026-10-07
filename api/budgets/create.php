<?php
require_once '../../config/database.php';
requireLogin();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$category = sanitize($data['category'] ?? '');
$amount = floatval($data['amount'] ?? 0);
$month = (int)($data['month'] ?? 0);
$year = (int)($data['year'] ?? 0);

if (empty($category) || $amount <= 0 || $month < 1 || $month > 12 || $year < 2000) {
    echo json_encode(['success' => false, 'message' => 'Invalid budget data']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?) 
                           ON DUPLICATE KEY UPDATE amount = VALUES(amount)");
    if ($stmt->execute([getUserId(), $category, $amount, $month, $year])) {
        echo json_encode(['success' => true, 'message' => 'Budget saved']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save budget']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
