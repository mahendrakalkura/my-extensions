(() => {
  'use strict';

  const isYouTube = () => {
    return window.location.hostname.includes('youtube.com');
  };

  const getYouTubeTranscript = async () => {
    // Save current scroll position
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

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

      // Restore scroll position
      window.scrollTo(scrollX, scrollY);
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

      const pageTitle = document.title;
      const pageUrl = window.location.href;

      let content = '';
      let isTranscript = false;
      const isYT = isYouTube();

      if (isYT) {
        // Silent extraction for YouTube
        content = await getYouTubeTranscript();

        if (content) {
          isTranscript = true;
        } else {
          content = getAllPageText();
        }
      } else {
        // Silent extraction for all pages
        content = getAllPageText();
      }

      if (!content || content.length < 10) {
        // Silently fail - no notifications
        return;
      }

      // Create prompt header
      let prompt = '';
      if (isYouTube() && isTranscript) {
        prompt = `Summarize the following transcript in a clear and concise way. Capture all the key insights, arguments, and takeaways while removing filler. Break the summary into well-structured bullet points or sections by theme/topic. The goal is to help me understand everything important without reading the whole transcript. Think like a researcher or note-taker summarizing for someone smart but busy. Keep the summary accurate, complete, and easy to scan.

Title: ${pageTitle}
URL: ${pageUrl}

---

`;
      } else {
        prompt = `Summarize the following page content in a clear and concise way. Capture all the key insights, main points, and important information. Break the summary into well-structured bullet points or sections by theme/topic. The goal is to help me understand the essential content without reading the entire page. Think like a researcher or note-taker summarizing for someone smart but busy. Keep the summary accurate, complete, and easy to scan.

Title: ${pageTitle}
URL: ${pageUrl}

---

`;
      }

      const fullContent = prompt + content;

      // Store content in chrome.storage
      chrome.storage.local.set({ summarizeContent: fullContent }, () => {
        // Open AI service in a new tab silently
        chrome.runtime.sendMessage({
          action: 'openAI',
          service: aiService
        });
      });
    } catch (error) {
      console.error('Error extracting content:', error);
      // Silently fail - no notifications
    }
  };

  extractContent();
})();
