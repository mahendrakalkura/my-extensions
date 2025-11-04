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
  if (request.action === 'captureTab') {
    // Simply capture the visible tab and send it back
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Capture failed:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      sendResponse({ success: true, dataUrl: dataUrl });
    });

    return true; // Keep the message channel open for async response
  }
});
