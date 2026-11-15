#!/usr/bin/env python3
"""
Проект: Tiny AI XO 107601 | Файл: tests.py
Автор: Beck Sarbassov | Версия: 2.1.0
Дата выпуска: 2026-10-29 | Последнее обновление: 2026-11-15
Авторские права: © Beck Sarbassov. Все права защищены.
EN: Build, integrity, engine and language checks. RU: Сборка, целостность, движок и языки.
"""
import hashlib
import json
import os
import re
import shutil
import subprocess
from pathlib import Path
from build_demo import ROOT, build


def main():
    assert (ROOT / "index.html").read_text(encoding="utf-8") == build(), "Rebuild index.html first"
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    embedded = re.search(r'<script type="application/json" id="bundled-checkpoint">(.*?)</script>', html, re.S)
    assert embedded, "Standalone page must include the offline checkpoint"
    assert json.loads(embedded.group(1)) == json.loads((ROOT / "model/checkpoint-185.json").read_text(encoding="utf-8"))
    for line in (ROOT / "SHA256SUMS.txt").read_text().splitlines():
        expected, name = line.split(None, 1)
        assert hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == expected, name
    for obsolete in ("tiny302.py", "tiny_xo.py", "train.py", "game_rules.py", "legacy", "model/weights.f32", "model/positions.json"):
        assert not (ROOT / obsolete).exists(), f"Obsolete artifact: {obsolete}"
    node = os.environ.get("XO_NODE") or shutil.which("node")
    if not node:
        raise SystemExit("Node.js 18+ is required for JavaScript tests. Set XO_NODE to its executable path. Playing needs only a browser.")
    suites = [str(ROOT / "tests" / name) for name in ("engine.test.cjs", "i18n.test.cjs")]
    subprocess.run([node, "--test", *suites], cwd=ROOT, check=True)
    print("Build, integrity, distribution, engine and language checks passed.")


if __name__ == "__main__":
    main()
