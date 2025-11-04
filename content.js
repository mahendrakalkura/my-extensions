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

    try {
      // Capture the element
      const canvas = await html2canvas(elementToCapture, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.href = url;
        a.download = `screenshot-${timestamp}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Screenshot failed. Please try again.');
    }

    // Cleanup
    cleanup();
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
