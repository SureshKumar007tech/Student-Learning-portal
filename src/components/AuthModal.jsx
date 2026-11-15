import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import Icon from "./Icons";
import Modal from "./Modal";
import { Alert, Spinner } from "./ui";

const EMPTY_FORM = { username: "", email: "", password: "", firstName: "", lastName: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form, isLogin) {
  const errors = {};
  if (isLogin) {
    if (!form.username.trim()) errors.username = "Enter your username or email.";
    if (!form.password) errors.password = "Enter your password.";
    return errors;
  }
  if (!form.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!form.lastName.trim()) errors.lastName = "Enter your last name.";
  if (form.username.trim().length < 3) errors.username = "Username must be at least 3 characters.";
  else if (form.username.trim().length > 50) errors.username = "Username must be 50 characters or fewer.";
  if (!EMAIL_RE.test(form.email.trim())) errors.email = "Enter a valid email address, like name@university.edu.";
  if (form.password.length < 6) errors.password = "Password must be at least 6 characters.";
  return errors;
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const { login, register } = useAuth();
  const toast = useToast();

  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === "login");
      setError("");
      setFieldErrors({});
      setSubmitted(false);
      setShowPassword(false);
    }
  }, [initialMode, isOpen]);

  const switchMode = (login) => {
    setIsLogin(login);
    setError("");
    setFieldErrors({});
    setSubmitted(false);
  };

  const handleChange = (e) => {
    const next = { ...formData, [e.target.name]: e.target.value };
    setFormData(next);
    setError("");
    if (submitted) setFieldErrors(validate(next, isLogin));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    const errors = validate(formData, isLogin);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstField = Object.keys(errors)[0];
      document.getElementById(`auth-${firstField}`)?.focus();
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await login(formData.username.trim(), formData.password);
        if (res.success) {
          toast.success(`Welcome back, ${res.data?.firstName || formData.username}.`, "Signed in");
          setFormData(EMPTY_FORM);
          onClose();
        } else {
          setError(res.error || "We couldn't sign you in. Check your details and try again.");
        }
      } else {
        const res = await register({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim()
        });
        if (res.success) {
          toast.success("Your student account is ready.", "Account created");
          setFormData(EMPTY_FORM);
          onClose();
        } else {
          setError(res.error || "We couldn't create your account. The username or email may already be in use.");
        }
      }
    } catch (err) {
      setError(err.message || "Something unexpected happened. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldProps = (name) => ({
    id: `auth-${name}`,
    name,
    value: formData[name],
    onChange: handleChange,
    className: "form-input",
    "aria-invalid": fieldErrors[name] ? true : undefined,
    "aria-describedby": fieldErrors[name] ? `auth-${name}-error` : undefined,
    disabled: loading
  });

  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <span id={`auth-${name}-error`} className="form-error">
        <Icon name="alert-circle" size={12} />
        {fieldErrors[name]}
      </span>
    ) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={isLogin ? "Welcome back" : "Create your student account"}
      subtitle={
        isLogin
          ? "Sign in to see your courses, progress and event registrations."
          : "Enroll in courses, track your progress and register for events."
      }
      closeDisabled={loading}
    >
      <div style={{ padding: "0 24px" }}>
        <div className="tab-list" role="tablist" aria-label="Account options">
          <button
            type="button"
            role="tab"
            id="auth-tab-login"
            className="tab"
            aria-selected={isLogin}
            aria-controls="auth-panel"
            onClick={() => switchMode(true)}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            id="auth-tab-register"
            className="tab"
            aria-selected={!isLogin}
            aria-controls="auth-panel"
            onClick={() => switchMode(false)}
          >
            Create account
          </button>
        </div>
      </div>

      <div
        className="modal-body"
        id="auth-panel"
        role="tabpanel"
        aria-labelledby={isLogin ? "auth-tab-login" : "auth-tab-register"}
        style={{ paddingTop: 20 }}
      >
        {error && (
          <div style={{ marginBottom: 16 }}>
            <Alert type="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="auth-firstName">First name</label>
                <input {...fieldProps("firstName")} autoComplete="given-name" />
                <FieldError name="firstName" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="auth-lastName">Last name</label>
                <input {...fieldProps("lastName")} autoComplete="family-name" />
                <FieldError name="lastName" />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-username">
              {isLogin ? "Username or email" : "Username"}
            </label>
            <input {...fieldProps("username")} autoComplete="username" autoCapitalize="none" spellCheck="false" />
            {!isLogin && !fieldErrors.username && <span className="form-hint">3–50 characters. You'll use this to sign in.</span>}
            <FieldError name="username" />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email</label>
              <input {...fieldProps("email")} type="email" autoComplete="email" placeholder="name@university.edu" />
              <FieldError name="email" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <div className="input-with-action">
              <input
                {...fieldProps("password")}
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
              </button>
            </div>
            {!isLogin && !fieldErrors.password && <span className="form-hint">At least 6 characters.</span>}
            <FieldError name="password" />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} aria-busy={loading} style={{ marginTop: 4 }}>
            {loading ? (
              <>
                <Spinner /> {isLogin ? "Signing in…" : "Creating account…"}
              </>
            ) : isLogin ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="small muted" style={{ textAlign: "center", marginTop: 16 }}>
          {isLogin ? "New to the portal? " : "Already have an account? "}
          <button type="button" className="text-link" onClick={() => switchMode(!isLogin)}>
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </Modal>
  );
}
