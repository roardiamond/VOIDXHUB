// VOIDXHUB — API layer (shared with tools site via dual localStorage keys)

const VX = (() => {
  const TOKEN_KEYS = ["voidxhub_token", "vxh_token", "token"];
  const USER_KEYS = ["voidxhub_user", "vxh_user", "user"];

  function getToken() {
    for (const k of TOKEN_KEYS) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
    return null;
  }

  function getUser() {
    for (const k of USER_KEYS) {
      try {
        const raw = localStorage.getItem(k);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
    }
    return null;
  }

  function setSession(token, user) {
    if (token) {
      localStorage.setItem("voidxhub_token", token);
      localStorage.setItem("vxh_token", token);
      localStorage.setItem("token", token);
    }
    if (user) {
      const s = JSON.stringify(user);
      localStorage.setItem("voidxhub_user", s);
      localStorage.setItem("vxh_user", s);
      localStorage.setItem("user", s);
    }
  }

  function clearSession() {
    TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
    USER_KEYS.forEach((k) => localStorage.removeItem(k));
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
    try {
      body = await res.json();
    } catch (e) {}
    if (!res.ok) {
      const err = new Error((body && body.error) || "Something went wrong");
      err.status = res.status;
      err.body = body;
      if (res.status === 401) {
        // stale token — clear so UI shows login
        clearSession();
      }
      throw err;
    }
    return body;
  }

  return {
    get: (path) => api("GET", path),
    post: (path, data) => api("POST", path, data),
    patch: (path, data) => api("PATCH", path, data),
    del: (path) => api("DELETE", path),
    getToken,
    getUser,
    setSession,
    clearSession,
    apiUrl,
  };
})();
