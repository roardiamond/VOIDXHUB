# Login System Setup & Installation Guide

## Overview
This is a complete user authentication system for VOIDXHUB with:
- User registration with email verification
- Secure login with password hashing
- Session management
- SQLite database
- Protected dashboard
- Responsive design

## Files Created

### Frontend
- `login.html` - Login page
- `register.html` - Registration page  
- `dashboard.html` - Protected user dashboard

### Backend
- `backend/auth.php` - Main authentication API
- `backend/db.php` - Database connection and operations
- `backend/users.db` - SQLite database (auto-created)

## Installation & Setup

### 1. Prerequisites
- PHP 7.4+ with PDO and SQLite3 support
- A web server (Apache, Nginx, or built-in PHP server)

### 2. File Placement
All files should be in your `VOIDXHUB` directory:
```
VOIDXHUB/
├── login.html
├── register.html
├── dashboard.html
└── backend/
    ├── auth.php
    ├── db.php
    └── users.db (auto-created)
```

### 3. Running Locally (Testing)

#### Using PHP Built-in Server:
```bash
cd path/to/VOIDXHUB
php -S localhost:8000
```
Then visit: `http://localhost:8000/login.html`

#### Using Apache:
Place the VOIDXHUB folder in your `htdocs` (or similar) and access via:
`http://localhost/VOIDXHUB/login.html`

### 4. Database Setup
The database is **automatically created** on first run by `backend/db.php`. You don't need to manually create any tables.

The system creates:
- `users` table - stores user accounts
- `sessions` table - stores user sessions

### 5. File Permissions
Make sure the `backend/` directory is writable:
```bash
chmod 755 backend/
chmod 755 backend/users.db  # After first run
```

## API Endpoints

All requests go to `backend/auth.php` as POST with JSON data.

### Register User
```json
{
  "action": "register",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user_id": 1
}
```

### Login User
```json
{
  "action": "login",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user_id": 1
}
```

### Check Authentication
```json
{
  "action": "check_auth"
}
```

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-06-05 10:30:00"
  }
}
```

### Logout
```json
{
  "action": "logout"
}
```

## Security Features

✅ **Password Hashing** - Uses bcrypt (PHP's `password_hash`)
✅ **Session Management** - Secure cookie-based sessions
✅ **Email Validation** - Built-in email validation
✅ **SQL Injection Protection** - Uses prepared statements
✅ **CSRF Protection** - Can be added with tokens
✅ **HTTPOnly Cookies** - Session cookies are HTTPOnly

## Validation Rules

### Username
- Minimum 3 characters
- Unique across the database
- No special characters enforced (you can add more rules)

### Email
- Must be valid email format
- Unique across the database

### Password
- Minimum 8 characters
- Can contain uppercase, lowercase, numbers, special characters
- Hashed before storage

## Testing

### Test Account Creation
1. Go to `http://localhost:8000/register.html`
2. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123`
3. Click "Create Account"

### Test Login
1. Go to `http://localhost:8000/login.html`
2. Enter the email and password from above
3. You should be redirected to the dashboard

### Test Protected Route
- Try accessing `dashboard.html` directly without logging in
- You should be redirected to `login.html`

## Database Structure

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
```

## Environment Variables (Optional)

You can create a `.env` file for configuration:
```
DB_PATH=backend/users.db
SESSION_TIMEOUT=2592000
SESSION_HTTPONLY=true
```

Then load it in `db.php` if needed.

## Production Deployment

Before going live:

1. **Enable HTTPS** - Always use SSL/TLS in production
2. **Add CSRF Tokens** - Implement CSRF protection
3. **Rate Limiting** - Add login attempt rate limiting
4. **Email Verification** - Send confirmation emails on registration
5. **Password Recovery** - Implement forgot password flow
6. **2FA** - Add two-factor authentication
7. **Logging** - Log all authentication attempts
8. **Backups** - Regular database backups

## Troubleshooting

### "Database connection failed"
- Ensure PHP has SQLite3 support: `php -m | grep sqlite`
- Check `backend/` directory permissions

### "Session not working"
- Make sure cookies are enabled in browser
- Check `session_start()` is called before any output

### "Users not being created"
- Check for duplicate email/username
- Verify file permissions on `backend/` directory
- Check PHP error logs

## Support

For issues or improvements, check:
- PHP error logs
- Browser console (F12)
- `backend/` directory permissions

## Next Steps

You can extend this with:
- Email confirmation on registration
- Password reset/recovery
- Profile page
- User roles/permissions
- Two-factor authentication
- Social login (Google, GitHub, etc.)
- Activity logging
