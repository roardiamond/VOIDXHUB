<?php
/**
 * Authentication API
 * Handles user login, registration, and session management
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Start session
session_start();

// Include database
require_once 'db.php';

// Get request data
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

try {
    switch ($action) {
        case 'register':
            handleRegister($input);
            break;

        case 'login':
            handleLogin($input);
            break;

        case 'logout':
            handleLogout();
            break;

        case 'check_auth':
            handleCheckAuth();
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

/**
 * Handle user registration
 */
function handleRegister($input) {
    global $db;

    $username = trim($input['username'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    // Validation
    if (empty($username) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        return;
    }

    if (strlen($username) < 3) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username must be at least 3 characters']);
        return;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        return;
    }

    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters']);
        return;
    }

    // Check if user exists
    if ($db->getUserByEmail($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        return;
    }

    if ($db->getUserByUsername($username)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username already taken']);
        return;
    }

    // Create user
    $userId = $db->createUser($username, $email, $password);

    if ($userId) {
        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully',
            'user_id' => $userId
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create account']);
    }
}

/**
 * Handle user login
 */
function handleLogin($input) {
    global $db;

    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    // Validation
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email and password required']);
        return;
    }

    // Get user by email
    $user = $db->getUserByEmail($email);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        return;
    }

    // Verify password
    if (!$db->verifyPassword($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        return;
    }

    // Create session
    $sessionId = $db->createSession($user['id']);

    if ($sessionId) {
        // Set secure cookie
        setcookie(
            'session_id',
            $sessionId,
            strtotime('+30 days'),
            '/',
            '',
            false,
            true // httponly
        );

        // Also store in session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['session_id'] = $sessionId;

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user_id' => $user['id']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create session']);
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    global $db;

    $sessionId = $_COOKIE['session_id'] ?? $_SESSION['session_id'] ?? null;

    if ($sessionId) {
        $db->deleteSession($sessionId);
    }

    // Clear cookies and session
    setcookie('session_id', '', time() - 3600, '/');
    session_destroy();

    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
}

/**
 * Check if user is authenticated
 */
function handleCheckAuth() {
    global $db;

    $sessionId = $_COOKIE['session_id'] ?? $_SESSION['session_id'] ?? null;

    if (!$sessionId) {
        http_response_code(401);
        echo json_encode(['authenticated' => false]);
        return;
    }

    $session = $db->getSession($sessionId);

    if (!$session) {
        http_response_code(401);
        echo json_encode(['authenticated' => false]);
        return;
    }

    $user = $db->getUserById($session['user_id']);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['authenticated' => false]);
        return;
    }

    echo json_encode([
        'authenticated' => true,
        'user' => $user
    ]);
}
?>
