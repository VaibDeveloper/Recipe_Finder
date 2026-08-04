import { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";
import type { Recipe, CategoryListResponse } from "../types/Recipe";
import { useFavorites } from "../hooks/useFavorites";

function Home() {
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

  useEffect(() => {
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
  }, [debouncedQuery, category]);

  return (
    <div>
      <div className="search-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes..."
          className="search-input"
        />

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
      </div>

      {loading && (
        <div className="status-message">
          <div className="spinner"></div>
          <p>Loading recipes...</p>
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
            {category === "all" && debouncedQuery.trim() === ""
              ? "Start typing to search for recipes, or pick a category."
              : "No recipes found. Try a different search or category."}
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

export default Home;
