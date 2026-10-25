# PIN-8 privacy and business details — proposed completion

25 October 2026. Wolf approved the policy links, form notices and publication of PR #14 after checks. The expanded privacy wording below remains a draft; this is not full PIN-8 sign-off.

Owner response: business registration is “Not registered yet / unsure”. Legal operator and ABN remain unconfirmed.

## Implemented on this branch

- Both forms explicitly use POST with their existing API endpoint. Submit buttons stay disabled until the JavaScript submit handler is installed. A visible fallback message provides the phone number if scripts fail or are disabled. Normal JSON submissions are unchanged.
- Both forms explain the enquiry purpose and link to Privacy.
- Privacy and Terms are accessible from the homepage and the six public content/policy pages.
- Hero artwork, existing page copy, service images, layout rules and colour palette remain unchanged. Only policy navigation and form notices are added.

## Proposed privacy wording (not yet placed on the public policy page)

### Information collected

When you submit an enquiry, we collect your name, email address, any phone number or business name you provide, and your project message. The enquiry system also records an enquiry reference, submission time, enquiry type, browser user-agent information and a hashed value derived from your IP address. These technical records support enquiry handling and rate limiting.

### Services involved

The enquiry system uses Cloudflare Pages Functions and Cloudflare D1 to process and store enquiries. It sends enquiry notifications through Resend to the configured business mailbox. Those notifications contain submitted contact and project details.

### Requests about your information — proposed owner commitment

Contact studio@tenthavenuewebdesign.com or call 0430 535 096 to ask about information you have submitted, request access or correction, or raise a privacy concern. Please do not email identity documents unless a suitable verification process has been agreed.

## Facts required before completing the policy

1. Confirm the legal operator name and any ABN/business identifiers to publish. Existing public contact details: studio@tenthavenuewebdesign.com; 0430 535 096; Budgewoi, NSW 2262. Do not publish a residential street address by assumption.
2. Decide and document retention for unsuccessful enquiries, client records, D1 records, notification emails, logs and backups. No deletion schedule has been verified; do not promise automatic deletion.
3. Confirm processor and mailbox arrangements, processing/storage locations and any overseas handling. Do not claim Australian-only storage.
4. Approve a practical process for access/correction/deletion requests and complaints, including identity checks where needed.
5. Confirm any analytics, cookies or additional processing configured outside the repository before making tracking claims.

## Evidence and limits

The public pages were inspected on 25 October. Repository `functions/_shared.js` verifies database columns, hashed-IP rate limiting and the Resend notification payload. It does not establish production retention settings or every provider's handling arrangements. The mailbox receipt and direct production D1 checks remain separate PIN-9 work. No new enquiry was sent. No legal-compliance conclusion is made.
