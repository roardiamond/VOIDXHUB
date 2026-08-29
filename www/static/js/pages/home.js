// Page script for index.html (home page).

async function loadHome() {
  renderNav("home");
  try {
    const tournaments = await VX.get("/api/tournaments?status=upcoming");
    const openSlots = tournaments.reduce((a, t) => a + Math.max(t.slots_total - t.slots_filled, 0), 0);
    const prizePool = tournaments.reduce((a, t) => a + t.prize_pool, 0);
    const gameCount = new Set(tournaments.map((t) => t.game_slug)).size;

    const stats = document.querySelectorAll("#hud-stats .val");
    stats[0].textContent = openSlots;
    stats[1].textContent = tournaments.length;
    stats[2].textContent = gameCount;
    stats[3].textContent = fmtMoney(prizePool);

    const gamesGrid = document.getElementById("games-grid");
    try {
      const games = await VX.get("/api/games");
      gamesGrid.innerHTML = games.map((g) => `
        <a href="/tournaments.html?game=${g.slug}" class="game-tile">
          ${gameEmblemHtml(g.name)}
          <span class="name">${escapeHtml(g.name)}</span>
        </a>`).join("");
    } catch (e) {
      gamesGrid.innerHTML = `<p class="mono" style="color:var(--alert-red)">Couldn't load games.</p>`;
    }

    const grid = document.getElementById("featured-grid");
    if (tournaments.length === 0) {
      grid.innerHTML = `<div class="empty-state"><h3>No open tournaments right now</h3><p>Check back soon — new scrims drop regularly.</p></div>`;
      return;
    }
    grid.innerHTML = tournaments.slice(0, 6).map(deployCardHtml).join("");
  } catch (e) {
    document.getElementById("featured-grid").innerHTML = `<p class="mono" style="color:var(--alert-red)">Couldn't load tournaments.</p>`;
  }
}

loadHome();
