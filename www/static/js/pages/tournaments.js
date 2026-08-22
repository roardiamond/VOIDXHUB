// Page script for tournaments.html (browse / filter grid).

let currentGame = "";
let currentStatus = "";

async function loadGameTabs() {
  const games = await VX.get("/api/games");
  const preselected = new URLSearchParams(window.location.search).get("game") || "";
  currentGame = preselected;

  const tabsEl = document.getElementById("game-tabs");
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
    if (tournaments.length === 0) {
      grid.innerHTML = `<div class="empty-state"><h3>Nothing here yet</h3><p>Try a different filter.</p></div>`;
      return;
    }
    grid.innerHTML = tournaments.map(deployCardHtml).join("");
  } catch (e) {
    grid.innerHTML = `<p class="mono" style="color:var(--alert-red)">Couldn't load tournaments.</p>`;
  }
}

renderNav("tournaments");
setupStatusTabs();
loadGameTabs();
loadGrid();
