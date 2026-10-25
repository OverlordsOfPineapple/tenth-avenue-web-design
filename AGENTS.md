# Tenth Avenue — approved design lock

Wolf explicitly locked the approved Lamborghini artwork and layout on 25 October 2026.

- Preserve the Countach/Lamborghini assets, crops, positioning and sizing; logos; service imagery; typography; colours; spacing; page structure; and responsive layouts.
- Privacy, security, SEO, performance and bug-fix requests do not implicitly authorise visual changes.
- Do not redesign, restyle, move sections, change artwork, or publish visible additions without Wolf explicitly approving the exact proposed visual change.
- On 25 October 2026 Wolf explicitly approved: “Approve the policy links and form notices, then publish PR #14 after checks”. This authorises only those additions and the associated form safeguards; it does not authorise other visual changes.
- Publish PR #14 only after checks. Future visible changes still require specific approval; the earlier “lock it down” instruction alone is not publication approval.
- Run `node scripts/check-design-lock.mjs` before presenting or publishing changes. It conservatively flags frontend edits against the approved baseline, including code that could change appearance. A flag requires review, not an automatic baseline reset.
- Baseline: `dd2825ee19bc202aa29c60a508f05e0a5236aa7d`. Do not update or bypass it without explicit approval of the resulting appearance.

This is a repository instruction and review check, not a GitHub branch-protection rule. Browser visual comparison remains required for an explicitly approved visual change.
