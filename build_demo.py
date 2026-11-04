#!/usr/bin/env python3
"""
Проект: Tiny AI XO 107601 | Файл: build_demo.py
Автор: Beck Sarbassov | Версия: 2.1.0
Дата выпуска: 2026-10-29 | Последнее обновление: 2026-11-05
Авторские права: © Beck Sarbassov. Все права защищены.
EN: Embed the published checkpoint without training. RU: Сборка с опубликованным опытом без обучения.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def build():
    manifest = json.loads((ROOT / "model/manifest.json").read_text(encoding="utf-8"))
    dims = manifest["architecture"]
    if dims != [81, 256, 256, 81] or sum(a*b+b for a,b in zip(dims,dims[1:])) != manifest["parameter_count"]:
        raise ValueError("Expected exactly 107601 parameters, 81→256→256→81")
    bundled = manifest["bundled_checkpoint"]
    checkpoint_bytes = (ROOT / bundled["path"]).read_bytes()
    if len(checkpoint_bytes) > 6*1024*1024 or hashlib.sha256(checkpoint_bytes).hexdigest() != bundled["sha256"]:
        raise ValueError("Bundled checkpoint size or checksum mismatch")
    checkpoint = json.loads(checkpoint_bytes)
    if (checkpoint["architecture"] != dims or checkpoint["parameter_count"] != manifest["parameter_count"]
            or checkpoint["format"] != "tiny-ai-xo-online-v2"
            or checkpoint["stats"]["games"] != manifest["starting_games"]):
        raise ValueError("Bundled checkpoint does not match the release manifest")
    # EN: Escape HTML delimiters even inside inert JSON script data.
    # RU: Экранируем HTML-разделители даже внутри неисполняемого JSON.
    checkpoint_json = json.dumps(checkpoint, ensure_ascii=True, separators=(",", ":"))
    checkpoint_json = checkpoint_json.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
    sources = {name: (ROOT / "web" / name).read_text(encoding="utf-8")
               for name in ("core.js", "neural.js", "learner.js", "bootstrap.js", "storage.js", "client.js", "app.js", "worker.js")}
    replacements = {"__CSS__": (ROOT / "web/app.css").read_text(encoding="utf-8"),
                    "__BUNDLED_CHECKPOINT__": checkpoint_json,
                    "__WORKER_SOURCE__": "\n".join(sources[name] for name in ("core.js", "neural.js", "learner.js", "worker.js"))}
    for name in ("core", "neural", "learner", "bootstrap", "storage", "client", "app"):
        replacements[f"__{name.upper()}_JS__"] = sources[f"{name}.js"]
    html = (ROOT / "web/index.template.html").read_text(encoding="utf-8")
    for token, value in replacements.items():
        if html.count(token) != 1:
            raise ValueError(f"Expected one {token}")
        if "</script" in value.lower():
            raise ValueError("Embedded source may not close its script container")
        html = html.replace(token, value)
    return html


def refresh_checksums():
    excluded = {".git", "__pycache__", ".venv", "venv", "node_modules"}
    files = [p for p in ROOT.rglob("*") if p.is_file()
             and not any(part in excluded for part in p.relative_to(ROOT).parts)
             and p.name != ".DS_Store" and not p.name.startswith(".env")
             and p != ROOT / "SHA256SUMS.txt"]
    (ROOT / "SHA256SUMS.txt").write_text("".join(
        f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(ROOT).as_posix()}\n"
        for p in sorted(files)), encoding="utf-8")


if __name__ == "__main__":
    (ROOT / "index.html").write_text(build(), encoding="utf-8")
    refresh_checksums()
    print("Built Tiny AI XO 107601: bundled 185-game checkpoint, offline play and continued learning; no training run.")
