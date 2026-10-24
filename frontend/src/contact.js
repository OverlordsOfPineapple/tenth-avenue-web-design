import { bindEnquiryForm } from "./enquiry-form.js";

bindEnquiryForm(
  document.querySelector("#contact-form"),
  document.querySelector("#form-status"),
  "/api/contact",
);
