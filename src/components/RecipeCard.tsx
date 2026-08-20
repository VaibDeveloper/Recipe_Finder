import { useNavigate } from "react-router-dom";
import type { Recipe } from "../types/Recipe";
import { useToast } from "../hooks/useToast";

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

  const handleCardClick = () => {
    if (recipe.id.startsWith("ai-")) return;
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <div
      className={`movie-card ${recipe.id.startsWith("ai-") ? "ai-card" : ""}`}
      onClick={handleCardClick}
    >
      <button
        className={`favorite-icon-btn ${isFavorite ? "favorited" : ""}`}
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <span>{isFavorite ? "★" : "☆"}</span>
      </button>
      {recipe.thumbnail ? (
        <img src={recipe.thumbnail} alt={recipe.name} className="movie-poster" />
      ) : (
        <div className="movie-poster ai-poster-placeholder">🍳</div>
      )}
      <div className="card-text">
        <h3>{recipe.name}</h3>
        <p>{recipe.category}</p>
      </div>
    </div>
  );
}

export default RecipeCard;