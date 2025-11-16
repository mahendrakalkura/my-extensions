(() => {
  'use strict';

  const updateProgress = () => {
    const video = document.querySelector('video');
    const progressBar = document.querySelector('.ytp-play-progress');

    if (video && progressBar && !video.paused && video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      progressBar.style.transform = `scaleX(${progress / 100})`;
    }
  };

  const init = () => {
    const video = document.querySelector('video');

    if (video) {
      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('play', () => {
        const animate = () => {
          if (!video.paused) {
            updateProgress();
            requestAnimationFrame(animate);
          }
        };
        animate();
      });
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
