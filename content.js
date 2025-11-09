(() => {
  // Store processed video URLs (prevents reload loop)
  const processed = new Set();
  const getVideoKey = () => location.pathname + location.search;

  // Main function
  const handleAudioTrack = () => {
    const key = getVideoKey();
    if (processed.has(key)) return;  // Already handled → skip
    processed.add(key);

    const player = document.querySelector('#movie_player');
    if (!player) return;

    const settingsBtn = player.querySelector('.ytp-settings-button');
    if (!settingsBtn) return;

    // Step 1: Open settings
    settingsBtn.click();

    setTimeout(() => {
      // Step 2: Find "Audio track" menu item
      const audioTrackItem = Array.from(
        document.querySelectorAll('.ytp-panel-menu .ytp-menuitem')
      ).find(item => /audio\s*track/i.test(item.textContent));

      if (!audioTrackItem) {
        closeSettings();
        return;
      }

      audioTrackItem.click();

      setTimeout(() => {
        // Step 3: Look for "Original" track
        const originalTrack = Array.from(
          document.querySelectorAll('.ytp-panel-menu .ytp-menuitem')
        ).find(item => {
          const label = item.querySelector('.ytp-menuitem-label')?.textContent || '';
          return /original/i.test(label);
        });

        if (originalTrack) {
          originalTrack.click();
          console.log('YT Mega Control: Original audio selected → reloading once');
          location.reload();  // ONE-TIME RELOAD
        } else {
          console.log('YT Mega Control: No original track → playing as-is');
          closeSettings();
        }
      }, 200);
    }, 250);
  };

  // Close settings menu
  const closeSettings = () => {
    const btn = document.querySelector('.ytp-settings-button');
    if (btn && btn.getAttribute('aria-expanded') === 'true') {
      btn.click();
    }
  };

  // Wait for player to be ready
  const waitForPlayer = () => {
    const interval = setInterval(() => {
      if (document.querySelector('#movie_player')) {
        clearInterval(interval);
        handleAudioTrack();
      }
    }, 500);
  };

  // Handle YouTube SPA navigation (next video, Shorts, etc.)
  let lastKey = getVideoKey();
  const observer = new MutationObserver(() => {
    const currentKey = getVideoKey();
    if (currentKey !== lastKey) {
      lastKey = currentKey;
      // Do NOT reset processed here → allow per-video once-only
      waitForPlayer();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Start on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForPlayer);
  } else {
    waitForPlayer();
  }
})();
