# Production launch automation

Primary domain: `https://tenthavenuewebdesign.com`  
Cloudflare preview: `https://tenth-avenue-web-design.pages.dev`  
Cloudflare Pages project: `tenth-avenue-web-design`

## Commands

```bash
SITE_URL=https://tenthavenuewebdesign.com npm run site:url
npm run check
SITE_URL=https://tenthavenuewebdesign.com npm run verify:live
```

The root launch script also:

1. creates a complete backup and checksum;
2. normalises canonical, Open Graph, Twitter, JSON-LD, sitemap and robots URLs;
3. validates every production route;
4. fast-forwards `main` after all checks pass;
5. deploys to Cloudflare Pages;
6. checks Pages secrets used by Resend;
7. optionally attaches the apex and `www` domains through the Cloudflare API;
8. tests DNS, HTTPS, HTML, sitemap, robots and the lead API;
9. enables the canonical-host redirect only after the custom domain passes.
