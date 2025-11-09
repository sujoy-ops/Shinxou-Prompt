const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfyTlcKue5yz8nv4n_J1wMUhxXIat2uOd7WI5HeAiB1nlDKcTiRmleV4bQncPIu39u/exec'; // replace this!

// Fetch data from Google Sheets
async function fetchPrompts() {
  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching data:', err);
    alert('⚠️ Failed to load prompts. Please try again later.');
    return [];
  }
}

// Add new prompt
async function addPrompt() {
  const category = document.getElementById('newCategory').value.trim();
  const img = document.getElementById('newImage').value.trim();
  const prompt = document.getElementById('newPrompt').value.trim();

  if (!category || !img || !prompt) {
    alert('⚠️ Please fill in all fields.');
    return;
  }

  const newPrompt = { category, img, prompt };

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(newPrompt),
      headers: { 'Content-Type': 'application/json' }
    });

    alert('✅ Prompt added successfully!');
    document.getElementById('newCategory').value = '';
    document.getElementById('newImage').value = '';
    document.getElementById('newPrompt').value = '';

    await loadPrompts();
  } catch (err) {
    console.error('Error adding prompt:', err);
    alert('❌ Failed to add prompt. Please try again later.');
  }
}

// Render prompts
function renderPrompts(data) {
  const categorySelect = document.getElementById('categorySelect');
  const promptContainer = document.getElementById('promptContainer');

  if (!data.length) {
    promptContainer.innerHTML = '<p style="text-align:center;">No prompts found.</p>';
    return;
  }

  const categories = ['all', ...new Set(data.map(item => item.category))];
  categorySelect.innerHTML = categories.map(cat =>
    `<option value="${cat}">${cat}</option>`
  ).join('');

  const selectedCategory = categorySelect.value || 'all';
  const filtered = selectedCategory === 'all'
    ? data
    : data.filter(item => item.category === selectedCategory);

  promptContainer.innerHTML = '';
  filtered.forEach(item => {
    const card = document.createElement('section');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.img}" alt="${item.category}" />
      <div class="card-content">
        <p class="prompt-text">${item.prompt}</p>
        <button class="copy-btn" onclick="copyPromptText('${escapeQuotes(item.prompt)}')">
          📋 Copy Prompt
        </button>
      </div>`;
    promptContainer.appendChild(card);
  });
}

// Copy prompt text
function copyPromptText(text) {
  navigator.clipboard.writeText(text)
    .then(() => alert('📋 Copied!'))
    .catch(err => alert('❌ Copy failed: ' + err));
}

// Escape quotes
function escapeQuotes(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Load prompts
async function loadPrompts() {
  const data = await fetchPrompts();
  renderPrompts(data);
}

// Run when loaded
document.addEventListener('DOMContentLoaded', loadPrompts);
