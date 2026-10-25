import { execFileSync } from "node:child_process";

// Wolf approved PR #14 policy links and form notices on 25 October 2026.
// Wolf explicitly requested restoration of the original Inter/system homepage
// typography on 25 October 2026, superseding PR #15's font selection.
// The reference below is the exact permanent main commit immediately before
// PR #15; the rollback changes only the four font-related frontend files.
// Preserve Lamborghini assets, positioning, colours, content and layout.
// Never silently rebaseline this check for any subsequent frontend changes.
const baseline = "cf4647838ccf8505f74fc6c3201b4d93f177f74c";
const run = (...args) => execFileSync("git", args, { encoding: "utf8" });
try {
  run("cat-file", "-e", `${baseline}^{commit}`);
  const changed = run("diff", "--name-only", "--no-renames", baseline, "--", "frontend")
    .split("\n").filter(Boolean);
  const untracked = run("ls-files", "--others", "--exclude-standard", "--", "frontend")
    .split("\n").filter(Boolean);
  const files = [...new Set([...changed, ...untracked])].sort();
  if (files.length) {
    console.error("DESIGN LOCK: frontend changes require review against the approved appearance:");
    for (const file of files) console.error(`- ${file}`);
    console.error("This conservative check also flags functional/metadata edits. Do not merge visible changes or reset the baseline without Wolf's explicit approval.");
    process.exitCode = 1;
  } else {
    console.log("Design lock passed: frontend matches the approved baseline.");
  }
} catch (error) {
  console.error("Design lock could not be verified. Fetch the baseline history before proceeding.");
  process.exitCode = 2;
}
