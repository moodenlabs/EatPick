let menuData = [];
let filters = new Set();
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

async function fetchMenu() {
  const res = await fetch('menu.json');
  menuData = await res.json();
  generateFilterButtons();
}

function generateFilterButtons() {
  const allTags = new Set(menuData.flatMap(item => item.tags));
  const filtersContainer = document.getElementById("filters");

  allTags.forEach(tag => {
    const btn = document.createElement("button");
    btn.textContent = tag;
    btn.className = "filter-btn";
    btn.onclick = () => toggleFilter(tag, btn);
    filtersContainer.appendChild(btn);
  });
}

function toggleFilter(tag, button) {
  if (filters.has(tag)) {
    filters.delete(tag);
    button.classList.remove("active");
  } else {
    filters.add(tag);
    button.classList.add("active");
  }
}

function recommendMenu() {
  let filtered = menuData;

  if (filters.size > 0) {
    filtered = menuData.filter(item =>
      item.tags.some(tag => filters.has(tag))
    );
  }

  if (filtered.length === 0) {
    document.getElementById("menuItem").textContent = "조건에 맞는 메뉴가 없어요 😢";
    document.getElementById("favoriteBtn").style.visibility = "hidden";
    return;
  }

  const picked = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("menuItem").textContent = picked.name;
  document.getElementById("favoriteBtn").style.visibility = "visible";
  updateFavoriteIcon(picked.name);
}

function updateFavoriteIcon(menuName) {
  const btn = document.getElementById("favoriteBtn");
  btn.onclick = () => toggleFavorite(menuName);
  btn.style.color = favorites.includes(menuName) ? "#facc15" : "#ccc";
}

function toggleFavorite(menuName) {
  if (favorites.includes(menuName)) {
    favorites = favorites.filter(f => f !== menuName);
  } else {
    favorites.push(menuName);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoriteIcon(menuName);
  refreshFavoritesPopup();
}

function toggleFavoritesPopup() {
  const popup = document.getElementById("favoritesPopup");
  const overlay = document.getElementById("overlay");

  const isOpen = popup.style.display === "block";
  popup.style.display = isOpen ? "none" : "block";
  overlay.style.display = isOpen ? "none" : "block";

  if (!isOpen) {
    refreshFavoritesPopup();
  }
}

function refreshFavoritesPopup() {
  const list = document.getElementById("favoritesList");
  list.innerHTML = "";

  if (favorites.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "즐겨찾기된 메뉴가 없네요! 추천받고 즐겨찾기해보세요 🍴";
    msg.style.color = "#999";
    list.appendChild(msg);
    return;
  }

  favorites.forEach(name => {
    const item = document.createElement("div");
    item.style.marginBottom = "0.5rem";
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";

    item.innerHTML = `
      <span>${name}</span>
      <button onclick="toggleFavorite('${name}')" style="background:none;border:none;color:red;cursor:pointer;">❌</button>
    `;
    list.appendChild(item);
  });
}

function shareSite() {
  if (navigator.share) {
    navigator.share({
      title: 'EatPick - 오늘 뭐 먹지?',
      text: '오늘 뭐 먹을지 고민된다면? 🍱 EatPick으로 추천받아보세요!',
      url: window.location.href
    }).catch(err => console.log("공유 실패:", err));
  } else {
    alert("이 브라우저는 공유 기능을 지원하지 않아요 😢");
  }
}

fetchMenu();
