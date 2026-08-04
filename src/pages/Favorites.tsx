import { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";
import type { Recipe } from "../types/Recipe";
import { useFavorites } from "../hooks/useFavorites";

function Favorites() {
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (favoriteIds.length === 0) {
      setRecipes([]);
      return;
    }

    Promise.all(
      favoriteIds.map((id) =>
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
          .then((res) => res.json())
          .then((data) => data.meals[0])
      )
    ).then((meals) => {
      const formatted: Recipe[] = meals.map((meal) => ({
        id: meal.idMeal,
        name: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: meal.strCategory,
      }));
      setRecipes(formatted);
    });
  }, [favoriteIds]);

  if (favoriteIds.length === 0) {
    return (
      <div className="status-message">
        <p>You haven't favorited any recipes yet.</p>
      </div>
    );
  }

  return (
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
  );
}

export default Favorites;