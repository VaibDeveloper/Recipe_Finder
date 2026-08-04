import { useNavigate } from "react-router-dom";
import type { Recipe } from "../types/Recipe";

type RecipeCardProps = {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

function RecipeCard({ recipe, isFavorite, onToggleFavorite }: RecipeCardProps) {
  const navigate = useNavigate();

  return (
    <div className="movie-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      <img src={recipe.thumbnail} alt={recipe.name} className="movie-poster" />
      <h3>{recipe.name}</h3>
      <p>{recipe.category}</p>
      <button
        className={isFavorite ? "favorited" : ""}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(recipe.id);
        }}
      >
        {isFavorite ? "★ Favorited" : "☆ Add to favorites"}
      </button>
    </div>
  );
}

export default RecipeCard;