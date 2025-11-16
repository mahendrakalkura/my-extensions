(() => {
  'use strict';

  const forceHoverState = () => {
    const player = document.querySelector('.html5-video-player');
    if (player && !player.classList.contains('ytp-fullscreen')) {
      player.classList.add('ytp-hover');
    }
  };

  const observer = new MutationObserver(() => forceHoverState());

  const init = () => {
    const player = document.querySelector('.html5-video-player');
    if (player) {
      forceHoverState();
      observer.observe(player, { attributes: true, attributeFilter: ['class'] });
      setInterval(forceHoverState, 100);
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
