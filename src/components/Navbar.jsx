import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { getNavItems } from "./navItems";
import Icon from "./Icons";

/** Desktop primary navigation row. On small screens the Header's drawer takes over. */
export default function Navbar() {
  const { isAdmin } = useAuth();
  const items = getNavItems(isAdmin);

  return (
    <nav className="primary-nav" aria-label="Main">
      <div className="container">
        <ul className="primary-nav-list">
          {items.map((item) => (
            <li key={item.to} className={item.admin ? "push-right" : undefined}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
