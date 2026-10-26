# Check the Cloudflare tokens without TinyFish

Run this helper on your own computer. It reads token permissions, resource scopes, expiry dates and available last-used dates through Cloudflare's official API. It checks these exact names:

- `Cloudflare Agent Token - 2026-10-09`
- `TENTH`
- `Tenth Avenue domain setup`

The helper cannot change or delete tokens. Its output is the evidence needed to decide which credentials still support a deployment, local script or agent.

## One-time setup in your existing Cloudflare tab

1. Open [My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Choose **Create Token → Create Custom Token**.
3. Name it **Temporary token audit** and select **User → API Tokens → Read**. No account or zone permissions are required.
4. Give it a short expiry, such as one day, then create it. Keep this new token for the local prompt below; do not put it in chat, a command argument or a repository file.

This temporary credential only reads API-token metadata. You do not need to change your existing three tokens or use a Global API Key.

## Run the audit

Download `tools/cloudflare-token-audit.py` from this branch using GitHub's **Download raw file** button. Save it in a folder such as Downloads, then open a terminal in that folder and run:

```bash
python3 cloudflare-token-audit.py
```

At **Cloudflare API token (input hidden)**, paste the temporary token and press Enter. The characters will not appear. Python 3's standard library is sufficient; no packages or browser extensions are needed. If `CLOUDFLARE_API_TOKEN` is already set in that terminal, the helper uses that credential instead of prompting.

The script makes only `GET` requests to `https://api.cloudflare.com/client/v4/user/tokens`, including expired records and pagination. It keeps TLS verification enabled, refuses redirects, and retains the credential only for the running process.

It prints a short summary and creates a timestamped `cloudflare-token-audit-*.json` report beside where you ran the command. The report contains the three tokens' allowlisted metadata and no API credential. Existing files are never overwritten. On Unix, the report is readable only by its owner.

Review the report before sharing it: resource identifiers and any IP restrictions are account metadata. Share that report here to continue the cleanup review. Never share the API credential. Remove the temporary audit token in Cloudflare after the review, or let its short expiry take effect.

## Reading the result

- A recent `last_used_on` date means a token has been used; it does not identify every dependent tool.
- Missing or null usage information means **unknown**, not unused.
- A token name alone does not establish which project uses it. Duplicate exact-name matches are called out so IDs can be checked.
- Permission policies and scope must be assessed together before narrowing a token or revoking it.

The repository's existing GitHub workflows do not reference Cloudflare management credentials. Its documentation describes native Cloudflare Pages deployment from GitHub `main`. Those are useful clues, but they do not rule out a local launch script or another agent using one of these tokens.

If the API returns HTTP 401 or 403, check that the temporary credential is active and has **User → API Tokens → Read**, and that you created it under the same Cloudflare user who owns the three tokens. This script cannot use an ordinary dashboard browser session as API authentication.

## Verification

The automated checks use mocked responses and make no Cloudflare calls. From the repository, run:

```bash
python3 -m unittest discover -s tools -p 'test_cloudflare_token_audit.py'
```

They check the GET-only request path, credential redaction, redirect rejection, response allowlisting, pagination, authentication errors and safe report creation.

## Official references

- [Create an API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [API token permission names](https://developers.cloudflare.com/fundamentals/api/reference/permissions/)
- [List user API tokens](https://developers.cloudflare.com/api/resources/user/subresources/tokens/methods/list/)
