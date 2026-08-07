import { useState, useEffect } from "react";

export type AiRecipe = {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  difficulty: string;
  ingredients: { amount: string; item: string }[];
  steps: string[];
  imageUrl: string | null;
};

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("favoriteIds");
    return stored ? JSON.parse(stored) : [];
  });

  const [aiRecipes, setAiRecipes] = useState<AiRecipe[]>(() => {
    const stored = localStorage.getItem("favoriteAiRecipes");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("favoriteIds", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem("favoriteAiRecipes", JSON.stringify(aiRecipes));
  }, [aiRecipes]);

  function toggleFavorite(id: string) {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  }

  function toggleAiFavorite(recipe: AiRecipe) {
    setAiRecipes((prev) =>
      prev.some((r) => r.id === recipe.id)
        ? prev.filter((r) => r.id !== recipe.id)
        : [recipe, ...prev]
    );
  }

  function isFavorite(id: string) {
    return favoriteIds.includes(id) || aiRecipes.some((r) => r.id === id);
  }

  return { favoriteIds, aiRecipes, toggleFavorite, toggleAiFavorite, isFavorite };
}