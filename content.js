(() => {
  const processed = new Set();
  const getVideoKey = () => location.pathname + location.search;

  const forceOriginalAndReload = () => {
    const key = getVideoKey();
    if (processed.has(key)) return;
    processed.add(key);

    const player = document.querySelector('#movie_player');
    if (!player) return;

    const settingsBtn = player.querySelector('.ytp-settings-button');
    if (!settingsBtn) return;

    // 1. Open settings
    settingsBtn.click();

    setTimeout(() => {
      const audioItem = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem'))
        .find(i => /audio\s*track/i.test(i.textContent));

      if (!audioItem) { closeMenu(); return; }
      audioItem.click();

      setTimeout(() => {
        const original = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem'))
          .find(i => {
            const label = i.querySelector('.ytp-menuitem-label')?.textContent || '';
            return /original/i.test(label);
          });

        if (original) {
          original.click();
          console.log('YT Mega Control: Original audio selected → full reload');
          location.reload();  // FULL TAB REFRESH
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

  // Wait for player
  const start = () => {
    const check = setInterval(() => {
      if (document.querySelector('#movie_player')) {
        clearInterval(check);
        forceOriginalAndReload();
      }
    }, 400);
  };

  // SPA navigation
  let lastKey = getVideoKey();
  new MutationObserver(() => {
    const now = getVideoKey();
    if (now !== lastKey) {
      lastKey = now;
      start();
    }
  }).observe(document.body, { childList: true, subtree: true });

  // Initial run
  start();
})();
