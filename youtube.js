(() => {
  'use strict';

  const update = () => {
    const player = document.querySelector('.html5-video-player');
    if (player && !player.classList.contains('ytp-fullscreen')) {
      player.classList.add('ytp-hover');
    }
  };

  const init = () => {
    const player = document.querySelector('.html5-video-player');
    if (player) {
      setInterval(update, 1000);
    } else {
      setTimeout(init, 500);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
