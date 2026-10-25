import { execFileSync } from "node:child_process";

// The approved pre-PIN-8 state. Never silently rebaseline this check.
const baseline = "50eda527c6482a570b166c6f3f278272c870b938";
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
