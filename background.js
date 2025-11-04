chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['lib/html2canvas.min.js']
  }).then(() => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['content.css']
    });
  });
});
