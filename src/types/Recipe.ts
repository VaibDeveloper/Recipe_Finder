export type Recipe = {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
};

// Shape of a single meal as TheMealDB returns it from search.php
export type RawMeal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
};

// Shape of the search.php API response
export type MealDBResponse = {
  meals: RawMeal[] | null;
};

export type RecipeDetail = {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  area: string;
  instructions: string;
  youtube: string | null;
  ingredients: { name: string; measure: string }[];
};

// Raw shape for a single full meal from lookup.php (has up to 20 ingredient fields)
export type RawMealDetail = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube: string;
  [key: string]: string; // catches strIngredient1..20, strMeasure1..20 dynamically
};

// Shape of the lookup.php API response
export type MealDetailResponse = {
  meals: RawMealDetail[] | null;
};

export type Category = {
  name: string;
};

export type CategoryListResponse = {
  meals: { strCategory: string }[];
};

export type FilterMeal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

export type CategoryFilterResponse = {
  meals: FilterMeal[] | null;
};

export type IngredientFilterResponse = {
  meals: FilterMeal[] | null;
};