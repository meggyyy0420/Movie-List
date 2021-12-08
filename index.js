const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
let viewMode = ''
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const viewSelector = document.querySelector('#view-selector')

// viewMode = 'card'
function renderMovieCard(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie"  data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
  viewMode = 'card'
}

// viewMode = 'column'
function renderMovieColumn(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
      <div class="col-12 row border-top d-flex justify-content-center align-items-center mb-2 pb-2">
        <div class="col-6 text-center pt-3">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="col-6 text-center">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
  viewMode = 'column'
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount, currentPage) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
  paginator.children[currentPage - 1].classList.add("active")
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((res) => {
    const data = res.data.results
    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if(list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  return alert('添加成功！')
}

// 判斷顯示樣式
function viewCheck(page) {
  if (viewMode === 'card') {
    renderMovieCard(getMoviesByPage(page))
  } else {
    renderMovieColumn(getMoviesByPage(page))
  }
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// Click
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()  //終止瀏覽器預設行為
  const keyword = searchInput.value.trim().toLowerCase()
  // 1. for迴圈方式
  // for(const movie of movies) {
  //   if(movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  // 2.用條件來迭代：filter
  filteredMovies = movies.filter((movie) => 
    movie.title.toLowerCase().includes(keyword)
  )
  currentPage = 1
  if(filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length, currentPage)
  viewCheck(currentPage)
})

// Enter
// searchInput.addEventListener('keypress', function onSearchInputEntered(event) {
//   if(event.key === 'Enter') {
//     const keyword = event.target.value.trim().toLowerCase()

//     filteredMovies = movies.filter((movie) =>
//       movie.title.toLowerCase().includes(keyword)
//     )
//     if (filteredMovies.length === 0) {
//       return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
//     }

//     renderPaginator(filteredMovies.length)
//     renderMovieCard(getMoviesByPage(1))
//   }
// })

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if(event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page);
  const data = filteredMovies.length ? filteredMovies : movies;
  renderPaginator(data.length, currentPage);
  viewCheck(currentPage);
})

viewSelector.addEventListener('click', function onViewSelectorClicked(event) {
  if (event.target.classList.contains('list-card')) {
    viewMode = 'card'
    viewCheck(currentPage)
  } else if (event.target.classList.contains('list-column')) {
    viewMode = 'column'
    viewCheck(currentPage)
  }
})

axios.get(INDEX_URL).then((res) => {
  // 1. for迴圈方式
  // for (const movie of res.data.results) {
  //   movies.push(movie)
  // }
  // 2. ...展開運算子（展開陣列元素）
  movies.push(...res.data.results)
  renderPaginator(movies.length, currentPage)
  renderMovieCard(getMoviesByPage(currentPage))
}).catch((err) => console.log(err))
