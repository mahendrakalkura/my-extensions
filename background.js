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
    id: 'summarize-claude',
    title: 'Summarize with Claude',
    contexts: ['page']
  });
  chrome.contextMenus.create({
    id: 'summarize-deepseek',
    title: 'Summarize with DeepSeek',
    contexts: ['page']
  });
  chrome.contextMenus.create({
    id: 'summarize-gemini',
    title: 'Summarize with Gemini',
    contexts: ['page']
  });
  chrome.contextMenus.create({
    id: 'summarize-grok',
    title: 'Summarize with Grok',
    contexts: ['page']
  });
  chrome.contextMenus.create({
    id: 'summarize-openai',
    title: 'Summarize with OpenAI',
    contexts: ['page']
  });
  chrome.contextMenus.create({
    id: 'summarize-qwen',
    title: 'Summarize with Qwen',
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
  } else if (info.menuItemId.startsWith('summarize-')) {
    const service = info.menuItemId.replace('summarize-', '');
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (aiService) => {
        window.__summarizeAIService = aiService;
      },
      args: [service]
    }).then(() => {
      chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['summarize.js'] });
    });
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
  } else if (request.action === 'openAI') {
    const urls = {
      claude: 'https://claude.ai/new',
      deepseek: 'https://chat.deepseek.com/',
      gemini: 'https://gemini.google.com/u/2/app',
      grok: 'https://grok.com/',
      openai: 'https://chat.openai.com/',
      qwen: 'https://chat.qwen.ai/'
    };

    const url = urls[request.service] || urls.claude;

    chrome.tabs.create({ url }, (tab) => {
      // Wait for the tab to load, then inject the handler script
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (service) => {
              window.__aiService = service;
            },
            args: [request.service]
          }).then(() => {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['ai-handler.js']
            });
          });
        }
      });
    });
  }
});
