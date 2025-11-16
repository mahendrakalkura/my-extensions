// Force YouTube controls to always show when not in fullscreen
(function() {
  'use strict';

  function forceShowControls() {
    // Get all video players on the page
    const players = document.querySelectorAll('.html5-video-player');

    players.forEach(player => {
      // Check if video is NOT in fullscreen
      const isFullscreen = player.classList.contains('ytp-fullscreen');

      if (!isFullscreen) {
        // Remove autohide class to keep controls visible
        player.classList.remove('ytp-autohide');
      }
    });
  }

  // Run on page load
  forceShowControls();

  // Watch for changes (videos loading, fullscreen toggle, etc.)
  const observer = new MutationObserver(() => {
    forceShowControls();
  });

  // Observe the body for any changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  // Also force show controls periodically as a fallback
  setInterval(forceShowControls, 500);
})();
