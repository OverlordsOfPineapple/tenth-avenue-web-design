"""Mock-only verification: no network calls and no real credentials."""

import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import stat
import tempfile
import unittest
import warnings
from unittest import mock
from urllib.error import HTTPError
from urllib.parse import parse_qs, urlsplit


SCRIPT = Path(__file__).with_name("cloudflare-token-audit.py")
spec = importlib.util.spec_from_file_location("cloudflare_audit", SCRIPT)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
FAKE_SECRET = "FAKE-CREDENTIAL-FOR-MOCKED-TESTS"


class FakeOpener:
    def __init__(self, *results):
        self.results = list(results)
        self.requests = []

    def open(self, request, timeout):
        self.requests.append((request, timeout))
        result = self.results.pop(0)
        if isinstance(result, Exception):
            raise result
        return io.BytesIO(json.dumps(result).encode("utf-8"))


def payload(tokens, total=None):
    result = {"success": True, "result": tokens}
    if total is not None:
        result["result_info"] = {"total_count": total}
    return result


class AuditTests(unittest.TestCase):
    def setUp(self):
        # Any accidental use of the real networking stack fails immediately.
        self.network_guard = mock.patch("socket.create_connection", side_effect=AssertionError("Tests must not use network"))
        self.network_guard.start()
        self.addCleanup(self.network_guard.stop)

    def test_only_fixed_get_endpoint_and_expected_query(self):
        token = {"name": audit.TARGET_NAMES[0], "id": "id-1", "status": "active"}
        opener = FakeOpener(payload([token], total=1))
        report = audit.collect_report(opener, FAKE_SECRET)
        self.assertEqual(report["tokens"][0]["id"], "id-1")
        self.assertEqual(len(opener.requests), 1)
        request, timeout = opener.requests[0]
        self.assertEqual(request.get_method(), "GET")
        parsed = urlsplit(request.full_url)
        self.assertEqual((parsed.scheme, parsed.netloc, parsed.path), ("https", "api.cloudflare.com", "/client/v4/user/tokens"))
        self.assertEqual(parse_qs(parsed.query), {"include_expired": ["true"], "per_page": ["50"], "page": ["1"]})
        self.assertIsNone(request.data)
        self.assertEqual(timeout, 30)

    def test_allowlist_redacts_reflected_secret_and_preserves_nested_resources(self):
        token = {
            "name": audit.TARGET_NAMES[1], "id": "id-2", "status": FAKE_SECRET,
            "value": FAKE_SECRET, "unknown": "must not survive", "last_used_on": None,
            "condition": {"request_ip": {"in": ["192.0.2.0/24", "2001:db8::/32"], "unknown": FAKE_SECRET}, "unknown": FAKE_SECRET},
            "policies": [{
                "id": "policy-id-to-omit", "effect": "allow", "unknown": FAKE_SECRET,
                "permission_groups": [{"id": "permission-id", "name": "API Tokens Read", "meta": {"secret": FAKE_SECRET}}],
                "resources": {"com.cloudflare.api.account.*": {"com.cloudflare.api.zone.zone-id": "*"}, "unknown": FAKE_SECRET},
            }],
        }
        cleaned = audit.sanitize_token(token, FAKE_SECRET)
        serialized = json.dumps(cleaned)
        self.assertNotIn(FAKE_SECRET, serialized)
        self.assertNotIn("must not survive", serialized)
        self.assertNotIn("unknown", serialized)
        self.assertNotIn("meta", serialized)
        self.assertNotIn("policy-id-to-omit", serialized)
        self.assertEqual(cleaned["status"], "[REDACTED]")
        self.assertEqual(cleaned["condition"]["request_ip"]["in"], ["192.0.2.0/24", "2001:db8::/32"])
        self.assertEqual(cleaned["policies"][0]["resources"], {"com.cloudflare.api.account.*": {"com.cloudflare.api.zone.zone-id": "*"}})
        self.assertLessEqual(set(cleaned), set(audit.TOKEN_FIELDS) | {"policies", "condition"})

    def test_http_401_and_403_show_exact_permission_guidance_without_response(self):
        for code in (401, 403):
            with self.subTest(code=code):
                error = HTTPError(audit.API_URL, code, FAKE_SECRET, {}, io.BytesIO(FAKE_SECRET.encode()))
                with self.assertRaises(audit.AuditError) as caught:
                    audit.fetch_page(FakeOpener(error), FAKE_SECRET, 1)
                self.assertIn("User → API Tokens → Read", str(caught.exception))
                self.assertIn(str(code), str(caught.exception))
                self.assertNotIn(FAKE_SECRET, str(caught.exception))

    def test_redirect_is_rejected_without_destination_or_credential(self):
        request = audit.Request(audit.API_URL, headers={"Authorization": "Bearer " + FAKE_SECRET})
        with self.assertRaises(audit.AuditError) as caught:
            audit.RejectRedirects().redirect_request(request, None, 302, "Found", {}, "https://example.invalid/" + FAKE_SECRET)
        self.assertNotIn(FAKE_SECRET, str(caught.exception))
        self.assertNotIn("example.invalid", str(caught.exception))
        opener = FakeOpener(HTTPError(audit.API_URL, 307, FAKE_SECRET, {}, None))
        with self.assertRaisesRegex(audit.AuditError, "redirect"):
            audit.fetch_page(opener, FAKE_SECRET, 1)

    def test_output_is_mode_0600_and_never_overwrites_files_or_symlinks(self):
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "audit.json"
            report = {"tokens": [], "missing_targets": list(audit.TARGET_NAMES), "duplicate_targets": []}
            audit.write_report(output, report)
            self.assertEqual(stat.S_IMODE(output.stat().st_mode), 0o600)
            self.assertEqual(json.loads(output.read_text()), report)
            before = output.read_bytes()
            with self.assertRaisesRegex(audit.AuditError, "already exists"):
                audit.write_report(output, {"tokens": ["should not overwrite"]})
            self.assertEqual(output.read_bytes(), before)
            link = Path(folder) / "link.json"
            link.symlink_to(output)
            with self.assertRaisesRegex(audit.AuditError, "already exists"):
                audit.write_report(link, {})
            self.assertEqual(output.read_bytes(), before)

    def test_missing_usage_is_unknown_and_never_claimed_unused(self):
        opener = FakeOpener(payload([{"name": audit.TARGET_NAMES[2], "id": "id-3", "status": "active"}]))
        report = audit.collect_report(opener, FAKE_SECRET)
        text = io.StringIO()
        with contextlib.redirect_stdout(text):
            audit.print_summary(report)
        self.assertIn("last used=unknown", text.getvalue())
        self.assertIn("does not prove the token is unused", text.getvalue())
        self.assertEqual(report["missing_targets"], list(audit.TARGET_NAMES[:2]))

    def test_paginated_targets_and_duplicate_names_are_detected(self):
        first = [{"name": audit.TARGET_NAMES[1], "id": "one"}, {"name": "unrelated", "id": "two", "value": FAKE_SECRET}]
        second = [{"name": audit.TARGET_NAMES[1], "id": "three"}]
        opener = FakeOpener(payload(first, 3), payload(second, 3))
        with mock.patch.object(audit, "PER_PAGE", 2):
            report = audit.collect_report(opener, FAKE_SECRET)
        self.assertEqual(report["duplicate_targets"], [audit.TARGET_NAMES[1]])
        self.assertEqual(len(report["tokens"]), 2)
        self.assertNotIn("unrelated", json.dumps(report))
        self.assertEqual([parse_qs(urlsplit(req.full_url).query)["page"] for req, _ in opener.requests], [["1"], ["2"]])

    def test_repeated_pagination_stops_incomplete_audit(self):
        tokens = [{"name": audit.TARGET_NAMES[0], "id": "id-1"}]
        opener = FakeOpener(payload(tokens, 3), payload(tokens, 3))
        with self.assertRaisesRegex(audit.AuditError, "repeated"):
            audit.collect_report(opener, FAKE_SECRET)

    def test_noninteractive_missing_token_stops_without_network(self):
        stderr = io.StringIO()
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "audit.json"
            with mock.patch.dict(os.environ, {}, clear=True), mock.patch.object(audit.sys.stdin, "isatty", return_value=False), mock.patch.object(audit, "make_opener") as opener, contextlib.redirect_stderr(stderr):
                code = audit.main(["--output", str(output)])
            self.assertEqual(code, 1)
            self.assertIn("noninteractive", stderr.getvalue())
            self.assertFalse(output.exists())
            opener.assert_not_called()

    def test_cannot_disable_echo_stops_before_accepting_or_submitting_credential(self):
        stderr = io.StringIO()
        stdout = io.StringIO()
        def echo_warning(*args, **kwargs):
            warnings.warn("Cannot disable echo " + FAKE_SECRET, audit.getpass.GetPassWarning)
            self.fail("The warning must prevent an echoed credential read")
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "audit.json"
            with mock.patch.dict(os.environ, {}, clear=True), mock.patch.object(audit.sys.stdin, "isatty", return_value=True), mock.patch.object(audit.getpass, "getpass", side_effect=echo_warning), mock.patch.object(audit, "make_opener") as opener, contextlib.redirect_stderr(stderr), contextlib.redirect_stdout(stdout):
                code = audit.main(["--output", str(output)])
            self.assertEqual(code, 1)
            self.assertIn("cannot conceal input", stderr.getvalue())
            self.assertNotIn(FAKE_SECRET, stderr.getvalue() + stdout.getvalue())
            self.assertFalse(output.exists())
            opener.assert_not_called()

    def test_main_redacts_even_a_reflected_error_message(self):
        stderr = io.StringIO()
        with tempfile.TemporaryDirectory() as folder, mock.patch.dict(os.environ, {"CLOUDFLARE_API_TOKEN": FAKE_SECRET}), mock.patch.object(audit, "make_opener", side_effect=audit.AuditError("Unexpected " + FAKE_SECRET)), contextlib.redirect_stderr(stderr):
            code = audit.main(["--output", str(Path(folder) / "audit.json")])
        self.assertEqual(code, 1)
        self.assertNotIn(FAKE_SECRET, stderr.getvalue())
        self.assertIn("[REDACTED]", stderr.getvalue())

    def test_main_success_writes_sanitized_report_without_credential(self):
        opener = FakeOpener(payload([{"name": audit.TARGET_NAMES[0], "id": "id-1", "status": "active", "value": FAKE_SECRET}], 1))
        stdout = io.StringIO()
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "audit.json"
            with mock.patch.dict(os.environ, {"CLOUDFLARE_API_TOKEN": FAKE_SECRET}), mock.patch.object(audit, "make_opener", return_value=opener), contextlib.redirect_stdout(stdout):
                code = audit.main(["--output", str(output)])
            self.assertEqual(code, 0)
            self.assertNotIn(FAKE_SECRET, output.read_text())
            self.assertNotIn(FAKE_SECRET, stdout.getvalue())


if __name__ == "__main__":
    unittest.main(verbosity=2)
