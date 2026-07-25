import { useEffect, useState } from "react";

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
      if (event.key === "Escape") closeModal();
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

  return (
    <main className="prototype-page">
      <div className="website-canvas">
        <img
          className="website-image"
          src="/tenth-avenue-home.png"
          alt="Tenth Avenue Web Design homepage featuring a black Lamborghini Countach with neon pink branding"
        />

        <Hotspot className="nav-home" label="Home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
        <Hotspot className="nav-services" label="Services" onClick={() => openModal({ type: "services" })} />
        <Hotspot className="nav-portfolio" label="Portfolio" onClick={() => openModal({ type: "portfolio" })} />
        <Hotspot className="nav-about" label="About" onClick={() => openModal({ type: "about" })} />
        <Hotspot className="nav-process" label="Process" onClick={() => openModal({ type: "process" })} />
        <Hotspot className="nav-contact" label="Contact" onClick={() => openModal({ type: "contact" })} />
        <Hotspot className="top-quote" label="Get a quote" onClick={() => openModal({ type: "quote" })} />
        <Hotspot className="hero-quote" label="Get a quote" onClick={() => openModal({ type: "quote" })} />
        <Hotspot className="hero-work" label="View our work" onClick={() => openModal({ type: "portfolio" })} />
      </div>

      {modal && (
        <div className="modal-backdrop" onMouseDown={closeModal}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" type="button" onClick={closeModal}>×</button>

            {modal.type === "services" && <div><h2>Our Services</h2><p>Web Design, Development, SEO & Performance.</p></div>}
            {modal.type === "portfolio" && <div><h2>Our Portfolio</h2><p>Premium Business Websites, E-Commerce, Custom Applications.</p></div>}
            {modal.type === "about" && <div><h2>About Tenth Avenue</h2><p>Tenth Avenue Web Design creates bold, high-performing websites.</p></div>}
            {modal.type === "process" && <div><h2>Our Process</h2><p>We plan, design, build, test and launch your website.</p></div>}
            {(modal.type === "quote" || modal.type === "contact") && (
              <div>
                <h2>{modal.type === "quote" ? "Get a Quote" : "Contact Us"}</h2>
                <form className="project-form" onSubmit={handleSubmit}>
                  <label>Name <input name="name" required autoFocus /></label>
                  <label>Email <input name="email" type="email" required /></label>
                  <label>Message <textarea name="message" rows="5" required placeholder="Tell us about your project..." /></label>
                  <button className="pink-button" type="submit">Send request →</button>
                </form>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
