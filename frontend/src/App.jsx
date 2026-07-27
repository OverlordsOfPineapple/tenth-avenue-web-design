import { useEffect, useState } from "react";

const navigation = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/process", label: "Process" },
  { href: "/contact", label: "Contact" },
];

function LightningFeatureIcon() {
  return (
    <svg
      className="lightning-feature-icon"
      viewBox="0 0 28 36"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16.7 1 4 20.2h8.8L10.5 35 24 15.2h-9L16.7 1Z" />
    </svg>
  );
}

const features = [
  {
    icon: <LightningFeatureIcon />,
    title: "Fast Loading",
    text: "Quick by design",
  },
  {
    icon: "▣",
    title: "Fully Responsive",
    text: "Natural on every screen",
  },
  {
    icon: "◆",
    title: "SEO Optimised",
    text: "Built to be discovered",
  },
  {
    icon: "</>",
    title: "Clean Code",
    text: "Made to last",
  },
];

const modalContent = {
  services: {
    eyebrow: "Capabilities",
    title: "Design with restraint. Development without compromise.",
    text: "Every element has a reason to be there. We combine clear visual thinking, responsive development and sound technical foundations to make websites that feel effortless to use.",
  },
  portfolio: {
    eyebrow: "Selected work",
    title: "Composed on the surface. Considered underneath.",
    text: "We favour strong ideas, quiet detail and interfaces that reward attention without demanding it. Client work is shared where permissions allow; private projects can be discussed directly.",
  },
  about: {
    eyebrow: "Independent studio",
    title: "Small by design. Serious about the details.",
    text: "Tenth Avenue is a focused web design practice for businesses that value clarity, character and dependable execution. You deal directly with the person shaping and building the work.",
  },
  process: {
    eyebrow: "A deliberate process",
    title: "Clear decisions. Careful execution. No theatre.",
    text: "We define the right problem, establish a strong direction and move through design and development with purpose. Communication stays direct and the work stays grounded in what the business needs.",
  },
};

function AnimatedText({ children, offset = 0, className = "" }) {
  return (
    <span className={`animated-text ${className}`} aria-label={children}>
      {[...children].map((character, index) => (
        <span
          className="animated-character"
          aria-hidden="true"
          key={`${character}-${index}`}
          style={{ "--character-index": index + offset }}
        >
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </span>
  );
}

function Modal({ type, onClose, submitted, setSubmitted }) {
  const content = modalContent[type];

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const endpoint = type === "quote" ? "/api/quote" : "/api/contact";
    const payload =
      type === "quote"
        ? { ...data, details: data.details }
        : { ...data, message: data.details };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to send enquiry.");
      form.reset();
      setSubmitted(true);
    } catch (error) {
      window.alert(`${error.message} Please call (+61) 430 535 096.`);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          className="modal-close"
          type="button"
          aria-label="Close window"
          onClick={onClose}
        >
          ×
        </button>

        {type === "quote" || type === "contact" ? (
          <>
            <p className="eyebrow">
              {type === "quote" ? "Start a project" : "Contact"}
            </p>

            <h2 id="modal-title">
              {type === "quote"
                ? "Tell us about your website"
                : "Let’s build something great"}
            </h2>

            <p className="modal-copy">
              {type === "quote"
                ? "Share your goals, required features and preferred launch window. We’ll translate the brief into a clear technical roadmap."
                : "Tell us what you’re building, upgrading or trying to automate. We’ll help define the right design, platform and implementation path."}
            </p>

            {submitted ? (
              <div className="success-message">
                <strong>Thanks—your enquiry has been received.</strong>
                <p>
                  We’ll review your project details and get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <label>
                  Name
                  <input name="name" autoComplete="name" required />
                </label>

                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>


                <label>
                  Phone
                  <input name="phone" type="tel" autoComplete="tel" />
                </label>

                <label>
                  Business
                  <input name="business" autoComplete="organization" />
                </label>

                <label>
                  Project details
                  <textarea name="details" rows="5" required />
                </label>
                <div className="form-honeypot" aria-hidden="true">
                  <label>
                    Website
                    <input
                      name="website"
                      tabIndex="-1"
                      autoComplete="off"
                    />
                  </label>
                </div>


                <button className="button button-primary" type="submit">
                  Send enquiry <span aria-hidden="true">→</span>
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2 id="modal-title">{content.title}</h2>
            <p className="modal-copy">{content.text}</p>

            <button
              className="button button-primary"
              type="button"
              onClick={() => {
                setSubmitted(false);
                window.dispatchEvent(
                  new CustomEvent("open-tenth-avenue-quote"),
                );
              }}
            >
              Start a project <span aria-hidden="true">→</span>
            </button>
          </>
        )}
      </section>
    </div>
  );
}

export default function App() {
  const [modal, setModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function openModal(type) {
    setSubmitted(false);
    setMenuOpen(false);
    setModal(type);
  }

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setModal(null);
        setMenuOpen(false);
      }
    }

    function openQuote() {
      setSubmitted(false);
      setModal("quote");
    }

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("open-tenth-avenue-quote", openQuote);

    document.body.style.overflow = modal ? "hidden" : "";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("open-tenth-avenue-quote", openQuote);
      document.body.style.overflow = "";
    };
  }, [modal]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <button
          className="brand"
          type="button"
          aria-label="Tenth Avenue Web Design home"
          onClick={() => {
            setMenuOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="brand-mark" aria-hidden="true">
            X
          </span>

          <span className="brand-copy">
            <strong>Tenth Avenue</strong>
            <small>Web Design</small>
          </span>
        </button>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
        </button>

        <nav
          className={menuOpen ? "site-nav site-nav-open" : "site-nav"}
          aria-label="Primary navigation"
        >
          <a className="active" href="/" onClick={() => setMenuOpen(false)}>
            Home
          </a>

          {navigation.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>

        <button
          className="header-quote"
          type="button"
          onClick={() => openModal("quote")}
        >
          Get a quote <span aria-hidden="true">→</span>
        </button>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-photograph" aria-hidden="true" />

          <div className="hero-content">
            <p className="eyebrow hero-eyebrow">
              <span aria-hidden="true" />
              Independent web design · Central Coast
            </p>

            <h1 id="hero-title">
              <span className="headline-line">
                <AnimatedText offset={0}>WE BUILD</AnimatedText>
              </span>

              <span className="headline-line">
                <AnimatedText offset={8}>WEBSITES THAT</AnimatedText>
              </span>

              <span className="headline-line">
                <AnimatedText offset={21} className="headline-accent">
                  DRIVE BUSINESS
                </AnimatedText>
              </span>
            </h1>

            <p className="hero-description">
              Fast, responsive websites for businesses in Budgewoi, across the
              Central Coast and throughout Australia—built to look sharp,
              perform reliably and turn visitors into enquiries.
            </p>

            <div className="hero-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={() => openModal("quote")}
              >
                Get a quote <span aria-hidden="true">→</span>
              </button>

              <button
                className="button button-secondary"
                type="button"
                onClick={() => openModal("portfolio")}
              >
                <span className="play-icon" aria-hidden="true">
                  ▶
                </span>
                View work
              </button>
            </div>
            <a
              className="hero-phone"
              href="tel:+61430535096"
              aria-label="Call Tenth Avenue Web Design on (+61) 430 535 096"
            >
              (+61) 430 535 096
            </a>

          </div>

          <div className="feature-strip" aria-label="Website benefits">
            {features.map((feature) => (
              <article className="feature" key={feature.title}>
                <span className="feature-icon" aria-hidden="true">
                  {feature.icon}
                </span>

                <span>
                  <strong>{feature.title}</strong>
                  <small>{feature.text}</small>
                </span>
              </article>
            ))}
          </div>
        </section>
      </main>
      {modal && (
        <Modal
          type={modal}
          submitted={submitted}
          setSubmitted={setSubmitted}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
