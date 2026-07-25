
/* Remove the old "What We Do" card section */
function removeOldServicesSection() {
  document.querySelectorAll("section").forEach((section) => {
    const text = section.textContent
      ?.replace(/\s+/g, " ")
      .trim()
      .toUpperCase();

    if (
      text?.includes("WHAT WE DO") &&
      text.includes("WEB DESIGN") &&
      text.includes("WEB DEVELOPMENT") &&
      text.includes("E-COMMERCE")
    ) {
      section.remove();
    }
  });
}

requestAnimationFrame(removeOldServicesSection);

const oldServicesObserver = new MutationObserver(removeOldServicesSection);
oldServicesObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

/* Remove the old "What We Do" card section */
function removeOldServicesSection() {
  document.querySelectorAll("section").forEach((section) => {
    const text = section.textContent
      ?.replace(/\s+/g, " ")
      .trim()
      .toUpperCase();

    if (
      text?.includes("WHAT WE DO") &&
      text.includes("WEB DESIGN") &&
      text.includes("WEB DEVELOPMENT") &&
      text.includes("E-COMMERCE")
    ) {
      section.remove();
    }
  });
}

requestAnimationFrame(removeOldServicesSection);

const oldServicesObserver = new MutationObserver(removeOldServicesSection);
oldServicesObserver.observe(document.body, {
  childList: true,
  subtree: true,
});
