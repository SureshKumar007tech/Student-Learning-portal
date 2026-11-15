import { Link } from "react-router-dom";
import Icon from "./Icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="brand" aria-label="Student Learning Portal — home">
              <span className="brand-mark">
                <Icon name="graduation" size={20} />
              </span>
              <span className="brand-text">
                <span className="brand-name">Student Portal</span>
                <span className="brand-tagline">Learning hub</span>
              </span>
            </Link>
            <p className="footer-about">
              Your courses, study materials, and campus events in one place — built to help you stay organised
              through the semester.
            </p>
          </div>

          <div className="footer-col">
            <h2>Learn</h2>
            <ul>
              <li><Link to="/courses">Course catalogue</Link></li>
              <li><Link to="/resources">Study resources</Link></li>
              <li><Link to="/events">Events & workshops</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h2>Your account</h2>
            <ul>
              <li><Link to="/dashboard">My dashboard</Link></li>
              <li><Link to="/contact">Help & support</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h2>Portal</h2>
            <ul>
              <li><Link to="/about">About the portal</Link></li>
              <li><Link to="/about#how-it-works">How it's built</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {currentYear} Student Learning Portal</span>
          <span>Questions? <Link to="/contact">Contact student support</Link></span>
        </div>
      </div>
    </footer>
  );
}
