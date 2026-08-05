# Foodie — Recipe Finder

A React + TypeScript recipe discovery app. Search recipes by name or browse by
category, save favorites, view full ingredients and instructions, and get a
random recipe suggestion — all backed by [TheMealDB](https://www.themealdb.com/api.php)
public API.

## Tech stack

- **React 19** + **TypeScript**
- **Vite** — build tool / dev server
- **React Router v7** — client-side routing
- **CSS variables** — theming (dark / light mode), no CSS framework

## Getting started

```bash
npm install
npm run dev
```

Open the printed `localhost` URL in your browser.

To build for production:

```bash
npm run build
```

## Project structure

```
src/
├── components/
│   ├── RecipeCard.tsx      # Recipe card used in grid/list views
│   └── SkeletonCard.tsx    # Loading placeholder, matches RecipeCard's shape
├── context/
│   ├── ThemeContext.tsx    # Dark/light theme state, persisted to localStorage
│   └── ToastContext.tsx    # Global toast notifications (e.g. "Added to favorites")
├── hooks/
│   └── useFavorites.ts     # Favorite recipe IDs, persisted to localStorage
├── pages/
│   ├── Landing.tsx         # "/" — marketing/hero landing page
│   ├── Home.tsx            # "/recipes" — search, category filter, results grid
│   ├── Favorites.tsx       # "/favorites" — favorited recipes
│   └── RecipeDetail.tsx    # "/recipe/:id" — full recipe: ingredients + instructions
├── types/
│   └── Recipe.ts           # Shared TypeScript types for recipe data (app-facing
│                           #  and raw API response shapes)
├── App.tsx                 # Routes + navbar
├── App.css                 # All app styling (theme variables, layout, components)
├── main.tsx                # App entry point
└── index.css               # Base/reset styles
```

## Features

- 🔍 Search recipes by name (debounced) or browse by category
- ⭐ Favorite recipes, persisted across sessions (localStorage)
- 📖 Full recipe detail pages — ingredients, step-by-step instructions, YouTube link
- 🎲 "Surprise Me" — jump to a random recipe
- 🌓 Dark / light theme toggle
- 📱 Responsive — grid layout on desktop (2–5 columns by screen width), single-column
  list on mobile
- 🔔 Toast notifications on favoriting
- 💀 Skeleton loading states while fetching

## API

All recipe data comes from the free [TheMealDB API](https://www.themealdb.com/api.php)
(test key `1`, no auth required):

| Endpoint | Used for |
|---|---|
| `search.php?s={query}` | Search recipes by name |
| `filter.php?c={category}` | Browse recipes by category |
| `list.php?c=list` | Populate the category dropdown |
| `lookup.php?i={id}` | Full recipe detail (ingredients, instructions) |
| `random.php` | "Surprise Me" button |

## Notes for future development

- `types/Recipe.ts` separates the **app-facing** shapes (`Recipe`, `RecipeDetail`)
  from the **raw API response** shapes (`RawMeal`, `RawMealDetail`, etc.) — always
  map raw API data into the app-facing type at the fetch boundary, don't pass raw
  API objects further into the component tree.
- Favorites and theme are both implemented as the same pattern: a Context +
  Provider wrapping the app, backed by a `useState` that's lazily initialized from
  `localStorage` and synced back to it via `useEffect`. Follow this same pattern
  for any future global, persisted state.
