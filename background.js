chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    contexts: ["all"],
    id: "screenshot-element",
    title: "Take screenshot",
  });
  chrome.contextMenus.create({
    contexts: ["page"],
    id: "auto-expand",
    title: "Expand all content",
  });
  chrome.contextMenus.create({
    contexts: ["page"],
    id: "summarize-claude",
    title: "Summarize with Claude",
  });
  chrome.contextMenus.create({
    contexts: ["page"],
    id: "summarize-deepseek",
    title: "Summarize with DeepSeek",
  });
  chrome.contextMenus.create({
    contexts: ["page"],
    id: "summarize-gemini",
    title: "Summarize with Gemini",
  });
  chrome.contextMenus.create({
    contexts: ["page"],
    id: "summarize-kimi",
    title: "Summarize with Kimi",
  });
  chrome.contextMenus.create({
    contexts: ["page"],
    id: "summarize-openai",
    title: "Summarize with OpenAI",
  });
  chrome.contextMenus.create({
    contexts: ["page"],
    id: "summarize-qwen",
    title: "Summarize with Qwen",
  });
  chrome.contextMenus.create({
    contexts: ["page"],
    id: "summarize-z.ai",
    title: "Summarize with z.ai",
  });
});

const activateScreenshot = (tabId) => {
  chrome.scripting.executeScript({ files: ["content.js"], target: { tabId } });
  chrome.scripting.insertCSS({ files: ["content.css"], target: { tabId } });
};

chrome.action.onClicked.addListener((tab) => activateScreenshot(tab.id));

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "screenshot-element") {
    activateScreenshot(tab.id);
  } else if (info.menuItemId === "auto-expand") {
    chrome.scripting.executeScript({ files: ["auto-expand.js"], target: { tabId: tab.id } });
  } else if (info.menuItemId.startsWith("summarize-")) {
    const service = info.menuItemId.replace("summarize-", "");
    chrome.scripting
      .executeScript({
        args: [service],
        func: (aiService) => {
          window.__summarizeAIService = aiService;
        },
        target: { tabId: tab.id },
      })
      .then(() => {
        chrome.scripting.executeScript({ files: ["summarize.js"], target: { tabId: tab.id } });
      });
  }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "captureTab") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message, success: false });
        return;
      }
      sendResponse({ dataUrl, success: true });
    });
    return true;
  } else if (request.action === "openAI") {
    const urls = {
      claude: "https://claude.ai/new",
      deepseek: "https://chat.deepseek.com/",
      gemini: "https://gemini.google.com/u/3/app",
      kimi: "https://www.kimi.com/?chat_enter_method=new_chat",
      openai: "https://chat.openai.com/",
      qwen: "https://chat.qwen.ai/",
      "z.ai": "https://chat.z.ai/",
    };

    const url = urls[request.service] || urls.claude;

    chrome.tabs.create({ url }, (tab) => {
      // Inject the handler on every load completion, not just the first: on a
      // cold visit these SPAs can redirect or reload after the first
      // "complete", which destroys the injected script. The handler guards
      // against duplicate runs and exits when storage is empty.
      const updatedListener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === "complete") {
          chrome.scripting
            .executeScript({
              args: [request.service],
              func: (service) => {
                window.__aiService = service;
              },
              target: { tabId: tab.id },
            })
            .then(() => {
              chrome.scripting.executeScript({
                files: ["ai-handler.js"],
                target: { tabId: tab.id },
              });
            });
        }
      };
      const removedListener = (tabId) => {
        if (tabId === tab.id) {
          chrome.tabs.onRemoved.removeListener(removedListener);
          chrome.tabs.onUpdated.removeListener(updatedListener);
        }
      };
      chrome.tabs.onRemoved.addListener(removedListener);
      chrome.tabs.onUpdated.addListener(updatedListener);
    });
  }
});
