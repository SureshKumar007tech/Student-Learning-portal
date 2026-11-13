import { Link } from "react-router-dom";
import Icon from "./Icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="portal-footer">
      <div className="footer-inner">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, #2563EB, #06B6D4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white"
                }}
              >
                <Icon name="book" size={16} />
              </div>
              <h3 style={{ margin: 0 }}>Student Learning Portal</h3>
            </div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#94A3B8", maxWidth: "340px", margin: "0 0 16px" }}>
              Enterprise-grade distributed learning management platform designed for university students, faculty, and technical evaluations. Built with React 19, Spring Boot microservices, and stateless JWT authentication.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="badge" style={{ background: "rgba(255,255,255,0.08)", color: "#CBD5E1" }}>
                Java 21 LTS
              </span>
              <span className="badge" style={{ background: "rgba(255,255,255,0.08)", color: "#CBD5E1" }}>
                Spring Boot 4.x
              </span>
              <span className="badge" style={{ background: "rgba(255,255,255,0.08)", color: "#CBD5E1" }}>
                React 19 SPA
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Academics</h4>
            <ul>
              <li><Link to="/courses">Course Catalogue</Link></li>
              <li><Link to="/dashboard">Student Dashboard</Link></li>
              <li><Link to="/resources">Study Resources & Notes</Link></li>
              <li><Link to="/events">Workshops & Hackathons</Link></li>
            </ul>
          </div>

          {/* Examination & Architecture */}
          <div className="footer-col">
            <h4>Engineering</h4>
            <ul>
              <li><Link to="/about">React 19 Syllabus Lab</Link></li>
              <li><Link to="/about">Microservices Architecture</Link></li>
              <li><Link to="/contact">Support & Helpdesk</Link></li>
              <li><Link to="/dashboard">Enrollment Records</Link></li>
            </ul>
          </div>

          {/* Microservices Topology */}
          <div className="footer-col">
            <h4>Microservices Cluster</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8125rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: "var(--radius-sm)" }}>
                <span>API Gateway (Reverse Proxy)</span>
                <span className="service-tag">Port 8080</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: "var(--radius-sm)" }}>
                <span>User & Auth Microservice</span>
                <span className="service-tag">Port 8081</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: "var(--radius-sm)" }}>
                <span>Course & Enrollment Service</span>
                <span className="service-tag">Port 8082</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: "var(--radius-sm)" }}>
                <span>Learning Resource Service</span>
                <span className="service-tag">Port 8083</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: "var(--radius-sm)" }}>
                <span>Engagement & Inquiry Service</span>
                <span className="service-tag">Port 8084</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {currentYear} Student Learning Portal • University Major Project • All Rights Reserved.
          </div>
          <div className="footer-services-strip">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#10B981" }}>
              <span className="pulse-dot" />
              Microservices Cluster Active
            </span>
            <span>•</span>
            <span>Stateless JWT Security</span>
            <span>•</span>
            <span>Spring JDBC Data Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

