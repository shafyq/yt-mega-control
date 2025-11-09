(() => {
  let processed = new Set();               // URL → already handled
  const currentUrl = () => location.pathname + location.search;

  const forceOriginalAndReload = () => {
    const urlKey = currentUrl();
    if (processed.has(urlKey)) return;     // already done for this video
    processed.add(urlKey);

    const player = document.querySelector('#movie_player');
    if (!player) return;

    const settingsBtn = player.querySelector('.ytp-settings-button');
    if (!settingsBtn) return;

    // ---- 1. Open Settings ----
    settingsBtn.click();

    setTimeout(() => {
      // ---- 2. Click "Audio track" ----
      const audioItem = Array.from(
        document.querySelectorAll('.ytp-panel-menu .ytp-menuitem')
      ).find(i => /audio\s*track/i.test(i.textContent));

      if (!audioItem) { closeMenu(); return; }
      audioItem.click();

      setTimeout(() => {
        // ---- 3. Click "Original" ----
        const original = Array.from(
          document.querySelectorAll('.ytp-panel-menu .ytp-menuitem')
        ).find(i => {
          const txt = (i.querySelector('.ytp-menuitem-label')?.textContent || '').toLowerCase();
          return txt.includes('original');
        });

        if (original) {
          original.click();
          console.log('Original audio selected → full reload');
          // ---- 4. FULL TAB RELOAD ----
          location.reload();          // <-- THIS IS THE ONLY RELOAD
        } else {
          closeMenu();
        }
      }, 180);
    }, 220);
  };

  const closeMenu = () => {
    const btn = document.querySelector('.ytp-settings-button');
    if (btn && btn.getAttribute('aria-expanded') === 'true') btn.click();
  };

  // ---- Wait for player (watch page or Shorts) ----
  const start = () => {
    const check = setInterval(() => {
      if (document.querySelector('#movie_player')) {
        clearInterval(check);
        forceOriginalAndReload();
      }
    }, 400);
  };

  // ---- SPA navigation (next video, Shorts, etc.) ----
  let last = currentUrl();
  new MutationObserver(() => {
    const now = currentUrl();
    if (now !== last) {
      last = now;
      start();                 // new video → run again
    }
  }).observe(document.body, { childList: true, subtree: true });

  // ---- Initial run ----
  start();
})();
