(() => {
  "use strict";

  const isYouTubeVideoLink = (target) => {
    if (!target || !target.closest) {
      return false;
    }
    const link = target.closest("a[href]");
    if (!link) {
      return false;
    }
    let url;
    try {
      url = new URL(link.href);
    } catch {
      return false;
    }
    if (url.hostname === "youtu.be") {
      return url.pathname.length > 1;
    }
    if (url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com")) {
      return url.pathname === "/watch" || url.pathname.startsWith("/shorts/");
    }
    return false;
  };

  const report = (event) => {
    // composedPath pierces shadow DOM (YouTube wraps links in custom
    // elements); event.target would be retargeted to the shadow host.
    const target = event.composedPath ? event.composedPath()[0] : event.target;
    const visible = !isYouTubeVideoLink(target);
    chrome.runtime.sendMessage({ action: "setScreenshotMenuVisible", visible });
  };

  // mousedown fires well before the native menu is built, giving the async
  // menu update time to land; contextmenu covers keyboard-invoked menus.
  document.addEventListener("contextmenu", report, true);
  document.addEventListener(
    "mousedown",
    (event) => {
      if (event.button === 2) {
        report(event);
      }
    },
    true,
  );
})();
