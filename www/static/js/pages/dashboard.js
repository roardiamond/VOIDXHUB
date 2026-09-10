// Page script for dashboard.html (account info + a user's own registrations).

if (requireAuth()) {
  renderNav("dashboard");
  loadAccount();
  load();

  document.getElementById("pw-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const alertEl = document.getElementById("pw-alert");
    alertEl.innerHTML = "";
    try {
      const res = await VX.post("/api/auth/change-password", {
        current_password: fd.get("current_password"),
        new_password: fd.get("new_password"),
      });
      VX.setSession(res.token, VX.getUser());
      alertEl.innerHTML = `<div class="alert alert-success">Password updated. Other devices are now logged out.</div>`;
      e.target.reset();
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    }
  });

  document.getElementById("logout-everywhere-btn").addEventListener("click", async () => {
    if (!confirm("This logs you out on every device, including this one. Continue?")) return;
    await VX.post("/api/auth/logout-everywhere", {});
    VX.clearSession();
    window.location.href = vxPath("/login.html");
  });
}

async function loadAccount() {
  const el = document.getElementById("account-info");
  try {
    const me = await VX.get("/api/auth/me");
    el.innerHTML = `
      <div>Username: <span style="color:#fff;">${escapeHtml(me.username)}</span></div>
      <div>Email: <span style="color:#fff;">${escapeHtml(me.email)}</span></div>
      <div>Phone: <span style="color:#fff;">${escapeHtml(me.phone || "—")}</span></div>`;
  } catch (e) {
    el.innerHTML = `<span style="color:var(--alert-red)">Couldn't load account info.</span>`;
  }
}

async function load() {
  const list = document.getElementById("list");
  try {
    const regs = await VX.get("/api/registrations/me");
    if (regs.length === 0) {
      list.innerHTML = `<div class="empty-state"><h3>No registrations yet</h3><p>Browse open tournaments and lock in your first slot.</p>
        <a href="/tournaments.html" class="btn btn-primary" style="margin-top:16px;">Browse tournaments</a></div>`;
      return;
    }
    list.innerHTML = regs.map((r) => `
      <div class="card-plain">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
          <div>
            <span class="deploy-game">${escapeHtml(r.game_name)}</span>
            <h3 style="font-size:19px; margin-top:2px;"><a href="/tournament.html?id=${r.tournament_id}" style="color:#fff;">${escapeHtml(r.title)}</a></h3>
            <p class="mono" style="font-size:13px; color:var(--fog-dim); margin-top:4px;">Team: ${escapeHtml(r.team_name)} · Slot #${r.slot_number}</p>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            ${statusBadge(r.tournament_status)}
            ${paymentBadge(r.payment_status)}
          </div>
        </div>
        <div style="display:flex; gap:24px; margin-top:14px; font-size:13px; color:var(--fog-dim);" class="mono">
          <span>Match: ${fmtDate(r.match_date)}</span>
          <span>Entry: ${fmtMoney(r.entry_fee)}</span>
        </div>
        ${r.payment_status === "verified" && r.room_id ? `
          <div class="room-reveal" style="margin-top:14px;">
            <div class="item"><div class="k">Room ID</div><div class="v">${escapeHtml(r.room_id)}</div></div>
            <div class="item"><div class="k">Password</div><div class="v">${escapeHtml(r.room_pass || "—")}</div></div>
          </div>` : ""}
      </div>`).join("");
  } catch (e) {
    list.innerHTML = `<p class="mono" style="color:var(--alert-red)">${escapeHtml(e.message)}</p>`;
  }
}
