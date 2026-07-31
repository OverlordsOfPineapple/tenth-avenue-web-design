const CANONICAL_HOST = "tenthavenuewebdesign.com";
const PREVIEW_HOST = "tenth-avenue-web-design.pages.dev";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const enforce = String(context.env.ENFORCE_CANONICAL_HOST || "").toLowerCase() === "true";

  if (
    enforce &&
    (url.hostname === PREVIEW_HOST || url.hostname === `www.${CANONICAL_HOST}`)
  ) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
