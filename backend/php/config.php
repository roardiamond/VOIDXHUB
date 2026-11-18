/**
 * Login System Configuration
 * Backend settings and security options
 *
 * IMPORTANT: In production always run over HTTPS and set
 * environment variables for any secrets.
 */

return [
    // Database settings
    'database' => [
        'type' => 'sqlite',
        'path' => __DIR__ . '/users.db',
    ],

    // Session settings
    'session' => [
        'timeout' => 2592000, // 30 days in seconds
        'httponly' => true,
        'secure' => true,     // Must be true on HTTPS production
        'samesite' => 'Lax',
    ],

    // Password settings
    'password' => [
        'min_length' => 8,
        'algorithm' => PASSWORD_BCRYPT,
        'cost' => 12, // Bcrypt cost factor (10-12 recommended)
    ],

    // Email settings
    'email' => [
        'validation' => true,
        'unique' => true,
    ],

    // Username settings
    'username' => [
        'min_length' => 3,
        'max_length' => 50,
        'unique' => true,
    ],

    // Security
    'security' => [
        'rate_limit' => true,
        'max_login_attempts' => 5,
        'lockout_time' => 900, // 15 minutes
        'log_attempts' => true,
    ],

    // API settings
    'api' => [
        'cors' => true,
        // Restrict to your own domains in production
        'allowed_origins' => [
            'https://voidxhub.in',
            'https://www.voidxhub.in',
            'https://roardiamond.github.io',
        ],
        'request_timeout' => 30,
    ],

    // Frontend
    'frontend' => [
        'theme' => 'default',
        'show_strength_meter' => true,
    ],
];
?>
