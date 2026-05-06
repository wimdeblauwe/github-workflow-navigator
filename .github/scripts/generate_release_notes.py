#!/usr/bin/env python3
"""Generate conventional-commits-based release notes, written to stdout."""

import os
import re
import subprocess
import sys

version = os.environ["VERSION"]

prev_result = subprocess.run(
    ["git", "describe", "--tags", "--abbrev=0", f"{version}^"],
    capture_output=True,
    text=True,
)
prev_tag = prev_result.stdout.strip() if prev_result.returncode == 0 else ""

range_spec = f"{prev_tag}..{version}" if prev_tag else f"{version}"
log = subprocess.run(
    ["git", "log", range_spec, "--pretty=format:%s"],
    capture_output=True,
    text=True,
).stdout.strip()

commits = [c for c in log.split("\n") if c]

SECTIONS = [
    ("feat",     "### Features"),
    ("fix",      "### Bug Fixes"),
    ("perf",     "### Performance Improvements"),
    ("refactor", "### Refactoring"),
    ("docs",     "### Documentation"),
    ("chore",    "### Chores"),
    ("build",    "### Build"),
    ("ci",       "### CI"),
    ("style",    "### Style"),
    ("test",     "### Tests"),
]

buckets: dict[str, list[str]] = {t: [] for t, _ in SECTIONS}
subject_re = re.compile(r"^(\w+)(?:\(([^)]+)\))?: (.+)")

for commit in commits:
    m = subject_re.match(commit)
    if m:
        typ, scope, desc = m.group(1), m.group(2), m.group(3)
        entry = f"- **{scope}**: {desc}" if scope else f"- {desc}"
        if typ in buckets:
            buckets[typ].append(entry)

lines: list[str] = []
for typ, header in SECTIONS:
    if buckets[typ]:
        lines.append(header)
        lines.extend(buckets[typ])
        lines.append("")

sys.stdout.write("\n".join(lines))
