# Div Screenshot Chrome Extension

A simple Chrome extension that lets you screenshot any div element on a webpage with just a hover and click.

## Features

- Click the extension icon to activate selection mode
- Hover over any element to highlight it
- Click to capture and automatically download a screenshot
- Press ESC to cancel
- No prompts, no dialogs - completely automatic

## Installation Instructions (Local/Unpacked)

Since you're not publishing this extension to the Chrome Web Store, you'll install it locally as an "unpacked extension". Here's how:

### Step 1: Download/Clone the Extension

Make sure you have all the extension files in a local folder on your computer. The folder should contain:
```
chrome-screenshot/
├── manifest.json
├── background.js
├── content.js
├── content.css
└── lib/
    └── html2canvas.min.js
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
2. Navigate to the folder containing your extension files (the `chrome-screenshot` folder)
3. Select the folder and click **Select Folder** (or **Open** on Mac)

### Step 5: Verify Installation

You should now see your extension listed on the extensions page:
- **Name**: Div Screenshot
- **Version**: 1.0
- **ID**: A unique ID will be generated
- Status should show **Enabled**

### Step 6: Pin the Extension (Recommended)

1. Look for the extension icon in your Chrome toolbar (it will be a blue square)
   - If you don't see it, click the puzzle piece icon (🧩) in the toolbar
2. Find "Div Screenshot" in the dropdown
3. Click the **pin icon** (📌) next to it
4. The extension icon will now appear directly in your toolbar for easy access

## How to Use

1. **Navigate** to any webpage
2. **Click** the extension icon (blue square) in your toolbar
3. **Hover** over elements on the page - they will highlight with a blue border
4. **Click** the element you want to screenshot
5. The screenshot will **automatically download** as a PNG file to your Downloads folder
6. Done! The file will be named `screenshot-YYYY-MM-DDTHH-MM-SS.png`

**To cancel**: Press the **ESC** key at any time

## Troubleshooting

### Extension doesn't appear after loading
- Make sure you selected the correct folder (the one containing `manifest.json`)
- Check for errors on the Extensions page - there should be no errors listed

### "Manifest file is missing or unreadable" error
- Verify that `manifest.json` exists in the folder you selected
- Make sure the file is named exactly `manifest.json` (not `manifest.json.txt`)

### Screenshots aren't downloading
- Check your Chrome download settings
- Make sure Chrome has permission to download files
- Look in your Downloads folder - the file might be there with a timestamp name

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
2. Find "Div Screenshot"
3. Click **Remove**
4. Confirm the removal

## File Structure

- `manifest.json` - Extension configuration and permissions
- `background.js` - Service worker that activates when you click the icon
- `content.js` - Handles element selection and screenshot capture
- `content.css` - Styling for the highlight effect
- `lib/html2canvas.min.js` - Library for converting DOM elements to images

## Browser Compatibility

- Google Chrome (recommended)
- Microsoft Edge (Chromium-based)
- Brave Browser
- Any Chromium-based browser that supports Manifest V3

## Privacy

This extension:
- Only runs when you click the icon
- Does NOT collect any data
- Does NOT send information anywhere
- Runs completely locally on your computer
- Only requires access to the active tab when activated

## License

Free to use and modify for personal use.
