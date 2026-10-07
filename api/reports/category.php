<?php
require_once '../../config/database.php';
requireLogin();

$month = (int)($_GET['month'] ?? date('n'));
$year = (int)($_GET['year'] ?? date('Y'));
$user_id = getUserId();

try {
    $stmt = $pdo->prepare("SELECT category, SUM(amount) as total FROM transactions WHERE user_id=? AND type='expense' AND MONTH(transaction_date)=? AND YEAR(transaction_date)=? GROUP BY category ORDER BY total DESC");
    $stmt->execute([$user_id, $month, $year]);
    $categories = $stmt->fetchAll();

    $totStmt = $pdo->prepare("SELECT SUM(amount) FROM transactions WHERE user_id=? AND type='expense' AND MONTH(transaction_date)=? AND YEAR(transaction_date)=?");
    $totStmt->execute([$user_id, $month, $year]);
    $total_expense = (float)$totStmt->fetchColumn() ?: 0.0;

    $result = [];
    foreach ($categories as $cat) {
        $amount = (float)$cat['total'];
        $percentage = $total_expense > 0 ? ($amount / $total_expense) * 100 : 0;
        $result[] = [
            'category' => $cat['category'],
            'amount' => $amount,
            'percentage' => round($percentage, 2)
        ];
    }
    
    echo json_encode(['success' => true, 'categories' => $result, 'total' => $total_expense]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
