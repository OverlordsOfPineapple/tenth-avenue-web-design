const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  const payload = Object.fromEntries(new FormData(form));

  button.disabled = true;
  form.setAttribute("aria-busy", "true");
  status.textContent = "Sending…";

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok !== true || !result.leadId) throw new Error(result.error || "The enquiry could not be sent.");

    form.reset();
    status.textContent = `${result.message || "Thanks—your enquiry has been received."} Reference: ${result.leadId}`;
  } catch (error) {
    status.textContent = `${error.message} Please call (+61) 430 535 096.`;
  } finally {
    button.disabled = false;
    form.removeAttribute("aria-busy");
  }
});
