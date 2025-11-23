(() => {
  'use strict';

  const pasteAndSubmit = async () => {
    try {
      const aiService = window.__aiService || 'claude';

      // Get the stored content
      chrome.storage.local.get(['summarizeContent'], async (result) => {
        const content = result.summarizeContent;

        if (!content) {
          console.error('No content found in storage');
          return;
        }

        // Wait for the page to fully load
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Different selectors for different AI services
        const inputSelectors = {
          claude: [
            'div[contenteditable="true"]',
            '[role="textbox"]',
            '.ProseMirror',
            'textarea'
          ],
          deepseek: [
            'textarea[placeholder*="消息"]',
            'textarea',
            'div[contenteditable="true"]',
            '[role="textbox"]'
          ],
          gemini: [
            'div[contenteditable="true"]',
            '[role="textbox"]',
            '.ql-editor',
            'textarea'
          ],
          grok: [
            'textarea',
            'div[contenteditable="true"]',
            '[role="textbox"]',
            'input[type="text"]'
          ],
          openai: [
            '#prompt-textarea',
            'textarea[placeholder*="Message"]',
            'textarea',
            'div[contenteditable="true"]'
          ],
          qwen: [
            'textarea[placeholder*="向"]',
            'textarea',
            'div[contenteditable="true"]',
            '[role="textbox"]'
          ]
        };

        const buttonSelectors = {
          claude: [
            'button[aria-label*="Send"]',
            'button[type="submit"]'
          ],
          deepseek: [
            'button[class*="send"]',
            'button svg[class*="icon"]',
            'button:has(svg)'
          ],
          gemini: [
            'button[aria-label*="Send"]',
            'button[type="submit"]'
          ],
          grok: [
            'button[aria-label*="Send"]',
            'button[data-testid*="send"]',
            'button:has(svg[data-testid*="send"])'
          ],
          openai: [
            'button[data-testid="send-button"]',
            'button[aria-label*="Send"]'
          ],
          qwen: [
            'button svg',
            'button:has(svg)',
            'button[class*="send"]'
          ]
        };

        const selectors = inputSelectors[aiService] || inputSelectors.claude;
        const btnSelectors = buttonSelectors[aiService] || buttonSelectors.claude;

        let inputField = null;
        for (const selector of selectors) {
          inputField = document.querySelector(selector);
          if (inputField) break;
        }

        if (!inputField) {
          console.error('Could not find input field');
          // Try again after a delay
          setTimeout(() => pasteAndSubmit(), 1000);
          return;
        }

        // Focus on the input field
        inputField.focus();
        inputField.click();

        // Paste the content
        if (inputField.contentEditable === 'true') {
          // For contenteditable divs
          inputField.textContent = content;

          // Trigger input event to make sure the UI updates
          inputField.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          inputField.dispatchEvent(new Event('change', { bubbles: true }));
          inputField.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: content }));
        } else {
          // For textarea/input elements
          // Use native setter to bypass React/Vue value tracking
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          nativeInputValueSetter.call(inputField, content);

          // Trigger all relevant events
          inputField.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          inputField.dispatchEvent(new Event('change', { bubbles: true }));
          inputField.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }));
          inputField.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter' }));
        }

        // Wait a moment for the UI to update
        await new Promise(resolve => setTimeout(resolve, 800));

        // Find and click the submit button
        let submitButton = null;

        // First try service-specific selectors
        for (const selector of btnSelectors) {
          try {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
              // Check if it's a button or has a button parent
              const button = el.tagName === 'BUTTON' ? el : el.closest('button');
              if (button) {
                const rect = button.getBoundingClientRect();
                const isVisible = rect.width > 0 && rect.height > 0 && button.offsetParent !== null;
                const isEnabled = !button.disabled && !button.hasAttribute('disabled');

                if (isVisible && isEnabled) {
                  submitButton = button;
                  break;
                }
              }
            }
          } catch (e) {
            console.log('Selector failed:', selector, e);
          }
          if (submitButton) break;
        }

        // If still not found, look for buttons near the input field
        if (!submitButton) {
          const inputParent = inputField.closest('form') || inputField.parentElement?.parentElement;
          if (inputParent) {
            const nearbyButtons = inputParent.querySelectorAll('button');
            for (const button of nearbyButtons) {
              const rect = button.getBoundingClientRect();
              const isVisible = rect.width > 0 && rect.height > 0;
              const isEnabled = !button.disabled;
              const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
              const buttonText = button.textContent?.toLowerCase() || '';

              if (isVisible && isEnabled && (
                ariaLabel.includes('send') ||
                buttonText.includes('send') ||
                ariaLabel.includes('submit') ||
                button.type === 'submit' ||
                button.querySelector('svg')  // Has icon
              )) {
                submitButton = button;
                break;
              }
            }
          }
        }

        // Last resort: find any visible enabled button with an SVG icon
        if (!submitButton) {
          const allButtons = document.querySelectorAll('button');
          for (const button of allButtons) {
            const rect = button.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && !button.disabled) {
              const hasSvg = button.querySelector('svg') !== null;
              const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';

              if (hasSvg || ariaLabel.includes('send')) {
                submitButton = button;
                break;
              }
            }
          }
        }

        if (submitButton) {
          console.log('Found submit button:', submitButton);
          submitButton.click();
          console.log('Content pasted and submitted!');

          // Clear the stored content
          chrome.storage.local.remove(['summarizeContent']);
        } else {
          console.error('Could not find submit button');
          console.log('Input field:', inputField);
        }
      });
    } catch (error) {
      console.error('Error pasting content:', error);
    }
  };

  // Run when the page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pasteAndSubmit);
  } else {
    pasteAndSubmit();
  }
})();
