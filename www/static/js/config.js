// =========================================================
// VOIDXHUB TOURNAMENTS — App configuration
// This is the ONE file to edit when you deploy, rebrand, or
// add/remove/reorder a page in the site's navigation.
// =========================================================

window.VX_CONFIG = {
  // Full HTTPS URL of your backend API, no trailing slash.
  // In the browser build (running from the same Flask server) this can stay
  // empty — requests will just hit relative paths like /api/... on the same
  // origin. For the packaged Android/iOS app, the app bundle is loaded from
  // a local/app origin, so this MUST point at your real, publicly hosted
  // backend, e.g. "https://api.yourdomain.com".
  API_BASE_URL: "https://voidxhub-backend.onrender.com",

  // Shown in the nav bar, browser tab titles, and footer.
  APP_NAME: "VOIDXHUB",

  // Used on the login/register pages and footer.
  SUPPORT_EMAIL: "support@voidxhub.in",

  // Footer copy line, shown on every page via renderFooter().
  FOOTER_NOTE: "Entry fees are non-refundable once a slot is confirmed.",
};

// ---------------------------------------------------------
// NAV_LINKS — every link that can appear in the top nav bar,
// in display order. This is the single place to add, remove,
// rename, or reorder a page in the site.
//
// href:     where the link goes (matches a page route below)
// label:    text shown in the nav bar
// key:      matches the `activePage` string each page passes
//           to renderNav(), used to highlight the active tab
// auth:     "public"  -> always shown
//           "user"    -> only shown when someone is logged in
//           "admin"   -> only shown to a logged-in admin
// ---------------------------------------------------------
window.VX_NAV_LINKS = [
  { href: "/index.html", label: "Home", key: "home", auth: "public" },
  { href: "/tournaments.html", label: "Tournaments", key: "tournaments", auth: "public" },
  { href: "/leaderboard.html", label: "Leaderboard", key: "leaderboard", auth: "public" },
  { href: "/dashboard.html", label: "Dashboard", key: "dashboard", auth: "user" },
  { href: "/admin.html", label: "Admin", key: "admin", auth: "admin" },
];

// Auth-only pages that aren't in the nav bar but are still part of the site
// map (kept here so every route in the app is discoverable from one file).
window.VX_AUTH_LINKS = {
  login: "/login.html",
  register: "/register.html",
};