import { handleLead } from "../_shared.js";

export function onRequest(context) {
  return handleLead(context, "quote");
}
