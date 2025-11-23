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
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Different selectors for different AI services
        const inputSelectors = {
          claude: [
            'div[contenteditable="true"]',
            '[role="textbox"]',
            '.ProseMirror',
            'textarea'
          ],
          deepseek: [
            'textarea',
            'div[contenteditable="true"]',
            '[role="textbox"]',
            'input[type="text"]'
          ],
          gemini: [
            'div[contenteditable="true"]',
            '[role="textbox"]',
            '.ql-editor',
            'textarea'
          ],
          grok: [
            'div[contenteditable="true"]',
            '[role="textbox"]',
            'textarea',
            'input[type="text"]'
          ],
          openai: [
            'textarea',
            'div[contenteditable="true"]',
            '[role="textbox"]',
            '#prompt-textarea'
          ],
          qwen: [
            'textarea',
            'div[contenteditable="true"]',
            '[role="textbox"]',
            'input[type="text"]'
          ]
        };

        const buttonSelectors = {
          claude: [
            'button[type="submit"]',
            'button[aria-label*="send"]',
            'button[aria-label*="Send"]'
          ],
          deepseek: [
            'button[type="submit"]',
            'button:has(svg)',
            '[data-testid="send-button"]'
          ],
          gemini: [
            'button[aria-label*="Send"]',
            'button[type="submit"]',
            'button:has(svg)'
          ],
          grok: [
            'button[data-testid*="send"]',
            'button[aria-label*="Send"]',
            'button[type="submit"]'
          ],
          openai: [
            'button[data-testid="send-button"]',
            'button[aria-label*="Send"]',
            'button[type="submit"]'
          ],
          qwen: [
            'button[type="submit"]',
            'button:has(svg)',
            '[class*="send"]'
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

        // Paste the content
        if (inputField.contentEditable === 'true') {
          // For contenteditable divs
          inputField.textContent = content;

          // Trigger input event to make sure the UI updates
          const inputEvent = new Event('input', { bubbles: true });
          inputField.dispatchEvent(inputEvent);

          // Also trigger compositionend for some frameworks
          const compositionEvent = new CompositionEvent('compositionend', { bubbles: true, data: content });
          inputField.dispatchEvent(compositionEvent);
        } else {
          // For textarea/input elements
          inputField.value = content;

          // Trigger input event
          const inputEvent = new Event('input', { bubbles: true });
          inputField.dispatchEvent(inputEvent);

          // Also trigger change event
          const changeEvent = new Event('change', { bubbles: true });
          inputField.dispatchEvent(changeEvent);
        }

        // Wait a moment for the UI to update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Find and click the submit button
        let submitButton = null;
        for (const selector of btnSelectors) {
          const buttons = document.querySelectorAll(selector);
          for (const button of buttons) {
            const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
            const buttonText = button.textContent?.toLowerCase() || '';
            const isVisible = button.offsetParent !== null;

            if (isVisible && (ariaLabel.includes('send') || buttonText.includes('send') || button.type === 'submit')) {
              submitButton = button;
              break;
            }
          }
          if (submitButton) break;
        }

        // If still not found, try to find any visible enabled button
        if (!submitButton) {
          const allButtons = document.querySelectorAll('button');
          for (const button of allButtons) {
            const rect = button.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && !button.disabled) {
              const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
              const buttonText = button.textContent?.toLowerCase() || '';
              if (ariaLabel.includes('send') || buttonText.includes('send')) {
                submitButton = button;
                break;
              }
            }
          }
        }

        if (submitButton) {
          submitButton.click();
          console.log('Content pasted and submitted!');

          // Clear the stored content
          chrome.storage.local.remove(['summarizeContent']);
        } else {
          console.error('Could not find submit button');
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
