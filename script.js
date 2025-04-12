let selectedTags = [];
let menuData = [];
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

const filters = ["한식", "중식", "일식", "양식", "분식", "매운맛", "국물", "면", "밥", "고기", "채식"];
const filterContainer = document.getElementById("filters");
const menuDisplay = document.getElementById("menuDisplay");
const favoritePopup = document.getElementById("favoritePopup");
const favoriteList = document.getElementById("favoriteList");
const shareMessage = document.getElementById("shareMessage");

filters.forEach(tag => {
  const btn = document.createElement("button");
  btn.textContent = tag;
  btn.className = "btn tag filter-btn";
  btn.addEventListener("click", () => toggleTag(tag, btn));
  filterContainer.appendChild(btn);
});

function toggleTag(tag, btn) {
  if (selectedTags.includes(tag)) {
    selectedTags = selectedTags.filter(t => t !== tag);
    btn.classList.remove("selected");
  } else {
    selectedTags.push(tag);
    btn.classList.add("selected");
  }
}

function recommendMenu() {
  const filtered = menuData.filter(item =>
    selectedTags.every(tag => item.tags.includes(tag))
  );

  const list = selectedTags.length ? filtered : menuData;
  const pick = list[Math.floor(Math.random() * list.length)];

  if (!pick) {
    menuDisplay.textContent = "조건에 맞는 메뉴가 없어요!";
    return;
  }

  const isFav = favorites.includes(pick.name);
  menuDisplay.innerHTML = `
    <div class="menu-item">
      <span>${pick.emoji} ${pick.name}</span>
      <span class="star" onclick="toggleFavorite('${pick.name}')">
        ${isFav ? "★" : "☆"}
      </span>
    </div>
  `;
}

function toggleFavorite(name) {
  const index = favorites.indexOf(name);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(name);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  recommendMenu(); // refresh star
  if (favoritePopup.style.display === "block") showFavorites(); // refresh popup
}

function toggleFavorites() {
  if (favoritePopup.style.display === "block") {
    favoritePopup.style.display = "none";
  } else {
    showFavorites();
    favoritePopup.style.display = "block";
  }
}

function showFavorites() {
  favoriteList.innerHTML = "";
  if (!favorites.length) {
    favoriteList.innerHTML = "<li>즐겨찾기한 메뉴가 아직 없어요. 추천을 받고 추가해보세요!</li>";
    return;
  }
  favorites.forEach(name => {
    favoriteList.innerHTML += `<li>
      ${name} <span class="star" onclick="toggleFavorite('${name}')">★</span>
    </li>`;
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// 공유 기능
function shareSite() {
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: "EatPick - 오늘 뭐 먹지?",
      url: url,
    }).then(() => {
      shareMessage.textContent = "공유가 완료되었습니다!";
    }).catch(() => {
      shareMessage.textContent = "공유를 취소했어요.";
    });
  } else {
    navigator.clipboard.writeText(url).then(() => {
      shareMessage.textContent = "링크가 복사되었어요!";
    });
  }
}

// 메뉴 로드
fetch("menu.json")
  .then(res => res.json())
  .then(data => menuData = data);
