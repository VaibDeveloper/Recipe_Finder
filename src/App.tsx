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
import { useEffect, useState, useRef } from "react";

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navbarWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const mediaQuery = window.matchMedia("(max-width: 640px)");

  const setupObserver = () => {
    const navbarWrapper = navbarWrapperRef.current;

    if (!navbarWrapper) return;

    if (mediaQuery.matches) {
      setIsScrolled(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(navbarWrapper);

    return () => observer.disconnect();
  };

  let cleanup = setupObserver();

  const handleChange = () => {
    cleanup?.();
    cleanup = setupObserver();
  };

  mediaQuery.addEventListener("change", handleChange);

  return () => {
    cleanup?.();
    mediaQuery.removeEventListener("change", handleChange);
  };
}, []);


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
    <div className="navbar-wrapper" ref={navbarWrapperRef}>
      <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
        <Link to="/" className="brand">
          <img
            src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
            alt="Foodie logo"
            className="brand-logo"
          />
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
    </div>
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