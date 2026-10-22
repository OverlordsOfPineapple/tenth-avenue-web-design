#!/usr/bin/env python3
"""Audit three named Cloudflare API tokens. This tool performs GET requests only."""

import argparse
from datetime import datetime, timezone
import getpass
import json
import os
from pathlib import Path
import ssl
import sys
import warnings
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import HTTPRedirectHandler, HTTPSHandler, Request, build_opener


API_URL = "https://api.cloudflare.com/client/v4/user/tokens"
TARGET_NAMES = (
    "Cloudflare Agent Token - 2026-10-09",
    "TENTH",
    "Tenth Avenue domain setup",
)
TOKEN_FIELDS = (
    "name", "id", "status", "issued_on", "modified_on", "expires_on",
    "not_before", "last_used_on",
)
PER_PAGE = 50
MAX_PAGES = 100
MAX_RESPONSE_BYTES = 10 * 1024 * 1024
PERMISSION_HELP = (
    "Use a Cloudflare custom API token with User → API Tokens → Read permission. "
    "No account or zone permissions are needed for this audit."
)


class AuditError(Exception):
    """An error safe to show without printing a server response or credential."""


class RejectRedirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise AuditError("Cloudflare returned a redirect. It was refused to protect the credential.")


def redact(value, credential):
    """Remove an exact credential match even if an unexpected response reflects it."""
    if isinstance(value, str):
        return value.replace(credential, "[REDACTED]") if credential else value
    if isinstance(value, list):
        return [redact(item, credential) for item in value]
    if isinstance(value, dict):
        return {redact(str(key), credential): redact(item, credential) for key, item in value.items()}
    return value


def clean_condition(value):
    """Keep documented IP/time restrictions; omit unfamiliar condition fields."""
    if not isinstance(value, dict):
        return None
    cleaned = {}
    for key in ("request_ip", "request.ip", "request_time", "request.time"):
        restriction = value.get(key)
        if not isinstance(restriction, dict):
            continue
        allowed = {}
        for operator in ("in", "not_in", "before", "after"):
            item = restriction.get(operator)
            if isinstance(item, str) or item is None and operator in restriction:
                allowed[operator] = item
            elif isinstance(item, list):
                allowed[operator] = [entry for entry in item if isinstance(entry, str)]
        if allowed:
            cleaned[key] = allowed
    return cleaned


def clean_policies(value):
    if not isinstance(value, list):
        return None
    policies = []
    for policy in value:
        if not isinstance(policy, dict):
            continue
        cleaned = {}
        if isinstance(policy.get("effect"), str):
            cleaned["effect"] = policy["effect"]
        groups = policy.get("permission_groups")
        if isinstance(groups, list):
            cleaned["permission_groups"] = [
                {key: group[key] for key in ("id", "name") if isinstance(group.get(key), str)}
                for group in groups if isinstance(group, dict)
            ]
        resources = policy.get("resources")
        if isinstance(resources, dict):
            cleaned["resources"] = clean_resources(resources)
        if "condition" in policy:
            condition = clean_condition(policy["condition"])
            if condition is not None:
                cleaned["condition"] = condition
        policies.append(cleaned)
    return policies


def clean_resources(value, depth=0):
    """Keep Cloudflare resource selectors, including nested account/zone selectors."""
    if depth > 8:
        return {}
    cleaned = {}
    for key, item in value.items():
        if not isinstance(key, str) or not (key == "*" or key.startswith("com.cloudflare.api.")):
            continue
        if isinstance(item, str):
            cleaned[key] = item
        elif isinstance(item, dict):
            cleaned[key] = clean_resources(item, depth + 1)
    return cleaned


def sanitize_token(token, credential):
    cleaned = {
        key: token[key] for key in TOKEN_FIELDS
        if key in token and (isinstance(token[key], str) or token[key] is None)
    }
    if "policies" in token:
        policies = clean_policies(token["policies"])
        if policies is not None:
            cleaned["policies"] = policies
    if "condition" in token:
        condition = clean_condition(token["condition"])
        if condition is not None:
            cleaned["condition"] = condition
    return redact(cleaned, credential)


def read_credential():
    credential = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    if not credential:
        if not sys.stdin.isatty():
            raise AuditError(
                "No credential is available in this noninteractive session. Run this script in "
                "an interactive terminal for a concealed prompt, or use an existing "
                "CLOUDFLARE_API_TOKEN environment variable. Do not put credentials in command arguments."
            )
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("error", getpass.GetPassWarning)
                credential = getpass.getpass("Cloudflare API token (input hidden): ").strip()
        except getpass.GetPassWarning:
            raise AuditError("The terminal cannot conceal input. No credential was read or submitted.") from None
        except (EOFError, KeyboardInterrupt):
            raise AuditError("Audit cancelled; no credential was submitted.") from None
    if not credential:
        raise AuditError("No API token entered; nothing was sent.")
    if any(char.isspace() for char in credential) or not credential.isascii():
        raise AuditError("The API token contains unsupported whitespace or characters; nothing was sent.")
    return credential


def make_opener():
    return build_opener(RejectRedirects(), HTTPSHandler(context=ssl.create_default_context()))


def fetch_page(opener, credential, page):
    query = urlencode({"include_expired": "true", "per_page": PER_PAGE, "page": page})
    request = Request(
        API_URL + "?" + query,
        headers={
            "Authorization": "Bearer " + credential,
            "Accept": "application/json",
            "User-Agent": "cloudflare-token-audit/1.0",
        },
        method="GET",
    )
    try:
        with opener.open(request, timeout=30) as response:
            raw = response.read(MAX_RESPONSE_BYTES + 1)
    except HTTPError as error:
        if error.code in (401, 403):
            raise AuditError(f"Cloudflare denied the audit (HTTP {error.code}). " + PERMISSION_HELP) from None
        if 300 <= error.code < 400:
            raise AuditError("Cloudflare returned a redirect. It was refused to protect the credential.") from None
        if error.code == 429:
            raise AuditError("Cloudflare rate-limited the audit (HTTP 429). Try again later.") from None
        raise AuditError("Cloudflare returned an HTTP error. No server response was printed.") from None
    except (URLError, TimeoutError, OSError):
        raise AuditError("Could not reach Cloudflare securely. Check connectivity and try again.") from None
    if len(raw) > MAX_RESPONSE_BYTES:
        raise AuditError("Cloudflare's response exceeded the audit's size limit.")
    try:
        payload = json.loads(raw)
    except (ValueError, UnicodeError):
        raise AuditError("Cloudflare returned an unreadable JSON response.") from None
    if not isinstance(payload, dict) or payload.get("success") is not True:
        raise AuditError("Cloudflare did not confirm a successful audit. " + PERMISSION_HELP)
    result = payload.get("result")
    if not isinstance(result, list) or not all(isinstance(item, dict) for item in result):
        raise AuditError("Cloudflare returned an unexpected token-list format.")
    return result, payload.get("result_info")


def collect_report(opener, credential):
    matching = []
    fetched_count = 0
    seen_pages = set()
    for page in range(1, MAX_PAGES + 1):
        tokens, info = fetch_page(opener, credential, page)
        signature = tuple(sorted(str(item.get("id", "")) for item in tokens))
        if tokens and signature in seen_pages:
            raise AuditError("Cloudflare repeated a result page. The audit stopped without saving an incomplete report.")
        seen_pages.add(signature)
        fetched_count += len(tokens)
        for token in tokens:
            if token.get("name") in TARGET_NAMES:
                matching.append(sanitize_token(token, credential))
        total = info.get("total_count") if isinstance(info, dict) else None
        valid_total = isinstance(total, int) and not isinstance(total, bool) and total >= 0
        if valid_total:
            if fetched_count >= total:
                break
            if not tokens:
                raise AuditError("Cloudflare's pagination was incomplete. No audit report was saved.")
        elif len(tokens) < PER_PAGE:
            break
    else:
        raise AuditError("The token list exceeded the audit's page limit. No incomplete report was saved.")
    matching.sort(key=lambda item: TARGET_NAMES.index(item["name"]))
    names = [item.get("name") for item in matching]
    return {
        "tokens": matching,
        "missing_targets": [name for name in TARGET_NAMES if name not in names],
        "duplicate_targets": [name for name in TARGET_NAMES if names.count(name) > 1],
    }


def write_report(path, report):
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
    try:
        fd = os.open(path, flags, 0o600)
    except FileExistsError:
        raise AuditError("The output path already exists. Choose a new --output path; existing files are never overwritten.") from None
    except OSError:
        raise AuditError("Could not create the audit file. Choose a writable --output path.") from None
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            os.fchmod(stream.fileno(), 0o600)
            json.dump(report, stream, indent=2, ensure_ascii=False)
            stream.write("\n")
    except OSError:
        # Remove only the new file opened above, not any pre-existing file.
        try:
            Path(path).unlink()
        except OSError:
            pass
        raise AuditError("Could not finish writing the audit file.") from None


def print_summary(report):
    for token in report["tokens"]:
        name = token.get("name", "(unnamed)")
        status = token.get("status") or "unknown"
        expiry = token.get("expires_on") or "not reported"
        usage = token.get("last_used_on")
        print(f"{name}: status={status}; expires={expiry}; last used={usage or 'unknown'}")
        if not usage:
            print("  Usage information is missing; this does not prove the token is unused.")
        if "policies" not in token:
            print("  Permission policies were not returned; scope cannot be verified from this response.")
    for name in report["missing_targets"]:
        print(f"Not found by exact name: {name}")
    for name in report["duplicate_targets"]:
        print(f"Multiple exact-name matches: {name}. Check IDs before making any future changes.")
    print("Read-only audit complete. A usage date does not identify every dependent tool; no tokens were changed.")


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Read-only audit of the three named Cloudflare tokens; never changes or revokes tokens."
    )
    parser.add_argument("--output", metavar="PATH", help="New JSON file to create (never overwrites an existing file).")
    args = parser.parse_args(argv)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    output = Path(args.output or f"cloudflare-token-audit-{stamp}.json")
    credential = ""
    try:
        # Check before requesting a credential; exclusive file creation still prevents races.
        if output.exists() or output.is_symlink():
            raise AuditError("The output path already exists. Choose a new --output path; existing files are never overwritten.")
        credential = read_credential()
        report = collect_report(make_opener(), credential)
        write_report(output, report)
        print_summary(report)
        # A caller-supplied filename could itself contain the credential; do not echo paths.
        print("Saved the audit JSON to the selected output file (permissions 0600).")
        return 0
    except AuditError as error:
        print("Audit stopped: " + redact(str(error), credential), file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("Audit cancelled; no tokens were changed.", file=sys.stderr)
        return 130
    except Exception:
        # Never expose exception reprs, request headers, server bodies, or tracebacks.
        print("Audit stopped due to an unexpected error. No credentials or server response were printed.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
