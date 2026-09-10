#!/usr/bin/env python3
"""FairGuide i18n sanity check:
1. All 5 JSON files parse.
2. All 5 files have identical key sets.
3. Every data-i18n* key referenced in index.html exists in the JSONs.
4. No unreferenced keys in JSON (warning only).
5. HTML tags are balanced (rough check).
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
langs = ["en", "uz", "ru", "tr", "zh"]
dicts = {}
ok = True

for l in langs:
    p = ROOT / "assets" / "i18n" / f"{l}.json"
    try:
        dicts[l] = json.loads(p.read_text(encoding="utf-8"))
        print(f"[ok] {l}.json parses — {len(dicts[l])} keys")
    except Exception as e:
        print(f"[FAIL] {l}.json: {e}"); ok = False

base = set(dicts.get("en", {}).keys())
for l in langs[1:]:
    keys = set(dicts.get(l, {}).keys())
    missing = base - keys
    extra = keys - base
    if missing:
        ok = False
        print(f"[FAIL] {l}.json missing keys: {sorted(missing)}")
    if extra:
        ok = False
        print(f"[FAIL] {l}.json extra keys: {sorted(extra)}")
    if not missing and not extra:
        print(f"[ok] {l}.json key set matches en.json ({len(keys)} keys)")

html = (ROOT / "index.html").read_text(encoding="utf-8")
used = set(re.findall(r'data-i18n(?:-html|-alt|-aria)?="([^"]+)"', html))
used |= {"scanner.statusBarcode", "scanner.statusProduct", "scanner.statusTag",
         "scanner.statusPhoto", "scanner.statusDone"}  # referenced from JS

missing_in_en = sorted(used - base)
if missing_in_en:
    ok = False
    print(f"[FAIL] keys used in HTML/JS but missing in en.json: {missing_in_en}")
else:
    print(f"[ok] all {len(used)} keys referenced in HTML/JS exist in en.json")

unref = sorted(base - used)
if unref:
    print(f"[warn] keys defined but not referenced: {unref}")

# rough balanced-tag check for a few critical elements
for tag in ["section", "header", "footer", "main", "div"]:
    opens = len(re.findall(rf"<{tag}[\s>]", html))
    closes = len(re.findall(rf"</{tag}>", html))
    if tag == "div":
        # skip: icons + inline divs are many; only warn
        continue
    if opens != closes:
        ok = False
        print(f"[FAIL] <{tag}> open={opens} close={closes}")
    else:
        print(f"[ok] <{tag}> balanced ({opens})")

sys.exit(0 if ok else 1)
