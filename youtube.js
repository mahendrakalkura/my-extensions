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

  const updateProgress = (video) => {
    if (!video || !video.duration) return;

    const progress = (video.currentTime / video.duration) * 100;

    const playProgress = document.querySelector('.ytp-play-progress');
    if (playProgress) {
      playProgress.style.width = `${progress}%`;
    }

    const scrubber = document.querySelector('.ytp-scrubber-button');
    if (scrubber) {
      scrubber.style.left = `${progress}%`;
    }

    const progressBar = document.querySelector('.ytp-progress-bar');
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', Math.floor(video.currentTime));
    }

    const timeDisplay = document.querySelector('.ytp-time-current');
    if (timeDisplay) {
      timeDisplay.textContent = formatTime(video.currentTime);
    }
  };

  const updateBuffered = (video) => {
    if (!video || !video.duration || video.buffered.length === 0) return;

    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    const bufferedProgress = (bufferedEnd / video.duration) * 100;

    const loadProgress = document.querySelector('.ytp-load-progress');
    if (loadProgress) {
      loadProgress.style.width = `${bufferedProgress}%`;
    }
  };

  const init = () => {
    const video = document.querySelector('video');

    if (video) {
      const onTimeUpdate = () => updateProgress(video);
      const onProgress = () => updateBuffered(video);
      const onLoadedMetadata = () => {
        updateProgress(video);
        updateBuffered(video);
      };

      video.addEventListener('timeupdate', onTimeUpdate);
      video.addEventListener('progress', onProgress);
      video.addEventListener('loadedmetadata', onLoadedMetadata);

      video.addEventListener('play', () => {
        const animate = () => {
          if (!video.paused) {
            updateProgress(video);
            requestAnimationFrame(animate);
          }
        };
        animate();
      });

      if (video.readyState >= 2) {
        updateProgress(video);
        updateBuffered(video);
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
