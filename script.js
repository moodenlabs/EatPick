const tagFiltersEl = document.getElementById("tagFilters");
const menuDisplay = document.getElementById("menuDisplay");
const favoritesListEl = document.getElementById("favoritesList");
const favoriteModal = document.getElementById("favoriteModal");

let menus = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let selectedTags = new Set();
let allTags = new Set();
let currentFiltered = [];

// 메뉴 불러오기
fetch('menus.json')
  .then(res => res.json())
  .then(data => {
    menus = data;
    data.forEach(menu => menu.tags.forEach(tag => allTags.add(tag)));
    renderTagButtons();
    renderFavorites();
  });

// 태그 버튼 렌더링
function renderTagButtons() {
  tagFiltersEl.innerHTML = "";
  Array.from(allTags).sort().forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "tag-btn";
    btn.textContent = tag;
    btn.addEventListener("click", () => {
      if (selectedTags.has(tag)) selectedTags.delete(tag);
      else selectedTags.add(tag);
      btn.classList.toggle("active");
    });
    tagFiltersEl.appendChild(btn);
  });
}

// 필터링 메뉴 저장만
function updateFilteredList() {
  currentFiltered = menus;
  if (selectedTags.size > 0) {
    currentFiltered = menus.filter(menu =>
      [...selectedTags].every(tag => menu.tags.includes(tag))
    );
  }
}

// 메뉴 추천 렌더링
function renderFilteredRandom() {
  updateFilteredList();
  if (currentFiltered.length === 0) {
    menuDisplay.innerHTML = `<p style="margin-top:1rem;">조건에 맞는 메뉴가 없어요 😢</p>`;
    return;
  }
  const menu = currentFiltered[Math.floor(Math.random() * currentFiltered.length)];
  menuDisplay.innerHTML = getMenuBoxHTML(menu, true);
  addFavoriteEvent(menuDisplay.querySelector(".favorite-btn"), menu);
}

function getMenuBoxHTML(menu, includeBtn = false) {
  return `
    <div class="menu-box">
      ${includeBtn ? `<button class="favorite-btn ${isFavorite(menu) ? 'favorited' : ''}">★</button>` : ""}
      <h2>${menu.emoji} ${menu.name}</h2>
      <div class="tags">${menu.tags.join(", ")}</div>
      <p>${menu.desc}</p>
    </div>
  `;
}

function isFavorite(menu) {
  return favorites.some(m => m.name === menu.name);
}

function toggleFavorite(menu) {
  const idx = favorites.findIndex(m => m.name === menu.name);
  if (idx >= 0) favorites.splice(idx, 1);
  else favorites.push(menu);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  favoritesListEl.innerHTML = "";
  if (favorites.length === 0) {
    favoritesListEl.innerHTML = `<p style="margin-top:1rem;">찜한 메뉴가 아직 없네요! 하나쯤 골라보는 건 어때요? 🥢</p>`;
    return;
  }
  favorites.forEach(menu => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = getMenuBoxHTML(menu, true);
    favoritesListEl.appendChild(wrapper);
    const btn = wrapper.querySelector(".favorite-btn");
    addFavoriteEvent(btn, menu);
  });
}

function addFavoriteEvent(btn, menu) {
  btn.addEventListener("click", e => {
    toggleFavorite(menu);
    btn.classList.toggle("favorited", isFavorite(menu));
    e.stopPropagation();
  });
}

// 이벤트 등록
document.getElementById("pickBtn").addEventListener("click", () => {
  renderFilteredRandom();
});

document.getElementById("openFavorites").addEventListener("click", () => {
  favoriteModal.style.display = "flex";
});

function closeFavorites() {
  favoriteModal.style.display = "none";
}

document.getElementById("toggleDark").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
