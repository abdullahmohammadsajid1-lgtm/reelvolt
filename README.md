# CineScope — Movie & Series Explorer

**CineScope** is a modern, responsive, API-driven web application for discovering movies and TV series. Built with vanilla HTML, CSS, and JavaScript, it features live search, category filtering, detailed movie previews, and a persistent personal watchlist.

## Features

- **Live Search:** Search movies and TV series in real time using the OMDb API.
- **Quick Categories & Filters:** Browse curated categories (Trending, Batman, Spider-Man, Fantasy, Sci-Fi, Action) and filter titles by **All**, **Movies**, or **Series**.
- **Movie Details Modal:** Click any title to view its IMDb rating, release year, runtime, genre, full plot summary, director, and cast.
- **Persistent Watchlist:** Save or remove favorite titles in a dedicated Watchlist powered by `localStorage` so your list stays saved after refreshing the page.
- **Complete UI States:** Smooth loading spinner, clear error handling, and empty state feedback.
- **Dark Cinema Theme & Mobile-First UI:** Crafted with an Obsidian Black and Cinema Gold palette, sticky glass navbar, and a responsive 2-column grid for mobile screens.

## Tech Stack

- **HTML5**
- **CSS3** (Flexbox, CSS Grid, Custom Properties, Responsive Design)
- **JavaScript (ES6+)** (Fetch API, Async/Await, DOM Manipulation, Array Methods, Local Storage)
- **OMDb API**

## Project Structure

```text
cinescope-app/
├── index.html      # Main layout and movie details modal
├── style.css       # Dark theme and responsive styling
├── script.js       # API integration, filtering, and watchlist logic
└── README.md       # Project documentation
```

## How to Run

1. Download or clone the repository.
2. Open `index.html` directly in any modern web browser (or run with VS Code Live Server).