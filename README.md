# 🖼️ Prompt Gallery

A clean, responsive web app that displays AI image prompts organized by category — fetched live from a Google Sheet. Users can browse, filter, and copy prompts with one click.

---

## 📸 Features

- **Category filter pills** — filter prompts by category with live count badges
- **Masonry/grid layout** — responsive card grid that adapts from 1 to 4 columns
- **Copy to clipboard** — one-click copy with haptic feedback and toast notification
- **Live data** — all prompts and images are fetched from Google Sheets via Apps Script
- **Zero framework** — plain HTML, CSS, and vanilla JavaScript

---

## 🗂️ Project Structure

```
prompt-gallery/
├── index.html       # App shell — nav, header, and card grid
├── style.css        # Responsive layout, card styles, pill buttons
└── script.js        # Data fetching, rendering, filtering, copy logic
```

---

## 🚀 Getting Started (From Scratch)

### Step 1 — Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. Rename the first sheet tab (bottom) to exactly: `submission`
3. Add these **three column headers** in row 1:

| A | B | C |
|---|---|---|
| `category` | `img` | `prompt` |

4. Fill in your data from row 2 onwards. Example:

| category | img | prompt |
|----------|-----|--------|
| fantasy | https://i.imgur.com/xyz.jpg | A dragon perched on a cliff at sunset... |
| portrait | https://i.imgur.com/abc.jpg | Hyperrealistic portrait of an elderly woman... |

> **Tip:** Use publicly accessible image URLs (e.g. from Imgur, Cloudinary, or a CDN). Google Drive direct links often break — avoid them.

---

### Step 2 — Set Up the Google Apps Script Backend

1. In your Google Sheet, click **Extensions → Apps Script**.
2. Delete any existing code and paste in the following:

```javascript
const SHEET_NAME = 'submission';

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove header row
  const jsonData = data.map(row => {
    let item = {};
    headers.forEach((header, i) => item[header] = row[i]);
    return item;
  });
  return ContentService.createTextOutput(JSON.stringify(jsonData))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const body = JSON.parse(e.postData.contents);
  sheet.appendRow([body.category, body.img, body.prompt]);
  return ContentService.createTextOutput("Success");
}
```

3. Click **Save** (name the project anything you like, e.g. `PromptGalleryAPI`).

---

### Step 3 — Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Click the ⚙️ gear icon next to "Type" and select **Web app**.
3. Fill in the settings:
   - **Description:** `Prompt Gallery API` (or anything)
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` ← **This is required** for the frontend to fetch data without auth
4. Click **Deploy**.
5. **Copy the Web App URL** — it will look like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

> ⚠️ Every time you edit the Apps Script code, you must click **Deploy → Manage deployments → Edit → New version** for changes to take effect.

---

### Step 4 — Connect the Frontend

Open `script.js` and replace the `SCRIPT_URL` value at the top with your own Web App URL:

```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

---

### Step 5 — Run Locally or Deploy

**Local testing:**
- Simply open `index.html` in a browser.
- If you hit CORS issues locally, use VS Code's **Live Server** extension or run:
  ```bash
  npx serve .
  ```

**Deploy to the web:**
- Upload the three files (`index.html`, `style.css`, `script.js`) to any static host:
  - [GitHub Pages](https://pages.github.com/) — free and easy
  - [Netlify](https://netlify.com/) — drag and drop
  - [Vercel](https://vercel.com/) — connect your repo

---

## 🔧 How the Data Flow Works

```
Google Sheet (your data)
        ↓
  Apps Script (doGet)
        ↓  returns JSON array
  fetch() in script.js
        ↓  parses JSON
  renderPrompts() builds cards
        ↓
  User sees the gallery
```

When the page loads, `setup()` is called. It fetches the Apps Script URL, which runs `doGet()`, reads every row from the `submission` sheet, and returns them as a JSON array like:

```json
[
  { "category": "fantasy", "img": "https://...", "prompt": "A dragon..." },
  { "category": "portrait", "img": "https://...", "prompt": "An elderly..." }
]
```

The frontend then groups prompts by `category`, builds the filter pills, and renders the cards.

---

## ➕ Adding New Prompts

You have two options:

**Option A — Directly in the Sheet (easiest):**
Just add a new row to the `submission` sheet. It will appear in the gallery on the next page refresh.

**Option B — Via POST request (for programmatic use):**
Send a POST request to your Apps Script URL with a JSON body:

```javascript
fetch(SCRIPT_URL, {
  method: 'POST',
  body: JSON.stringify({
    category: 'fantasy',
    img: 'https://your-image-url.jpg',
    prompt: 'Your prompt text here...'
  })
});
```

The `doPost()` function will append a new row to the sheet automatically.

---

## 🎨 Customization

| What | Where | How |
|------|-------|-----|
| Change accent color | `style.css` | Find `#9d6dfb` / `#8074f7` (purple gradient) and replace |
| Change copy button color | `style.css` | Find `#0ea5e9` (blue) and replace |
| Number of grid columns | `style.css` | Edit the `@media` breakpoints under `.prompt-grid` |
| Truncate prompt lines | `style.css` | Change `-webkit-line-clamp: 2` to any number |
| Add more sheet columns | `script.js` | Access them via `item.yourColumnName` inside `renderPrompts()` |

---

## 🗃️ Google Sheet Column Reference

| Column | Key | Required | Notes |
|--------|-----|----------|-------|
| A | `category` | ✅ | Used for filter pills. Case-sensitive. |
| B | `img` | ✅ | Must be a publicly accessible image URL |
| C | `prompt` | ✅ | The text shown on the card and copied |

You can add more columns to your sheet — the script maps all headers automatically. Just access extras in JavaScript as `item.yourNewColumn`.

---

## ❓ Troubleshooting

**Cards aren't loading / blank page:**
- Open browser DevTools → Console. Look for CORS or fetch errors.
- Make sure your Apps Script is deployed with **"Anyone"** access.
- Re-deploy after any script changes (new version required).

**Images are broken:**
- Confirm image URLs are publicly accessible (open them in an incognito tab).
- Avoid Google Drive links — use Imgur, Cloudinary, or similar.

**Category pills not showing:**
- Check that your `category` column has no trailing spaces or typos.
- Column header in row 1 must be exactly `category` (lowercase).

**Changes to the sheet aren't showing up:**
- The browser may be caching the old response. Hard refresh with `Ctrl+Shift+R` / `Cmd+Shift+R`.

---

## 🤝 Contributing

1. Fork this repo
2. Add your prompts directly to the linked Google Sheet, or set up your own sheet following the steps above
3. Open a pull request with any frontend improvements

---

## 📄 License

MIT — free to use, modify, and distribute.
