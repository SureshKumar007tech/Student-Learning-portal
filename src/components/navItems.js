// Single source of truth for student-facing navigation (desktop bar + mobile drawer).
export function getNavItems(isAdmin) {
  return [
    { to: "/", label: "Home", icon: "home", end: true },
    { to: "/courses", label: "Courses", icon: "book" },
    { to: "/dashboard", label: "My dashboard", icon: "dashboard" },
    { to: "/resources", label: "Resources", icon: "file-text" },
    { to: "/events", label: "Events", icon: "calendar" },
    { to: "/contact", label: "Help & support", icon: "help-circle" },
    { to: "/about", label: "About", icon: "info" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin console", icon: "shield", admin: true }] : [])
  ];
}
