<?php
/**
 * Database initialization and connection file
 * Handles SQLite database setup, user operations and payments
 */

class Database {
    private $db;
    private $dbPath;

    public function __construct() {
        $this->dbPath = __DIR__ . '/users.db';
        $this->connect();
        $this->initializeDatabase();
    }

    private function connect() {
        try {
            $this->db = new PDO('sqlite:' . $this->dbPath);
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
        }
    }

    private function initializeDatabase() {
        try {
            // Users table
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ");

            // Sessions table
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            ");

            // Payments / Registrations table
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS payments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    format TEXT NOT NULL,
                    total_amount INTEGER NOT NULL,
                    prize_pool INTEGER DEFAULT 0,
                    txn_id TEXT NOT NULL,
                    telegram TEXT NOT NULL,
                    players_json TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    verified_at DATETIME DEFAULT NULL,
                    notes TEXT DEFAULT NULL
                )
            ");

            // Create index for faster search
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_payments_txn ON payments(txn_id)");
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)");

        } catch (PDOException $e) {
            error_log('Database initialization error: ' . $e->getMessage());
        }
    }

    // ========== USER METHODS ==========

    public function getUserByEmail($email) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Database query error: ' . $e->getMessage());
            return null;
        }
    }

    public function getUserByUsername($username) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$username]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Database query error: ' . $e->getMessage());
            return null;
        }
    }

    public function getUserById($id) {
        try {
            $stmt = $this->db->prepare("SELECT id, username, email, created_at FROM users WHERE id = ?");
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Database query error: ' . $e->getMessage());
            return null;
        }
    }

    public function createUser($username, $email, $password) {
        try {
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $this->db->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
            $result = $stmt->execute([$username, $email, $hashedPassword]);
            return $result ? $this->db->lastInsertId() : false;
        } catch (PDOException $e) {
            error_log('Database insert error: ' . $e->getMessage());
            return false;
        }
    }

    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    public function createSession($userId) {
        try {
            $sessionId = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
            $stmt = $this->db->prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)");
            $stmt->execute([$sessionId, $userId, $expiresAt]);
            return $sessionId;
        } catch (PDOException $e) {
            error_log('Session creation error: ' . $e->getMessage());
            return false;
        }
    }

    public function getSession($sessionId) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP");
            $stmt->execute([$sessionId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Session query error: ' . $e->getMessage());
            return null;
        }
    }

    public function deleteSession($sessionId) {
        try {
            $stmt = $this->db->prepare("DELETE FROM sessions WHERE id = ?");
            return $stmt->execute([$sessionId]);
        } catch (PDOException $e) {
            error_log('Session deletion error: ' . $e->getMessage());
            return false;
        }
    }

    public function cleanExpiredSessions() {
        try {
            $this->db->exec("DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP");
        } catch (PDOException $e) {
            error_log('Session cleanup error: ' . $e->getMessage());
        }
    }

    // ========== PAYMENT METHODS ==========

    public function createPayment($format, $totalAmount, $prizePool, $txnId, $telegram, $players) {
        try {
            $playersJson = json_encode($players);
            $stmt = $this->db->prepare("
                INSERT INTO payments (format, total_amount, prize_pool, txn_id, telegram, players_json, status)
                VALUES (?, ?, ?, ?, ?, ?, 'pending')
            ");
            $result = $stmt->execute([$format, $totalAmount, $prizePool, $txnId, $telegram, $playersJson]);
            return $result ? $this->db->lastInsertId() : false;
        } catch (PDOException $e) {
            error_log('Payment insert error: ' . $e->getMessage());
            return false;
        }
    }

    public function getPaymentByTxn($txnId) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM payments WHERE txn_id = ?");
            $stmt->execute([$txnId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Payment query error: ' . $e->getMessage());
            return null;
        }
    }

    public function getAllPayments($status = null, $limit = 100) {
        try {
            if ($status) {
                $stmt = $this->db->prepare("SELECT * FROM payments WHERE status = ? ORDER BY created_at DESC LIMIT ?");
                $stmt->execute([$status, $limit]);
            } else {
                $stmt = $this->db->prepare("SELECT * FROM payments ORDER BY created_at DESC LIMIT ?");
                $stmt->execute([$limit]);
            }
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Payment list error: ' . $e->getMessage());
            return [];
        }
    }

    public function updatePaymentStatus($id, $status, $notes = null) {
        try {
            $stmt = $this->db->prepare("
                UPDATE payments 
                SET status = ?, notes = ?, verified_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            return $stmt->execute([$status, $notes, $id]);
        } catch (PDOException $e) {
            error_log('Payment update error: ' . $e->getMessage());
            return false;
        }
    }
}

// Initialize database connection
$db = new Database();
?>
