<?php
require_once '../../config/database.php';
requireLogin();

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID required']);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM transactions WHERE id=? AND user_id=?");
    if ($stmt->execute([$id, getUserId()])) {
        echo json_encode(['success' => true, 'message' => 'Transaction deleted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete transaction']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
