// Read from chrome.storage.local on startup. If missing, logs a one-time
// message with the setter command.  chrome.storage.local persists across
// browser restarts — you set the key once and it stays forever.
let OPENROUTER_KEY = "";

chrome.storage.local.get("openrouterKey", (result) => {
  if (result.openrouterKey) {
    OPENROUTER_KEY = result.openrouterKey;
  } else {
    console.warn(
      "OpenRouter key not set. Run this in the extension service worker console:\n\n" +
      '  chrome.storage.local.set({openrouterKey: "sk-or-v1-..."})\n'
    );
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.openrouterKey) OPENROUTER_KEY = changes.openrouterKey.newValue;
});

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
      const updatedListener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === "complete") {
          chrome.scripting.executeScript({
            args: [request.service],
            func: (service) => { window.__aiService = service; },
            target: { tabId: tab.id },
          }).then(() => {
            chrome.scripting.executeScript({ files: ["ai-handler.js"], target: { tabId: tab.id } });
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
  } else if (request.action === "cleanDraft") {
    if (!OPENROUTER_KEY) {
      console.warn("OpenRouter key not set. Run: chrome.storage.local.set({openrouterKey: \"sk-or-v1-...\"})");
      return;
    }
    const draft = request.draft;
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId) chrome.tabs.sendMessage(tabId, { action: "showProgress" });
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_KEY}` },
      body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [
        { role: "system", content: "Rewrite the following email draft as polished Markdown. Output ONLY the rewritten email — do NOT wrap your response in a code fence (```). Do not add explanations, greetings, or sign-offs." },
        { role: "user", content: draft }
      ] })
    })
      .then(res => res.json())
      .then(data => {
        const markdown = data?.choices?.[0]?.message?.content;
        if (markdown && tabId) {
          chrome.tabs.sendMessage(tabId, { action: "draftCleaned", markdown });
        } else if (tabId) {
          chrome.tabs.sendMessage(tabId, { action: "draftError" });
        }
      })
      .catch(() => { if (tabId) chrome.tabs.sendMessage(tabId, { action: "draftError" }); })
      .finally(() => { if (tabId) chrome.tabs.sendMessage(tabId, { action: "hideProgress" }); });
    return true;
  }
});
