import { useCallback, useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useTheme } from "./hooks/ThemeContext";
import { useAuth } from "./hooks/AuthContext";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";

import { fetchCourses, fetchMyEnrollments } from "./services/courseService";
import { fetchResources } from "./services/resourceService";

const PAGE_TITLES = {
  "/": "Home",
  "/courses": "Courses",
  "/dashboard": "My dashboard",
  "/resources": "Study resources",
  "/events": "Events",
  "/contact": "Help & support",
  "/about": "About",
  "/admin": "Admin console"
};

const initialRemote = { status: "loading", data: [], error: null };

function App() {
  const { darkMode } = useTheme();
  const { isAuthenticated, authModalOpen, authModalMode, closeAuthModal } = useAuth();
  const location = useLocation();

  const [courses, setCourses] = useState(initialRemote);
  const [resources, setResources] = useState(initialRemote);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(() => new Set());
  // Level filter is lifted here so it survives navigating between pages.
  const [selectedLevel, setSelectedLevel] = useState("All");

  const loadCourses = useCallback(async () => {
    setCourses((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const data = await fetchCourses();
      setCourses({ status: "ready", data, error: null });
    } catch (err) {
      setCourses({ status: "error", data: [], error: err.message });
    }
  }, []);

  const loadResources = useCallback(async () => {
    setResources((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const data = await fetchResources();
      setResources({ status: "ready", data, error: null });
    } catch (err) {
      setResources({ status: "error", data: [], error: err.message });
    }
  }, []);

  const loadEnrollments = useCallback(async () => {
    if (!isAuthenticated) {
      setEnrolledCourseIds(new Set());
      return;
    }
    try {
      const list = await fetchMyEnrollments();
      setEnrolledCourseIds(new Set(list.map((e) => e.courseId)));
    } catch {
      // Enrollment badges are a convenience; the enroll API still rejects duplicates.
      setEnrolledCourseIds(new Set());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCourses();
    loadResources();
  }, [loadCourses, loadResources]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  // Keep the document title in sync with the current page
  useEffect(() => {
    const page = PAGE_TITLES[location.pathname];
    document.title = page ? `${page} · Student Learning Portal` : "Student Learning Portal";
  }, [location.pathname]);

  // Start each page at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // useMemo: avoid recalculating the filtered list unnecessarily (Syllabus topic 13)
  const filteredCourses = useMemo(() => {
    if (selectedLevel === "All") return courses.data;
    return courses.data.filter((course) => course.level?.toLowerCase() === selectedLevel.toLowerCase());
  }, [selectedLevel, courses.data]);

  const handleEnrolled = useCallback((course) => {
    setEnrolledCourseIds((prev) => new Set(prev).add(course.id));
  }, []);

  const courseProps = {
    coursesState: courses,
    enrolledCourseIds,
    onEnrolled: handleEnrolled,
    onRetry: loadCourses
  };

  const homeElement = (
    <Home
      {...courseProps}
      resourcesState={resources}
      onRetryResources={loadResources}
      onSelectLevel={setSelectedLevel}
    />
  );

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header courses={courses.data} resources={resources.data} />
      <Navbar />

      <main id="main-content" className="main-content" tabIndex={-1}>
        <Breadcrumbs />

        <Routes>
          <Route path="/" element={homeElement} />
          <Route
            path="/courses"
            element={
              <Courses
                {...courseProps}
                filteredCourses={filteredCourses}
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
              />
            }
          />
          <Route
            path="/dashboard"
            element={<Dashboard courses={courses.data} onEnrollmentsChanged={loadEnrollments} />}
          />
          <Route
            path="/resources"
            element={<Resources resourcesState={resources} onRetry={loadResources} />}
          />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/admin"
            element={<AdminDashboard onCatalogChanged={() => { loadCourses(); loadResources(); }} />}
          />
          <Route path="*" element={homeElement} />
        </Routes>
      </main>

      <Footer />

      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} initialMode={authModalMode} />
    </div>
  );
}

export default App;
