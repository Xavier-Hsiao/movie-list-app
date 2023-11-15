// 宣告 API 端點的變數，這樣日後若 API 端點更新，直接修改變數即可，不用到程式碼一行一行修改
const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = `${BASE_URL}/api/movies/`;
const POSTER_URL = `${BASE_URL}/posters/`;
const MOVIES_PER_PAGE = 12;

const movies = JSON.parse(localStorage.getItem("favoriteMovies")) || [];

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const paginator = document.querySelector("#paginator");

let currentPage = 1;
let pageCount = 0;

function renderMovies(movies) {
  let rawHTML = "";

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
              class="btn btn-danger btn-remove-favorite" 
              data-id="${movie.id}">X</button>
          </div>
        </div>
      </div>
    </div>`;
  });

  dataPanel.innerHTML = rawHTML;
}

// 掛上電影卡片監聽器
dataPanel.addEventListener("click", handlePanelClick);

// 處理電影卡片的按鈕處理事件
function handlePanelClick(event) {
  const target = event.target;

  // 確保使用者是按下 movie 的 More 按鈕 => 呼叫 modal
  if (target.matches(".btn-show-movie")) {
    showMovieModal(target.dataset.id);
    // 確認使用者按下 x => 將電影從最愛清單中移除
  } else if (target.matches(".btn-remove-favorite")) {
    removeFavorite(Number(target.dataset.id));
  }
}

function removeFavorite(id) {
  // 預防 movies 為空陣列
  if (!movies || !movies.length) return;

  // 在 movies 陣列中，找出被點擊的那部電影；這裡的 movies 陣列為 local storage
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  // 若清單中找不到該部電影，結束函式
  if (movieIndex === -1) return;

  // 將找到的電影從 local storage 移除
  movies.splice(movieIndex, 1);

  // 將更新後的清單存回 local storage
  localStorage.setItem("favoriteMovies", JSON.stringify(movies));

  // 重新選染 favorite 頁面，否則使用者必須重新整理頁面，才會顯示更新後的 favorite 清單
  renderMovies(movies);
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

renderMovies(movies);
