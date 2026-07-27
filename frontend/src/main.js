const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const dialog = document.querySelector("#quote-dialog");
const quoteForm = document.querySelector("#quote-form");
const quoteStatus = document.querySelector("#quote-status");

function closeMenu() {
  navigation?.classList.remove("site-nav-open");
  menuButton?.setAttribute("aria-expanded", "false");
}

menuButton?.addEventListener("click", () => {
  const open = navigation.classList.toggle("site-nav-open");
  menuButton.setAttribute("aria-expanded", String(open));
});

navigation?.addEventListener("click", closeMenu);

document.querySelectorAll("[data-open-quote]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!dialog?.showModal) return;
    event.preventDefault();
    closeMenu();
    quoteStatus.textContent = "";
    dialog.showModal();
    dialog.querySelector('input[name="name"]')?.focus();
  });
});

document.querySelector("[data-close-dialog]")?.addEventListener("click", () => {
  dialog.close();
});

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

quoteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = quoteForm.querySelector('button[type="submit"]');
  const payload = Object.fromEntries(new FormData(quoteForm));
  button.disabled = true;
  quoteForm.setAttribute("aria-busy", "true");
  quoteStatus.textContent = "Sending…";

  try {
    const response = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "The enquiry could not be sent.");

    quoteForm.reset();
    quoteStatus.textContent = "Thanks—your enquiry has been received.";
  } catch (error) {
    quoteStatus.textContent = `${error.message} Please call (+61) 430 535 096.`;
  } finally {
    button.disabled = false;
    quoteForm.removeAttribute("aria-busy");
  }
});
