const CANONICAL_HOST = "tenthavenuewebdesign.com";
const PREVIEW_HOST = "tenth-avenue-web-design.pages.dev";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const enforcePreviewRedirect =
    String(context.env.ENFORCE_CANONICAL_HOST || "").toLowerCase() === "true";

  // The production www host must have one canonical URL, independently of
  // any optional preview-host redirect setting. Keep branch previews usable.
  if (
    url.hostname === `www.${CANONICAL_HOST}` ||
    (enforcePreviewRedirect && url.hostname === PREVIEW_HOST)
  ) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    // 308 preserves POST bodies for forms and API requests, unlike 301/302.
    return Response.redirect(url.toString(), 308);
  }

  return context.next();
}
