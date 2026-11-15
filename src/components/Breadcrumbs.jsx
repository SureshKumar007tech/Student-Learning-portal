import { Link, useLocation } from "react-router-dom";

const ROUTE_NAMES = {
  courses: "Courses",
  resources: "Study resources",
  events: "Events",
  dashboard: "My dashboard",
  admin: "Admin console",
  contact: "Help & support",
  about: "About"
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  // Not shown on home or on unknown routes (which render the home page)
  if (pathnames.length === 0 || !ROUTE_NAMES[pathnames[0].toLowerCase()]) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumbs">
        <li>
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const name = ROUTE_NAMES[value.toLowerCase()] || decodeURIComponent(value);
          return (
            <li key={to} style={{ display: "inline-flex", gap: 6 }}>
              <span className="breadcrumb-sep" aria-hidden="true">/</span>
              {isLast ? <span aria-current="page">{name}</span> : <Link to={to}>{name}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
