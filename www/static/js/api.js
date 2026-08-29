// =========================================================
// VOIDXHUB TOURNAMENTS — API layer
// Every network call and every bit of session storage in the
// app goes through this one wrapper. No DOM code lives here —
// see ui.js for rendering helpers and www/static/js/pages/*.js
// for page-specific logic.
// =========================================================

const VX = (() => {
  const TOKEN_KEY = "voidxhub_token";
  const USER_KEY = "voidxhub_user";

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function apiUrl(path) {
    const base = (window.VX_CONFIG && window.VX_CONFIG.API_BASE_URL) || "";
    return base ? base.replace(/\/$/, "") + path : path;
  }

  async function api(method, path, data) {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
    const res = await fetch(apiUrl(path), {
      method,
      headers,
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    let body = null;
    try { body = await res.json(); } catch (e) { /* no body */ }
    if (!res.ok) {
      const err = new Error((body && body.error) || "Something went wrong");
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  }

  return {
    get: (path) => api("GET", path),
    post: (path, data) => api("POST", path, data),
    patch: (path, data) => api("PATCH", path, data),
    del: (path) => api("DELETE", path),
    getToken, getUser, setSession, clearSession,
  };
})();
