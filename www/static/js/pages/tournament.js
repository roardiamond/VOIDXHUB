// Page script for tournament.html (single tournament detail + registration).

const params = new URLSearchParams(window.location.search);
const tid = params.get("id");
const content = document.getElementById("content");

// Mode -> how many players must register. Covers BGMI/Free Fire style modes
// (solo/duo/squad) and CS-style team sizes (4v4/5v5/6v6) — every player up
// to this count is mandatory, since a partial squad can't play the match.
// Mirrors MODE_PLAYER_COUNTS in backend/app.py — keep both in sync.
const MODE_PLAYER_COUNTS = { solo: 1, duo: 2, trio: 3, squad: 4, "4v4": 4, "5v5": 5, "6v6": 6 };

function playerInputsHtml(mode) {
  const n = MODE_PLAYER_COUNTS[mode] || 4;
  let html = "";
  for (let i = 1; i <= n; i++) {
    html += `
    <div class="field-row">
      <div class="field"><label>Player ${i} IGN ${i === 1 ? "(you)" : ""}</label>
        <input type="text" name="player${i}_ign" required placeholder="In-game name"></div>
      <div class="field"><label>Player ${i} UID ${i === 1 ? "(you)" : ""}</label>
        <input type="text" name="player${i}_uid" required inputmode="numeric" pattern="[0-9]*" placeholder="Game UID"></div>
    </div>`;
  }
  return html;
}

function renderRegisterForm(t) {
  const paid = t.entry_fee > 0;
  return `
  <div class="form-card">
    <h3 style="font-size:20px;">Register your squad</h3>
    <div id="reg-alert"></div>
    <form id="reg-form">
      <div class="field"><label>Team name</label>
        <input type="text" name="team_name" required placeholder="e.g. Void Wolves"></div>
      ${playerInputsHtml(t.mode)}
      ${paid ? `
        <div class="card-plain" style="margin:18px 0; background:var(--void-black);">
          <span class="eyebrow mono">Pay entry fee</span>
          <p style="margin:6px 0 12px; color:var(--fog-dim); font-size:14px;">
            Pay <strong class="mono" style="color:#fff">${fmtMoney(t.entry_fee)}</strong> via UPI to
            <strong class="mono" style="color:var(--signal-cyan)">${escapeHtml(t.upi_id || "voidxhub@upi")}</strong>,
            then enter the transaction / UTR number below. Your slot confirms once an admin verifies it.
          </p>
          <a class="btn btn-ghost btn-sm" target="_blank"
             href="upi://pay?pa=${encodeURIComponent(t.upi_id || 'voidxhub@upi')}&pn=VOIDXHUB&am=${t.entry_fee}&cu=INR&tn=${encodeURIComponent(t.title)}">
             Open UPI app
          </a>
        </div>
        <div class="field"><label>UTR / Transaction ID</label>
          <input type="text" name="utr_number" required placeholder="12-digit UTR from your payment app"></div>
      ` : ""}
      <button class="btn btn-primary btn-block" type="submit">
        ${paid ? "Submit registration" : "Register for free"}
      </button>
    </form>
  </div>`;
}

function renderMyRegistration(t, reg) {
  const roomKnown = reg.payment_status === "verified" && t.room_id;
  return `
  <div class="form-card">
    <h3 style="font-size:20px;">Your registration</h3>
    <div style="display:flex; justify-content:space-between; align-items:center; margin:14px 0;">
      <span class="mono">${escapeHtml(reg.team_name)}</span>
      ${paymentBadge(reg.payment_status)}
    </div>
    ${reg.payment_status === "pending" ? `<p style="color:var(--fog-dim); font-size:14px;">We're verifying your payment. Room details unlock once it's confirmed — check back or watch your dashboard.</p>` : ""}
    ${reg.payment_status === "rejected" ? `<p style="color:var(--alert-red); font-size:14px;">Your payment couldn't be verified. Contact support with your UTR: <span class="mono">${escapeHtml(reg.utr_number || "—")}</span></p>` : ""}
    ${roomKnown ? `
      <div class="room-reveal">
        <div class="item"><div class="k">Room ID</div><div class="v">${escapeHtml(t.room_id)}</div></div>
        <div class="item"><div class="k">Password</div><div class="v">${escapeHtml(t.room_pass || "—")}</div></div>
      </div>` : ""}
    ${reg.payment_status === "verified" && !t.room_id ? `<p style="color:var(--fog-dim); font-size:14px;">You're confirmed. Room ID drops closer to match time.</p>` : ""}
  </div>`;
}

function resultsTableHtml(results) {
  if (!results.length) return `<p style="color:var(--fog-dim)">Results haven't been published yet.</p>`;
  const rows = results.map((r) => `
    <tr>
      <td class="mono">#${r.position}</td>
      <td>${escapeHtml(r.team_name)}</td>
      <td class="mono">${r.kills}</td>
      <td class="mono" style="color:var(--signal-cyan)">${fmtMoney(r.prize_amount)}</td>
    </tr>`).join("");
  return `<table><thead><tr><th>Rank</th><th>Team</th><th>Kills</th><th>Prize</th></tr></thead><tbody>${rows}</tbody></table>`;
}

async function load() {
  renderNav("tournaments");
  if (!tid) {
    content.innerHTML = `<div class="wrap"><div class="empty-state"><h3>Tournament not found</h3></div></div>`;
    return;
  }
  try {
    const t = await VX.get(`/api/tournaments/${tid}`);
    const user = VX.getUser();

    let rightPanel;
    if (t.status === "completed") {
      rightPanel = `<div class="form-card"><h3 style="font-size:20px;">Final standings</h3>${resultsTableHtml(t.results)}</div>`;
    } else if (!user) {
      rightPanel = `<div class="form-card">
        <h3 style="font-size:20px;">Want in?</h3>
        <p style="color:var(--fog-dim); font-size:14px; margin-bottom:16px;">Log in or create an account to register your squad.</p>
        <a class="btn btn-primary btn-block" href="/login.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}">Log in to register</a>
      </div>`;
    } else if (t.my_registration) {
      rightPanel = renderMyRegistration(t, t.my_registration);
    } else if (t.status !== "upcoming") {
      rightPanel = `<div class="form-card"><p style="color:var(--fog-dim)">Registration is closed for this tournament.</p></div>`;
    } else if (t.slots_filled >= t.slots_total) {
      rightPanel = `<div class="form-card"><p style="color:var(--alert-amber)">All slots are full. Check back for the next scrim.</p></div>`;
    } else {
      rightPanel = renderRegisterForm(t);
    }

    content.innerHTML = `
      <div class="wrap">
        <span class="eyebrow">${escapeHtml(t.game_name)} · ${escapeHtml(t.mode)}</span>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap;">
          <h1 style="font-size:36px;">${escapeHtml(t.title)}</h1>
          ${statusBadge(t.status)}
        </div>
        <div style="display:grid; grid-template-columns: 1.4fr 1fr; gap:32px; margin-top:24px; align-items:start;">
          <div>
            <div class="card-plain">
              <div class="deploy-meta" style="font-size:15px; gap:28px; margin-bottom:18px;">
                <span>Entry <strong class="mono">${fmtMoney(t.entry_fee)}</strong></span>
                <span>Prize pool <strong class="mono" style="color:var(--signal-cyan)">${fmtMoney(t.prize_pool)}</strong></span>
                <span>Match time <strong class="mono">${fmtDate(t.match_date)}</strong></span>
              </div>
              <div class="slot-label"><span>SLOTS FILLED</span><span>${t.slots_filled} / ${t.slots_total}</span></div>
              ${slotBarHtml(t.slots_filled, t.slots_total)}
              <p style="margin-top:20px; color:var(--fog); line-height:1.7;">${escapeHtml(t.description || "No description provided.")}</p>
            </div>
            ${t.status === "completed" ? "" : `<div class="card-plain" style="margin-top:20px;"><h3 style="font-size:16px;">Final standings</h3>${resultsTableHtml(t.results)}</div>`}
          </div>
          <div>${rightPanel}</div>
        </div>
      </div>`;

    const form = document.getElementById("reg-form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(form);

        // Every player up to the mode's required count must have both IGN
        // and UID — a half-empty squad can't actually play the match.
        const playerCount = MODE_PLAYER_COUNTS[t.mode] || 4;
        const players = [];
        const alertEl = document.getElementById("reg-alert");
        alertEl.innerHTML = "";

        for (let i = 1; i <= playerCount; i++) {
          const ign = (fd.get(`player${i}_ign`) || "").trim();
          const uid = (fd.get(`player${i}_uid`) || "").trim();
          if (!ign || !uid) {
            alertEl.innerHTML = `<div class="alert alert-error">Player ${i} needs both IGN and UID — this mode requires all ${playerCount} player${playerCount > 1 ? "s" : ""}.</div>`;
            return;
          }
          if (!/^\d+$/.test(uid)) {
            alertEl.innerHTML = `<div class="alert alert-error">Player ${i}'s UID should be numbers only.</div>`;
            return;
          }
          players.push({ ign, uid });
        }

        const btn = form.querySelector("button[type=submit]");
        btn.disabled = true;
        try {
          await VX.post(`/api/tournaments/${tid}/register`, {
            team_name: fd.get("team_name"),
            players,
            utr_number: fd.get("utr_number") || "",
          });
          load();
        } catch (err) {
          alertEl.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
          btn.disabled = false;
        }
      });
    }
  } catch (e) {
    content.innerHTML = `<div class="wrap"><div class="empty-state"><h3>Tournament not found</h3><p>${escapeHtml(e.message)}</p></div></div>`;
  }
}

load();
