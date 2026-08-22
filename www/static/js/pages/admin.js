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
  await loadAuditLog();

  document.getElementById("toggle-create").addEventListener("click", () => {
    const panel = document.getElementById("create-panel");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

  document.getElementById("create-form").addEventListener("submit", onCreateSubmit);

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

async function loadAuditLog() {
  const tbody = document.querySelector("#audit-table tbody");
  try {
    const rows = await VX.get("/api/admin/audit-log");
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="mono" style="color:var(--fog-dim)">No events yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map((r) => `
      <tr>
        <td class="mono" style="font-size:12px;">${escapeHtml(r.created_at)}</td>
        <td class="mono" style="font-size:12px;">${escapeHtml(r.event)}</td>
        <td>${escapeHtml(r.username || "—")}</td>
        <td class="mono" style="font-size:12px;">${escapeHtml(r.ip_address || "—")}</td>
        <td class="mono" style="font-size:12px; color:var(--fog-dim);">${escapeHtml(r.detail || "")}</td>
      </tr>`).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="mono" style="color:var(--alert-red)">Couldn't load audit log.</td></tr>`;
  }
}

async function loadStats() {
  const s = await VX.get("/api/admin/stats");
  const vals = document.querySelectorAll("#stats-strip .val");
  vals[0].textContent = s.total_tournaments;
  vals[1].textContent = s.total_users;
  vals[2].textContent = s.pending_payments;
  vals[3].textContent = fmtMoney(s.revenue);
}

async function loadGames() {
  gamesCache = await VX.get("/api/games");
  document.getElementById("game-select").innerHTML =
    gamesCache.map((g) => `<option value="${g.id}">${escapeHtml(g.name)}</option>`).join("");
}

async function onCreateSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const alertEl = document.getElementById("create-alert");
  alertEl.innerHTML = "";
  try {
    await VX.post("/api/admin/tournaments", {
      title: fd.get("title"), game_id: Number(fd.get("game_id")), mode: fd.get("mode"),
      match_date: fd.get("match_date"), entry_fee: Number(fd.get("entry_fee")),
      prize_pool: Number(fd.get("prize_pool")), slots_total: Number(fd.get("slots_total")),
      upi_id: fd.get("upi_id"), description: fd.get("description"),
    });
    e.target.reset();
    document.getElementById("create-panel").style.display = "none";
    await loadStats();
    await loadTournaments();
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}

async function loadTournaments() {
  const tournaments = await VX.get("/api/tournaments");
  const tbody = document.querySelector("#tournament-table tbody");
  if (tournaments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="mono" style="color:var(--fog-dim)">No tournaments yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = tournaments.map((t) => `
    <tr>
      <td>${escapeHtml(t.title)}</td>
      <td class="mono">${escapeHtml(t.game_name)}</td>
      <td>${statusBadge(t.status)}</td>
      <td class="mono">${t.slots_filled}/${t.slots_total}</td>
      <td class="mono">${fmtMoney(t.entry_fee)}</td>
      <td><button class="btn btn-ghost btn-sm" data-manage="${t.id}">Manage</button></td>
    </tr>`).join("");

  tbody.querySelectorAll("[data-manage]").forEach((btn) => {
    btn.addEventListener("click", () => openManagePanel(Number(btn.dataset.manage)));
  });
}

async function openManagePanel(tid) {
  const panel = document.getElementById("manage-panel");
  panel.innerHTML = `<p class="mono" style="color:var(--fog-dim); margin-top:20px;">Loading tournament…</p>`;
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });

  const [t, regs] = await Promise.all([
    VX.get(`/api/tournaments/${tid}`),
    VX.get(`/api/admin/tournaments/${tid}/registrations`),
  ]);

  const regRows = regs.length ? regs.map((r) => {
    let players = [];
    try { players = JSON.parse(r.players || "[]"); } catch (e) { players = []; }
    const playersHtml = players.length
      ? players.map((p) => `<div>${escapeHtml(p.ign || p)}${p.uid ? ` <span class="mono" style="color:var(--fog-dim);">#${escapeHtml(p.uid)}</span>` : ""}</div>`).join("")
      : `<span class="mono" style="color:var(--fog-dim);">—</span>`;
    return `
    <tr>
      <td>${escapeHtml(r.team_name)}</td>
      <td class="mono">${escapeHtml(r.username)}</td>
      <td style="font-size:13px;">${playersHtml}</td>
      <td class="mono">${escapeHtml(r.utr_number || "—")}</td>
      <td>${paymentBadge(r.payment_status)}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-sm btn-ghost" data-verify="${r.id}">Verify</button>
        <button class="btn btn-sm btn-danger" data-reject="${r.id}">Reject</button>
      </td>
    </tr>`;
  }).join("") : `<tr><td colspan="6" class="mono" style="color:var(--fog-dim)">No registrations yet.</td></tr>`;

  const resultRows = (t.results && t.results.length ? t.results : [{}, {}, {}]).map((r, i) => `
    <div class="field-row" style="grid-template-columns: 40px 2fr 1fr 1fr; align-items:end; margin-bottom:8px;">
      <div class="field" style="margin-bottom:0;"><label>#</label><input class="mono" name="pos" value="${r.position || i + 1}" style="text-align:center;"></div>
      <div class="field" style="margin-bottom:0;"><label>Team</label><input name="team" value="${escapeHtml(r.team_name || "")}"></div>
      <div class="field" style="margin-bottom:0;"><label>Kills</label><input class="mono" name="kills" value="${r.kills || 0}"></div>
      <div class="field" style="margin-bottom:0;"><label>Prize ₹</label><input class="mono" name="prize" value="${r.prize_amount || 0}"></div>
    </div>`).join("");

  panel.innerHTML = `
    <div class="card-plain" style="margin-top:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <h3 style="font-size:20px;">${escapeHtml(t.title)}</h3>
        ${statusBadge(t.status)}
      </div>

      <h4 style="font-size:14px; text-transform:uppercase; letter-spacing:0.06em; color:var(--fog-dim); margin-top:24px;">Match settings</h4>
      <form id="settings-form">
        <div class="field-row">
          <div class="field"><label>Status</label>
            <select name="status">
              <option value="upcoming" ${t.status === "upcoming" ? "selected" : ""}>Upcoming</option>
              <option value="live" ${t.status === "live" ? "selected" : ""}>Live</option>
              <option value="completed" ${t.status === "completed" ? "selected" : ""}>Completed</option>
            </select>
          </div>
          <div class="field"><label>Room ID</label><input class="mono" name="room_id" value="${escapeHtml(t.room_id || "")}"></div>
        </div>
        <div class="field"><label>Room password</label><input class="mono" name="room_pass" value="${escapeHtml(t.room_pass || "")}"></div>
        <button class="btn btn-primary btn-sm" type="submit">Save settings</button>
      </form>

      <h4 style="font-size:14px; text-transform:uppercase; letter-spacing:0.06em; color:var(--fog-dim); margin-top:28px;">Registrations &amp; payments</h4>
      <table>
        <thead><tr><th>Team</th><th>User</th><th>Players</th><th>UTR</th><th>Status</th><th></th></tr></thead>
        <tbody>${regRows}</tbody>
      </table>

      <h4 style="font-size:14px; text-transform:uppercase; letter-spacing:0.06em; color:var(--fog-dim); margin-top:28px;">Publish results</h4>
      <form id="results-form">
        <div id="results-rows">${resultRows}</div>
        <button type="button" class="btn btn-ghost btn-sm" id="add-result-row">+ Add row</button>
        <div style="margin-top:14px;"><button class="btn btn-primary btn-sm" type="submit">Publish results</button></div>
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
