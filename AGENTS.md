# Tenth Avenue — approved design lock

Wolf explicitly locked the approved Lamborghini artwork and layout on 25 October 2026.

- Preserve the Countach/Lamborghini assets, crops, positioning and sizing; logos; service imagery; typography; colours; spacing; page structure; and responsive layouts.
- Privacy, security, SEO, performance and bug-fix requests do not implicitly authorise visual changes.
- Do not redesign, restyle, move sections, change artwork, or publish visible additions without Wolf explicitly approving the exact proposed visual change.
- Policy links and form notices in draft PR #14 are proposals only. They are NOT part of the approved baseline and must not be merged or deployed without that explicit approval.
- Keep the live site unchanged while preparing fixes. Do not merge or deploy the current draft under the instruction to “lock it down”.
- Run `node scripts/check-design-lock.mjs` before presenting or publishing changes. It conservatively flags frontend edits against the pre-PR baseline, including code that could change appearance. A flag requires review, not an automatic baseline reset.
- Baseline: `50eda527c6482a570b166c6f3f278272c870b938`. Do not update or bypass it without explicit approval of the resulting appearance.

This is a repository instruction and review check, not a GitHub branch-protection rule. Browser visual comparison remains required for an explicitly approved visual change.
