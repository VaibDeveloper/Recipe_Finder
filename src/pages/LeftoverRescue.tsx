import { useState } from "react";

type GeneratedRecipe = {
  name: string;
  description: string;
  prepTime: string;
  difficulty: string;
  ingredients: { amount: string; item: string }[];
  steps: string[];
  imageUrl: string | null;
};

function LeftoverRescue() {
  const [input, setInput] = useState("");
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateRecipe() {
    const trimmed = input.trim();
    if (trimmed.length === 0 || loading) return;

    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const groqKey = import.meta.env.VITE_GROQ_API_KEY;
      const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 700,
          messages: [
            {
              role: "system",
              content: `You are a creative chef who makes delicious meals from available ingredients.
You MUST respond with ONLY valid JSON, no other text:
{
  "name": "Recipe Name",
  "description": "Short 1-2 sentence appetizing description",
  "prepTime": "X mins",
  "difficulty": "Easy/Medium/Hard",
  "searchQuery": "2-3 word food photo search term",
  "ingredients": [
    { "amount": "2 tablespoons", "item": "olive oil" },
    { "amount": "3 cloves", "item": "garlic, minced" }
  ],
  "steps": ["Step 1", "Step 2", "Step 3"]
}`,
            },
            {
              role: "user",
              content: `I have these ingredients: ${trimmed}. Generate a creative recipe.`,
            },
          ],
        }),
      });

      const groqData = await groqResponse.json();
      const rawText = groqData.choices?.[0]?.message?.content?.trim();
      if (!rawText) throw new Error("No response from Groq");

      const parsed = JSON.parse(rawText);

      let imageUrl: string | null = null;
      try {
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(parsed.searchQuery)}&per_page=1&orientation=landscape`,
          { headers: { Authorization: `Client-ID ${unsplashKey}` } }
        );
        const unsplashData = await unsplashResponse.json();
        imageUrl = unsplashData.results?.[0]?.urls?.regular ?? null;
      } catch {
        // Non-critical
      }

      setRecipe({
        name: parsed.name,
        description: parsed.description,
        prepTime: parsed.prepTime,
        difficulty: parsed.difficulty,
        ingredients: parsed.ingredients,
        steps: parsed.steps,
        imageUrl,
      });
    } catch {
      setError("Something went wrong generating your recipe. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generateRecipe();
  }

  function reset() {
    setRecipe(null);
    setInput("");
    setError(null);
  }

  return (
    <div className="leftover-page">
      {!recipe && !loading && (
        <>
          <div className="leftover-intro">
            <span className="hero-eyebrow">AI-powered</span>
            <h1>Leftover Rescue</h1>
            <p>Tell us what's in your fridge — we'll invent a recipe just for you.</p>
          </div>

          <div className="leftover-input-section">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. half a block of tofu, wilting spinach, three eggs, soy sauce, garlic..."
              className="leftover-textarea"
              rows={4}
              disabled={loading}
            />
            <button
              className="explore-btn"
              onClick={generateRecipe}
              disabled={loading || input.trim().length === 0}
            >
              <span>Generate Recipe</span>
              <span className="explore-btn-arrow">→</span>
            </button>
          </div>
        </>
      )}

      {loading && (
        <div className="status-message">
          <div className="spinner"></div>
          <p>Your personal chef is thinking...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>⚠</span>
          <p>{error}</p>
        </div>
      )}

      {recipe && (
        <div className="recipe-detail">
          <div className="recipe-header">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="recipe-detail-img"
              />
            ) : (
              <div className="recipe-detail-img recipe-img-placeholder">🍳</div>
            )}
            <div>
              <span className="recipe-category-tag">AI Generated</span>
              <h1>{recipe.name}</h1>
              <p className="recipe-meta ai-description">{recipe.description}</p>
              <div className="generated-recipe-meta">
                <span>⏱ {recipe.prepTime}</span>
                <span>📊 {recipe.difficulty}</span>
              </div>
            </div>
          </div>

          <div className="recipe-body">
            <div>
              <h2>Ingredients</h2>
              <ul className="ingredient-list">
                {recipe.ingredients.map((item, i) => (
                  <li key={i}>
                    <span>{item.item}</span>
                    <span className="measure">{item.amount}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2>Instructions</h2>
              <ol className="instructions-list">
                {recipe.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="back-link-wrapper">
            <button className="explore-btn" onClick={reset}>
              ← Try different ingredients
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeftoverRescue;