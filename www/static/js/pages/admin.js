// Page script for admin.html — tournament management, payment verification,
// results publishing, and account security controls.

if (requireAdmin()) {
  renderNav("admin");
  init();
}

let gamesCache = [];

async function init() {
  await loadStats();
  await loadGames();
  await loadTournaments();
  await loadUsers();
  await loadOrders();
  await loadAuditLog();

  document.getElementById("toggle-create").addEventListener("click", () => {
    const panel = document.getElementById("create-panel");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

  document.getElementById("create-form").addEventListener("submit", onCreateSubmit);

  document.getElementById("orders-status-filter").addEventListener("change", (e) => {
    loadOrders(e.target.value);
  });

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
    window.location.href = "/login.html";
  });
}

async function loadUsers() {
  const tbody = document.querySelector("#users-table tbody");
  try {
    const users = await VX.get("/api/admin/users");
    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="mono" style="color:var(--fog-dim)">No users yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = users.map((u) => `
      <tr>
        <td>${escapeHtml(u.username)}${u.role === "admin" ? ' <span class="mono" style="color:var(--fog-dim); font-size:11px;">(admin)</span>' : ""}</td>
        <td class="mono" style="font-size:12px;">${escapeHtml(u.email)}</td>
        <td class="mono" style="font-size:12px;">${escapeHtml(u.phone || "—")}</td>
        <td class="mono">${escapeHtml(u.role)}</td>
        <td class="mono">${u.total_orders || 0}</td>
        <td class="mono">₹${u.verified_spend || 0}</td>
        <td class="mono" style="font-size:12px;">${u.created_at ? String(u.created_at).slice(0, 10) : "—"}</td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="mono" style="color:var(--danger)">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function loadOrders(status = "") {
  const tbody = document.querySelector("#orders-table tbody");
  try {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    const rows = await VX.get("/api/admin/registrations" + qs);
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="mono" style="color:var(--fog-dim)">No orders found.</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map((r) => `
      <tr>
        <td class="mono" style="font-size:12px;">${r.registered_at ? String(r.registered_at).slice(0, 16).replace("T", " ") : "—"}</td>
        <td>${escapeHtml(r.tournament_title || "—")}</td>
        <td class="mono">${escapeHtml(r.game_name || "—")}</td>
        <td>${escapeHtml(r.username || "—")}</td>
        <td>${escapeHtml(r.team_name || "—")}</td>
        <td class="mono">₹${r.entry_fee || 0}</td>
        <td class="mono" style="font-size:12px;">${escapeHtml(r.utr_number || "—")}</td>
        <td><span class="mono">${escapeHtml(r.payment_status)}</span></td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="mono" style="color:var(--danger)">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function loadStats() {
  try {
    const s = await VX.get("/api/admin/stats");
    const vals = document.querySelectorAll("#stats-strip .val");
    if (vals[0]) vals[0].textContent = s.total_tournaments;
    if (vals[1]) vals[1].textContent = s.total_users;
    if (vals[2]) vals[2].textContent = s.pending_payments;
    if (vals[3]) vals[3].textContent = "₹" + s.revenue;
  } catch (e) {}
}

async function loadGames() {
  gamesCache = await VX.get("/api/games");
  const sel = document.getElementById("game-select");
  sel.innerHTML = gamesCache.map((g) => `<option value="${g.id}">${escapeHtml(g.name)}</option>`).join("");
}

async function loadTournaments() {
  const list = document.getElementById("tournaments-list");
  try {
    const tours = await VX.get("/api/tournaments");
    if (!tours.length) {
      list.innerHTML = `<p class="mono" style="color:var(--fog-dim)">No tournaments yet.</p>`;
      return;
    }
    list.innerHTML = tours.map((t) => `
      <div class="card-plain" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
        <div>
          <strong>${escapeHtml(t.title)}</strong>
          <div class="mono" style="font-size:12px; color:var(--fog-dim); margin-top:4px;">
            ${escapeHtml(t.game_name || "")} · ${escapeHtml(t.mode)} · ${t.slots_filled || 0}/${t.slots_total} slots · ₹${t.entry_fee} · ${escapeHtml(t.status)}
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-ghost btn-sm" data-manage="${t.id}">Manage</button>
          <button class="btn btn-danger btn-sm" data-del="${t.id}">Delete</button>
        </div>
      </div>`).join("");

    list.querySelectorAll("[data-manage]").forEach((b) => b.addEventListener("click", () => openManagePanel(Number(b.dataset.manage))));
    list.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("Delete this tournament and all its registrations?")) return;
      await VX.del(`/api/admin/tournaments/${b.dataset.del}`);
      await loadTournaments();
      await loadStats();
    }));
  } catch (err) {
    list.innerHTML = `<p class="mono" style="color:var(--danger)">${escapeHtml(err.message)}</p>`;
  }
}

async function onCreateSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const alertEl = document.getElementById("create-alert");
  alertEl.innerHTML = "";
  try {
    await VX.post("/api/admin/tournaments", {
      title: fd.get("title"),
      game_id: Number(fd.get("game_id")),
      mode: fd.get("mode"),
      match_date: fd.get("match_date"),
      entry_fee: Number(fd.get("entry_fee") || 0),
      prize_pool: Number(fd.get("prize_pool") || 0),
      slots_total: Number(fd.get("slots_total") || 25),
      upi_id: fd.get("upi_id") || "",
      description: fd.get("description") || "",
    });
    alertEl.innerHTML = `<div class="alert alert-success">Tournament created.</div>`;
    e.target.reset();
    document.getElementById("create-panel").style.display = "none";
    await loadTournaments();
    await loadStats();
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}

async function loadAuditLog() {
  const tbody = document.querySelector("#audit-table tbody");
  try {
    const rows = await VX.get("/api/admin/audit-log");
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="mono" style="color:var(--fog-dim)">Empty.</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map((r) => `
      <tr>
        <td class="mono" style="font-size:12px;">${r.created_at ? String(r.created_at).slice(0, 19).replace("T", " ") : "—"}</td>
        <td class="mono">${escapeHtml(r.event)}</td>
        <td>${escapeHtml(r.username || "—")}</td>
        <td class="mono" style="font-size:12px;">${escapeHtml(r.ip_address || "—")}</td>
        <td style="font-size:12px;">${escapeHtml(r.detail || "")}</td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="mono" style="color:var(--danger)">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function openManagePanel(tid) {
  const panel = document.getElementById("manage-panel");
  panel.style.display = "block";
  panel.innerHTML = `<p class="mono">Loading…</p>`;
  try {
    const t = await VX.get(`/api/tournaments/${tid}`);
    const regs = await VX.get(`/api/admin/tournaments/${tid}/registrations`);
    renderManagePanel(panel, tid, t, regs);
  } catch (err) {
    panel.innerHTML = `<p class="mono" style="color:var(--danger)">${escapeHtml(err.message)}</p>`;
  }
}

function renderManagePanel(panel, tid, t, regs) {
  panel.innerHTML = `
    <div class="form-card">
      <h3 style="margin-top:0;">${escapeHtml(t.title)}</h3>
      <form id="settings-form">
        <div class="field-row">
          <div class="field"><label>Status</label>
            <select name="status">
              <option value="upcoming" ${t.status === "upcoming" ? "selected" : ""}>upcoming</option>
              <option value="live" ${t.status === "live" ? "selected" : ""}>live</option>
              <option value="completed" ${t.status === "completed" ? "selected" : ""}>completed</option>
              <option value="cancelled" ${t.status === "cancelled" ? "selected" : ""}>cancelled</option>
            </select>
          </div>
          <div class="field"><label>Room ID</label><input name="room_id" value="${escapeHtml(t.room_id || "")}"></div>
          <div class="field"><label>Room Pass</label><input name="room_pass" value="${escapeHtml(t.room_pass || "")}"></div>
        </div>
        <button class="btn btn-primary btn-sm" type="submit">Save settings</button>
      </form>

      <h4 style="margin-top:24px;">Registrations (${regs.length})</h4>
      <div style="overflow-x:auto;">
        <table>
          <thead><tr><th>User</th><th>Team</th><th>UTR</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${regs.map((r) => `
              <tr>
                <td>${escapeHtml(r.username)}</td>
                <td>${escapeHtml(r.team_name)}</td>
                <td class="mono" style="font-size:12px;">${escapeHtml(r.utr_number || "—")}</td>
                <td class="mono">${escapeHtml(r.payment_status)}</td>
                <td style="white-space:nowrap;">
                  <button class="btn btn-ghost btn-sm" data-verify="${r.id}">Verify</button>
                  <button class="btn btn-danger btn-sm" data-reject="${r.id}">Reject</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>

      <h4 style="margin-top:24px;">Publish results</h4>
      <div id="results-rows"></div>
      <button class="btn btn-ghost btn-sm" id="add-result-row" type="button">+ Add row</button>
      <form id="results-form" style="margin-top:12px;">
        <button class="btn btn-primary btn-sm" type="submit">Publish results</button>
      </form>
    </div>`;

  panel.querySelectorAll("[data-verify]").forEach((b) => b.addEventListener("click", () => setPayment(b.dataset.verify, "verified", tid)));
  panel.querySelectorAll("[data-reject]").forEach((b) => b.addEventListener("click", () => setPayment(b.dataset.reject, "rejected", tid)));

  document.getElementById("settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await VX.patch(`/api/admin/tournaments/${tid}`, {
      status: fd.get("status"), room_id: fd.get("room_id"), room_pass: fd.get("room_pass"),
    });
    await loadTournaments();
    openManagePanel(tid);
  });

  document.getElementById("add-result-row").addEventListener("click", () => {
    const wrap = document.getElementById("results-rows");
    const div = document.createElement("div");
    div.className = "field-row";
    div.style.cssText = "grid-template-columns: 40px 2fr 1fr 1fr; align-items:end; margin-bottom:8px;";
    div.innerHTML = `
      <div class="field" style="margin-bottom:0;"><label>#</label><input class="mono" name="pos" style="text-align:center;"></div>
      <div class="field" style="margin-bottom:0;"><label>Team</label><input name="team"></div>
      <div class="field" style="margin-bottom:0;"><label>Kills</label><input class="mono" name="kills" value="0"></div>
      <div class="field" style="margin-bottom:0;"><label>Prize ₹</label><input class="mono" name="prize" value="0"></div>`;
    wrap.appendChild(div);
  });

  document.getElementById("results-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const rows = document.querySelectorAll("#results-rows .field-row");
    const results = [];
    rows.forEach((row) => {
      const team = row.querySelector("[name=team]").value.trim();
      if (!team) return;
      results.push({
        position: Number(row.querySelector("[name=pos]").value) || 0,
        team_name: team,
        kills: Number(row.querySelector("[name=kills]").value) || 0,
        prize_amount: Number(row.querySelector("[name=prize]").value) || 0,
      });
    });
    await VX.post(`/api/admin/tournaments/${tid}/results`, { results });
    await loadTournaments();
    openManagePanel(tid);
  });
}

async function setPayment(rid, status, tid) {
  await VX.patch(`/api/admin/registrations/${rid}/payment`, { status });
  await loadStats();
  openManagePanel(tid);
}
