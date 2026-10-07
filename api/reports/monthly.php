<?php
require_once '../../config/database.php';
requireLogin();

$from_month = (int)($_GET['from_month'] ?? date('n', strtotime('-5 months')));
$from_year = (int)($_GET['from_year'] ?? date('Y', strtotime('-5 months')));
$to_month = (int)($_GET['to_month'] ?? date('n'));
$to_year = (int)($_GET['to_year'] ?? date('Y'));
$user_id = getUserId();

$start = strtotime("$from_year-$from_month-01");
$end = strtotime("$to_year-$to_month-01");

$report = [];
try {
    $current = $start;
    while ($current <= $end) {
        $m = date('m', $current);
        $y = date('Y', $current);
        
        $inc = $pdo->prepare("SELECT SUM(amount) FROM transactions WHERE user_id=? AND type='income' AND MONTH(transaction_date)=? AND YEAR(transaction_date)=?");
        $inc->execute([$user_id, $m, $y]);
        $incVal = (float)$inc->fetchColumn() ?: 0.0;
        
        $exp = $pdo->prepare("SELECT SUM(amount) FROM transactions WHERE user_id=? AND type='expense' AND MONTH(transaction_date)=? AND YEAR(transaction_date)=?");
        $exp->execute([$user_id, $m, $y]);
        $expVal = (float)$exp->fetchColumn() ?: 0.0;
        
        $report[] = [
            'month' => date('M Y', $current),
            'income' => $incVal,
            'expense' => $expVal,
            'net_balance' => $incVal - $expVal
        ];
        $current = strtotime("+1 month", $current);
    }
    echo json_encode(['success' => true, 'report' => $report]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
