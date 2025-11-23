(() => {
  'use strict';

  const isYouTube = () => {
    return window.location.hostname.includes('youtube.com');
  };

  const getYouTubeTranscript = async () => {
    // First, try to find and click the "Show transcript" button
    const showTranscriptButton = Array.from(document.querySelectorAll('button, [role="button"]'))
      .find(el => {
        const text = el.textContent?.trim().toLowerCase() || '';
        const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || '';
        return text.includes('transcript') || ariaLabel.includes('transcript') || text === 'show transcript';
      });

    if (showTranscriptButton) {
      showTranscriptButton.click();
      // Wait for transcript panel to load
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Try to find transcript segments
    const transcriptSelectors = [
      'ytd-transcript-segment-renderer',
      '[class*="transcript"] [class*="segment"]',
      '#transcript-scrollbox',
    ];

    for (const selector of transcriptSelectors) {
      const transcriptContainer = document.querySelector(selector)?.closest('ytd-engagement-panel-section-list-renderer, [id*="transcript"]')
        || document.querySelector(selector)?.parentElement?.parentElement;

      if (transcriptContainer) {
        const segments = transcriptContainer.querySelectorAll('ytd-transcript-segment-renderer, [class*="segment"]');
        if (segments.length > 0) {
          const transcriptText = Array.from(segments)
            .map(segment => {
              const textElement = segment.querySelector('[class*="text"], .segment-text, yt-formatted-string');
              return textElement?.textContent?.trim() || segment.textContent?.trim();
            })
            .filter(text => text && text.length > 0)
            .join(' ');

          if (transcriptText) {
            return transcriptText;
          }
        }
      }
    }

    // Fallback: try to get any transcript text from the page
    const transcriptPanel = document.querySelector('#panels ytd-engagement-panel-section-list-renderer[target-id*="transcript"]');
    if (transcriptPanel) {
      const text = transcriptPanel.textContent
        ?.replace(/\d+:\d+/g, '') // Remove timestamps
        ?.replace(/\s+/g, ' ')
        ?.trim();
      if (text && text.length > 100) {
        return text;
      }
    }

    // If no transcript found, return null
    return null;
  };

  const getAllPageText = () => {
    // Get all visible text from the page
    const elementsToInclude = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'article', 'section', 'main', 'li', 'td', 'th'];
    const elements = document.querySelectorAll(elementsToInclude.join(', '));

    const texts = Array.from(elements)
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 0);

    // Remove duplicates and join
    return [...new Set(texts)].join('\n\n');
  };

  const showNotification = (msg, color = '#4CAF50') => {
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `position:fixed;top:20px;right:20px;background:${color};color:white;padding:16px 24px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:2147483647;animation:slideIn 0.3s ease-out`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  };

  const extractContent = async () => {
    try {
      const aiService = window.__summarizeAIService || 'claude';
      const serviceNames = {
        claude: 'Claude',
        deepseek: 'DeepSeek',
        gemini: 'Gemini',
        grok: 'Grok',
        openai: 'OpenAI',
        qwen: 'Qwen'
      };

      let content = '';

      if (isYouTube()) {
        showNotification('Extracting YouTube transcript...', '#2196F3');
        content = await getYouTubeTranscript();

        if (!content) {
          showNotification('No transcript found, extracting page text...', '#FF9800');
          content = getAllPageText();
        }
      } else {
        showNotification('Extracting page text...', '#2196F3');
        content = getAllPageText();
      }

      if (!content || content.length < 10) {
        showNotification('Failed to extract content', '#f44336');
        return;
      }

      // Store content in chrome.storage
      chrome.storage.local.set({ summarizeContent: content }, () => {
        showNotification(`Opening ${serviceNames[aiService] || 'AI'}...`, '#4CAF50');

        // Open AI service in a new tab
        chrome.runtime.sendMessage({
          action: 'openAI',
          service: aiService
        });
      });
    } catch (error) {
      console.error('Error extracting content:', error);
      showNotification('Error extracting content', '#f44336');
    }
  };

  extractContent();
})();
