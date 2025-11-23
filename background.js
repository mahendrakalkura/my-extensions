chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'screenshot-element',
    title: 'Take screenshot',
    contexts: ['all']
  });
  chrome.contextMenus.create({
    id: 'auto-expand',
    title: 'Expand all content',
    contexts: ['page']
  });
  chrome.contextMenus.create({
    id: 'summarize',
    title: 'Summarize',
    contexts: ['page']
  });
});

const activateScreenshot = (tabId) => {
  chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  chrome.scripting.insertCSS({ target: { tabId }, files: ['content.css'] });
};

chrome.action.onClicked.addListener((tab) => activateScreenshot(tab.id));

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'screenshot-element') {
    activateScreenshot(tab.id);
  } else if (info.menuItemId === 'auto-expand') {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['auto-expand.js'] });
  } else if (info.menuItemId === 'summarize') {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['summarize.js'] });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureTab') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      sendResponse({ success: true, dataUrl });
    });
    return true;
  } else if (request.action === 'openClaudeAI') {
    chrome.tabs.create({ url: 'https://claude.ai/new' }, (tab) => {
      // Wait for the tab to load, then inject the handler script
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['claude-ai-handler.js']
          });
        }
      });
    });
  }
});
