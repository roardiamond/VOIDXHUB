// Page script for index.html (home page).

async function loadHome() {
  renderNav("home");

  const grid = document.getElementById("featured-grid");
  const gamesGrid = document.getElementById("games-grid");
  const stats = document.querySelectorAll("#hud-stats .val");

  try {
    const tournaments = await VX.get("/api/tournaments?status=upcoming");
    const openSlots = tournaments.reduce((a, t) => a + Math.max((t.slots_total || 0) - (t.slots_filled || 0), 0), 0);
    const prizePool = tournaments.reduce((a, t) => a + (t.prize_pool || 0), 0);
    const gameCount = new Set(tournaments.map((t) => t.game_slug)).size;

    if (stats.length >= 4) {
      stats[0].textContent = openSlots;
      stats[1].textContent = tournaments.length;
      stats[2].textContent = gameCount;
      stats[3].textContent = fmtMoney(prizePool);
    }

    // Games
    try {
      const games = await VX.get("/api/games");
      if (gamesGrid) {
        gamesGrid.innerHTML = games.map((g) => `
          <a href="${vxPath("/tournaments.html")}?game=${encodeURIComponent(g.slug)}" class="game-tile">
            ${gameEmblemHtml(g.name)}
            <span class="name">${escapeHtml(g.name)}</span>
          </a>`).join("");
      }
    } catch (e) {
      if (gamesGrid) {
        gamesGrid.innerHTML = `<p class="mono" style="color:var(--fog-dim)">Games temporarily unavailable.</p>`;
      }
    }

    // Featured tournaments
    if (!grid) return;
    if (!tournaments || tournaments.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No open tournaments right now</h3>
          <p>Check back soon — new scrims drop regularly.</p>
        </div>`;
      return;
    }
    grid.innerHTML = tournaments.slice(0, 6).map(deployCardHtml).join("");

  } catch (e) {
    // Backend is down or network error
    console.warn("Backend unreachable:", e);

    if (stats.length >= 4) {
      stats[0].textContent = "—";
      stats[1].textContent = "—";
      stats[2].textContent = "—";
      stats[3].textContent = "—";
    }

    if (grid) {
      grid.innerHTML = `
        <div class="empty-state" style="text-align:center; padding:40px 20px;">
          <h3 style="margin-bottom:8px;">Backend temporarily offline</h3>
          <p style="color:var(--fog-dim); max-width:420px; margin:0 auto 16px;">
            Tournament data could not be loaded. The main site is still live.
            Please try again later or join via Telegram.
          </p>
          <a href="https://t.me/voidxhub" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
            Open Telegram →
          </a>
        </div>`;
    }

    if (gamesGrid) {
      gamesGrid.innerHTML = `<p class="mono" style="color:var(--fog-dim)">Games unavailable while backend is offline.</p>`;
    }
  }
}

loadHome();
