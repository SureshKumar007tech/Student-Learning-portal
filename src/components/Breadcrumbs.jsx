import { Link, useLocation } from "react-router-dom";
import Icon from "./Icons";

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) {
    return null; // Don't show on home page
  }

  const routeNameMap = {
    courses: "Course Catalogue",
    resources: "Learning Resources",
    events: "Academic Events",
    dashboard: "Student Dashboard",
    admin: "Admin Console",
    contact: "Support & Inquiries",
    about: "Architecture & Viva Lab"
  };

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs-bar">
      <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Icon name="book" size={14} />
        Home
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[value.toLowerCase()] || decodeURIComponent(value);

        return (
          <span key={to} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span className="breadcrumb-separator">/</span>
            {isLast ? (
              <span className="breadcrumb-current" aria-current="page">
                {displayName}
              </span>
            ) : (
              <Link to={to}>{displayName}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

