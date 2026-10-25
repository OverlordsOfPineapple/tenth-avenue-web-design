import "@fontsource/barlow-condensed/latin-800.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/montserrat/latin-700.css";
import "@fontsource/montserrat/latin-800.css";
import "@fontsource/montserrat/latin-900.css";
import { bindEnquiryForm } from "./enquiry-form.js";

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

bindEnquiryForm(quoteForm, quoteStatus, "/api/quote");
