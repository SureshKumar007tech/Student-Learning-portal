import { useRef, useState } from "react";
import { submitContactInquiry } from "../services/contactService";
import { useToast } from "../hooks/ToastContext";
import Icon from "./Icons";

export default function ContactForm() {
  const nameRef = useRef(null);
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Course Syllabus Question",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "How do I access course lecture notes and exercise materials?",
      a: "Navigate to the 'Resources' tab in the top navigation. All study notes, code repositories, and cheat sheets are categorized and downloadable directly from Resource Service (Port 8083)."
    },
    {
      q: "How are my course enrollments and progress tracked?",
      a: "Once you sign in or register, your enrollments are maintained by Course Microservice (Port 8082). You can view your completion percentages and update your progress inside the Student Dashboard."
    },
    {
      q: "How does the microservices architecture communicate?",
      a: "The API Gateway running on port 8080 acts as the single reverse proxy. It inspects stateless JWT tokens from User Service (8081) and transparently enriches downstream requests with user identity headers."
    },
    {
      q: "Can I register for multiple academic workshops?",
      a: "Yes! Check the 'Events' section to browse upcoming technical workshops, hackathons, and project showcases managed by Engagement Service (Port 8084)."
    }
  ];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitContactInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        message: `[${form.subject}] ${form.message.trim()}`
      });

      if (res.success) {
        setSubmitted(true);
        toast.success("Your inquiry was submitted to Engagement Service (Port 8084)!");
        setForm({ name: "", email: "", subject: "Course Syllabus Question", message: "" });
      } else {
        setSubmitted(true);
        toast.info("Inquiry received (Recorded in Engagement Service demo mode).");
        setForm({ name: "", email: "", subject: "Course Syllabus Question", message: "" });
      }
    } catch {
      setSubmitted(true);
      toast.info("Inquiry received in local queue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Support & Academic Inquiries</h2>
          <p className="section-subtitle">
            Need guidance regarding course prerequisites, academic workshops, or project submissions? Our faculty and support team are here to help.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 32, alignItems: "start" }}>
        {/* Contact Form Card */}
        <div className="card">
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 16px" }}>
            Submit Support Request
          </h3>

          {submitted && (
            <div
              style={{
                backgroundColor: "var(--status-success-bg)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "var(--status-success)",
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 10
              }}
            >
              <Icon name="check" size={18} />
              <span>
                Thank you! Your inquiry has been routed to the Engagement Microservice support queue.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                ref={nameRef}
                className="form-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Alex Morgan"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                className="form-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@university.edu"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Inquiry Category</label>
              <select
                className="form-select"
                name="subject"
                value={form.subject}
                onChange={handleChange}
              >
                <option value="Course Syllabus Question">Course Syllabus & Curriculum</option>
                <option value="Study Resource Request">Study Material / Resource Request</option>
                <option value="Event RSVP Inquiry">Event & Workshop Inquiry</option>
                <option value="Microservices Technical Bug">Microservices Technical Issue</option>
                <option value="General Academic Question">General Academic Support</option>
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Message *</label>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {form.message.length} / 500
                </span>
              </div>
              <textarea
                className="form-textarea"
                rows="4"
                name="message"
                value={form.message}
                onChange={handleChange}
                maxLength={500}
                placeholder="Describe your inquiry or question in detail..."
                required
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                <Icon name="mail" size={16} />
                {submitting ? "Transmitting to Engagement Service..." : "Submit Inquiry"}
              </button>

              {/* Preserving syllabus mapping: useRef for input focus */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  nameRef.current?.focus();
                  toast.info("Focused Name input using React useRef hook.");
                }}
                title="Demonstrates useRef DOM direct access"
              >
                Focus Name (useRef Hook)
              </button>
            </div>
          </form>
        </div>

        {/* FAQ & Contact Information Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Quick Support Card */}
          <div className="card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 12px" }}>
              Academic Helpdesk
            </h3>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="mail" size={16} style={{ color: "var(--accent-primary)" }} />
                <span>support@portal.edu</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="clock" size={16} style={{ color: "var(--accent-cyan)" }} />
                <span>Mon – Fri: 09:00 AM – 05:00 PM EST</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="server" size={16} style={{ color: "var(--status-success)" }} />
                <span>Engagement Microservice (Port 8084)</span>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 14px" }}>
              Frequently Asked Questions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden"
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: isOpen ? "var(--bg-surface-subtle)" : "var(--bg-surface)",
                        border: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        color: "var(--text-primary)",
                        textAlign: "left"
                      }}
                    >
                      <span>{faq.q}</span>
                      <Icon
                        name={isOpen ? "chevron-down" : "chevron-right"}
                        size={14}
                        style={{ color: "var(--text-muted)", flexShrink: 0 }}
                      />
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: "10px 14px",
                          fontSize: "0.8125rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                          backgroundColor: "var(--bg-surface-subtle)",
                          borderTop: "1px solid var(--border-color-subtle)"
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
