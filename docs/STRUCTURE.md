# Repository structure

This layout was reorganized from a flat, ~110-file repo root into logical folders.
All internal links, image sources, and script paths were rewritten to match; nothing
in `www/` (a separate self-contained sub-app) was touched.

```
VOIDXHUB/
├── index.html            # site entry point
├── CNAME, Procfile        # deployment config (unchanged, root-level by convention)
├── composer.json, requirements.txt
│
├── docs/                 # README, SECURITY, QUICKSTART, this file
│
├── assets/
│   ├── images/           # every .jpg/.png used across the site
│   └── js/auth.js         # shared nav/auth script (paths made root-relative)
│
├── pages/
│   ├── account/          # login, register, dashboard, my-orders
│   ├── admin/            # admin panel pages
│   ├── tournaments/      # BGMI/FF/CS/Apex/COD/Valorant listing + scrim pages
│   ├── shop/             # payment, entry fee, tools catalogue, paid push
│   ├── tools/            # individual tool/product detail pages
│   └── misc/             # api-tester, redirect, wait
│
├── backend/
│   ├── php/              # all server-side PHP (admin.php, create_key.php, auth.php, db.php, ...)
│   └── bot/              # Telegram bot (bot.py) + its license data store
│
└── www/                  # unchanged — separate PWA-style sub-app (own login/register/dashboard)
```

## Notes / things worth your attention

- **Rotate secrets.** `backend/bot/bot.py` has a Telegram bot token and a Fernet
  encryption key hardcoded in plaintext, and `backend/php/create_key.php` /
  `backend/php/admin.php`-style pages use a hardcoded admin password in the URL
  query string. If this repo has ever been pushed anywhere public, treat all of
  these as already leaked and rotate them.
- **`coin.jpg`** is referenced by five pages under `pages/tools/` but was never
  present in the original zip — this is a pre-existing broken image link, not
  something the reorganization caused.
- **`pages/tournaments/brsquad.html`** redirects to `entryfee?format=...`
  (missing `.html`) — also pre-existing, left as-is since it wasn't part of the
  reorg.
