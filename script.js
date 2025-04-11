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
  if (filters.size) {
    filtered = menuData.filter(item =>
      item.tags.some(tag => filters.has(tag))
    );
  }
  if (!filtered.length) {
    document.getElementById("menuItem").textContent = "해당 조건의 메뉴가 없어요 😢";
    return;
  }
  const picked = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("menuItem").textContent = picked.name;
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
}

function toggleFavoritesPopup() {
  const popup = document.getElementById("favoritesPopup");
  const overlay = document.getElementById("overlay");
  const list = document.getElementById("favoritesList");

  popup.style.display = popup.style.display === "block" ? "none" : "block";
  overlay.style.display = overlay.style.display === "block" ? "none" : "block";

  list.innerHTML = "";

  if (favorites.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "즐겨찾기한 메뉴가 아직 없어요! 추천받고 별 눌러보세요 ⭐";
    msg.style.color = "#888";
    list.appendChild(msg);
  } else {
    favorites.forEach(name => {
      const item = document.createElement("div");
      item.textContent = name;
      item.style.marginBottom = "0.5rem";
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.innerHTML = `<span>${name}</span><button onclick="toggleFavorite('${name}')" style="background:none; border:none; cursor:pointer;">❌</button>`;
      list.appendChild(item);
    });
  }
}

function shareSite() {
  if (navigator.share) {
    navigator.share({
      title: '오늘 뭐 먹지? | EatPick',
      text: '메뉴 고민 끝! 지금 EatPick에서 추천받아보세요 🍽️',
      url: window.location.href,
    }).catch(err => console.log("공유 실패:", err));
  } else {
    alert("공유 기능을 지원하지 않는 브라우저입니다.");
  }
}

fetchMenu();
