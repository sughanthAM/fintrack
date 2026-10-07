<?php
require_once '../../config/database.php';
requireLogin();

$month = (int)($_GET['month'] ?? date('n'));
$year = (int)($_GET['year'] ?? date('Y'));
$user_id = getUserId();

try {
    $stmt = $pdo->prepare("SELECT id, category, amount FROM budgets WHERE user_id=? AND month=? AND year=?");
    $stmt->execute([$user_id, $month, $year]);
    $budgets = $stmt->fetchAll();

    $result = [];
    foreach ($budgets as $b) {
        $catStmt = $pdo->prepare("SELECT SUM(amount) FROM transactions WHERE user_id=? AND category=? AND type='expense' AND MONTH(transaction_date)=? AND YEAR(transaction_date)=?");
        $catStmt->execute([$user_id, $b['category'], $month, $year]);
        $spent = (float)$catStmt->fetchColumn() ?: 0.0;
        
        $budget_amount = (float)$b['amount'];
        $remaining = $budget_amount - $spent;
        $percentage = $budget_amount > 0 ? ($spent / $budget_amount) * 100 : 0;
        
        $result[] = [
            'id' => $b['id'],
            'category' => $b['category'],
            'amount' => $budget_amount,
            'spent' => $spent,
            'remaining' => $remaining,
            'percentage' => round($percentage, 2)
        ];
    }

    echo json_encode(['success' => true, 'budgets' => $result]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
