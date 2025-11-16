(() => {
  'use strict';

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const updateProgress = () => {
    const video = document.querySelector('video');
    if (!video || !video.duration) return;

    const progress = video.currentTime / video.duration;
    const progressPercent = progress * 100;

    const playProgress = document.querySelector('.ytp-play-progress');
    if (playProgress) {
      playProgress.style.transform = `scaleX(${progress})`;
      playProgress.style.width = `${progressPercent}%`;
    }

    const scrubber = document.querySelector('.ytp-scrubber-button');
    if (scrubber) {
      scrubber.style.left = `${progressPercent}%`;
    }

    const progressBar = document.querySelector('.ytp-progress-bar');
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', video.currentTime);
    }

    const timeDisplay = document.querySelector('.ytp-time-current');
    if (timeDisplay) {
      timeDisplay.textContent = formatTime(video.currentTime);
    }
  };

  const init = () => {
    const video = document.querySelector('video');

    if (video) {
      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('loadedmetadata', updateProgress);
      video.addEventListener('play', () => {
        const animate = () => {
          if (!video.paused) {
            updateProgress();
            requestAnimationFrame(animate);
          }
        };
        animate();
      });

      if (video.readyState >= 2) {
        updateProgress();
      }
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
