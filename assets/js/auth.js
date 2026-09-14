const VXH_API = "https://voidxhub-backend.onrender.com";

/** Same keys as www tournament app so login works everywhere */
const KEYS = {
  token: ["voidxhub_token", "vxh_token", "token"],
  user: ["voidxhub_user", "vxh_user", "user"],
};

function getToken() {
  for (const k of KEYS.token) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

function getUser() {
  for (const k of KEYS.user) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
  }
  return null;
}

function setUser(user) {
  const s = JSON.stringify(user);
  localStorage.setItem("voidxhub_user", s);
  localStorage.setItem("vxh_user", s);
  localStorage.setItem("user", s);
}

function setToken(token) {
  localStorage.setItem("voidxhub_token", token);
  localStorage.setItem("vxh_token", token);
  localStorage.setItem("token", token);
}

function clearUser() {
  KEYS.token.forEach((k) => localStorage.removeItem(k));
  KEYS.user.forEach((k) => localStorage.removeItem(k));
}

async function refreshUser() {
  const token = getToken();
  if (!token) return getUser();
  try {
    const res = await fetch(VXH_API + "/api/auth/me", {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.username) {
        setUser(data);
        return data;
      }
    }
    if (res.status === 401) clearUser();
  } catch (e) {}
  return getUser();
}

function injectNav() {
  if (document.getElementById("vxh-nav")) return;

  const user = getUser();
  const nav = document.createElement("div");
  nav.id = "vxh-nav";
  nav.style.cssText =
    "position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(5,5,10,0.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(103,232,249,0.15);padding:10px 16px;display:flex;justify-content:space-between;align-items:center;font-family:Inter,system-ui,sans-serif;";

  let rightHtml = "";
  if (user) {
    rightHtml = `
      <a href="/www/tournaments.html" style="color:#67e8f9;text-decoration:none;font-size:13px;font-weight:600;margin-right:14px;">Tournaments</a>
      <a href="/pages/account/my-orders.html" style="color:#67e8f9;text-decoration:none;font-size:13px;font-weight:600;margin-right:16px;">My Orders</a>
      <a href="/pages/account/dashboard.html" style="color:#e0e0ff;text-decoration:none;font-size:13px;margin-right:12px;">@${user.username || "user"}</a>
      <button onclick="vxhLogout()" style="background:transparent;border:1px solid #ef4444;color:#f87171;padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer;">Logout</button>
    `;
  } else {
    rightHtml = `
      <a href="/www/tournaments.html" style="color:#a5b4fc;text-decoration:none;font-size:13px;margin-right:12px;">Tournaments</a>
      <a href="/pages/account/login.html" style="color:#67e8f9;text-decoration:none;font-size:13px;font-weight:600;margin-right:12px;">Login</a>
      <a href="/pages/account/register.html" style="background:linear-gradient(to right,#06b6d4,#a855f7);color:#000;padding:6px 14px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;">Register</a>
    `;
  }

  nav.innerHTML = `
    <a href="/" style="color:#67e8f9;text-decoration:none;font-weight:800;font-size:16px;letter-spacing:0.5px;">VOID<span style="color:#c084fc;">X</span>HUB</a>
    <div style="display:flex;align-items:center;">${rightHtml}</div>
  `;
  document.body.prepend(nav);
  document.body.style.paddingTop = "52px";
}

function vxhLogout() {
  const t = getToken();
  clearUser();
  fetch(VXH_API + "/api/auth/logout-everywhere", {
    method: "POST",
    headers: { Authorization: "Bearer " + (t || "") },
  }).catch(() => {});
  window.location.href = "/pages/account/login.html";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectNav);
} else {
  injectNav();
}
