// Page script for login.html.

renderNav("");
initOAuthButtons();

const oauthErr = new URLSearchParams(window.location.search).get("error");
if (oauthErr) {
  const map = {
    oauth_denied: "Login was cancelled.",
    oauth_failed: "That login didn't go through — try again.",
    oauth_invalid_state: "That login link expired — try again.",
    oauth_unavailable: "That login option isn't set up yet.",
  };
  document.getElementById("alert").innerHTML =
    `<div class="alert alert-error">${escapeHtml(map[oauthErr] || "Login failed.")}</div>`;
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const alertEl = document.getElementById("alert");
  alertEl.innerHTML = "";
  try {
    const res = await VX.post("/api/auth/login", { username: fd.get("identifier"), password: fd.get("password") });
    VX.setSession(res.token, res.user);
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next || (res.user.role === "admin" ? "/admin.html" : "/dashboard.html");
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
});
