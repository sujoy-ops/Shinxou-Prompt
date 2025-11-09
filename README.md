#🖼️ Prompt Gallery

A dynamic and elegant Prompt Gallery Web App built using HTML, CSS, and JavaScript, powered by Google Sheets as a live backend database.
This project allows you to manage and display categorized AI or image prompts in a clean, professional, and responsive gallery layout.


---

🌟 Features

✅ Google Sheets as Database
Easily add or edit prompt data directly from a connected Google Sheet — no need to modify website code.

✅ Dynamic Category Tabs
Categories are automatically fetched from your Google Sheet and displayed dynamically.

✅ Responsive Grid Layout
Prompts are displayed in a flexible grid view with adaptive image sizing and a clean visual hierarchy.

✅ Smart Text Handling
Only two lines of each prompt are shown for a compact view, with ellipsis for overflow — but the “Copy” button copies the full prompt.

✅ Show More Functionality
Displays 10 prompts initially and lets users load more for seamless browsing.

✅ Copy to Clipboard Feedback
Quick mobile vibration + system copy confirmation ensures smooth UX.

✅ Professional Footer
Includes credit watermark and social links (Instagram, WhatsApp) in a minimalist footer section.


---

⚙️ Tech Stack

Frontend: HTML5, CSS3, Vanilla JavaScript

Backend (Data Source): Google Sheets + Google Apps Script Web API

Deployment: Netlify / Vercel / GitHub Pages (works with any static hosting)



---

🧩 Setup Instructions

1️⃣ Clone or Download This Repository

git clone https://github.com/yourusername/prompt-gallery.git
cd prompt-gallery

2️⃣ Create a Google Sheet

Go to Google Sheets → Create a new sheet.

Use columns named exactly like:

category | image | prompt

Example:

Men | https://example.com/image.jpg | Dreamy cinematic portrait of a stylish young man


3️⃣ Deploy an Apps Script API

In Google Sheets, click:
Extensions → Apps Script

Paste the following script:

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const json = data.map(r => Object.fromEntries(r.map((v, i) => [headers[i], v])));
  return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(ContentService.MimeType.JSON);
}

Save → Deploy → New deployment

Select type: Web App

Set access to: “Anyone with the link”

Copy the deployment URL (this is your apiURL).


4️⃣ Link the API

Open index.html

Replace:

const apiURL = "https://script.google.com/macros/s/your-api-link/exec";

with your copied Apps Script link.


5️⃣ Host Your Site

Upload all files to your preferred hosting platform (e.g., Netlify).
🎉 Your live prompt gallery is ready!


---

🪄 Customization

Feature	How to Customize

Accent Colors	Edit gradient colors in .tab.active inside style.css
Logo / Branding	Add your logo inside <header>
Social Links	Update Instagram and WhatsApp URLs in <footer>
Number of Prompts Displayed Initially	Change visibleCount = 10 in index.html script
Rounded Image Size	Adjust height and border-radius in .prompt-image CSS



---

📱 Responsive Design

Optimized for all devices — mobile, tablet, and desktop.
The grid adjusts automatically, ensuring perfect alignment for all prompt cards.


---

🧠 Future Improvements (Planned)

Search bar for prompt filtering

Category icons

Dark mode toggle

Toast notification for “Copied” (in place of alert)



---

👨‍🎨 Credits

Designed and developed by Sujoy Senpai 💜
If you use this project, please retain credit in the footer.


---

📄 License

This project is open for personal and educational use.
You can modify and host it freely, but please credit the original creator.
