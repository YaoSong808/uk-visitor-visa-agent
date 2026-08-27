#!/usr/bin/env python3
"""Create a privacy-conscious JSON inventory without reading document contents."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


DEFAULT_EXCLUDES = {".git", ".next", "Generated", "node_modules", "release"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path, help="Case directory to inventory")
    parser.add_argument("--output", type=Path, help="Write JSON to this path")
    parser.add_argument("--exclude", action="append", default=[], help="Directory name to exclude")
    args = parser.parse_args()

    root = args.root.expanduser().resolve()
    if not root.is_dir():
        parser.error(f"not a directory: {root}")

    excluded = DEFAULT_EXCLUDES | set(args.exclude)
    files = []
    for path in sorted(root.rglob("*")):
        if not path.is_file() or any(part in excluded for part in path.relative_to(root).parts):
            continue
        stat = path.stat()
        files.append(
            {
                "path": path.relative_to(root).as_posix(),
                "extension": path.suffix.lower(),
                "size_bytes": stat.st_size,
                "sha256": sha256(path),
            }
        )

    payload = {"root_name": root.name, "file_count": len(files), "files": files}
    rendered = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        output = args.output.expanduser().resolve()
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(rendered, encoding="utf-8")
    else:
        print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
