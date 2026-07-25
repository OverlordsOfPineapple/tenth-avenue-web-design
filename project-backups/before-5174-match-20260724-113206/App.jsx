import { useEffect, useState } from "react";

const navigation = [
  ["services", "Services"],
  ["portfolio", "Portfolio"],
  ["about", "About"],
  ["process", "Process"],
  ["contact", "Contact"],
];

const features = [
  {
    icon: "⚡",
    title: "Fast Loading",
    text: "Optimised for speed",
  },
  {
    icon: "▣",
    title: "Fully Responsive",
    text: "Perfect on every device",
  },
  {
    icon: "◆",
    title: "SEO Optimised",
    text: "Rank higher, get found",
  },
  {
    icon: "</>",
    title: "Clean Code",
    text: "Built for performance",
  },
];

const modalContent = {
  services: {
    eyebrow: "What we do",
    title: "Web design and development",
    text: "Premium websites with bold visual design, responsive layouts, clean code, lead capture and reliable performance.",
  },
  portfolio: {
    eyebrow: "Selected work",
    title: "Websites designed to perform",
    text: "Our portfolio will showcase polished business websites, landing pages, online stores and custom digital experiences.",
  },
  about: {
    eyebrow: "About us",
    title: "Bold websites without the bloat",
    text: "Tenth Avenue Web Design creates clean, fast and memorable websites for businesses that want to stand out online.",
  },
  process: {
    eyebrow: "How it works",
    title: "From first idea to launch",
    text: "We plan the project, establish the visual direction, build the frontend and backend, test everything and prepare it for launch.",
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

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
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

            {submitted ? (
              <div className="success-message">
                <strong>Thanks—your message is ready.</strong>
                <p>
                  The form interface is working. Backend delivery will be
                  connected during the next build phase.
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
                  Business
                  <input name="business" autoComplete="organization" />
                </label>

                <label>
                  Project details
                  <textarea name="details" rows="5" required />
                </label>

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

        <nav className={menuOpen ? "site-nav site-nav-open" : "site-nav"}>
          <button
            className="active"
            type="button"
            onClick={() => {
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Home
          </button>

          {navigation.map(([key, label]) => (
            <button key={key} type="button" onClick={() => openModal(key)}>
              {label}
            </button>
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
              Premium web design
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
              Custom websites designed to impress, built to perform, and
              engineered to convert visitors into enquiries.
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
