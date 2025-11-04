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
        cropAndDownload(response.dataUrl, rect, filename);
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

  // Crop the screenshot and download it
  function cropAndDownload(dataUrl, rect, filename) {
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

        // Convert to blob and download (PNG preserves transparency)
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();

          // Cleanup
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);

          console.log('Screenshot saved successfully');
        }, 'image/png'); // PNG format preserves transparency

      } catch (error) {
        console.error('Cropping failed:', error);
        alert('Screenshot cropping failed: ' + error.message);
      } finally {
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
