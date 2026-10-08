# Contact delivery repair — 6 October 2026

## Problem

Production-source handlers return success before Resend finishes and silently skip mail when settings are missing. Visitors can believe their enquiry reached the inbox when only the database write succeeded.

## Change

Both contact and quote handlers save the enquiry first, then wait for email acceptance. Missing configuration, network errors, timeout, rejected requests, and malformed provider responses produce a saved-enquiry fallback message and reference. The email call aborts after ten seconds. Provider error bodies are not logged. Both frontend forms reject malformed success responses and display the server message and reference.

HTTP 201 and ok:true mean the enquiry is saved; notification:accepted means Resend accepted the email, not that the recipient mailbox received it. notification:failed means acceptance could not be confirmed; a timeout can occur after provider acceptance. No automatic duplicate submission or new retry queue is introduced.

## Validation completed

- npm run check passed: Vite build, syntax, 8 HTML pages, bundle limits, static routes and function tests.
- Updated delivery tests passed for both endpoints: missing settings, provider rejection, malformed and null responses, network error, timeout, accepted email, missing DB and DB write rejection.
- git diff --check passed for the repair.
- Resend connector reports tenthavenuewebdesign.com verified with sending enabled. No secret values were read.

## Pending deployment

GitHub integration returned HTTP 403 Resource not accessible by integration when creating the checkpoint branch. No remote fix branch, pull request, merge or production deployment is claimed. Cloudflare was not found in the available plugin search; dashboard settings and live D1 rows have not been inspected.

Next: restore authorised GitHub write access or obtain permission for cloud-browser fallback, publish this repair for review, deploy, and perform a uniquely marked contact-form test. Confirm the D1 row and delivery to studio@tenthavenuewebdesign.com. The existing October 5 performance patch overlaps with this repair and must be rebased/reviewed separately. Keep Prism excluded.

Baseline main: bb6e494c3669c88af7e25b72d126a83cde305665.
Backup checkpoint: fe17ceac35a35cb99cf13c578929cf845f4f3f86.
