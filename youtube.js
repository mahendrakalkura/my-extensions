// Source - https://stackoverflow.com/a
// Posted by Louys Patrice Bessette, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-16, License - CC BY-SA 4.0

setInterval(() => {
  const container = document.querySelector('#movie_player');
  if (!container) return;

  container.classList.remove('ytp-autohide');

  const video = document.querySelector('.video-stream');
  if (!video || !video.duration) return;

  const hours = Math.floor(video.currentTime / 3600);
  let minutes = Math.floor(video.currentTime / 60) - (hours * 3600);
  let seconds = Math.round(video.currentTime % 60);
  if (seconds < 10) { seconds = `0${seconds}`; }
  if (hours > 0 && minutes < 10) { minutes = `0${minutes}`; }

  const timeDisplay = document.querySelector('.ytp-time-current');
  if (timeDisplay) {
    timeDisplay.innerText = `${(hours > 0 ? `${hours}:` : '')}${minutes}:${seconds}`;
  }

  const percentagePlayed = video.currentTime / video.duration;
  const progressBar = document.querySelector('.ytp-play-progress');
  if (progressBar) {
    progressBar.style = `left: 0px; transform: scaleX(${percentagePlayed})`;
  }

  if (video.buffered.length > 0) {
    const percentageBuffered = video.buffered.end(0) / video.duration;
    const bufferedBar = document.querySelector('.ytp-load-progress');
    if (bufferedBar) {
      bufferedBar.style = `left: 0px; transform: scaleX(${percentageBuffered})`;
    }
  }
}, 100);
