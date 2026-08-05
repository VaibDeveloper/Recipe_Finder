import { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";
import type { Recipe, CategoryListResponse, IngredientFilterResponse } from "../types/Recipe";
import { useFavorites } from "../hooks/useFavorites";
import SkeletonCard from "../components/SkeletonCard";

type SearchMode = "name" | "ingredients";

function RecipeFinder() {
  const [mode, setMode] = useState<SearchMode>("name");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Fetch the list of categories once, on mount
  useEffect(() => {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list")
      .then((res) => res.json())
      .then((data: CategoryListResponse) => {
        const names = data.meals.map((item) => item.strCategory);
        setCategories(names);
      })
      .catch(() => {
        // Non-critical — dropdown just stays empty if this fails
      });
  }, []);

  // Debounce the search query before triggering the recipe fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Name / category search — original logic, untouched, only gated by mode
  useEffect(() => {
    if (mode !== "name") return;

    setLoading(true);
    setError(null);

    const url =
      category === "all"
        ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${debouncedQuery}`
        : `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.meals) {
          setRecipes([]);
        } else if (category === "all") {
          const formatted: Recipe[] = data.meals.map((meal: any) => ({
            id: meal.idMeal,
            name: meal.strMeal,
            thumbnail: meal.strMealThumb,
            category: meal.strCategory,
          }));
          setRecipes(formatted);
        } else {
          const formatted: Recipe[] = data.meals.map((meal: any) => ({
            id: meal.idMeal,
            name: meal.strMeal,
            thumbnail: meal.strMealThumb,
            category: category,
          }));
          setRecipes(formatted);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load recipes.");
        setLoading(false);
      });
  }, [debouncedQuery, category, mode]);

  // Ingredient search — new branch, runs only in "ingredients" mode
  useEffect(() => {
    if (mode !== "ingredients") return;

    const ingredients = debouncedQuery
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);

    if (ingredients.length === 0) {
      setRecipes([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all(
      ingredients.map((ingredient) =>
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
          .then((res) => res.json())
          .then((data: IngredientFilterResponse) => data.meals ?? [])
      )
    )
      .then((responses) => {
        const idSets = responses.map((mealList) => new Set(mealList.map((meal) => meal.idMeal)));
        const firstList = responses[0];
        const commonMeals = firstList.filter((meal) =>
          idSets.every((idSet) => idSet.has(meal.idMeal))
        );

        const formatted: Recipe[] = commonMeals.map((meal) => ({
          id: meal.idMeal,
          name: meal.strMeal,
          thumbnail: meal.strMealThumb,
          category: "",
        }));

        setRecipes(formatted);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to search by ingredients.");
        setLoading(false);
      });
  }, [debouncedQuery, mode]);

  function handleModeChange(newMode: SearchMode) {
    setMode(newMode);
    setQuery("");
    setDebouncedQuery("");
    setCategory("all");
    setRecipes([]);
  }

  return (
    <div>
      <div className="mode-toggle">
        <button
          className={mode === "name" ? "active" : ""}
          onClick={() => handleModeChange("name")}
        >
          By Name
        </button>
        <button
          className={mode === "ingredients" ? "active" : ""}
          onClick={() => handleModeChange("ingredients")}
        >
          By Ingredients
        </button>
      </div>

      <div className="search-wrapper">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === "name" ? "Search recipes..." : "e.g. chicken, garlic, onion"
            }
            className="search-input"
          />
          {query.length > 0 && (
            <button
              className="clear-search-btn"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {mode === "name" && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      {mode === "ingredients" && (
        <p className="mode-hint">Separate multiple ingredients with commas</p>
      )}

      {loading && (
        <div className="movie-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>⚠</span>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && recipes.length === 0 && (
        <div className="status-message">
          <p>
            {mode === "name"
              ? category === "all" && debouncedQuery.trim() === ""
                ? "Start typing to search for recipes, or pick a category."
                : "No recipes found. Try a different search or category."
              : debouncedQuery.trim() === ""
              ? "Enter ingredients you have, separated by commas."
              : "No recipes found using all of those ingredients together."}
          </p>
        </div>
      )}

      {!loading && !error && recipes.length > 0 && (
        <div className="movie-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={isFavorite(recipe.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipeFinder;