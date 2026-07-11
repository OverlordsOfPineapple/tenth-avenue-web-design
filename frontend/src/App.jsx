import { useEffect, useState } from "react";

const services = {
  design: {
    title: "Web Design",
    text: "Distinctive, responsive websites designed around your brand, audience and business goals.",
  },
  development: {
    title: "Web Development",
    text: "Fast, accessible and scalable websites built with dependable modern technology.",
  },
  ecommerce: {
    title: "E-Commerce",
    text: "Professional online stores with product management, payments and conversion-focused design.",
  },
  seo: {
    title: "SEO & Performance",
    text: "Technical optimisation, metadata and performance improvements that help customers find you.",
  },
};

const information = {
  about: {
    eyebrow: "Who we are",
    title: "About Tenth Avenue",
    text: "Tenth Avenue Web Design creates bold, high-performing websites for businesses that want to make a memorable impression online.",
  },
  process: {
    eyebrow: "How it works",
    title: "Our Process",
    text: "We plan the project, design the experience, build the website, test every important interaction and prepare everything for launch.",
  },
};

function Hotspot({ className, label, onClick }) {
  return (
    <button
      type="button"
      className={`hotspot ${className}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <span>{label}</span>
    </button>
  );
}

export default function App() {
  const [modal, setModal] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const openModal = (value) => {
    setSubmitted(false);
    setModal(value);
  };

  const closeModal = () => {
    setModal(null);
    setSubmitted(false);
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.body.style.overflow = modal ? "hidden" : "";

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [modal]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const modalContent =
    modal?.type === "service"
      ? {
          eyebrow: "Our services",
          ...services[modal.service],
        }
      : modal?.type === "information"
        ? information[modal.section]
        : null;

  return (
    <main className="prototype-page">
      <div className="website-canvas">
        <img
          className="website-image"
          src="/tenth-avenue-home.png"
          alt="Tenth Avenue Web Design homepage featuring a black Lamborghini Countach with neon pink branding"
        />

        <Hotspot
          className="nav-home"
          label="Home"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />

        <Hotspot
          className="nav-services"
          label="Services"
          onClick={() =>
            openModal({
              type: "service",
              service: "design",
            })
          }
        />

        <Hotspot
          className="nav-portfolio"
          label="Portfolio"
          onClick={() => openModal({ type: "portfolio" })}
        />

        <Hotspot
          className="nav-about"
          label="About"
          onClick={() =>
            openModal({
              type: "information",
              section: "about",
            })
          }
        />

        <Hotspot
          className="nav-process"
          label="Process"
          onClick={() =>
            openModal({
              type: "information",
              section: "process",
            })
          }
        />

        <Hotspot
          className="nav-contact"
          label="Contact"
          onClick={() => openModal({ type: "contact" })}
        />

        <Hotspot
          className="top-quote"
          label="Get a quote"
          onClick={() => openModal({ type: "quote" })}
        />

        <Hotspot
          className="hero-quote"
          label="Get a quote"
          onClick={() => openModal({ type: "quote" })}
        />

        <Hotspot
          className="hero-work"
          label="View our work"
          onClick={() => openModal({ type: "portfolio" })}
        />

        <Hotspot
          className="service-design"
          label="Learn more about web design"
          onClick={() =>
            openModal({
              type: "service",
              service: "design",
            })
          }
        />

        <Hotspot
          className="service-development"
          label="Learn more about web development"
          onClick={() =>
            openModal({
              type: "service",
              service: "development",
            })
          }
        />

        <Hotspot
          className="service-ecommerce"
          label="Learn more about e-commerce"
          onClick={() =>
            openModal({
              type: "service",
              service: "ecommerce",
            })
          }
        />

        <Hotspot
          className="service-seo"
          label="Learn more about SEO and performance"
          onClick={() =>
            openModal({
              type: "service",
              service: "seo",
            })
          }
        />

        <Hotspot
          className="chat-button"
          label="Chat with Tenth Avenue"
          onClick={() => openModal({ type: "contact" })}
        />
      </div>

      {modal && (
        <div className="modal-backdrop" onMouseDown={closeModal}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close dialog"
              onClick={closeModal}
            >
              ×
            </button>

            {modalContent && (
              <>
                <p className="modal-eyebrow">{modalContent.eyebrow}</p>
                <h2 id="modal-title">{modalContent.title}</h2>
                <p className="modal-copy">{modalContent.text}</p>

                <button
                  className="pink-button"
                  type="button"
                  onClick={() => openModal({ type: "quote" })}
                >
                  Start a project →
                </button>
              </>
            )}

            {modal.type === "portfolio" && (
              <>
                <p className="modal-eyebrow">Selected work</p>
                <h2 id="modal-title">Our Portfolio</h2>

                <div className="portfolio-list">
                  <article>
                    <span>01</span>
                    <div>
                      <h3>Premium Business Website</h3>
                      <p>
                        Brand strategy, responsive design and lead generation.
                      </p>
                    </div>
                  </article>

                  <article>
                    <span>02</span>
                    <div>
                      <h3>E-Commerce Store</h3>
                      <p>
                        Product catalogue, checkout and sales optimisation.
                      </p>
                    </div>
                  </article>

                  <article>
                    <span>03</span>
                    <div>
                      <h3>Custom Web Application</h3>
                      <p>
                        Secure dashboards, forms and business automation.
                      </p>
                    </div>
                  </article>
                </div>
              </>
            )}

            {(modal.type === "quote" || modal.type === "contact") && (
              <>
                <p className="modal-eyebrow">
                  {modal.type === "quote" ? "Start your project" : "Let's talk"}
                </p>

                <h2 id="modal-title">
                  {modal.type === "quote"
                    ? "Get a Quote"
                    : "Contact Tenth Avenue"}
                </h2>

                {submitted ? (
                  <div className="success-message">
                    <strong>Message received.</strong>
                    <p>
                      The frontend interaction is working. Backend delivery will
                      be connected in the next milestone.
                    </p>
                  </div>
                ) : (
                  <form className="project-form" onSubmit={handleSubmit}>
                    <label>
                      Name
                      <input name="name" required autoFocus />
                    </label>

                    <label>
                      Email
                      <input name="email" type="email" required />
                    </label>

                    {modal.type === "quote" && (
                      <>
                        <label>
                          Project type
                          <select name="projectType" defaultValue="" required>
                            <option value="" disabled>
                              Select a service
                            </option>
                            <option>Business website</option>
                            <option>E-commerce website</option>
                            <option>Website redesign</option>
                            <option>SEO and performance</option>
                            <option>Custom web application</option>
                          </select>
                        </label>

                        <label>
                          Budget
                          <select name="budget" defaultValue="">
                            <option value="">Select a budget</option>
                            <option>Under $2,000</option>
                            <option>$2,000–$5,000</option>
                            <option>$5,000–$10,000</option>
                            <option>$10,000+</option>
                          </select>
                        </label>
                      </>
                    )}

                    <label>
                      Message
                      <textarea
                        name="message"
                        rows="5"
                        required
                        placeholder="Tell us about your project..."
                      />
                    </label>

                    <button className="pink-button" type="submit">
                      Send request →
                    </button>
                  </form>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
