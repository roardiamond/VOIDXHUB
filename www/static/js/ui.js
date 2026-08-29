// =========================================================
// VOIDXHUB TOURNAMENTS — Shared UI helpers
// =========================================================

// Base path helper: when hosted under /www/ use that prefix
function vxBase() {
  try {
    if (location.pathname.indexOf("/www/") !== -1 || location.pathname === "/www" || location.pathname.startsWith("/www")) {
      return "/www";
    }
  } catch (e) {}
  return "";
}

function vxPath(path) {
  // path should start with /
  return vxBase() + path;
}

function fmtMoney(n) {
  if (!n) return "Free";
  return "₹" + Number(n).toLocaleString("en-IN");
}

function fmtDate(iso) {
  if (!iso) return "TBA";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function statusBadge(status) {
  const map = { upcoming: "Upcoming", live: "Live", completed: "Completed" };
  return `<span class="badge badge-${status}">${map[status] || status}</span>`;
}

function paymentBadge(status) {
  const map = { pending: "Pending", verified: "Verified", rejected: "Rejected" };
  return `<span class="badge badge-${status}">${map[status] || status}</span>`;
}

function slotBarHtml(filled, total, ticks) {
  ticks = ticks || Math.min(total, 24);
  const filledTicks = Math.round((filled / Math.max(total, 1)) * ticks);
  let spans = "";
  for (let i = 0; i < ticks; i++) {
    spans += `<span class="${i < filledTicks ? "filled" : ""}"></span>`;
  }
  return `<div class="slot-bar">${spans}</div>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

const EMBLEM_PALETTE = [
  "#7b5cff", "#33f5d5", "#ff9640", "#ff5470", "#5cc8ff", "#c46bff",
];

function emblemColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return EMBLEM_PALETTE[hash % EMBLEM_PALETTE.length];
}

function emblemInitials(name) {
  const words = String(name || "").replace(/[^a-zA-Z0-9 ]/g, "").split(" ").filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (name || "??").slice(0, 2).toUpperCase();
}

function gameEmblemHtml(name, size) {
  size = size || 44;
  const color = emblemColor(name || "?");
  return `<div class="emblem" style="width:${size}px;height:${size}px;font-size:${size * 0.38}px;border-color:${color}55;color:${color};background:${color}14;">${escapeHtml(emblemInitials(name))}</div>`;
}

function deployCardHtml(t) {
  return `
  <a href="${vxPath("/tournament.html")}?id=${t.id}" class="deploy-card">
    <div class="deploy-top">
      <div>
        <span class="deploy-game">${escapeHtml(t.game_name)} · ${escapeHtml(t.mode)}</span>
        <h3 class="deploy-title">${escapeHtml(t.title)}</h3>
      </div>
      ${statusBadge(t.status)}
    </div>
    <div class="deploy-meta">
      <span><strong class="mono">${fmtMoney(t.entry_fee)}</strong> entry</span>
      <span><strong class="mono">${fmtMoney(t.prize_pool)}</strong> pool</span>
      <span><strong class="mono">${fmtDate(t.match_date)}</strong></span>
    </div>
    <div>
      <div class="slot-label"><span>SLOTS</span><span>${t.slots_filled || 0} / ${t.slots_total || 0}</span></div>
      ${slotBarHtml(t.slots_filled || 0, t.slots_total || 1)}
    </div>
    <div class="deploy-footer">
      <span class="badge ${t.entry_fee > 0 ? "badge-paid" : "badge-free"}">${t.entry_fee > 0 ? "Paid entry" : "Free entry"}</span>
      <span class="mono" style="font-size:13px; color:var(--signal-violet);">View →</span>
    </div>
  </a>`;
}

function renderNav(activePage) {
  const user = VX.getUser();
  const el = document.getElementById("site-nav");
  if (!el) return;

  const navLinks = (window.VX_NAV_LINKS || []).filter((l) => {
    if (l.auth === "user") return !!user;
    if (l.auth === "admin") return !!user && user.role === "admin";
    return true;
  });

  const linksHtml = navLinks.map(
    (l) => `<a href="${l.href}" class="${l.key === activePage ? "active" : ""}">${escapeHtml(l.label)}</a>`
  ).join("");

  const authLinks = window.VX_AUTH_LINKS || {
    login: vxPath("/login.html"),
    register: vxPath("/register.html"),
  };
  const ctaHtml = user
    ? `<span class="mono" style="font-size:13px;color:var(--fog-dim)">@${escapeHtml(user.username)}</span>
       <button class="btn btn-ghost btn-sm" id="nav-logout">Log out</button>`
    : `<a href="${authLinks.login}" class="btn btn-ghost btn-sm">Log in</a>
       <a href="${authLinks.register}" class="btn btn-primary btn-sm">Sign up</a>`;

  const brandName = (window.VX_CONFIG && window.VX_CONFIG.APP_NAME) || "VOIDXHUB";

  el.innerHTML = `
    <div class="wrap">
      <a href="${vxPath("/index.html")}" class="brand">${escapeHtml(brandName)}</a>
      <div class="nav-links">${linksHtml}</div>
      <div class="nav-cta">${ctaHtml}</div>
    </div>`;

  const logoutBtn = document.getElementById("nav-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      VX.clearSession();
      window.location.href = vxPath("/index.html");
    });
  }
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  const brandName = (window.VX_CONFIG && window.VX_CONFIG.APP_NAME) || "VOIDXHUB";
  const note = (window.VX_CONFIG && window.VX_CONFIG.FOOTER_NOTE) || "";
  el.innerHTML = `
    <div class="wrap site-footer">
      <span>© ${new Date().getFullYear()} ${escapeHtml(brandName)}</span>
      <span>${escapeHtml(note)}</span>
    </div>`;
}

function requireAuth() {
  if (!VX.getToken()) {
    window.location.href = vxPath("/login.html") + "?next=" + encodeURIComponent(window.location.pathname);
    return false;
  }
  return true;
}

function requireAdmin() {
  const user = VX.getUser();
  if (!VX.getToken() || !user || user.role !== "admin") {
    window.location.href = vxPath("/login.html");
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  renderFooter();
});
