# Foodie — Recipe Finder

A React + TypeScript recipe discovery app. Search recipes by name or ingredients,
browse by category, save favorites, view full ingredients and instructions, get a
random recipe suggestion, and — powered by AI — chat with an assistant about a
recipe or generate a brand new recipe from whatever's left in your fridge. Recipe
data comes from [TheMealDB](https://www.themealdb.com/api.php); AI features are
powered by Groq (LLM) and Unsplash (recipe photos).

## Tech stack

- **React 19** + **TypeScript**
- **Vite** — build tool / dev server
- **React Router v7** — client-side routing
- **Motion** — scroll-driven marquee animation on the landing page
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

To lint:

```bash
npm run lint
```

### Environment variables

AI features require a `.env.local` (gitignored) with:

```
VITE_GROQ_API_KEY=
VITE_UNSPLASH_ACCESS_KEY=
```

- `VITE_GROQ_API_KEY` — [Groq](https://groq.com) API key, used for AI recipe
  descriptions, the in-recipe chat assistant, and the Leftover Rescue generator
  (all call `llama-3.1-8b-instant`).
- `VITE_UNSPLASH_ACCESS_KEY` — [Unsplash](https://unsplash.com/developers) access
  key, used to fetch a matching photo for AI-generated recipes.

Both are called directly from the browser — there is no backend/proxy, so these
keys are exposed client-side.

## Project structure

```
src/
├── components/
│   ├── RecipeCard.tsx           # Recipe card used in grid/list views
│   ├── SkeletonCard.tsx         # Loading placeholder, matches RecipeCard's shape
│   ├── RecipeChat.tsx           # Chat FAB on the recipe detail page — ask an AI
│   │                            #  assistant about the recipe you're viewing
│   └── ScrollVelocityMarquee.tsx # Scroll-velocity-reactive marquee (landing page)
├── context/
│   ├── ThemeContext.tsx         # Dark/light theme state, persisted to localStorage
│   └── ToastContext.tsx         # Global toast notifications (e.g. "Added to favorites")
├── hooks/
│   ├── useFavorites.ts          # Favorite recipe IDs + favorited AI recipes,
│   │                            #  persisted to localStorage
│   └── useAiDescription.ts      # Fetches (and caches) an AI-written blurb for a recipe
├── pages/
│   ├── Landing.tsx              # "/" — marketing/hero landing page
│   ├── RecipeFinder.tsx         # "/recipes" — search by name or ingredients,
│   │                            #  category filter, results grid
│   ├── Favorites.tsx            # "/favorites" — favorited recipes (real + AI-generated)
│   ├── RecipeDetail.tsx         # "/recipe/:id" — full recipe: ingredients,
│   │                            #  instructions, AI description, chat
│   └── LeftoverRescue.tsx       # "/rescue" — generate a recipe from leftover
│                                #  ingredients via AI, with an AI-searched photo
├── types/
│   └── Recipe.ts                # Shared TypeScript types for recipe data (app-facing
│                                #  and raw API response shapes)
├── App.tsx                      # Routes + navbar (incl. "Surprise Me")
├── App.css                      # All app styling (theme variables, layout, components)
├── main.tsx                     # App entry point
└── index.css                    # Base/reset styles
```

## Features

- 🔍 Search recipes by name (debounced) or by a comma-separated list of ingredients,
  or browse by category
- ⭐ Favorite recipes — including AI-generated ones — persisted across sessions
  (localStorage)
- 📖 Full recipe detail pages — ingredients, step-by-step instructions, an
  AI-generated description, and a YouTube link when available
- 💬 Ask-about-this-recipe chat assistant, grounded in that recipe's own
  ingredients/instructions
- 🍳 Leftover Rescue — describe what's in your fridge and get a full AI-generated
  recipe (with a matching photo)
- 🎲 "Surprise Me" — jump to a random recipe
- 🌓 Dark / light theme toggle
- 📱 Responsive — grid layout on desktop (2–5 columns by screen width), single-column
  list on mobile
- 🔔 Toast notifications on favoriting
- 💀 Skeleton loading states while fetching

## API

Recipe data comes from the free [TheMealDB API](https://www.themealdb.com/api.php)
(test key `1`, no auth required):

| Endpoint | Used for |
|---|---|
| `search.php?s={query}` | Search recipes by name |
| `filter.php?c={category}` | Browse recipes by category |
| `filter.php?i={ingredient}` | Search recipes by ingredient (intersected client-side for multi-ingredient search) |
| `list.php?c=list` | Populate the category dropdown |
| `lookup.php?i={id}` | Full recipe detail (ingredients, instructions) |
| `random.php` | "Surprise Me" button |

AI features call two external APIs directly from the browser:

| API | Used for |
|---|---|
| Groq chat completions (`llama-3.1-8b-instant`) | AI recipe descriptions, the recipe chat assistant, and Leftover Rescue's recipe generation |
| Unsplash search | Fetching a photo for AI-generated recipes |

## Notes for future development

- `types/Recipe.ts` separates the **app-facing** shapes (`Recipe`, `RecipeDetail`)
  from the **raw API response** shapes (`RawMeal`, `RawMealDetail`, etc.) — always
  map raw API data into the app-facing type at the fetch boundary, don't pass raw
  API objects further into the component tree.
- There are two "kinds" of recipe wherever favoriting/display logic touches
  recipes: real TheMealDB recipes and AI-generated recipes from Leftover Rescue
  (`id` prefixed `ai-`). `useFavorites` tracks these as two separate localStorage
  lists — `favoriteIds` (real recipes, by ID) and `aiRecipes` (AI ones, stored as
  full objects since they can't be re-fetched by ID). `isFavorite` checks both.
- Global persisted state (theme, favorites) follows one pattern: a `useState`
  lazily initialized from `localStorage`, synced back to it via `useEffect`.
  Follow this same pattern for any future global, persisted state — use a
  Context when the state is read/toggled widely (like theme), or a plain hook
  when it's only consumed by a few places (like favorites).
