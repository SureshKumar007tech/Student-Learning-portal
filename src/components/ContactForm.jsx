import { useEffect, useRef, useState } from "react";
import { submitContactInquiry } from "../services/contactService";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import Icon from "./Icons";
import { Alert, PageHeader, Spinner, displayName } from "./ui";

const SUBJECTS = [
  "Course content or enrollment",
  "Study resources",
  "Events and registrations",
  "Account or sign-in",
  "Technical problem with the portal",
  "Something else"
];

const FAQS = [
  {
    q: "Where do I find lecture notes and exercises?",
    a: "Open Resources from the main menu. You can filter by type — lecture notes, exercises, projects or cheat sheets — and download anything you need."
  },
  {
    q: "How do I keep track of my courses?",
    a: "Once you enroll, the course appears on My dashboard. Use the progress slider on each course and select Save to keep your progress up to date."
  },
  {
    q: "Can I register for more than one event?",
    a: "Yes. Reserve a seat at as many events as you like. If plans change, cancel your registration from the Events page so the seat goes to someone else."
  },
  {
    q: "I can't sign in. What should I do?",
    a: "Check that you're using the username or email you registered with. If it still doesn't work, send us a message using the form with the category “Account or sign-in”."
  }
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 500;

function validate(form) {
  const errors = {};
  const name = form.name.trim();
  if (!name) errors.name = "Enter your name.";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters.";
  if (!form.email.trim()) errors.email = "Enter your email so we can reply.";
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = "Enter a valid email address, like name@university.edu.";
  if (!form.message.trim()) errors.message = "Tell us how we can help.";
  else if (form.message.trim().length < 5) errors.message = "Please add a little more detail (at least 5 characters).";
  return errors;
}

export default function ContactForm() {
  // useRef: move focus to the first field with an error (Syllabus: Refs)
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);
  const fieldRefs = { name: nameRef, email: emailRef, message: messageRef };

  const toast = useToast();
  const { user } = useAuth();

  const blankForm = () => ({
    name: user ? displayName(user) : "",
    email: user?.email || "",
    subject: SUBJECTS[0],
    message: ""
  });

  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Prefill when the user signs in while on this page
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || displayName(user),
        email: prev.email || user.email || ""
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    setSubmitError("");
    if (attempted) setErrors(validate(next));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = ["name", "email", "message"].find((k) => found[k]);
      fieldRefs[first]?.current?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await submitContactInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        message: `[${form.subject}] ${form.message.trim()}`
      });
      if (res.success) {
        setSubmitted(true);
        toast.success("We've received your message and will reply by email.", "Message sent");
      } else {
        setSubmitError(res.error || "Your message couldn't be sent. Please try again.");
      }
    } catch {
      setSubmitError("Your message couldn't be sent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(blankForm());
    setErrors({});
    setAttempted(false);
    setSubmitted(false);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const describedBy = (field, extra) =>
    [errors[field] ? `contact-${field}-error` : null, extra].filter(Boolean).join(" ") || undefined;

  const FieldError = ({ field }) =>
    errors[field] ? (
      <span id={`contact-${field}-error`} className="form-error">
        <Icon name="alert-circle" size={12} />
        {errors[field]}
      </span>
    ) : null;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Help & support"
        title="How can we help?"
        lead="Questions about a course, a resource, an event or your account? Send us a message and the student support team will get back to you by email."
      />

      <div className="layout-form">
        <section className="card" aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: 4 }}>
            Send us a message
          </h2>
          <p className="small muted" style={{ marginBottom: 20 }}>All fields are required.</p>

          {submitted ? (
            <div className="stack" role="status">
              <Alert type="success" title="Message sent">
                Thanks, {form.name.split(" ")[0] || "there"}. We've received your message and will reply to{" "}
                <strong>{form.email}</strong>.
              </Alert>
              <button type="button" className="btn btn-secondary" style={{ alignSelf: "flex-start" }} onClick={resetForm}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {submitError && (
                <div style={{ marginBottom: 16 }}>
                  <Alert type="error" title="Your message wasn't sent">
                    {submitError} Your text is still here, so you can try again.
                  </Alert>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">Full name</label>
                  <input
                    id="contact-name"
                    ref={nameRef}
                    className="form-input"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    maxLength={100}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={describedBy("name")}
                    disabled={submitting}
                  />
                  <FieldError field="name" />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    ref={emailRef}
                    className="form-input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    placeholder="name@university.edu"
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={describedBy("email")}
                    disabled={submitting}
                  />
                  <FieldError field="email" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-subject">What's this about?</label>
                <select id="contact-subject" className="form-select" name="subject" value={form.subject} onChange={handleChange} disabled={submitting}>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label className="form-label" htmlFor="contact-message">Message</label>
                  <span id="contact-message-count" className="form-hint" aria-live="polite">
                    {form.message.length} / {MAX_MESSAGE}
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  ref={messageRef}
                  className="form-textarea"
                  rows={6}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  maxLength={MAX_MESSAGE}
                  placeholder="Include the course or event name if your question is about one."
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={describedBy("message", "contact-message-count")}
                  disabled={submitting}
                />
                <FieldError field="message" />
              </div>

              <div className="form-actions" style={{ justifyContent: "flex-start" }}>
                <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting}>
                  {submitting ? <><Spinner /> Sending…</> : <><Icon name="mail" size={16} /> Send message</>}
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="stack-lg" aria-label="Support information">
          <div className="card">
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, marginBottom: 12 }}>Student support</h2>
            <ul className="list-plain small" style={{ color: "var(--text-secondary)", gap: 12 }}>
              <li className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                <Icon name="mail" size={16} style={{ color: "var(--accent-primary-text)", flexShrink: 0 }} />
                <a href="mailto:support@portal.edu">support@portal.edu</a>
              </li>
              <li className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                <Icon name="clock" size={16} style={{ color: "var(--accent-primary-text)", flexShrink: 0 }} />
                <span>Monday to Friday, 9:00 am – 5:00 pm</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, marginBottom: 12 }}>Common questions</h2>
            <div className="stack-sm">
              {FAQS.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={faq.q} className="faq-item">
                    <h3 style={{ margin: 0 }}>
                      <button
                        type="button"
                        className="faq-q"
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${idx}`}
                        id={`faq-btn-${idx}`}
                      >
                        <span>{faq.q}</span>
                        <Icon name="chevron-down" size={16} />
                      </button>
                    </h3>
                    {isOpen && (
                      <div id={`faq-panel-${idx}`} role="region" aria-labelledby={`faq-btn-${idx}`} className="faq-a">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
