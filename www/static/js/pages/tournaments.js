// Page script for tournaments.html — browse grid + ArenaX AI create (merged).

let currentGame = "";
let currentStatus = "";
let gamesCache = [];
let lastAiPayload = null;

const AI_EXAMPLES = [
  "64 team Free Fire BR tonight, ₹20k prize, entry ₹50",
  "BGMI 5v5 custom rooms, 32 teams, start Saturday 7pm",
  "Valorant duo draft, 16 teams, prize ₹10k",
];

async function loadGameTabs() {
  const tabsEl = document.getElementById("game-tabs");
  try {
    gamesCache = await VX.get("/api/games");
    const preselected = new URLSearchParams(window.location.search).get("game") || "";
    currentGame = preselected;

    tabsEl.innerHTML =
      `<button class="tab ${preselected ? "" : "active"}" data-game="">All games</button>` +
      gamesCache
        .map(
          (g) =>
            `<button class="tab ${g.slug === preselected ? "active" : ""}" data-game="${g.slug}">${escapeHtml(g.name)}</button>`
        )
        .join("");

    tabsEl.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        tabsEl.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentGame = btn.dataset.game;
        loadGrid();
      });
    });
  } catch (e) {
    tabsEl.innerHTML = `<p class="mono" style="color:var(--fog-dim);font-size:13px;">Games unavailable (backend waking up…)</p>`;
  }
}

function setupStatusTabs() {
  const tabsEl = document.getElementById("status-tabs");
  tabsEl.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      tabsEl.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentStatus = btn.dataset.status;
      loadGrid();
    });
  });
}

async function loadGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = `<p class="mono" style="color:var(--fog-dim)">Loading…</p>`;
  const params = new URLSearchParams();
  if (currentGame) params.set("game", currentGame);
  if (currentStatus) params.set("status", currentStatus);
  try {
    const tournaments = await VX.get("/api/tournaments?" + params.toString());
    if (!tournaments || tournaments.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No tournaments yet</h3>
          <p>Use AI Create above (admin) or the Admin panel to add the first one.</p>
        </div>`;
      return;
    }
    grid.innerHTML = tournaments.map(deployCardHtml).join("");
  } catch (e) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3 style="color:var(--alert-red)">Couldn't reach server</h3>
        <p>Backend may be waking up (Render free plan). Wait 20–30 seconds and refresh.</p>
        <p class="mono" style="font-size:12px;margin-top:12px;color:var(--fog-faint);">${escapeHtml(e.message || "Network error")}</p>
        <button class="btn btn-primary btn-sm" style="margin-top:16px;" onclick="loadGrid()">Retry</button>
      </div>`;
  }
}

function parseAiPrompt(text) {
  const lower = text.toLowerCase();
  let game =
    gamesCache.find((g) => g.slug === "free-fire") ||
    gamesCache[0] ||
    { id: 2, name: "Free Fire", slug: "free-fire" };
  if (lower.includes("bgmi") || lower.includes("pubg"))
    game = gamesCache.find((g) => g.slug === "bgmi") || game;
  if (lower.includes("valorant") || lower.includes("valo"))
    game = gamesCache.find((g) => g.slug === "valorant") || game;
  if (lower.includes("free fire") || lower.includes("ff "))
    game = gamesCache.find((g) => g.slug === "free-fire") || game;

  const teamMatch = lower.match(/(\d+)\s*team/);
  const prizeMatch = text.match(/₹\s*[\d,]+\s*k?/i) || text.match(/(\d+)\s*k\s*prize/i);
  let prize = 10000;
  if (prizeMatch) {
    const raw = prizeMatch[0].replace(/[₹,\s]/g, "").toLowerCase();
    prize = raw.endsWith("k") ? parseInt(raw, 10) * 1000 : parseInt(raw, 10) || 10000;
  }
  const entryMatch = lower.match(/entry\s*₹?\s*(\d+)/);
  const mode =
    lower.includes("solo")
      ? "solo"
      : lower.includes("duo")
        ? "duo"
        : lower.includes("5v5") || lower.includes("5 v 5")
          ? "5v5"
          : "squad";

  const when = new Date();
  when.setDate(when.getDate() + 1);
  when.setHours(21, 0, 0, 0);
  const match_date = when.toISOString().slice(0, 19).replace("T", " ");

  return {
    title: text.slice(0, 80).trim() || "AI Tournament",
    game_id: game.id,
    game_name: game.name,
    mode,
    description:
      'AI-drafted from: "' +
      text +
      '"\n\nRules: check-in verification · no teaming · screenshot disputes · UPI payouts within 24h.',
    entry_fee: entryMatch ? parseInt(entryMatch[1], 10) : 0,
    prize_pool: prize,
    slots_total: teamMatch ? parseInt(teamMatch[1], 10) : 32,
    match_date,
    upi_id: "",
  };
}

function setupAiCreate() {
  const chips = document.getElementById("ai-chips");
  const promptEl = document.getElementById("ai-prompt");
  const genBtn = document.getElementById("ai-generate");
  const pubBtn = document.getElementById("ai-publish");
  const resultEl = document.getElementById("ai-result");
  const msgEl = document.getElementById("ai-msg");

  if (!chips || !genBtn) return;

  chips.innerHTML = AI_EXAMPLES.map(
    (ex) => `<button type="button" class="ai-chip" data-ex="${escapeHtml(ex)}">${escapeHtml(ex.slice(0, 42))}…</button>`
  ).join("");

  chips.querySelectorAll(".ai-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      promptEl.value = btn.dataset.ex || "";
    });
  });

  genBtn.addEventListener("click", () => {
    const text = (promptEl.value || "").trim();
    if (!text) return;
    genBtn.disabled = true;
    genBtn.textContent = "Drafting…";
    msgEl.textContent = "";
    msgEl.className = "ai-msg";

    setTimeout(() => {
      lastAiPayload = parseAiPrompt(text);
      document.getElementById("ai-game").textContent = lastAiPayload.game_name;
      document.getElementById("ai-mode").textContent = lastAiPayload.mode;
      document.getElementById("ai-slots").textContent = String(lastAiPayload.slots_total);
      document.getElementById("ai-prize").textContent = fmtMoney(lastAiPayload.prize_pool);
      document.getElementById("ai-desc").textContent = lastAiPayload.description.split("\n")[0];
      resultEl.classList.add("show");
      pubBtn.style.display = "inline-flex";
      genBtn.disabled = false;
      genBtn.textContent = "Generate with AI";
    }, 600);
  });

  pubBtn.addEventListener("click", async () => {
    if (!lastAiPayload) return;
    if (!VX.getToken()) {
      msgEl.className = "ai-msg warn";
      msgEl.textContent = "Login as admin first (same VOIDXHUB account).";
      window.location.href = window.VX_AUTH_LINKS.login + "?next=tournaments.html";
      return;
    }
    pubBtn.disabled = true;
    pubBtn.textContent = "Publishing…";
    msgEl.textContent = "";
    try {
      const res = await VX.post("/api/admin/tournaments", lastAiPayload);
      msgEl.className = "ai-msg ok";
      msgEl.textContent = "Published — tournament #" + (res.id || "") + ". Refreshing list…";
      await loadGrid();
    } catch (err) {
      msgEl.className = "ai-msg warn";
      if (err.status === 401 || err.status === 403) {
        msgEl.textContent = "Admin role required to publish. Config is ready — open Admin panel or use an admin account.";
      } else {
        msgEl.textContent = err.message || "Publish failed";
      }
    } finally {
      pubBtn.disabled = false;
      pubBtn.textContent = "Publish tournament";
    }
  });
}

renderNav("tournaments");
setupStatusTabs();
loadGameTabs().then(setupAiCreate);
loadGrid();
