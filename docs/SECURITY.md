# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | ✅ Yes            |
| Older   | ❌ No             |

## Critical Notice (November 2026)

Hardcoded secrets were previously present in the repository (Telegram bot token, Fernet key, admin passwords).  
**These have been removed.**  

If this repository was ever public with those secrets:
1. **Immediately revoke / regenerate** the Telegram bot token at @BotFather
2. Generate a new Fernet key
3. Change the admin password and set it only via environment variable `ADMIN_PASS`
4. Rotate any UPI / payment credentials that were associated

## How Secrets Must Be Managed

| Secret                    | Environment Variable     | Notes                                      |
|---------------------------|--------------------------|--------------------------------------------|
| Telegram Bot Token        | `TELEGRAM_BOT_TOKEN`     | Required for `backend/bot/bot.py`          |
| Telegram Admin User ID    | `TELEGRAM_ADMIN_ID`      | Optional                                   |
| Fernet Encryption Key     | `FERNET_KEY`             | Required for file encryption               |
| Admin Panel Password      | `ADMIN_PASS`             | Required for PHP admin pages               |

Never commit real values of these variables.

## Reporting a Vulnerability

Agar aapko koi **security vulnerability** dikhti hai toh please turant report karo.

### Reporting Process

1. **Email** → `voidxhub.security@gmail.com`
2. **Telegram** → `@YASHXCHI` or `@VOIDXHUB_ADMIN`

**Please include:**
- Vulnerability type (XSS, SQLi, Payment Bypass, Auth bypass, etc.)
- Step-by-step reproduction
- PoC if possible
- Impact
- Suggested fix (optional)

## Response Time

- **Critical** (Payment bypass, Admin access, secret leak) → Within 24 hours
- **High** → Within 48 hours
- **Medium/Low** → Within 7 days

## Scope

**In Scope:**
- voidxhub.in and related GitHub Pages
- Payment related pages
- Telegram bot integration
- User data handling
- Auth & session handling

**Out of Scope:**
- Social engineering
- Physical attacks
- DDoS / spam
- Third-party services (Tailwind, Google Fonts, Render, etc.)

## Do Not

- Publicly disclose vulnerabilities without responsible disclosure
- Access or modify production data
- Perform brute force / destructive testing

---

**Last Updated:** November 2026  
**Maintained by:** YASHXCHI (VOIDXHUB Team)
