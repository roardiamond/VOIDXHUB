<?php
/**
 * Payment / Registration API
 * Saves entry fee payments and player registrations to database
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'submit':
            handleSubmitPayment($input);
            break;

        case 'list':
            handleListPayments($input);
            break;

        case 'update_status':
            handleUpdateStatus($input);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handleSubmitPayment($input) {
    global $db;

    $format = trim($input['format'] ?? '');
    $totalAmount = (int)($input['total_amount'] ?? 0);
    $prizePool = (int)($input['prize_pool'] ?? 0);
    $txnId = trim($input['txn_id'] ?? '');
    $telegram = trim($input['telegram'] ?? '');
    $players = $input['players'] ?? [];

    if (empty($format) || empty($txnId) || empty($telegram) || $totalAmount <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }

    // Check if txn already exists
    $existing = $db->getPaymentByTxn($txnId);
    if ($existing) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Transaction ID already submitted']);
        return;
    }

    $paymentId = $db->createPayment($format, $totalAmount, $prizePool, $txnId, $telegram, $players);

    if ($paymentId) {
        echo json_encode([
            'success' => true,
            'message' => 'Payment registered successfully',
            'payment_id' => $paymentId
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save payment']);
    }
}

function handleListPayments($input) {
    global $db;

    $status = $input['status'] ?? null;
    $limit = (int)($input['limit'] ?? 100);

    $payments = $db->getAllPayments($status, $limit);

    echo json_encode([
        'success' => true,
        'count' => count($payments),
        'payments' => $payments
    ]);
}

function handleUpdateStatus($input) {
    global $db;

    $id = (int)($input['id'] ?? 0);
    $status = trim($input['status'] ?? '');
    $notes = $input['notes'] ?? null;

    if (!$id || !in_array($status, ['pending', 'verified', 'rejected'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid id or status']);
        return;
    }

    $result = $db->updatePaymentStatus($id, $status, $notes);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Status updated']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update status']);
    }
}
?>
