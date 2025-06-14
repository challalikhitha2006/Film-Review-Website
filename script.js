const API_KEY = 'c8535c53'; // <--- REPLACE THIS
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');
const current = document.getElementById('current');

let currentPage = 1;
let currentQuery = '';
let currentGenre = '';
const genres = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
  'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sport',
  'Thriller', 'War', 'Western'
];

setGenreTags();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  currentQuery = searchTerm;
  currentPage = 1;
  getMovies();
});

document.getElementById('next').addEventListener('click', () => {
  currentPage++;
  getMovies();
});

document.getElementById('prev').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    getMovies();
  }
});

function setGenreTags() {
  tagsEl.innerHTML = '';
  genres.forEach(genre => {
    const tag = document.createElement('div');
    tag.classList.add('tag');
    tag.innerText = genre;
    tag.addEventListener('click', () => {
      currentGenre = genre === currentGenre ? '' : genre;
      getMovies();
      highlightTag();
    });
    tagsEl.appendChild(tag);
  });
}

function highlightTag() {
  const tags = document.querySelectorAll('.tag');
  tags.forEach(tag => {
    tag.classList.remove('highlight');
    if (tag.innerText === currentGenre) {
      tag.classList.add('highlight');
    }
  });
}

function getMovies() {
  main.innerHTML = '';
  const url = `${BASE_URL}&s=${currentQuery || 'Avengers'}&page=${currentPage}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.Response === 'True') {
        fetchDetails(data.Search);
      } else {
        main.innerHTML = `<h2 class="no-results">No results found</h2>`;
      }
    });
}

function fetchDetails(movies) {
  const requests = movies.map(movie =>
    fetch(`${BASE_URL}&i=${movie.imdbID}&plot=full`).then(res => res.json())
  );

  Promise.all(requests).then(fullData => {
    fullData.forEach(movie => {
      if (!currentGenre || (movie.Genre && movie.Genre.includes(currentGenre))) {
        showMovie(movie);
      }
    });
    current.innerText = currentPage;
  });
}

function showMovie(movie) {
  const movieEl = document.createElement('div');
  movieEl.classList.add('movie');
  movieEl.innerHTML = `
    <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450'}" alt="${movie.Title}">
    <div class="movie-info">
      <h3>${movie.Title}</h3>
      <span class="${getRatingColor(movie.imdbRating)}">${movie.imdbRating}</span>
    </div>
    <div class="overview">
      <h3>Overview</h3>
      ${movie.Plot}
    </div>
  `;
  main.appendChild(movieEl);
}

function getRatingColor(vote) {
  if (vote >= 8) return 'green';
  else if (vote >= 5) return 'orange';
  else return 'red';
}

// Initial load
getMovies();
