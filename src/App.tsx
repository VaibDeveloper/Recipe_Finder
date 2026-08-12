import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";
import Landing from "./pages/Landing";
import RecipeFinder from "./pages/RecipeFinder";
import Favorites from "./pages/Favorites";
import RecipeDetail from "./pages/RecipeDetail";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import LeftoverRescue from "./pages/LeftoverRescue";
import "./App.css";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [surpriseLoading, setSurpriseLoading] = useState(false);

  const handleSurpriseMe = () => {
    if (surpriseLoading) return;
    setSurpriseLoading(true);

    fetch("https://www.themealdb.com/api/json/v1/1/random.php")
      .then((res) => res.json())
      .then((data) => {
        const meal = data.meals[0];
        navigate(`/recipe/${meal.idMeal}`);
      })
      .catch(() => {})
      .finally(() => setSurpriseLoading(false));
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">🍳</span>
        <span className="brand-name">Foodie - Recipe Finder</span>
      </Link>

      <span className="nav-divider" aria-hidden="true"></span>

      <div className="nav-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/recipes"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Explore
        </NavLink>
        <NavLink
          to="/rescue"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Leftover Rescue
        </NavLink>
        <NavLink
          to="/favorites"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Favorites
        </NavLink>
      </div>

      <span className="nav-divider" aria-hidden="true"></span>

      <div className="nav-actions">
        <button
          className="surprise-btn"
          onClick={handleSurpriseMe}
          disabled={surpriseLoading}
        >
          🎲 <span>{surpriseLoading ? "Finding..." : "Surprise Me"}</span>
        </button>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/recipes" element={<RecipeFinder />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/rescue" element={<LeftoverRescue />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
