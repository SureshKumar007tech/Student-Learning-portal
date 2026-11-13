# Syllabus Mapping

| Topic | Where demonstrated |
|---|---|
| Foundation of React | `main.jsx`, `App.jsx` |
| JSX | All React components |
| Components | `components/` and `pages/` |
| Events | `onClick`, `onChange`, `onSubmit` |
| Forms | `ContactForm.jsx` |
| Refs | `useRef` in ContactForm and FocusDemo |
| Styling React | `styles.css`, conditional dark class |
| Routing | `react-router-dom` in App.jsx |
| Rules of Hooks | Hooks only at component/custom-hook top level |
| useState | Forms, theme, counter, filters |
| useEffect | document title, logging, localStorage |
| useContext | `ThemeContext.jsx` and `ThemeToggle.jsx` |
| useMemo | Course filtering in App.jsx |
| useRef | Focus input/name field |
| Custom Hooks | `useGreeting`, `useLocalStorage` |
| useDebugValue | Both custom hooks |
| Finding/Using Custom Hooks | Custom hooks imported and used in About.jsx |

## Important viva flow

User opens portal → React renders `App` → Router selects a page → Components render JSX → user actions trigger events → state updates cause re-render → effects run when dependencies change → refs directly access DOM elements → context shares theme state → custom hooks package reusable logic.
