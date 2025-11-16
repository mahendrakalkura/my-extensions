(() => {
  'use strict';

  if (window.divScreenshotActive) return;
  window.divScreenshotActive = true;

  let current = null;

  const onMouseOver = (e) => {
    current?.classList.remove('div-screenshot-highlight');
    current = e.target;
    current.classList.add('div-screenshot-highlight');
    e.stopPropagation();
  };

  const generateFilename = (el) => {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `-${el.id}` : '';
    const cls = el.className && typeof el.className === 'string'
      ? `-${el.className.split(' ').filter(c => c && !c.startsWith('div-screenshot')).join('-')}`
      : '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `screenshot-${tag}${id}${cls}-${timestamp}`.replace(/[^a-z0-9\-_.]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '.png';
  };

  const cropAndDisplay = (dataUrl, rect, filename) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: true });
      const scale = window.devicePixelRatio || 1;
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      ctx.drawImage(img, rect.left * scale, rect.top * scale, rect.width * scale, rect.height * scale, 0, 0, rect.width * scale, rect.height * scale);
      canvas.toBlob((blob) => {
        window.open(URL.createObjectURL(blob), '_blank');
        cleanup();
      }, 'image/png');
    };
    img.onerror = () => {
      alert('Failed to load captured image');
      cleanup();
    };
    img.src = dataUrl;
  };

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = e.target;
    el.classList.remove('div-screenshot-highlight');
    document.querySelectorAll('.div-screenshot-highlight').forEach(e => e.classList.remove('div-screenshot-highlight'));
    el.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));
    const rect = el.getBoundingClientRect();
    const filename = generateFilename(el);
    chrome.runtime.sendMessage({ action: 'captureTab' }, (res) => {
      if (!res?.success) {
        alert('Screenshot failed: ' + (res?.error || 'Unknown error'));
        cleanup();
        return;
      }
      cropAndDisplay(res.dataUrl, rect, filename);
    });
  };

  const cleanup = () => {
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    current?.classList.remove('div-screenshot-highlight');
    document.querySelectorAll('.div-screenshot-highlight').forEach(e => e.classList.remove('div-screenshot-highlight'));
    window.divScreenshotActive = false;
  };

  const onKeyDown = (e) => e.key === 'Escape' && cleanup();

  document.addEventListener('mouseover', onMouseOver, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);

  const indicator = document.createElement('div');
  indicator.textContent = 'Hover over an element and click to screenshot. Press ESC to cancel.';
  indicator.style.cssText = `position:fixed;top:10px;left:50%;transform:translateX(-50%);background:#4285f4;color:white;padding:12px 24px;border-radius:4px;font-family:Arial,sans-serif;font-size:14px;z-index:999999;box-shadow:0 2px 8px rgba(0,0,0,0.3);pointer-events:none`;
  document.body.appendChild(indicator);
  setTimeout(() => indicator.remove(), 3000);
})();
