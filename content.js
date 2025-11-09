(() => {
  // === PERMANENT storage: survives reloads ===
  const STORAGE_KEY = 'yt_mega_control_processed';
  const getProcessed = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch {
      return new Set();
    }
  };
  const saveProcessed = (set) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  };

  const processed = getProcessed();
  const getVideoKey = () => location.pathname + location.search;

  // === Main logic ===
  const trySwitchAndReload = () => {
    const videoKey = getVideoKey();
    if (processed.has(videoKey)) {
      console.log('YT Mega Control: Already processed → skip');
      return; // ← This stops the loop
    }

    const player = document.querySelector('#movie_player');
    if (!player) return;

    const settingsBtn = player.querySelector('.ytp-settings-button');
    if (!settingsBtn) return;

    // Open settings
    settingsBtn.click();

    setTimeout(() => {
      const audioItem = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem'))
        .find(i => /audio\s*track/i.test(i.textContent));

      if (!audioItem) {
        closeSettings();
        return;
      }

      audioItem.click();

      setTimeout(() => {
        const original = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem'))
          .find(i => {
            const label = i.querySelector('.ytp-menuitem-label')?.textContent || '';
            return /original/i.test(label);
          });

        closeSettings(); // Always close

        if (original) {
          original.click();
          console.log('YT Mega Control: Original selected → RELOAD ONCE');
          processed.add(videoKey);
          saveProcessed(processed);
          location.reload(); // ← ONLY ONCE
        } else {
          console.log('YT Mega Control: No original track → play as-is');
          // Do NOT add to processed — allow retry if track appears later
        }
      }, 220);
    }, 280);
  };

  const closeSettings = () => {
    const btn = document.querySelector('.ytp-settings-button');
    if (btn && btn.getAttribute('aria-expanded') === 'true') {
      btn.click();
    }
  };

  // === Wait for player ===
  const waitAndRun = () => {
    let attempts = 0;
    const checker = setInterval(() => {
      if (document.querySelector('#movie_player') || attempts++ > 30) {
        clearInterval(checker);
        trySwitchAndReload();
      }
    }, 500);
  };

  // === SPA navigation (next video, Shorts, etc.) ===
  let lastKey = getVideoKey();
  const observer = new MutationObserver(() => {
    const now = getVideoKey();
    if (now !== lastKey) {
      lastKey = now;
      waitAndRun();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // === Start ===
  waitAndRun();
})();
