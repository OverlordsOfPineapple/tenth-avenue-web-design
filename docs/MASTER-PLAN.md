# TENTH AVENUE WEB DESIGN — MASTER PLAN

**Canonical project plan**  
**Last consolidated:** 29 August 2026

---

## 1. North Star

Build and maintain **tenthavenuewebdesign.com** as a fast, polished, conversion-focused web design business site with a distinctive visual identity, reliable lead capture, clean deployment, and a simple operating process that makes future edits safe.

The site should feel deliberate and premium rather than bloated: strong typography, high contrast, memorable visual direction, excellent performance, and clear paths to enquiry.

---

## 2. Core Project Stack

### Domain
- `tenthavenuewebdesign.com`
- Registrar: Spaceship
- DNS / edge: Cloudflare

### Hosting
- Cloudflare Pages
- Production branch intended to be `main`

### Source control
- GitHub repository: `OverlordsOfPineapple/tenth-avenue-web-design`
- Primary branch: `main`

### Local project
- Primary working folder used in recent work:
  - `~/Projects/tenth-avenue-web-design`

### Application structure
- `frontend/` — site UI and static pages
- `functions/` — Cloudflare Pages Functions / API handlers
- `backend/` — backend-related project material
- `scripts/` — build, route, deployment, backup, and verification scripts

---

## 3. Confirmed Major Milestones

### MILESTONE A — Domain connected
The domain was moved from the original Spaceship nameserver-only state into a working Cloudflare-backed setup.

### MILESTONE B — Cloudflare deployment working
The project was deployed successfully through Cloudflare Pages.

### MILESTONE C — Production branch aligned
The intended production branch was moved to `main` so the live site follows the main GitHub branch.

### MILESTONE D — Live site verification
Previous project work recorded a verified launch checkpoint including:
- production build passed
- public pages returned HTTP 200
- redirect-loop issue fixed
- contact API returned HTTP 201
- quote and contact handlers connected
- D1 lead storage working

### MILESTONE E — Backup / recovery process established
Several safety scripts were created for:
- source backups
- Git bundle backups
- database export
- checksums
- rollback and routing correction

This means the project now has a real recovery strategy rather than relying on memory or ad-hoc copies.

---

## 4. Current Site Direction

### Visual identity
Keep the site visually bold and highly controlled:
- strong black / white contrast
- restrained use of neon / accent colour where appropriate
- oversized typography
- modern, premium, slightly rebellious design language
- minimal unnecessary decoration
- fast-loading assets

### Homepage
The homepage remains the primary conversion page.

It should:
- communicate what Tenth Avenue does immediately
- look distinctive within the first screen
- make services obvious
- provide a direct quote/contact path
- stay fast and uncluttered

### Supporting pages
Maintain clear standalone pages for the content that is still part of the final site structure, including:
- Services
- About
- Process
- Contact
- Privacy / Terms where required

Portfolio content should only remain if it is intentionally approved and current. Do not reintroduce removed or placeholder portfolio material by accident.

---

## 5. 404 Page — Approved Direction

The 404 page should be deliberately separate from the main visual system.

### Approved design
- solid white background
- giant black `404`
- heavy sans-serif typography
- static layout
- no falling letters
- no animation
- no border
- no neon effect
- no decorative horror treatment
- minimal supporting text only
- small return-home link

### Intended source file
`frontend/public/404.html`

### Important
Changing the 404 file should **not alter the homepage**. It is an isolated static page.

---

## 6. Routing Rules

Cloudflare routing has already caused problems once, so routing must remain a protected area.

### Required rules
- unknown URLs must return a true HTTP `404`
- the top-level `404.html` must remain present
- avoid accidental SPA fallback behaviour
- valid static routes must return their own content, not the homepage
- route checks should run before deployment

### Minimum test
A deliberately invalid URL such as:

`tenthavenuewebdesign.com/this-page-must-not-exist`

must:
1. return HTTP 404
2. display the approved 404 design

---

## 7. Lead Capture

The site’s enquiry system is a core business function.

### Required behaviour
- quote/contact forms must submit successfully
- validation must run
- spam and abuse controls should remain in place
- lead data should persist safely
- failed submissions should provide usable feedback
- business email notification should be configured if not already finalised

### D1
The previous live checkpoint recorded D1 lead storage as working.

Treat database changes as production changes:
- backup first
- test locally/staging
- deploy
- verify a real submission

---

## 8. Performance Standard

The site should remain intentionally lean.

### Priorities
1. fast first load
2. minimal JavaScript
3. compressed images
4. semantic HTML
5. responsive layout
6. accessible navigation
7. no unnecessary frameworks or libraries
8. stable mobile rendering
9. good Core Web Vitals
10. no dead assets or abandoned routes

Before major releases, run:
- production build
- route checks
- `git diff --check`
- local Wrangler test where relevant

---

## 9. Safe Change Process

For every meaningful production change:

### Step 1 — Inspect
```bash
cd ~/Projects/tenth-avenue-web-design
git status
git branch --show-current
```

### Step 2 — Backup
Create a safety copy before large edits.

### Step 3 — Edit only the intended files
Avoid broad replacements across the project unless absolutely necessary.

### Step 4 — Review
```bash
git diff
git diff --check
```

### Step 5 — Test
```bash
npm run check
```

### Step 6 — Commit
Use a narrow, descriptive commit message.

### Step 7 — Push
Push only when the exact staged change has been reviewed.

### Step 8 — Verify live
Check:
- homepage
- key internal pages
- contact/quote form
- 404 behaviour
- mobile layout

---

## 10. GitHub Rule

The ChatGPT GitHub connector has previously been able to read the repository but returned:

`403 — Resource not accessible by integration`

when attempting to write.

Until GitHub write access is confirmed again:
- do not assume ChatGPT can push
- local Git remains a valid publishing path
- confirm `git status` before each local push
- stage specific files rather than `git add .` whenever possible

---

## 11. Immediate Next Actions

### Priority 1 — Finish the 404 rollout
- place the approved 404 HTML into `frontend/public/404.html`
- run build/checks
- commit only the 404 file
- push to `main`
- wait for Cloudflare deployment
- verify a nonexistent URL shows the new design and returns HTTP 404

### Priority 2 — Confirm production health
Verify:
- root domain
- `www`
- HTTPS
- homepage
- Services
- About
- Process
- Contact
- 404 behaviour
- contact/quote submission

### Priority 3 — Reconfirm GitHub write access
Restore the connector's repository write permission so future edits can be made directly when appropriate.

### Priority 4 — Content refinement
Review:
- final homepage wording
- service descriptions
- business details
- privacy/terms
- contact details
- any portfolio material still intentionally retained

### Priority 5 — Performance pass
Run one final lean-up pass:
- remove dead CSS/JS/assets
- compress images
- remove old build artefacts
- confirm route and SEO files
- retest mobile

---

## 12. Backlog

Once the production site is stable:

- CMS decision
- easier content editing workflow
- analytics
- Search Console
- structured data / schema
- automated uptime checks
- lead notification workflow
- automated backups
- regular dependency/security review
- SEO content expansion
- Central Coast local landing pages where justified
- portfolio/case studies only when real, approved work is ready

---

## 13. Definition of Done

The current Tenth Avenue website phase is considered complete when:

- `https://tenthavenuewebdesign.com` loads correctly
- `https://www.tenthavenuewebdesign.com` resolves correctly
- HTTPS is valid
- `main` is the production source of truth
- all intended pages are distinct and working
- missing pages return the custom 404 with HTTP 404
- contact/quote submissions persist correctly
- no obvious dead links remain
- mobile layout is clean
- production build/checks pass
- a verified backup exists
- the final deployment commit is recorded

---

## 14. Canonical Operating Rule

**Protect the working site. Make one intentional change at a time. Back up first, test before pushing, and verify the live result after every production deployment.**

This document is the master plan unless we explicitly replace it with a newer revision.

