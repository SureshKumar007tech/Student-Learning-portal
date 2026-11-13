import { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useTheme } from "./hooks/ThemeContext";
import { useAuth } from "./hooks/AuthContext";
import { useToast } from "./hooks/ToastContext";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";
import FocusDemo from "./components/FocusDemo";
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

import { fetchCourses, FALLBACK_COURSES } from "./services/courseService";
import { fetchResources, FALLBACK_RESOURCES } from "./services/resourceService";

function App() {
  const { darkMode } = useTheme();
  const { authModalOpen, authModalMode, closeAuthModal } = useAuth();
  const toast = useToast();

  const [coursesList, setCoursesList] = useState(FALLBACK_COURSES);
  const [resourcesList, setResourcesList] = useState(FALLBACK_RESOURCES);
  const [selectedCourse, setSelectedCourse] = useState("All");

  useEffect(() => {
    fetchCourses().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setCoursesList(data);
      }
    });

    fetchResources().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setResourcesList(data);
      }
    });
  }, []);

  // useMemo: avoid recalculating the filtered list unnecessarily (Syllabus topic 13)
  const filteredCourses = useMemo(() => {
    if (selectedCourse === "All") return coursesList;
    return coursesList.filter((course) => course.level === selectedCourse);
  }, [selectedCourse, coursesList]);

  const handleCourseClick = (course) => {
    setSelectedCourse(course.level || "All");
    toast.info(`Selected "${course.title}". Level filter synchronized to ${course.level}.`);
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <Header />
      <Navbar />

      <main className="main-content">
        <Breadcrumbs />

        <Routes>
          <Route
            path="/"
            element={
              <Home
                courses={filteredCourses}
                resources={resourcesList}
                onCourseClick={handleCourseClick}
              />
            }
          />
          <Route
            path="/courses"
            element={
              <Courses
                courses={filteredCourses}
                onCourseClick={handleCourseClick}
              />
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/resources"
            element={<Resources resources={resourcesList} />}
          />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="*"
            element={
              <Home
                courses={filteredCourses}
                resources={resourcesList}
                onCourseClick={handleCourseClick}
              />
            }
          />
        </Routes>

        <FocusDemo />
      </main>

      <Footer />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default App;
