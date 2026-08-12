import { Link } from "react-router-dom";
import ScrollVelocityMarquee from "../components/ScrollVelocityMarquee";

const FOOD_IMAGES = [
  {
    src: "https://b.zmtcdn.com/data/o2_assets/110a09a9d81f0e5305041c1b507d0f391743058910.png",
    alt: "Cheeseburger",
    className: "food-img food-img-1",
  },
  {
    src: "https://b.zmtcdn.com/data/o2_assets/b4f62434088b0ddfa9b370991f58ca601743060218.png",
    alt: "Dumplings",
    className: "food-img food-img-2",
  },
  {
    src: "https://b.zmtcdn.com/data/o2_assets/316495f4ba2a9c9d9aa97fed9fe61cf71743059024.png",
    alt: "Pizza slice",
    className: "food-img food-img-3",
  },
  {
    src: "https://b.zmtcdn.com/data/o2_assets/70b50e1a48a82437bfa2bed925b862701742892555.png",
    alt: "Basil leaf",
    className: "food-img food-img-4",
  },
  {
    src: "https://b.zmtcdn.com/data/o2_assets/9ef1cc6ecf1d92798507ffad71e9492d1742892584.png",
    alt: "Tomato slice",
    className: "food-img food-img-5",
  },
  {
    src: "https://b.zmtcdn.com/data/o2_assets/9ef1cc6ecf1d92798507ffad71e9492d1742892584.png",
    alt: "Tomato slice 2",
    className: "food-img food-img-6",
  },
];

const ROW_1 = ["Pizza", "Sushi", "Burger", "Pasta", "Tacos", "Ramen", "Curry", "Steak", "Dim Sum", "Paella"];
const ROW_2 = ["Tiramisu", "Croissant", "Biryani", "Pho", "Risotto", "Gyoza", "Shawarma", "Pad Thai", "Lasagna", "Ceviche"];

function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <svg className="hero-swirl hero-swirl-tl" width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M515.266 181.33C377.943 51.564 128.537 136.256 50.8123 293.565C-26.9127 450.874 125.728 600 125.728 600" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <svg className="hero-swirl hero-swirl-br" width="700" height="700" viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M26.8838 528.274C193.934 689.816 480.051 637.218 594.397 451.983C708.742 266.748 543.953 2.22235 543.953 2.22235" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {FOOD_IMAGES.map((img, i) => (
          <img key={i} src={img.src} alt={img.alt} className={img.className} style={{ animationDelay: `${i * 300}ms` }} />
        ))}

        <div className="hero-content">
          <span className="hero-eyebrow">Discover · Cook · Save</span>
          <h1 className="hero-title">
            Find your next{" "}
            <span className="hero-highlight">favorite meal</span>
          </h1>
          <p className="hero-subtitle">
            Search thousands of recipes from around the world, save the ones
            you love, and never wonder "what's for dinner" again.
          </p>
          <Link to="/recipes" className="explore-btn">
            Explore Recipes
            <span className="explore-btn-arrow">→</span>
          </Link>
        </div>
      </section>

      <ScrollVelocityMarquee row1={ROW_1} row2={ROW_2} />

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