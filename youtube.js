(() => {
  'use strict';

  let animationId;

  const update = () => {
    const player = document.querySelector('.html5-video-player');
    if (player && !player.classList.contains('ytp-fullscreen')) {
      player.classList.add('ytp-hover');
    }
    animationId = requestAnimationFrame(update);
  };

  const init = () => {
    const player = document.querySelector('.html5-video-player');
    if (player) {
      update();
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
