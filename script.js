const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfyTlcKue5yz8nv4n_J1wMUhxXIat2uOd7WI5HeAiB1nlDKcTiRmleV4bQncPIu39u/exec';

let promptData = [];
let categories = [];
let selectedCategory = 'all';

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

function renderCategoryPanel(categoryCounts, total) {
  const panel = document.getElementById('categoryPanel');
  panel.innerHTML = '';
  const entries = [['all', total], ...Object.entries(categoryCounts)];
  entries.forEach(([cat, count], idx) => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn' + (selectedCategory === cat ? ' selected' : '');
    btn.type = 'button';
    btn.innerHTML = `${cat.charAt(0).toUpperCase() + cat.slice(1)} <span class="pill-count">(${count})</span>`;
    btn.addEventListener('click', () => {
      selectedCategory = cat;
      renderCategoryPanel(categoryCounts, total);
      renderPrompts(promptData, cat);
    });
    panel.appendChild(btn);
  });
}

function renderPrompts(data, catOverride) {
  const cat = catOverride || selectedCategory || 'all';
  const filtered = cat === 'all' ? data : data.filter(item => item.category === cat);

  document.getElementById('categoryTitle').textContent =
    cat === 'all' ? 'All Prompts' : (cat.charAt(0).toUpperCase() + cat.slice(1));
  document.getElementById('promptCount').textContent = `${filtered.length} prompt${filtered.length !== 1 ? 's' : ''}`;

  const container = document.getElementById('promptContainer');
  container.innerHTML = '';
  filtered.forEach(item => {
    const card = document.createElement('section');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.img}" alt="Image for ${item.category}" />
      <div class="card-content">
        <p class="prompt-text">${item.prompt}</p>
        <button class="copy-btn">Copy</button>
      </div>`;
    container.appendChild(card);

    card.querySelector('.copy-btn').addEventListener('click', () => copyPromptText(item.prompt));
  });
}

function copyPromptText(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      const toast = document.createElement('div');
      toast.textContent = '✓ Copied!';
      toast.style.cssText =
        'position:fixed;top:20px;left:50%;transform:translateX(-50%);' +
        'background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;' +
        'z-index:1000;font-size:14px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.18);';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
      }, 1200);
    })
    .catch(err => alert('Copy failed: ' + err));
}

async function setup() {
  promptData = await fetchPrompts();
  const categoryCounts = {};
  promptData.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });
  categories = Object.keys(categoryCounts);
  renderCategoryPanel(categoryCounts, promptData.length);
  renderPrompts(promptData, 'all');
}

document.addEventListener('DOMContentLoaded', setup);
