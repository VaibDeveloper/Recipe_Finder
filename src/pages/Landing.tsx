import { Link } from "react-router-dom";

const FOOD_EMOJIS = ["🍕", "🍜", "🍣", "🥗", "🍔", "🌮", "🍝", "🍩", "🥘", "🍛", "🍤", "🥞"];

function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Discover · Cook · Save</span>
          <h1 className="hero-title">
            Find your next <span className="hero-highlight">favorite meal</span>
          </h1>
          <p className="hero-subtitle">
            Search thousands of recipes from around the world, save the ones you love,
            and never wonder "what's for dinner" again.
          </p>
          <Link to="/recipes" className="explore-btn">
            Explore Recipes
            <span className="explore-btn-arrow">→</span>
          </Link>
        </div>
      </section>

      <div className="food-marquee">
        <div className="food-marquee-track">
          {[...FOOD_EMOJIS, ...FOOD_EMOJIS].map((emoji, i) => (
            <span key={i} className="food-marquee-item">{emoji}</span>
          ))}
        </div>
      </div>

      <section className="features">
        <div className="feature-card">
          <span className="feature-icon">🔍</span>
          <h3>Search anything</h3>
          <p>Find recipes by name or browse by category — chicken, seafood, dessert, and more.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">★</span>
          <h3>Save favorites</h3>
          <p>Star the recipes you love and come back to them anytime, on any visit.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🎲</span>
          <h3>Feeling adventurous?</h3>
          <p>Hit "Surprise Me" for a random recipe when you can't decide what to cook.</p>
        </div>
      </section>
    </div>
  );
}

export default Landing;