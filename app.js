// 宣告 API 端點的變數，這樣日後若 API 端點更新，直接修改變數即可，不用到程式碼一行一行修改
const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = `${BASE_URL}/api/movies/`;
const POSTER_URL = `${BASE_URL}/posters/`;
const MOVIES_PER_PAGE = 12;

const movies = [];
const viewModes = {
  cardMode: "cardMode",
  listMode: "listMode",
};

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const paginator = document.querySelector("#paginator");
const modeSwitcher = document.querySelector("#mode-switcher");

let currentPage = 1;
let currentViewMode = viewModes.cardMode;
let pageCount = 0;
let filteredMovies = [];

axios
  .get(INDEX_URL)
  .then((res) => {
    // 將全部的電影都推入到電影容器陣列中，由於 res.data.results 的回傳值為陣列，所以運用展開運算子來置入資料
    movies.push(...res.data.results);
    // 將電影清單渲染到 HTML
    renderMovies(getMoviesByPage(1), currentViewMode);
    //渲染分頁器
    renderPaginator(pageCount);
  })
  .catch((err) => {
    console.log(err);
  });

function renderMovies(movies, currentViewMode) {
  let rawHTML = "";
  // 判斷目前的檢視模式
  if (currentViewMode === viewModes.cardMode) {
    movies.forEach((movie) => {
      rawHTML += `<div class="col-sm-3">
      <div class="mb-3">
        <div class="card">
          <img
            src="${POSTER_URL + movie.image}"
            class="card-img-top"
            alt="movie-poster"
          />
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
          </div>
          <div class="card-footer">
            <button
              class="btn btn-primary btn-show-movie"
              data-bs-toggle="modal"
              data-bs-target="#movie-modal"
              data-id="${movie.id}"
            >
              More
            </button>
            <button 
              class="btn btn-info btn-add-favorite" 
              data-id="${movie.id}">+</button>
          </div>
        </div>
      </div>
    </div>`;
    });
  } else if (currentViewMode === viewModes.listMode) {
    rawHTML += `<ul class="list-group">`;

    movies.forEach((movie) => {
      rawHTML += `<li class="list-group-item d-flex justify-content-between">
            <h5 class="align-self-center">${movie.title}</h5>
            <div class="list-btns">
              <button
                class="btn btn-primary btn-show-movie"
                data-bs-toggle="modal"
                data-bs-target="#movie-modal"
                data-id="${movie.id}"
              >
                More
              </button>
              <button
                class="btn btn-info btn-add-favorite"
                data-id="${movie.id}"
              >
                +
              </button>
            </div>
          </li>`;
    });

    rawHTML += `</ul>`;
  }

  dataPanel.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  // 確認關鍵字搜尋的陣列是否有電影，決定要回傳哪個電影陣列
  const data = filteredMovies.length ? filteredMovies : movies;
  // 計算出 slice 需要使用的起始 index 參數
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  // 利用 slice 切割出每頁的電影項目
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function renderPaginator(pageCount) {
  // 計算出分頁器的頁面數量，記得要考慮到餘數
  pageCount = filteredMovies.length
    ? Math.ceil(filteredMovies.length / MOVIES_PER_PAGE)
    : Math.ceil(movies.length / MOVIES_PER_PAGE);
  console.log(pageCount);
  // 製作分頁器的 template 頭
  let rawHTML = `<li class="page-item">
          <a class="page-link" href="#" aria-label="Previous" id="last-page">
            &laquo
          </a>
        </li>`;

  // 遞迴時別忘了加上 page 的 data-set，供分頁器的點擊監聽使用
  for (let page = 1; page <= pageCount; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  // 製作分頁器的 template 尾
  rawHTML += `<li class="page-item">
          <a class="page-link" href="#" aria-label="Next" id="next-page">
            &raquo
          </a>
        </li>`;

  paginator.innerHTML = rawHTML;
}

// 掛上分頁器的點擊事件監聽器
paginator.addEventListener("click", handlePaginatorClick);

// 處理分頁器的按鈕處理事件
function handlePaginatorClick(event) {
  const target = event.target;
  const pageNum = filteredMovies.length
    ? Math.ceil(filteredMovies.length / MOVIES_PER_PAGE)
    : Math.ceil(movies.length / MOVIES_PER_PAGE);
  // 若點擊的是下一頁，更新 currentPage
  if (target.id === "next-page" && currentPage < pageNum) {
    currentPage += 1;
  } else if (target.dataset.page) {
    //透過 data-set 取得指定頁數
    currentPage = Number(target.dataset.page);
    // 若點擊的是上一頁，更新 currentPage
  } else if (target.id === "last-page" && currentPage !== 1) {
    currentPage -= 1;
  }
  // 根據指定頁數渲染出對應的電影
  renderMovies(getMoviesByPage(currentPage), currentViewMode);
}

// 掛上電影卡片監聽器
dataPanel.addEventListener("click", handlePanelClick);

// 處理電影卡片的按鈕處理事件
function handlePanelClick(event) {
  const target = event.target;

  // 確保使用者是按下 movie 的 More 按鈕 => 呼叫 modal
  if (target.matches(".btn-show-movie")) {
    showMovieModal(target.dataset.id);
    // 確認使用者按下 + => 將電影加入到最愛清單
  } else if (target.matches(".btn-add-favorite")) {
    addToFavorite(Number(target.dataset.id));
  }
}

// 接受電影 id 參數，呈現出對應的 Modal
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios
    .get(INDEX_URL + id)
    .then((res) => {
      const data = res.data.results;
      modalTitle.innerText = data.title;
      modalDate.innerText = "Release date: " + data.release_date;
      modalDescription.innerText = data.description;
      modalImage.innerHTML = `<img src="${
        POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
    })
    .catch((err) => {
      console.log(err);
    });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];

  // 在 movies 陣列中，找出被點擊的那部電影
  const movie = movies.find((movie) => movie.id === id);

  // 注意：一部電影只能被加入到收藏清單一次
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在清單中！");
  }

  // 將找到的電影，先暫時儲存到收藏清單
  list.push(movie);

  // 將收藏清單儲存到 local storage
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
  alert("已成功加入收藏❤️")
}

// 搜尋表單掛上監聽器
searchForm.addEventListener("input", searchFormKeyIn);

// 處理搜尋表單的關鍵字搜尋事件
function searchFormKeyIn(event) {
  // 取得 search bar 的 input 值
  const keyword = document
    .querySelector("#search-input")
    .value.trim()
    .toLowerCase();

  // 查看 movies 電影清單，比對 input 和 movie title 屬性
  // 篩選出 title 當中含有 input 值的電影，產生一組新的陣列
  filteredMovies = movies.filter((movie) => {
    return movie.title.toLowerCase().includes(keyword);
  });

  // 重製分頁器
  renderPaginator(filteredMovies.length);

  // 利用 renderMovies 函式，將篩選出來的電影渲染到 data panel
  renderMovies(getMoviesByPage(1), currentViewMode);
}

// 掛上檢視模式切換的監聽器
modeSwitcher.addEventListener('click', handleModeSwitcher);

function handleModeSwitcher(event) {
  const target = event.target;
  if (event.target.id === "card-mode") {
    renderViewMode(viewModes.cardMode);
  } else if (event.target.id === "list-mode") {
    renderViewMode(viewModes.listMode);
  }
}

function renderViewMode(viewMode) {
  currentViewMode = viewMode;
  renderMovies(getMoviesByPage(currentPage), currentViewMode);
}