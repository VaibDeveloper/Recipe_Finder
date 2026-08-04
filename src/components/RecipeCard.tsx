import { useNavigate } from "react-router-dom";
import type { Recipe } from "../types/Recipe";
import { useToast } from "../context/ToastContext";

type RecipeCardProps = {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

function RecipeCard({ recipe, isFavorite, onToggleFavorite }: RecipeCardProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(recipe.id);
    showToast(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <div className="movie-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      <button
        className={`favorite-icon-btn ${isFavorite ? "favorited" : ""}`}
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <span>{isFavorite ? "★" : "☆"}</span>
      </button>
      <img src={recipe.thumbnail} alt={recipe.name} className="movie-poster" />
      <h3>{recipe.name}</h3>
      <p>{recipe.category}</p>
    </div>
  );
}

export default RecipeCard;