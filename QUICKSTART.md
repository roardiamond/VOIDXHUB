# 🚀 Quick Start Guide - VOIDXHUB Login System

## What's Been Created?

Your complete authentication system includes:

### 📁 Frontend Pages
- **login.html** - User login page
- **register.html** - User registration page
- **dashboard.html** - Protected dashboard for logged-in users
- **api-tester.html** - API testing tool (development only)

### 🔧 Backend System
- **backend/auth.php** - Core authentication API
- **backend/db.php** - Database handling
- **backend/config.php** - Configuration file
- **backend/users.db** - SQLite database (auto-created)

### 📋 Documentation
- **LOGIN_SYSTEM_README.md** - Full documentation
- **.htaccess** - Apache security configuration

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Start a Web Server

**Option A: Using PHP's Built-in Server (Easiest)**
```bash
cd path/to/VOIDXHUB
php -S localhost:8000
```

**Option B: Using Python**
```bash
python -m http.server 8000
```

**Option C: Using Apache**
Copy folder to `htdocs/` and access via `http://localhost/VOIDXHUB/`

### Step 2: Visit the Application

Open your browser and go to:
- **Registration**: `http://localhost:8000/register.html`
- **Login**: `http://localhost:8000/login.html`
- **Test API**: `http://localhost:8000/api-tester.html`

### Step 3: Create a Test Account

1. Go to registration page
2. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123`
3. Click "Create Account"

### Step 4: Login

1. Go to login page
2. Enter email: `test@example.com`
3. Enter password: `TestPass123`
4. You should see the dashboard!

---

## 🧪 Testing the API

### Using the API Tester (Recommended)
1. Open `http://localhost:8000/api-tester.html`
2. Fill in the form fields
3. Click the appropriate button to test each endpoint

### Using cURL
```bash
# Register
curl -X POST http://localhost:8000/backend/auth.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "username": "newuser",
    "email": "new@example.com",
    "password": "SecurePass123"
  }'

# Login
curl -X POST http://localhost:8000/backend/auth.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "new@example.com",
    "password": "SecurePass123"
  }'
```

### Using Postman
1. Create new POST request
2. URL: `http://localhost:8000/backend/auth.php`
3. Body (JSON):
```json
{
  "action": "login",
  "email": "test@example.com",
  "password": "TestPass123"
}
```
4. Send request

---

## 📚 API Endpoints Quick Reference

### Register
```
POST /backend/auth.php
{
  "action": "register",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Login
```
POST /backend/auth.php
{
  "action": "login",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Check Session
```
POST /backend/auth.php
{
  "action": "check_auth"
}
```

### Logout
```
POST /backend/auth.php
{
  "action": "logout"
}
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Make sure PHP server is running: `php -S localhost:8000`
- Try different port: `php -S localhost:8080`

### "404 Not Found" on API calls
- Check that `backend/auth.php` exists
- Verify file path is correct
- Check web server error logs

### "Database error"
- The database is created automatically
- Check `backend/` folder permissions
- Make sure PHP has SQLite3 support

### Password not working after login
- Double-check password in registration
- Passwords are case-sensitive
- Clear browser cache if still having issues

### Session not persisting
- Check if cookies are enabled in browser
- Try different browser
- Check browser console for errors (F12)

---

## 🔒 Security Notes

✅ Passwords are hashed with bcrypt
✅ Sessions expire after 30 days
✅ SQL injection protection included
✅ Secure cookie handling

⚠️ **For Production:**
- Use HTTPS only
- Change default session timeout
- Add rate limiting
- Enable CSRF protection
- Add email verification
- Review `.htaccess` configuration

---

## 📝 Database Info

**SQLite Database Location:** `backend/users.db`

**Users Table:**
```
id          | username | email      | password | created_at
1           | testuser | test@...   | [hash]   | 2024-01-01...
```

**To View Database:**
```bash
# Using sqlite3 CLI
sqlite3 backend/users.db
sqlite> SELECT * FROM users;
sqlite> .tables

# Or use DB Browser for SQLite (GUI)
# Download: https://sqlitebrowser.org/
```

---

## 🎯 Next Steps

1. **Test Everything** - Use api-tester.html
2. **Read Full Docs** - Open LOGIN_SYSTEM_README.md
3. **Customize** - Update colors, text, branding
4. **Add Features** - Password reset, email verification, 2FA
5. **Deploy** - Move to production server

---

## 📞 File Structure Reference

```
VOIDXHUB/
├── login.html                    # Login page
├── register.html                 # Registration page
├── dashboard.html                # User dashboard
├── api-tester.html              # API testing tool
├── .htaccess                    # Apache security config
├── LOGIN_SYSTEM_README.md        # Full documentation
├── QUICKSTART.md                # This file
└── backend/
    ├── auth.php                 # Authentication API
    ├── db.php                   # Database layer
    ├── config.php               # Configuration
    └── users.db                 # SQLite database
```

---

## ✨ Tips

- Use `api-tester.html` during development
- Check browser console (F12) for JavaScript errors
- Check PHP error logs for backend issues
- Create a `.gitignore` to exclude `users.db` from version control
- Backup `users.db` regularly in production

---

**Ready to go? Start with Step 1 above!** 🚀

For detailed information, read `LOGIN_SYSTEM_README.md`
