// ✅ Your Google Apps Script Web App URL:
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfyTlcKue5yz8nv4n_J1wMUhxXIat2uOd7WI5HeAiB1nlDKcTiRmleV4bQncPIu39u/exec';

// Fetch data from Google Sheets
async function fetchPrompts() {
  try {
    const response = await fetch(SCRIPT_URL);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching data:', err);
    return [];
  }
}

// Render prompt cards
function renderPrompts(data) {
  const categorySelect = document.getElementById('categorySelect');
  const promptContainer = document.getElementById('promptContainer');

  // Calculate category counts
  const categoryCounts = data.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const totalCount = data.length;

  // Populate dropdown with counts
  const categories = ['all', ...Object.keys(categoryCounts)];
  categorySelect.innerHTML = categories.map(cat => {
    const count = cat === 'all' ? totalCount : categoryCounts[cat];
    return `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)} (Prompts: ${count})</option>`;
  }).join('');

  const selectedCategory = categorySelect.value;
  const filtered = selectedCategory === 'all'
    ? data
    : data.filter(item => item.category === selectedCategory);

  // Render prompt cards
  promptContainer.innerHTML = '';
  filtered.forEach(item => {
    const card = document.createElement('section');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.img}" alt="Image for ${item.category}" />
      <div class="card-content">
        <p class="prompt-text">${item.prompt}</p>
        <button class="copy-btn" onclick="copyPromptText(\`${escapeQuotes(item.prompt)}\`)">Copy</button>
      </div>`;
    promptContainer.appendChild(card);
  });
}

// Escape backticks and quotes for safe use in JS
function escapeQuotes(text) {
  return text.replace(/`/g, "\\`");
}

// Copy full prompt (use native copy toast)
function copyPromptText(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      if (navigator.vibrate) navigator.vibrate(50); // phone feedback
      if (window.Android) {
        window.Android.showToast("Copied!");
      } else {
        console.log("Copied!"); // silent success for desktop
      }
    })
    .catch(err => console.error('Copy failed: ' + err));
}

// Load prompts
async function loadPrompts() {
  const data = await fetchPrompts();
  renderPrompts(data);
}

document.addEventListener('DOMContentLoaded', loadPrompts);
