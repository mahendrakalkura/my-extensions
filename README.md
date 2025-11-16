# My Extensions

A Chrome extension with useful productivity features.

## Features

### Element Screenshot
- Click the extension icon or right-click → "Take screenshot" to activate selection mode
- Hover over any element to highlight it
- Click to capture screenshot
- Screenshot opens in new tab as blob URL
- Press ESC to cancel

### YouTube Always-Show-Controls
- Automatically keeps YouTube video controls visible when not in fullscreen mode
- No need to hover to see controls
- Works on all YouTube videos

### Auto-Expand Content
- Right-click on any page → "Expand all content" to automatically expand "Read more", "Show more", etc.
- **Continuous monitoring mode**: Automatically expands new content as it loads (perfect for infinite scroll!)
- Works on Twitter/X, Reddit, LinkedIn, Medium, and other sites with expandable content
- Toggle on/off by clicking the context menu again
- Shows a blue indicator badge when active
- Intelligently avoids re-clicking already expanded content

## Installation Instructions (Local/Unpacked)

Since you're not publishing this extension to the Chrome Web Store, you'll install it locally as an "unpacked extension". Here's how:

### Step 1: Download/Clone the Extension

Make sure you have all the extension files in a local folder on your computer. The folder should contain:
```
my-extensions/
├── manifest.json
├── background.js
├── content.js
├── content.css
├── auto-expand.js
├── youtube.css
└── README.md
```

### Step 2: Open Chrome Extensions Page

1. Open Google Chrome
2. Click the three dots menu (⋮) in the top-right corner
3. Go to **More tools** → **Extensions**

   Or simply type this in your address bar:
   ```
   chrome://extensions/
   ```

### Step 3: Enable Developer Mode

1. In the top-right corner of the Extensions page, you'll see a toggle for **Developer mode**
2. Turn it **ON** (it should turn blue)

### Step 4: Load the Extension

1. Click the **Load unpacked** button (it appears in the top-left after enabling Developer mode)
2. Navigate to the folder containing your extension files (the `my-extensions` folder)
3. Select the folder and click **Select Folder** (or **Open** on Mac)

### Step 5: Verify Installation

You should now see your extension listed on the extensions page:
- **Name**: My Extensions
- **Version**: 1.0
- **ID**: A unique ID will be generated
- Status should show **Enabled**

### Step 6: Pin the Extension (Recommended)

1. Look for the extension icon in your Chrome toolbar
   - If you don't see it, click the puzzle piece icon (🧩) in the toolbar
2. Find "My Extensions" in the dropdown
3. Click the **pin icon** (📌) next to it
4. The extension icon will now appear directly in your toolbar for easy access

## How to Use

### Taking Screenshots
1. **Navigate** to any webpage
2. **Click** the extension icon OR **right-click** → "Take screenshot"
3. **Hover** over elements on the page - they will highlight with a blue border
4. **Click** the element you want to screenshot
5. Screenshot opens in a new tab as blob URL
6. Right-click the image to save if needed

**To cancel**: Press the **ESC** key at any time

### YouTube Controls
- Automatically active on all YouTube pages
- Controls stay visible when not in fullscreen
- No configuration needed

### Auto-Expand Content
1. **Navigate** to any webpage with expandable content (Twitter/X, Reddit, articles, etc.)
2. **Right-click** anywhere on the page
3. Select **"Expand all content"** from the context menu
4. The extension activates **continuous monitoring mode**:
   - Immediately expands all current "Read more", "Show more", etc. buttons
   - A blue notification shows how many elements were expanded
   - A persistent blue badge appears in the bottom-right corner
   - As you scroll and new content loads, it automatically expands
5. **To stop**: Right-click → "Expand all content" again (acts as a toggle)
   - The badge disappears and monitoring stops
   - A red notification confirms it's stopped

**Perfect for infinite scroll sites like Twitter/X!** Just enable it once and all tweets will auto-expand as you scroll.

## Troubleshooting

### Extension doesn't appear after loading
- Make sure you selected the correct folder (the one containing `manifest.json`)
- Check for errors on the Extensions page - there should be no errors listed

### "Manifest file is missing or unreadable" error
- Verify that `manifest.json` exists in the folder you selected
- Make sure the file is named exactly `manifest.json` (not `manifest.json.txt`)

### Screenshots not opening in new tab
- Make sure popup blocker isn't blocking the new tab
- Check browser console (F12) for errors
- Try reloading the extension

### Extension icon is grayed out
- The extension can't run on Chrome internal pages (like `chrome://extensions/`)
- Navigate to a regular webpage (like google.com) and try again

### Highlighting isn't working
- Try clicking the extension icon again
- Refresh the webpage and try again
- Check the browser console (F12) for any error messages

### Screenshots look incorrect or incomplete
- Some websites use canvas/iframe elements that may not capture properly
- Try scrolling the element fully into view before capturing
- Complex animations or dynamic content may not capture perfectly

## Updating the Extension

If you make changes to the extension files:

1. Go to `chrome://extensions/`
2. Find your extension
3. Click the **circular reload icon** (🔄)
4. The changes will be applied immediately

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "My Extensions"
3. Click **Remove**
4. Confirm the removal

## File Structure

- `manifest.json` - Extension configuration and permissions
- `background.js` - Service worker that handles icon clicks and context menu
- `content.js` - Handles element selection and screenshot capture
- `content.css` - Styling for the highlight effect
- `auto-expand.js` - Automatically expands "Read more" and similar buttons
- `youtube.css` - CSS overrides to keep YouTube controls visible

## Browser Compatibility

- Google Chrome (recommended)
- Microsoft Edge (Chromium-based)
- Brave Browser
- Any Chromium-based browser that supports Manifest V3

## Privacy

This extension:
- Screenshot feature only runs when you activate it (click icon or context menu)
- YouTube feature only modifies CSS on YouTube pages
- Does NOT collect any data
- Does NOT send information anywhere
- Runs completely locally on your computer
- Only requires access to the active tab and YouTube pages

## License

Free to use and modify for personal use.
