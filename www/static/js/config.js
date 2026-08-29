// =========================================================
// VOIDXHUB TOURNAMENTS — App configuration
// =========================================================

window.VX_CONFIG = {
  // Unified backend (website + app both use this)
  API_BASE_URL: "https://voidxhub-backend.onrender.com",

  APP_NAME: "VOIDXHUB",
  SUPPORT_EMAIL: "support@voidxhub.in",
  FOOTER_NOTE: "Entry fees are non-refundable once a slot is confirmed.",
};

// When hosted under /www/ on voidxhub.in, links must include /www/
// When served as root by Flask (or Capacitor), paths stay relative to current folder.
(function () {
  var base = "";
  try {
    if (location.pathname.indexOf("/www/") !== -1 || location.pathname.indexOf("/www") === 0) {
      base = "/www";
    }
  } catch (e) {}

  window.VX_NAV_LINKS = [
    { href: base + "/index.html", label: "Home", key: "home", auth: "public" },
    { href: base + "/tournaments.html", label: "Tournaments", key: "tournaments", auth: "public" },
    { href: base + "/leaderboard.html", label: "Leaderboard", key: "leaderboard", auth: "public" },
    { href: base + "/dashboard.html", label: "Dashboard", key: "dashboard", auth: "user" },
    { href: base + "/admin.html", label: "Admin", key: "admin", auth: "admin" },
  ];

  window.VX_AUTH_LINKS = {
    login: base + "/login.html",
    register: base + "/register.html",
  };
})();
