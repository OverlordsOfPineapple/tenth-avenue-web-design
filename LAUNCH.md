# Tenth Avenue launch

## Hosting choice

Cloudflare Pages + Pages Functions + D1.

## Build settings

- Repository: OverlordsOfPineapple/tenth-avenue-web-design
- Build command: `npm install --prefix frontend && npm run build --prefix frontend`
- Output directory: `frontend/dist`
- Production branch: choose the clean launch branch after review

## Create the lead database

```bash
npx wrangler login
npx wrangler d1 create tenth-avenue-leads
```

Copy the returned database ID into `wrangler.toml`, then run:

```bash
npx wrangler d1 execute tenth-avenue-leads --remote --file=schema.sql
```

In the Pages project, bind the D1 database as `DB`.

## Email notifications

Create a Resend account, verify a sending subdomain and add these Pages secrets:

```text
RESEND_API_KEY
RESEND_FROM_EMAIL
LEAD_TO_EMAIL
IP_HASH_SALT
```

The form stores enquiries in D1 even before email notifications are configured.

## Domain

Add the custom domain:

```text
tenthavenuewebdesign.com.au
```

Choose one preferred host and redirect the other:

```text
https://tenthavenuewebdesign.com.au
https://www.tenthavenuewebdesign.com.au
```

## Post-deployment checks

- Submit a real test enquiry.
- Confirm the row appears in D1.
- Confirm the notification email arrives.
- Open /robots.txt and /sitemap.xml.
- Test /services.html, /contact.html, /privacy.html and /terms.html.
- Run Lighthouse against the public URL.
- Add the domain to Google Search Console and submit /sitemap.xml.
