<?php
require_once '../../config/database.php';
requireLogin();
$user_id = getUserId();

try {
    $incStmt = $pdo->prepare("SELECT SUM(amount) FROM transactions WHERE user_id=? AND type='income'");
    $incStmt->execute([$user_id]);
    $total_income = (float)$incStmt->fetchColumn() ?: 0.0;

    $expStmt = $pdo->prepare("SELECT SUM(amount) FROM transactions WHERE user_id=? AND type='expense'");
    $expStmt->execute([$user_id]);
    $total_expenses = (float)$expStmt->fetchColumn() ?: 0.0;

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM transactions WHERE user_id=?");
    $countStmt->execute([$user_id]);
    $transaction_count = (int)$countStmt->fetchColumn();

    $balance = $total_income - $total_expenses;

    $recStmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id=? ORDER BY transaction_date DESC LIMIT 5");
    $recStmt->execute([$user_id]);
    $recent = $recStmt->fetchAll();

    $monthly = [];
    for ($i = 5; $i >= 0; $i--) {
        $m = date('m', strtotime("-$i months"));
        $y = date('Y', strtotime("-$i months"));
        
        $mInc = $pdo->prepare("SELECT SUM(amount) FROM transactions WHERE user_id=? AND type='income' AND MONTH(transaction_date)=? AND YEAR(transaction_date)=?");
        $mInc->execute([$user_id, $m, $y]);
        
        $mExp = $pdo->prepare("SELECT SUM(amount) FROM transactions WHERE user_id=? AND type='expense' AND MONTH(transaction_date)=? AND YEAR(transaction_date)=?");
        $mExp->execute([$user_id, $m, $y]);
        
        $monthly[] = [
            'month' => date('M Y', strtotime("-$i months")),
            'income' => (float)$mInc->fetchColumn() ?: 0.0,
            'expense' => (float)$mExp->fetchColumn() ?: 0.0
        ];
    }

    echo json_encode([
        'success' => true,
        'total_income' => $total_income,
        'total_expenses' => $total_expenses,
        'balance' => $balance,
        'transaction_count' => $transaction_count,
        'recent_transactions' => $recent,
        'monthly_data' => $monthly
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
