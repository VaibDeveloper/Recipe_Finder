import { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";
import type { MealDetailResponse, Recipe } from "../types/Recipe";
import { useFavorites } from "../hooks/useFavorites";

type FavoriteFilter = "all" | "normal" | "ai";

function Favorites() {
  const {
    favoriteIds,
    aiRecipes,
    toggleFavorite,
    toggleAiFavorite,
    isFavorite,
  } = useFavorites();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState<FavoriteFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedFavoriteIds, setLoadedFavoriteIds] = useState<string[] | null>(null);

  if (favoriteIds !== loadedFavoriteIds) {
    setLoadedFavoriteIds(favoriteIds);
    setFetching(favoriteIds.length > 0);
    if (favoriteIds.length === 0) {
      setRecipes([]);
    }
  }

  useEffect(() => {
    if (favoriteIds.length === 0) return;

    Promise.all(
      favoriteIds.map((id) =>
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
          .then((res) => res.json())
          .then((data: MealDetailResponse) => data.meals?.[0]),
      ),
    ).then((meals) => {
      const formatted: Recipe[] = meals
        .filter((meal) => meal != null)
        .map((meal) => ({
          id: meal.idMeal,
          name: meal.strMeal,
          thumbnail: meal.strMealThumb,
          category: meal.strCategory,
        }));
      setRecipes(formatted);
      setFetching(false);
    });
  }, [favoriteIds]);

  const aiCards: Recipe[] = aiRecipes.map((r) => ({
    id: r.id,
    name: r.name,
    thumbnail: r.imageUrl ?? "",
    category: "AI Generated",
  }));

  const allRecipes = [...recipes, ...aiCards];

  const categoryFiltered =
    filter === "all" ? allRecipes : filter === "ai" ? aiCards : recipes;

  const filteredRecipes = searchQuery.trim()
    ? categoryFiltered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : categoryFiltered;

  function handleToggle(id: string) {
    if (id.startsWith("ai-")) {
      const aiRecipe = aiRecipes.find((r) => r.id === id);
      if (aiRecipe) toggleAiFavorite(aiRecipe);
    } else {
      toggleFavorite(id);
    }
  }

  if (fetching) {
    return (
      <div className="status-message">
        <div className="spinner"></div>
        <p>Loading your favorites...</p>
      </div>
    );
  }

  if (allRecipes.length === 0) {
    return (
      <div className="status-message">
        <p>You haven't favorited any recipes yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="favorites-header">
        <div className="favorites-filter">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            ✦ All ({allRecipes.length})
          </button>
          <button
            className={filter === "normal" ? "active" : ""}
            onClick={() => setFilter("normal")}
          >
            🍽 Classic ({recipes.length})
          </button>
          <button
            className={filter === "ai" ? "active" : ""}
            onClick={() => setFilter("ai")}
          >
            🤖 AI Created ({aiCards.length})
          </button>
        </div>
        <div className="search-input-container favorites-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your favorites..."
            className="search-input"
          />
          {searchQuery.length > 0 && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="status-message">
          <p>
            {searchQuery.trim()
              ? `No favorites matching "${searchQuery}".`
              : filter === "ai"
                ? "No AI generated recipes saved yet — try Leftover Rescue!"
                : "No classic recipes saved yet — explore and favorite some!"}
          </p>
        </div>
      ) : (
        <div className="movie-grid">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={isFavorite(recipe.id)}
              onToggleFavorite={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
