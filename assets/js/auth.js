const VXH_API = "https://voidxhub-backend.onrender.com";

function getUser() {
  try { return JSON.parse(localStorage.getItem("vxh_user") || "null"); } catch { return null; }
}
function setUser(user) { localStorage.setItem("vxh_user", JSON.stringify(user)); }
function clearUser() { localStorage.removeItem("vxh_user"); }

async function refreshUser() {
  try {
    const res = await fetch(VXH_API + "/api/me", { credentials: "include" });
    const data = await res.json();
    if (data.success) { setUser(data.user); return data.user; }
  } catch (e) {}
  return getUser();
}

function injectNav() {
  const user = getUser();
  const nav = document.createElement("div");
  nav.id = "vxh-nav";
  nav.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(5,5,10,0.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(103,232,249,0.2);padding:10px 16px;display:flex;justify-content:space-between;align-items:center;font-family:Orbitron,sans-serif;";

  let rightHtml = "";
  if (user) {
    rightHtml = `
      <a href="/pages/account/my-orders.html" style="color:#67e8f9;text-decoration:none;font-size:13px;font-weight:700;margin-right:16px;">
        📦 My Orders
      </a>
      <a href="/pages/account/dashboard.html" style="color:#e0e0ff;text-decoration:none;font-size:13px;margin-right:12px;">@${user.username}</a>
      <button onclick="vxhLogout()" style="background:transparent;border:1px solid #ef4444;color:#f87171;padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer;font-family:Orbitron,sans-serif;">Logout</button>
    `;
  } else {
    rightHtml = `
      <a href="/pages/account/login.html" style="color:#67e8f9;text-decoration:none;font-size:13px;font-weight:700;margin-right:12px;">Login</a>
      <a href="/pages/account/register.html" style="background:linear-gradient(to right,#06b6d4,#a855f7);color:#000;padding:6px 14px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;">Register</a>
    `;
  }

  nav.innerHTML = `
    <a href="/index.html" style="color:#67e8f9;text-decoration:none;font-weight:900;font-size:16px;letter-spacing:2px;">VOID<span style="color:#c084fc;">X</span>HUB</a>
    <div style="display:flex;align-items:center;">${rightHtml}</div>
  `;
  document.body.prepend(nav);
  document.body.style.paddingTop = "52px";
}

function vxhLogout() {
  clearUser();
  fetch(VXH_API + "/api/logout", { method: "POST", credentials: "include" }).catch(() => {});
  window.location.href = "/pages/account/login.html";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectNav);
} else {
  injectNav();
}
