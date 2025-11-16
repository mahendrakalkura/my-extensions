// Auto-expand "Read more", "Show more", etc. on the page

(function() {
  'use strict';

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

  function matchesExpandPattern(text) {
    if (!text) return false;
    const trimmed = text.trim();
    return expandPatterns.some(pattern => pattern.test(trimmed));
  }

  function isExpandButton(element) {
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
          // Try clicking the element
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
      if (isVisible(detail)) {
        detail.open = true;
        expandedCount++;
      }
    });

    return expandedCount;
  }

  function expandMultipleTimes() {
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

        // Show feedback to user
        if (totalExpanded > 0) {
          showNotification(`Expanded ${totalExpanded} element${totalExpanded === 1 ? '' : 's'}`);
        } else {
          showNotification('No expandable content found');
        }
      }

      previousCount = count;
    }, 500);
  }

  function showNotification(message) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
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

    // Add animation keyframes
    const style = document.createElement('style');
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

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 300);
    }, 3000);
  }

  // Start the expansion process
  expandMultipleTimes();
})();
