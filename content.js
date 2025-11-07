(function() {
  'use strict';

  // Prevent multiple injections
  if (window.divScreenshotActive) {
    return;
  }
  window.divScreenshotActive = true;

  let currentElement = null;

  // Add hover effect
  function onMouseOver(e) {
    // Remove previous highlight
    if (currentElement && currentElement !== e.target) {
      currentElement.classList.remove('div-screenshot-highlight');
    }

    // Add highlight to current element
    currentElement = e.target;
    currentElement.classList.add('div-screenshot-highlight');

    e.stopPropagation();
  }

  // Capture screenshot on click
  async function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const elementToCapture = e.target;

    // Remove highlight before capturing
    elementToCapture.classList.remove('div-screenshot-highlight');

    // Remove all highlights from document
    document.querySelectorAll('.div-screenshot-highlight').forEach(el => {
      el.classList.remove('div-screenshot-highlight');
    });

    // Scroll element fully into view if needed
    elementToCapture.scrollIntoView({
      behavior: 'instant',
      block: 'nearest',
      inline: 'nearest'
    });

    // Wait for next frame to ensure:
    // 1. Highlight styles are fully removed
    // 2. Scroll has completed
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Get element bounds relative to viewport AFTER scrolling
    const rect = elementToCapture.getBoundingClientRect();

    // Generate descriptive filename
    const filename = generateFilename(elementToCapture);

    try {
      // Request full tab screenshot from background
      chrome.runtime.sendMessage({ action: 'captureTab' }, (response) => {
        if (!response || !response.success) {
          console.error('Screenshot failed:', response?.error);
          alert('Screenshot failed: ' + (response?.error || 'Unknown error'));
          cleanup();
          return;
        }

        // Now crop the image in the content script (not service worker)
        cropAndDisplay(response.dataUrl, rect, filename);
      });

    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Screenshot failed. Please try again.');
      cleanup();
    }
  }

  // Generate descriptive filename based on element
  function generateFilename(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `-${element.id}` : '';
    const className = element.className && typeof element.className === 'string'
      ? `-${element.className.split(' ').filter(c => c && !c.startsWith('div-screenshot')).join('-')}`
      : '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Clean up filename (remove invalid characters)
    const cleanName = `screenshot-${tag}${id}${className}-${timestamp}`
      .replace(/[^a-z0-9\-_.]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `${cleanName}.png`;
  }

  // Crop the screenshot and display it on page
  function cropAndDisplay(dataUrl, rect, filename) {
    const img = new Image();

    img.onload = () => {
      try {
        // Create canvas for cropping
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: true }); // Preserve transparency
        const scale = window.devicePixelRatio || 1;

        // Set canvas size to element size
        canvas.width = rect.width * scale;
        canvas.height = rect.height * scale;

        // Draw the cropped portion
        ctx.drawImage(
          img,
          rect.left * scale, rect.top * scale,           // Source x, y
          rect.width * scale, rect.height * scale,       // Source width, height
          0, 0,                                           // Destination x, y
          rect.width * scale, rect.height * scale        // Destination width, height
        );

        // Convert to blob and display on page
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          displayScreenshot(url, filename);
          console.log('Screenshot displayed successfully');
        }, 'image/png'); // PNG format preserves transparency

      } catch (error) {
        console.error('Cropping failed:', error);
        alert('Screenshot cropping failed: ' + error.message);
        cleanup();
      }
    };

    img.onerror = () => {
      console.error('Failed to load captured image');
      alert('Failed to load captured image');
      cleanup();
    };

    img.src = dataUrl;
  }

  // Display screenshot in a modal overlay
  function displayScreenshot(blobUrl, filename) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'screenshot-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 20px;
    `;

    // Create image
    const screenshotImg = document.createElement('img');
    screenshotImg.src = blobUrl;
    screenshotImg.style.cssText = `
      max-width: 90%;
      max-height: 80%;
      object-fit: contain;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 10px;
    `;

    // Create download button
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.style.cssText = `
      background: #4285f4;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      cursor: pointer;
      font-weight: 500;
    `;
    downloadBtn.onmouseover = () => downloadBtn.style.background = '#3367d6';
    downloadBtn.onmouseout = () => downloadBtn.style.background = '#4285f4';
    downloadBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.click();
    };

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = `
      background: #5f6368;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      cursor: pointer;
      font-weight: 500;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = '#4a4d50';
    closeBtn.onmouseout = () => closeBtn.style.background = '#5f6368';
    closeBtn.onclick = () => {
      document.body.removeChild(overlay);
      URL.revokeObjectURL(blobUrl);
      cleanup();
    };

    // Assemble the overlay
    buttonsContainer.appendChild(downloadBtn);
    buttonsContainer.appendChild(closeBtn);
    overlay.appendChild(screenshotImg);
    overlay.appendChild(buttonsContainer);
    document.body.appendChild(overlay);

    // Close on ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeBtn.click();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Close on clicking overlay background
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        closeBtn.click();
      }
    };
  }

  // Cancel on ESC key
  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cleanup();
    }
  }

  // Cleanup function
  function cleanup() {
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);

    if (currentElement) {
      currentElement.classList.remove('div-screenshot-highlight');
    }

    // Remove all highlights
    document.querySelectorAll('.div-screenshot-highlight').forEach(el => {
      el.classList.remove('div-screenshot-highlight');
    });

    window.divScreenshotActive = false;
  }

  // Initialize
  document.addEventListener('mouseover', onMouseOver, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);

  // Visual feedback that extension is active
  const indicator = document.createElement('div');
  indicator.textContent = 'Hover over an element and click to screenshot. Press ESC to cancel.';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #4285f4;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    pointer-events: none;
  `;
  document.body.appendChild(indicator);

  // Remove indicator after 3 seconds
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }, 3000);
})();
