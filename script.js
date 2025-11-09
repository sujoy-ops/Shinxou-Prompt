const apiUrl = "https://script.google.com/macros/s/AKfycbxfyTlcKue5yz8nv4n_J1wMUhxXIat2uOd7WI5HeAiB1nlDKcTiRmleV4bQncPIu39u/exec";

const gallery = document.getElementById("gallery");
const tabsContainer = document.getElementById("tabs");
const categoryTitle = document.getElementById("categoryTitle");
const promptCount = document.getElementById("promptCount");
const showMoreBtn = document.getElementById("showMore");
const toast = document.getElementById("toast");

let allPrompts = [];
let categories = [];
let visibleCount = 10;
let currentCategory = "all";

async function fetchPrompts() {
  try {
    const res = await fetch(apiUrl);
    allPrompts = await res.json();
    generateCategories();
    displayPrompts("all");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function generateCategories() {
  const categorySet = new Set(allPrompts.map(p => p.category.trim()));
  categories = ["all", ...categorySet];
  tabsContainer.innerHTML = "";

  categories.forEach(cat => {
    const count = cat === "all" ? allPrompts.length : allPrompts.filter(p => p.category === cat).length;
    const button = document.createElement("button");
    button.className = `tab ${cat === "all" ? "active" : ""}`;
    button.dataset.category = cat;
    button.innerHTML = `${cat === "all" ? "👤 All" : cat} (${count})`;
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      button.classList.add("active");
      visibleCount = 10;
      currentCategory = cat;
      displayPrompts(cat);
    });
    tabsContainer.appendChild(button);
  });
}

function displayPrompts(category) {
  gallery.innerHTML = "";
  let promptsToShow = category === "all"
    ? allPrompts
    : allPrompts.filter(p => p.category === category);

  categoryTitle.textContent =
    category === "all"
      ? "All Prompts"
      : `${category.charAt(0).toUpperCase() + category.slice(1)} Prompts`;

  promptCount.textContent = `${promptsToShow.length} prompts`;

  const visiblePrompts = promptsToShow.slice(0, visibleCount);
  visiblePrompts.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.prompt}" />
      <div class="card-bottom">
        <span class="tag">${p.category}</span>
        <button class="copy-btn" onclick="copyPrompt('${p.prompt.replace(/'/g, "\\'")}')">
          <i data-lucide="copy"></i>
        </button>
        <p class="prompt-text">${p.prompt}</p>
      </div>
    `;
    gallery.appendChild(card);
  });

  lucide.createIcons();

  if (visibleCount >= promptsToShow.length) {
    showMoreBtn.style.display = "none";
  } else {
    showMoreBtn.style.display = "block";
  }
}

showMoreBtn.addEventListener("click", () => {
  visibleCount += 10;
  displayPrompts(currentCategory);
});

function copyPrompt(text) {
  navigator.clipboard.writeText(text);
  showToast("Copied to clipboard!");
}

function showToast(message) {
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 1200);
}

fetchPrompts();
