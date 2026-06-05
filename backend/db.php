<?php
/**
 * Database initialization and connection file
 * Handles SQLite database setup and user operations
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
            // Check if users table exists
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

            // Create sessions table
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            ");
        } catch (PDOException $e) {
            error_log('Database initialization error: ' . $e->getMessage());
        }
    }

    // Get user by email
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

    // Get user by username
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

    // Get user by ID
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

    // Create new user
    public function createUser($username, $email, $password) {
        try {
            // Hash the password
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

            $stmt = $this->db->prepare("
                INSERT INTO users (username, email, password)
                VALUES (?, ?, ?)
            ");
            
            $result = $stmt->execute([$username, $email, $hashedPassword]);
            return $result ? $this->db->lastInsertId() : false;
        } catch (PDOException $e) {
            error_log('Database insert error: ' . $e->getMessage());
            return false;
        }
    }

    // Verify password
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    // Create session
    public function createSession($userId) {
        try {
            $sessionId = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

            $stmt = $this->db->prepare("
                INSERT INTO sessions (id, user_id, expires_at)
                VALUES (?, ?, ?)
            ");

            $stmt->execute([$sessionId, $userId, $expiresAt]);
            return $sessionId;
        } catch (PDOException $e) {
            error_log('Session creation error: ' . $e->getMessage());
            return false;
        }
    }

    // Get session
    public function getSession($sessionId) {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM sessions 
                WHERE id = ? AND expires_at > CURRENT_TIMESTAMP
            ");
            $stmt->execute([$sessionId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Session query error: ' . $e->getMessage());
            return null;
        }
    }

    // Delete session
    public function deleteSession($sessionId) {
        try {
            $stmt = $this->db->prepare("DELETE FROM sessions WHERE id = ?");
            return $stmt->execute([$sessionId]);
        } catch (PDOException $e) {
            error_log('Session deletion error: ' . $e->getMessage());
            return false;
        }
    }

    // Clean expired sessions
    public function cleanExpiredSessions() {
        try {
            $this->db->exec("DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP");
        } catch (PDOException $e) {
            error_log('Session cleanup error: ' . $e->getMessage());
        }
    }
}

// Initialize database connection
$db = new Database();
?>
