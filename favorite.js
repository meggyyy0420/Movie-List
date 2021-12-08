const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))
let viewMode = ''

const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const viewSelector = document.querySelector('#view-selector')

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
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
  viewMode = 'card'
}

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
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
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

function removeFromFavorite(id) {
  if (!movies) return
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieCard(movies)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  if (viewMode === 'card') {
    renderMovieCard(getMoviesByPage(page))
  } else {
    renderMovieColumn(getMoviesByPage(page))
  }
})

viewSelector.addEventListener('click', function onViewSelectorClicked(event) {
  if (event.target.classList.contains('list-card')) {
    viewMode = 'card'
    renderMovieCard(getMoviesByPage(1))

  } else if (event.target.classList.contains('list-column')) {
    viewMode = 'column'
    renderMovieColumn(getMoviesByPage(1))
  }
})

renderPaginator(movies.length)
renderMovieCard(getMoviesByPage(1))
