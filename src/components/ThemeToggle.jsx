import { useTheme } from "../hooks/ThemeContext";

function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button className="secondary" onClick={toggleTheme}>
      {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}

export default ThemeToggle;