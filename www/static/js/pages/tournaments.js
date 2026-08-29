// Page script for tournaments.html (browse / filter grid).

let currentGame = "";
let currentStatus = "";

async function loadGameTabs() {
  const tabsEl = document.getElementById("game-tabs");
  try {
    const games = await VX.get("/api/games");
    const preselected = new URLSearchParams(window.location.search).get("game") || "";
    currentGame = preselected;

    tabsEl.innerHTML = `<button class="tab ${preselected ? "" : "active"}" data-game="">All games</button>` +
      games.map((g) => `<button class="tab ${g.slug === preselected ? "active" : ""}" data-game="${g.slug}">${escapeHtml(g.name)}</button>`).join("");

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
          <p>Admin can create one from the Admin panel. Check back soon.</p>
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

renderNav("tournaments");
setupStatusTabs();
loadGameTabs();
loadGrid();
