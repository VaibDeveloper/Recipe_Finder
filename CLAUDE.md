# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Foodie — a React + TypeScript recipe discovery app ("Practice_Website"). Search recipes by
name or category, save favorites, view full ingredients/instructions, get a random recipe,
and generate AI recipes from leftover ingredients. Backed by the free
[TheMealDB API](https://www.themealdb.com/api.php) (no auth) plus Groq (LLM) and Unsplash
(images) for the AI features.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build      # tsc -b && vite build — type-checks before bundling
npm run lint        # eslint .
npm run preview     # preview the production build
```

There is no test suite / test runner configured in this project.

## Environment

Requires a `.env.local` (gitignored) with:
- `VITE_GROQ_API_KEY` — Groq chat completions (`llama-3.1-8b-instant`), used for AI recipe
  descriptions, the leftover-rescue generator, and the in-recipe chat assistant.
- `VITE_UNSPLASH_ACCESS_KEY` — Unsplash search, used to fetch a photo for AI-generated recipes.

Both are called directly from the browser (`import.meta.env.VITE_*`) — there is no backend/proxy.

## Architecture

- **Two recipe "kinds" coexist everywhere favorites/display logic touches recipes**: real
  TheMealDB recipes (string `id`, fetched by ID) and AI-generated recipes from Leftover Rescue
  (`id` prefixed `ai-<timestamp>`, full recipe object stored directly, no re-fetch possible).
  `useFavorites` (`src/hooks/useFavorites.ts`) tracks these as two separate localStorage-backed
  lists — `favoriteIds: string[]` for real recipes and `aiRecipes: AiRecipe[]` for AI ones
  (favoriting an AI recipe stores the whole object since it can't be looked up again). `isFavorite`
  checks both lists. Any code rendering "is this favorited" or a favorites list must handle both.
- **`types/Recipe.ts` separates app-facing shapes (`Recipe`, `RecipeDetail`) from raw TheMealDB
  API response shapes (`RawMeal`, `RawMealDetail`, `MealDBResponse`, etc.)** — map raw API data
  into the app-facing type at the fetch boundary; don't pass raw API objects into components.
- **Global persisted state (theme, favorites) follows one pattern**: a `useState` lazily
  initialized by reading `localStorage` in the initializer, synced back out via a `useEffect`
  on change. Theme is a Context (`src/context/ThemeContext.tsx`) since it's read widely and
  toggled from the navbar; favorites is a plain hook (`src/hooks/useFavorites.ts`) since it's
  only consumed by a few pages/components — follow whichever shape matches the new state's
  usage pattern.
- **AI features are three independent, ad hoc call sites**, not a shared client/service layer —
  `useAiDescription` (blurb on `RecipeDetail`, cached to localStorage by recipe ID so it's only
  generated once per recipe), `RecipeChat` (chat FAB on `RecipeDetail`, sends the full recipe's
  ingredients/instructions as a system prompt so answers stay grounded in that specific recipe),
  and `LeftoverRescue` (whole-recipe generation from freeform ingredients, requires the Groq
  response to be strict JSON per an inline schema in the prompt, then a secondary Unsplash call
  for a matching photo). When touching one, check whether the change belongs in all three.
- Routing is a flat `react-router-dom` v7 `<Routes>` list in `App.tsx`: `/` (Landing), `/recipes`
  (RecipeFinder — search/category browse), `/favorites`, `/recipe/:id` (RecipeDetail),
  `/rescue` (LeftoverRescue). `Navbar` (also in `App.tsx`) also drives "Surprise Me" by hitting
  TheMealDB's `random.php` directly and navigating to the result.
- Styling is a single `src/App.css` using CSS custom properties for theming — no CSS framework,
  no per-component stylesheets. Theme switching works by toggling `data-theme` on
  `document.documentElement` (done in `ThemeContext`); new components should theme via CSS
  variables scoped under `[data-theme]`, not inline conditionals.
- TheMealDB endpoints in use: `search.php?s=`, `filter.php?c=`, `list.php?c=list`, `lookup.php?i=`,
  `random.php`.
