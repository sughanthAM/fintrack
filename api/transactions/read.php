<?php
require_once '../../config/database.php';
requireLogin();

$type = $_GET['type'] ?? '';
$category = $_GET['category'] ?? '';
$from_date = $_GET['from_date'] ?? '';
$to_date = $_GET['to_date'] ?? '';
$search = $_GET['search'] ?? '';
$page = (int)($_GET['page'] ?? 1);
$limit = (int)($_GET['limit'] ?? 10);
$offset = ($page - 1) * $limit;

$params = [getUserId()];
$where = "user_id = ?";

if (!empty($type)) {
    $where .= " AND type = ?";
    $params[] = $type;
}
if (!empty($category)) {
    $where .= " AND category = ?";
    $params[] = $category;
}
if (!empty($from_date)) {
    $where .= " AND transaction_date >= ?";
    $params[] = $from_date;
}
if (!empty($to_date)) {
    $where .= " AND transaction_date <= ?";
    $params[] = $to_date;
}
if (!empty($search)) {
    $where .= " AND description LIKE ?";
    $params[] = '%' . $search . '%';
}

try {
    // Count total
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM transactions WHERE $where");
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();

    // Fetch data
    $query = "SELECT * FROM transactions WHERE $where ORDER BY transaction_date DESC, id DESC LIMIT $limit OFFSET $offset";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $transactions = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'transactions' => $transactions,
        'total' => $total,
        'pages' => ceil($total / $limit),
        'current_page' => $page
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
