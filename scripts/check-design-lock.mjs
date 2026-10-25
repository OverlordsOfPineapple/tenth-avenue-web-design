import { execFileSync } from "node:child_process";

// Wolf approved PR #14 policy links and form notices on 25 October 2026.
// This exact frontend tree includes those additions and preserves the artwork/layout.
// Never silently rebaseline this check.
const baseline = "dd2825ee19bc202aa29c60a508f05e0a5236aa7d";
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
