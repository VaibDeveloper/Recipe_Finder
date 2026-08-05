import { useState, useRef, useEffect } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type RecipeChatProps = {
  recipeName: string;
  ingredients: { name: string; measure: string }[];
  instructions: string;
};

function RecipeChat({ recipeName, ingredients, instructions }: RecipeChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (trimmed.length === 0 || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const ingredientList = ingredients
      .map((item) => `${item.measure} ${item.name}`.trim())
      .join(", ");

    const systemPrompt = `You are a helpful cooking assistant. The user is cooking "${recipeName}". 
Ingredients: ${ingredientList}.
Instructions: ${instructions}.
Answer the user's question about this specific recipe only, using the ingredients and instructions above as your source of truth. Keep answers short and practical — 2-3 sentences max. If the question isn't related to cooking this recipe, politely say you can only help with this recipe.`;

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 200,
          messages: [{ role: "system", content: systemPrompt }, ...newMessages],
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply ?? "Sorry, I couldn't come up with an answer. Try again." },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Ask about this recipe"}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div>
              <p className="chat-panel-title">Ask about this recipe</p>
              <p className="chat-panel-subtitle">{recipeName}</p>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <p className="chat-empty-hint">
                e.g. "Can I substitute the eggs?" or "How do I know when it's done?"
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {loading && <div className="chat-bubble assistant chat-thinking">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="search-input"
              disabled={loading}
              autoFocus
            />
            <button className="chat-send-btn" onClick={sendMessage} disabled={loading}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default RecipeChat;