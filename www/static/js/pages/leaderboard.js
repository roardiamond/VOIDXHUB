// Page script for leaderboard.html.

let currentGame = "";

function rankRowHtml(row, i) {
  const rank = i + 1;
  const topClass = rank <= 3 ? `top-${rank}` : "";
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "#" + rank;
  return `
  <div class="rank-row ${topClass}">
    <span class="rank-num">${medal}</span>
    <span class="rank-team">${escapeHtml(row.team_name)}</span>
    <span class="rank-stat">${row.events}<br><span style="font-size:11px;">events</span></span>
    <span class="rank-stat">${row.wins}<br><span style="font-size:11px;">wins</span></span>
    <span class="rank-stat"><strong>${fmtMoney(row.total_prize)}</strong>won</span>
  </div>`;
}

async function loadGameTabs() {
  const games = await VX.get("/api/games");
  const tabsEl = document.getElementById("game-tabs");
  tabsEl.innerHTML = `<button class="tab active" data-game="">All games</button>` +
    games.map((g) => `<button class="tab" data-game="${g.slug}">${escapeHtml(g.name)}</button>`).join("");

  tabsEl.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      tabsEl.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentGame = btn.dataset.game;
      loadBoard();
    });
  });
}

async function loadBoard() {
  const board = document.getElementById("board");
  board.innerHTML = `<p class="mono" style="color:var(--fog-dim); padding:0 16px;">Loading…</p>`;
  try {
    const params = currentGame ? `?game=${currentGame}` : "";
    const rows = await VX.get(`/api/leaderboard${params}`);
    if (rows.length === 0) {
      board.innerHTML = `<div class="empty-state"><h3>No results yet</h3><p>Rankings appear once tournaments are completed and results are published.</p></div>`;
      return;
    }
    board.innerHTML = rows.map(rankRowHtml).join("");
  } catch (e) {
    board.innerHTML = `<p class="mono" style="color:var(--alert-red)">Couldn't load leaderboard.</p>`;
  }
}

renderNav("leaderboard");
loadGameTabs();
loadBoard();
