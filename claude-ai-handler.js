(() => {
  'use strict';

  const pasteAndSubmit = async () => {
    try {
      // Get the stored content
      chrome.storage.local.get(['summarizeContent'], async (result) => {
        const content = result.summarizeContent;

        if (!content) {
          console.error('No content found in storage');
          return;
        }

        // Wait for the page to fully load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Find the textarea/input field on Claude.ai
        // Claude.ai uses a contenteditable div or textarea
        const selectors = [
          'div[contenteditable="true"]',
          'textarea',
          '[role="textbox"]',
          'input[type="text"]',
          '.ProseMirror',
        ];

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
        } else {
          // For textarea/input elements
          inputField.value = content;

          // Trigger input event
          const inputEvent = new Event('input', { bubbles: true });
          inputField.dispatchEvent(inputEvent);
        }

        // Wait a moment for the UI to update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Find and click the submit button
        const buttonSelectors = [
          'button[type="submit"]',
          'button[aria-label*="send"]',
          'button[aria-label*="Send"]',
          'button:has(svg)',
          '[data-testid="send-button"]',
          'button.send-button',
        ];

        let submitButton = null;
        for (const selector of buttonSelectors) {
          const buttons = document.querySelectorAll(selector);
          for (const button of buttons) {
            const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
            const buttonText = button.textContent?.toLowerCase() || '';
            if (ariaLabel.includes('send') || buttonText.includes('send') || button.type === 'submit') {
              submitButton = button;
              break;
            }
          }
          if (submitButton) break;
        }

        // If still not found, try to find any button near the input field
        if (!submitButton) {
          const allButtons = document.querySelectorAll('button');
          for (const button of allButtons) {
            // Check if button is visible and enabled
            const rect = button.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && !button.disabled) {
              submitButton = button;
              break;
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
