// Auto-expand "Read more", "Show more", etc. on the page
// Supports both one-time and continuous monitoring modes

(function() {
  'use strict';

  // Check if auto-expand is already running
  if (window.__autoExpandActive) {
    // Toggle off - stop the observer
    if (window.__autoExpandObserver) {
      window.__autoExpandObserver.disconnect();
      window.__autoExpandObserver = null;
    }
    window.__autoExpandActive = false;
    showNotification('Auto-expand stopped', '#f44336');
    return;
  }

  // Common text patterns for expand buttons
  const expandPatterns = [
    /^read more$/i,
    /^show more$/i,
    /^see more$/i,
    /^view more$/i,
    /^expand$/i,
    /^load more$/i,
    /^show full/i,
    /^see full/i,
    /^continue reading$/i,
    /^read full/i,
    /^\.\.\.\s*more$/i,
    /^more$/i,
    /^show all$/i,
    /^view all$/i
  ];

  // Selectors for common expandable elements
  const selectors = [
    // Buttons and links
    'button', 'a[href="#"]', 'a[role="button"]',
    // Generic clickable elements
    '[role="button"]', '[onclick]',
    // Common class patterns
    '[class*="expand"]', '[class*="show-more"]', '[class*="read-more"]',
    // ARIA attributes
    '[aria-expanded="false"]',
    // Details/summary elements
    'details:not([open]) summary'
  ];

  // Track expanded elements to avoid re-clicking
  const expandedElements = new WeakSet();

  function matchesExpandPattern(text) {
    if (!text) return false;
    const trimmed = text.trim();
    return expandPatterns.some(pattern => pattern.test(trimmed));
  }

  function isExpandButton(element) {
    // Skip if already expanded
    if (expandedElements.has(element)) {
      return false;
    }

    // Check if element text matches expand patterns
    const text = element.textContent || element.innerText || element.value || element.title || element.getAttribute('aria-label');
    if (matchesExpandPattern(text)) {
      return true;
    }

    // Check for collapsed/expandable attributes
    if (element.getAttribute('aria-expanded') === 'false') {
      return true;
    }

    // Check class names
    const className = element.className || '';
    if (typeof className === 'string') {
      if (/expand|show-more|read-more|collapsed/i.test(className)) {
        return true;
      }
    }

    return false;
  }

  function isVisible(element) {
    if (!element || !element.offsetParent) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
  }

  function expandAll() {
    let expandedCount = 0;
    const elements = document.querySelectorAll(selectors.join(', '));

    elements.forEach(element => {
      if (isVisible(element) && isExpandButton(element)) {
        try {
          // Mark as expanded before clicking to avoid double-clicking
          expandedElements.add(element);
          element.click();
          expandedCount++;
        } catch (e) {
          console.debug('Failed to click element:', e);
        }
      }
    });

    // Handle details/summary separately
    const details = document.querySelectorAll('details:not([open])');
    details.forEach(detail => {
      if (!expandedElements.has(detail) && isVisible(detail)) {
        expandedElements.add(detail);
        detail.open = true;
        expandedCount++;
      }
    });

    return expandedCount;
  }

  function expandMultipleTimes(callback) {
    let totalExpanded = 0;
    let previousCount = 0;
    let iterations = 0;
    const maxIterations = 5;

    // Sometimes expanding reveals more expand buttons, so try multiple times
    const interval = setInterval(() => {
      const count = expandAll();
      totalExpanded += count;
      iterations++;

      // Stop if no new elements were expanded or max iterations reached
      if ((count === 0 && previousCount === 0) || iterations >= maxIterations) {
        clearInterval(interval);
        if (callback) callback(totalExpanded);
      }

      previousCount = count;
    }, 500);
  }

  function showNotification(message, color = '#4CAF50') {
    // Remove existing notification if present
    const existing = document.getElementById('auto-expand-notification');
    if (existing) {
      existing.remove();
    }

    // Create a temporary notification
    const notification = document.createElement('div');
    notification.id = 'auto-expand-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 2147483647;
      animation: slideIn 0.3s ease-out;
    `;

    // Add animation keyframes if not already present
    if (!document.getElementById('auto-expand-styles')) {
      const style = document.createElement('style');
      style.id = 'auto-expand-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  function startContinuousMode() {
    window.__autoExpandActive = true;

    // Initial expansion
    expandMultipleTimes((count) => {
      showNotification(`Continuous auto-expand enabled (${count} expanded)`, '#2196F3');
    });

    // Set up MutationObserver to watch for new content
    const observer = new MutationObserver((mutations) => {
      // Debounce: only expand after mutations settle
      if (window.__autoExpandTimeout) {
        clearTimeout(window.__autoExpandTimeout);
      }

      window.__autoExpandTimeout = setTimeout(() => {
        const count = expandAll();
        if (count > 0) {
          console.debug(`Auto-expanded ${count} new element(s)`);
        }
      }, 300);
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-expanded', 'class']
    });

    window.__autoExpandObserver = observer;

    // Show persistent indicator
    showPersistentIndicator();
  }

  function showPersistentIndicator() {
    // Remove existing indicator if present
    const existing = document.getElementById('auto-expand-indicator');
    if (existing) {
      existing.remove();
    }

    const indicator = document.createElement('div');
    indicator.id = 'auto-expand-indicator';
    indicator.textContent = '🔄 Auto-expand active';
    indicator.title = 'Click context menu "Expand all content" again to stop';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(33, 150, 243, 0.95);
      color: white;
      padding: 10px 16px;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 2147483647;
      cursor: help;
      user-select: none;
    `;

    document.body.appendChild(indicator);

    // Remove indicator when auto-expand is stopped
    const checkInterval = setInterval(() => {
      if (!window.__autoExpandActive) {
        indicator.remove();
        clearInterval(checkInterval);
      }
    }, 1000);
  }

  // Start continuous mode
  startContinuousMode();
})();
