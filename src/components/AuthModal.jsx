import { useState, useEffect } from "react";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import Icon from "./Icons";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const { login, register } = useAuth();
  const toast = useToast();

  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "ROLE_STUDENT"
  });

  useEffect(() => {
    setIsLogin(initialMode === "login");
    setError("");
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please fill in all required credentials.");
      return;
    }

    if (!isLogin && !formData.email.trim()) {
      setError("Email address is required for registration.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(formData.username.trim(), formData.password);
        if (res.success) {
          toast.success(`Welcome back, ${res.data?.firstName || formData.username}!`);
          onClose();
        } else {
          setError(res.error || "Authentication failed. Check your username and password.");
        }
      } else {
        const res = await register({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          firstName: formData.firstName.trim() || "Student",
          lastName: formData.lastName.trim() || "User",
          role: formData.role
        });
        if (res.success) {
          toast.success("Account created successfully! Welcome to Student Portal.");
          onClose();
        } else {
          setError(res.error || "Registration failed. Username or email might already be taken.");
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: "460px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {isLogin ? "Sign In to Learning Portal" : "Create Student Account"}
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              {isLogin
                ? "Enter your credentials to access your dashboard"
                : "Register for course enrollments and study materials"}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", padding: "0 24px" }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            style={{
              flex: 1,
              padding: "12px",
              background: "none",
              border: "none",
              borderBottom: isLogin ? "2px solid var(--accent-primary)" : "2px solid transparent",
              color: isLogin ? "var(--accent-primary)" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            style={{
              flex: 1,
              padding: "12px",
              background: "none",
              border: "none",
              borderBottom: !isLogin ? "2px solid var(--accent-primary)" : "2px solid transparent",
              color: !isLogin ? "var(--accent-primary)" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Register
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div
              style={{
                backgroundColor: "var(--status-error-bg)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "var(--status-error)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8125rem",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <Icon name="x" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                {isLogin ? "Username or Email Address" : "Choose Username *"}
              </label>
              <input
                className="form-input"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={isLogin ? "e.g. student or student@portal.edu" : "e.g. jdoe"}
                required
                autoComplete="username"
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    className="form-input"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@university.edu"
                    required
                    autoComplete="email"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      className="form-input"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Alex"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      className="form-input"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Morgan"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Platform Role</label>
                  <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="ROLE_STUDENT">Student (Full Learner Access)</option>
                    <option value="ROLE_ADMIN">Administrator (Management Console)</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-password-wrapper">
                <input
                  className="form-input"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isLogin ? "Enter your password" : "Min 6 characters"}
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 8 }}
              disabled={loading}
            >
              {loading
                ? "Authenticating with User Microservice..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>
        </div>

        <div className="modal-footer" style={{ justifyContent: "center" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Protected by Stateless JWT • User Service (Port 8081)
          </span>
        </div>
      </div>
    </div>
  );
}
