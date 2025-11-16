// Force YouTube controls to always show when not in fullscreen
(function() {
  'use strict';

  let isProcessing = false;

  function forceShowControls() {
    // Prevent re-entry
    if (isProcessing) return;
    isProcessing = true;

    try {
      // Get all video players on the page
      const players = document.querySelectorAll('.html5-video-player');

      players.forEach(player => {
        // Check if video is NOT in fullscreen
        const isFullscreen = player.classList.contains('ytp-fullscreen');

        if (!isFullscreen && player.classList.contains('ytp-autohide')) {
          // Remove autohide class to keep controls visible
          player.classList.remove('ytp-autohide');
        }
      });
    } finally {
      isProcessing = false;
    }
  }

  // Run when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceShowControls);
  } else {
    forceShowControls();
  }

  // Only check every 2 seconds (much less aggressive)
  setInterval(forceShowControls, 2000);
})();
