// Activate selection mode when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
  chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ['content.css']
  });
});

// Listen for screenshot requests from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureElement') {
    const { bounds, devicePixelRatio } = request;

    // Capture the visible tab
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Capture failed:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }

      // Load the captured image
      const img = new Image();
      img.onload = () => {
        // Create canvas to crop the element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const scale = devicePixelRatio || 1;

        // Set canvas size to element size
        canvas.width = bounds.width * scale;
        canvas.height = bounds.height * scale;

        // Draw the cropped portion
        ctx.drawImage(
          img,
          bounds.x * scale, bounds.y * scale,           // Source x, y
          bounds.width * scale, bounds.height * scale,  // Source width, height
          0, 0,                                          // Destination x, y
          bounds.width * scale, bounds.height * scale   // Destination width, height
        );

        // Convert to blob and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

          chrome.downloads.download({
            url: url,
            filename: `screenshot-${timestamp}.png`,
            saveAs: false
          }, (downloadId) => {
            URL.revokeObjectURL(url);
            sendResponse({ success: true, downloadId });
          });
        }, 'image/png');
      };

      img.onerror = () => {
        sendResponse({ success: false, error: 'Failed to load captured image' });
      };

      img.src = dataUrl;
    });

    return true; // Keep the message channel open for async response
  }
});
