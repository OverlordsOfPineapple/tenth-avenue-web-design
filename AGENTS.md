# Tenth Avenue — approved design lock

Wolf explicitly locked the approved Lamborghini artwork and layout on 25 October 2026.

- Preserve the Countach/Lamborghini assets, crops, positioning and sizing; logos; service imagery; typography; colours; spacing; page structure; and responsive layouts.
- Privacy, security, SEO, performance and bug-fix requests do not implicitly authorise visual changes.
- Do not redesign, restyle, move sections, change artwork, or publish visible additions without Wolf explicitly approving the exact proposed visual change.
- On 25 October 2026 Wolf explicitly approved: “Approve the policy links and form notices, then publish PR #14 after checks”. This authorises only those additions and the associated form safeguards; it does not authorise other visual changes.
- Publish PR #14 only after checks. Future visible changes still require specific approval; the earlier “lock it down” instruction alone is not publication approval.
- Run `node scripts/check-design-lock.mjs` before presenting or publishing changes. It conservatively flags frontend edits against the approved baseline, including code that could change appearance. A flag requires review, not an automatic baseline reset.
- 25 October 2026: Wolf confirmed PR #15's homepage font restoration preview “looks good on my browser” and explicitly answered “yesyes” to finalising design-lock approval and publishing PR #15. The authorisation covers the previewed Barlow Condensed headline and Montserrat page text, **not** other visual changes. He previously reported a missing Lamborghini in his preview; this was investigated before his affirmative browser review. No hero image, image positioning, colour, layout, or page content changes were authorised.
- 25 October 2026 (later instruction, supersedes the PR #15 typography approval): Wolf explicitly requested to **restore the previous Inter/system homepage font**. Revert *only* PR #15's bundled Barlow Condensed/Montserrat dependencies, imports, and font declarations, leaving Lamborghini artwork, responsive positions, colours, layout, text, and all other frontend files untouched.
- Approved baseline: `cf4647838ccf8505f74fc6c3201b4d93f177f74c` (permanent main commit immediately before PR #15; exact previous frontend appearance). Do not update or bypass it without explicit approval of the resulting appearance.

This is a repository instruction and review check, not a GitHub branch-protection rule. Browser visual comparison remains required for an explicitly approved visual change.
