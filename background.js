// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'screenshot-element',
    title: 'Take screenshot',
    contexts: ['all']
  });
});

// Function to activate screenshot mode
function activateScreenshotMode(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['content.js']
  });
  chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ['content.css']
  });
}

// Activate selection mode when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  activateScreenshotMode(tab.id);
});

// Activate selection mode when context menu is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'screenshot-element') {
    activateScreenshotMode(tab.id);
  }
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
