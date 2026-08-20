import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type {
  RecipeDetail as RecipeDetailType,
  MealDetailResponse,
  RawMealDetail,
} from "../types/Recipe";
import { useFavorites } from "../hooks/useFavorites";
import { useToast } from "../context/ToastContext";
import { useAiDescription } from "../hooks/useAiDescription";
import RecipeChat from "../components/RecipeChat";

function extractIngredients(meal: RawMealDetail) {
  const ingredients: { name: string; measure: string }[] = [];

  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim() !== "") {
      ingredients.push({ name, measure: measure ?? "" });
    }
  }

  return ingredients;
}

function formatInstructions(raw: string) {
  const rawLines = raw
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const steps: string[] = [];

  for (const line of rawLines) {
    // Skip standalone "STEP 1", "Step 2:", "STEP 3 -" labels with no real content
    if (/^step\s*\d+\s*[:.-]?$/i.test(line)) {
      continue;
    }

    let cleaned = line;

    // Strip leading numbering: "1)", "1.", "1:", "1 -", "(1)"
    // eslint-disable-next-line no-useless-escape
    cleaned = cleaned.replace(/^\(?\d+\)?\s*[).:\-]?\s*/, "");

    // Strip leading bullet symbols: "-", "*", "•"
    cleaned = cleaned.replace(/^[-*•]\s*/, "");

    // Strip a leading "STEP N:" prefix that's attached to real content on the same line
    cleaned = cleaned.replace(/^step\s*\d+\s*[:.-]?\s*/i, "");

    cleaned = cleaned.trim();

    if (cleaned.length > 0) {
      steps.push(cleaned);
    }
  }

  return steps;
}

function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<RecipeDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | undefined>(undefined);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showToast } = useToast();

  const { description, loading: aiLoading } = useAiDescription(
    recipe?.id ?? "",
    recipe?.name ?? "",
    recipe?.category ?? "",
    recipe?.area ?? "",
  );

  if (id !== loadedId) {
    setLoadedId(id);
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    if (!id) return;

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
      .then((res) => res.json())
      .then((data: MealDetailResponse) => {
        if (!data.meals) {
          setError("Recipe not found.");
        } else {
          const meal = data.meals[0];
          setRecipe({
            id: meal.idMeal,
            name: meal.strMeal,
            thumbnail: meal.strMealThumb,
            category: meal.strCategory,
            area: meal.strArea,
            instructions: meal.strInstructions,
            youtube: meal.strYoutube || null,
            ingredients: extractIngredients(meal),
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load recipe.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="status-message">
        <div className="spinner"></div>
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="error-message">
        <span>⚠</span>
        <p>{error ?? "Something went wrong."}</p>
      </div>
    );
  }

  const steps = formatInstructions(recipe.instructions);

  return (
    <div className="recipe-detail">
      <div className="recipe-header">
        <div className="recipe-img-wrapper">
          <img
            src={recipe.thumbnail}
            alt={recipe.name}
            className="recipe-detail-img"
          />
          <button
            className={`favorite-icon-btn detail-favorite-btn ${isFavorite(recipe.id) ? "favorited" : ""}`}
            onClick={() => {
              toggleFavorite(recipe.id);
              showToast(
                isFavorite(recipe.id)
                  ? "Removed from favorites"
                  : "Added to favorites",
              );
            }}
            aria-label={
              isFavorite(recipe.id)
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <span>{isFavorite(recipe.id) ? "★" : "☆"}</span>
          </button>
        </div>
        <div>
          <span className="recipe-category-tag">{recipe.category}</span>
          <h1>{recipe.name}</h1>
          <p className="recipe-meta">{recipe.area} cuisine</p>
          {aiLoading && (
            <p className="ai-description ai-loading">
              Generating description...
            </p>
          )}
          {description && <p className="ai-description">{description}</p>}
          {recipe.youtube && (
            <a
              href={recipe.youtube}
              target="_blank"
              rel="noreferrer"
              className="youtube-link"
            >
              ▶ Watch on YouTube
            </a>
          )}
        </div>
      </div>

      <div className="recipe-body">
        <div>
          <h2>Ingredients</h2>
          <ul className="ingredient-list">
            {recipe.ingredients.map((item, index) => (
              <li key={index}>
                <span>{item.name}</span>
                <span className="measure">{item.measure}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Instructions</h2>
          <ol className="instructions-list">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
      <RecipeChat
        recipeName={recipe.name}
        ingredients={recipe.ingredients}
        instructions={recipe.instructions}
      />
      <div className="back-link-wrapper">
        <Link to="/" className="back-link">
          ← Back to recipes
        </Link>
      </div>
    </div>
  );
}

export default RecipeDetail;
