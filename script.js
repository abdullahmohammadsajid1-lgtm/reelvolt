const API_KEY = "2ba1dd1f";
const API_URL = "https://www.omdbapi.com/";
const STORAGE_KEY = "cinescope_watchlist";

const FALLBACK_POSTER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <rect width="300" height="450" fill="#1a1a22"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="18" font-weight="600">No Poster</text>
    </svg>`
  );

// Application state
let watchlist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentMovies = [];
let activeView = "home";
let activeTypeFilter = "all";
let currentLabel = "Trending Now";

// DOM selectors
const brandHomeBtn = document.getElementById("brandHomeBtn");
const homeNavBtn = document.getElementById("homeNavBtn");
const watchlistNavBtn = document.getElementById("watchlistNavBtn");
const watchlistBadge = document.getElementById("watchlistBadge");

const heroSection = document.getElementById("heroSection");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const categoryStrip = document.getElementById("categoryStrip");
const filterButtons = document.querySelectorAll(".filter-btn");

const sectionHeading = document.getElementById("sectionHeading");
const resultsCount = document.getElementById("resultsCount");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyDesc = document.getElementById("emptyDesc");
const moviesGrid = document.getElementById("moviesGrid");

const movieModal = document.getElementById("movieModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBody = document.getElementById("modalBody");

// Toggle catalog states
function setFeedState(state, title = "", message = "") {
  loadingState.classList.add("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
  moviesGrid.classList.add("hidden");

  if (state === "loading") {
    loadingState.classList.remove("hidden");
  } else if (state === "error") {
    errorMessage.textContent = message;
    errorState.classList.remove("hidden");
  } else if (state === "empty") {
    emptyTitle.textContent = title || "No titles found";
    emptyDesc.textContent = message || "Try searching for another movie or switch your filter.";
    emptyState.classList.remove("hidden");
  } else if (state === "grid") {
    moviesGrid.classList.remove("hidden");
  }
}

// Switch between Home (Hero + Live Movies) and Watchlist
function switchView(view) {
  activeView = view;
  homeNavBtn.classList.toggle("active", view === "home");
  watchlistNavBtn.classList.toggle("active", view === "watchlist");

  if (view === "home") {
    heroSection.classList.remove("hidden");
    sectionHeading.textContent = currentLabel;
  } else {
    heroSection.classList.add("hidden");
    sectionHeading.textContent = "My Watchlist";
  }

  renderFeed();
}

// Fetch movies from OMDb API
async function fetchMovies(query, label = "") {
  currentLabel = label || `Results for "${query}"`;
  activeView = "home";
  homeNavBtn.classList.add("active");
  watchlistNavBtn.classList.remove("active");
  heroSection.classList.remove("hidden");
  sectionHeading.textContent = currentLabel;

  if (!API_KEY || API_KEY === "YOUR_OMDB_API_KEY") {
    setFeedState("error", "", "Please paste your OMDb API key in script.js to load live movies.");
    resultsCount.textContent = "API key required";
    return;
  }

  setFeedState("loading");
  resultsCount.textContent = "Fetching titles...";

  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error("Unable to reach the movie server. Please try again.");
    }

    const data = await response.json();

    if (data.Response === "False") {
      currentMovies = [];
      resultsCount.textContent = "0 titles";
      setFeedState("empty", `No results for "${query}"`, data.Error || "Try checking the spelling.");
      return;
    }

    currentMovies = data.Search;
    renderFeed();
  } catch (error) {
    currentMovies = [];
    resultsCount.textContent = "Error";
    setFeedState("error", "", error.message || "Network error. Please check your connection.");
  }
}

// Fetch detailed movie info for modal
async function openMovieDetails(imdbID) {
  movieModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  modalBody.innerHTML = `
    <div style="text-align:center; padding: 40px 0;">
      <div class="spinner"></div>
      <p style="color:#94a3b8;">Loading movie details...</p>
    </div>
  `;

  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
    const movie = await response.json();

    if (movie.Response === "False") {
      throw new Error(movie.Error || "Details unavailable.");
    }

    const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : FALLBACK_POSTER;

    modalBody.innerHTML = `
      <div class="modal-layout">
        <img class="modal-poster" src="${poster}" alt="${movie.Title}" onerror="this.src='${FALLBACK_POSTER}'" />
        <div class="modal-info">
          <h2 id="modalTitle">${movie.Title}</h2>
          <div class="modal-tags">
            <span class="meta-chip rating-chip">IMDb ${movie.imdbRating || "N/A"}</span>
            <span class="meta-chip">${movie.Year}</span>
            <span class="meta-chip">${movie.Runtime || "N/A"}</span>
            <span class="meta-chip">${movie.Rated || "N/A"}</span>
          </div>
          <p class="modal-plot">${movie.Plot !== "N/A" ? movie.Plot : "Plot summary not available."}</p>
          <div class="modal-credits">
            <div><strong>Genre:</strong> ${movie.Genre || "N/A"}</div>
            <div><strong>Director:</strong> ${movie.Director || "N/A"}</div>
            <div><strong>Cast:</strong> ${movie.Actors || "N/A"}</div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    modalBody.innerHTML = `
      <div style="text-align:center; padding: 32px 12px;">
        <h4 style="color:#f87171; margin-bottom:6px;">Could not load details</h4>
        <p style="color:#94a3b8;">${error.message}</p>
      </div>
    `;
  }
}

function closeModal() {
  movieModal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Local Storage persistence
function syncWatchlist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  watchlistBadge.textContent = watchlist.length;
}

function isInWatchlist(imdbID) {
  return Boolean(watchlist.find((item) => item.imdbID === imdbID));
}

function toggleWatchlist(movie) {
  if (isInWatchlist(movie.imdbID)) {
    watchlist = watchlist.filter((item) => item.imdbID !== movie.imdbID);
  } else {
    watchlist.unshift(movie);
  }

  syncWatchlist();
  renderFeed();
}

// Render movie cards using filter() and map()
function renderFeed() {
  const sourceList = activeView === "home" ? currentMovies : watchlist;

  const filtered =
    activeTypeFilter === "all"
      ? sourceList
      : sourceList.filter((item) => item.Type === activeTypeFilter);

  resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? "title" : "titles"}`;

  if (filtered.length === 0) {
    if (activeView === "watchlist" && watchlist.length === 0) {
      setFeedState(
        "empty",
        "Your watchlist is empty",
        'Tap "Save" on any movie card to keep it saved in your browser.'
      );
    } else {
      setFeedState(
        "empty",
        "No matching titles",
        "Try switching the filter back to All or search another title."
      );
    }
    return;
  }

  moviesGrid.innerHTML = filtered
    .map((movie) => {
      const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : FALLBACK_POSTER;
      const saved = isInWatchlist(movie.imdbID);

      return `
        <article class="movie-card" data-id="${movie.imdbID}">
          <div class="poster-wrap" data-action="details" data-id="${movie.imdbID}">
            <img src="${poster}" alt="${movie.Title}" loading="lazy" onerror="this.src='${FALLBACK_POSTER}'" />
            <span class="type-pill">${movie.Type}</span>
          </div>
          <div class="card-body">
            <h4 class="movie-title">${movie.Title}</h4>
            <p class="movie-year">${movie.Year}</p>
            <div class="card-actions">
              <button type="button" class="btn-outline" data-action="details" data-id="${movie.imdbID}">Details</button>
              <button type="button" class="btn-save ${saved ? "saved" : ""}" data-action="save" data-id="${movie.imdbID}">
                ${saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  setFeedState("grid");
}

// Event listeners
brandHomeBtn.addEventListener("click", () => switchView("home"));
homeNavBtn.addEventListener("click", () => switchView("home"));
watchlistNavBtn.addEventListener("click", () => switchView("watchlist"));

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    setFeedState("empty", "Enter a movie name", "Type a title in the search bar above to explore.");
    resultsCount.textContent = "0 titles";
    return;
  }
  categoryStrip.querySelectorAll(".cat-chip").forEach((c) => c.classList.remove("active"));
  fetchMovies(query);
});

categoryStrip.addEventListener("click", (e) => {
  const chip = e.target.closest(".cat-chip");
  if (!chip) return;
  categoryStrip.querySelectorAll(".cat-chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  searchInput.value = "";
  fetchMovies(chip.dataset.query, `${chip.textContent} Movies & Series`);
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeTypeFilter = btn.dataset.type;
    renderFeed();
  });
});

moviesGrid.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-action]");
  if (!trigger) return;

  const { action, id } = trigger.dataset;

  if (action === "details") {
    openMovieDetails(id);
  } else if (action === "save") {
    const source = activeView === "home" ? currentMovies : watchlist;
    const movie = source.find((item) => item.imdbID === id);
    if (movie) {
      toggleWatchlist(movie);
    }
  }
});

closeModalBtn.addEventListener("click", closeModal);

movieModal.addEventListener("click", (e) => {
  if (e.target === movieModal) {
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !movieModal.classList.contains("hidden")) {
    closeModal();
  }
});

// Initialize app directly on Home with live movies below hero
watchlistBadge.textContent = watchlist.length;
fetchMovies("Avengers", "Trending Now");