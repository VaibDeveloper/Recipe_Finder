import { useState, useEffect } from "react";

const CACHE_KEY = "ai-descriptions";

function getCache(): Record<string, string> {
  const stored = localStorage.getItem(CACHE_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveToCache(id: string, description: string) {
  const cache = getCache();
  cache[id] = description;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function useAiDescription(recipeId: string, recipeName: string, category: string, area: string) {
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!recipeId) return;

    const cache = getCache();
    if (cache[recipeId]) {
      setDescription(cache[recipeId]);
      return;
    }

    setLoading(true);
    setError(false);

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    console.log("My API key is:", apiKey);

    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: `Write a short, appetizing 1-2 sentence description for a recipe called "${recipeName}", a ${area} ${category} dish. Don't list ingredients, just make it sound inviting. Respond with only the description, no preamble.`,
          },
        ],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          setDescription(text);
          saveToCache(recipeId, text);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [recipeId, recipeName, category, area]);

  return { description, loading, error };
}