#!/usr/bin/env python3
"""
PostToolUse hook: run the writing-without-ai-tells Tier 1 checks on any HTML
page in this project after Claude writes or edits it.

Reports findings back into the model's context so they get fixed in the same
turn. Never blocks an edit; a false positive should cost a glance, not a retry.

Checks only prose inside <main>, ignores alt text, and counts sentence rhythm
within a paragraph rather than across paragraph breaks.
"""
import sys, os, json, re, html

PROJECT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

VOCAB = set("""delve delves delving tapestry testament vibrant pivotal crucial intricate intricacies
meticulous meticulously bolster bolstered garner garnered underscore underscores interplay multifaceted
foster fostering leverage utilize commence facilitate encompass encompassing paramount groundbreaking
transformative seamless seamlessly robust endeavor endeavour aforementioned harnessing spearheading
showcasing highlighting emphasizing enhancing unprecedented remarkable stunning profound synergy synergies
boasts empower empowering elevate streamline supercharge valuable enduring""".split())

PATTERNS = [
    ("copula avoidance (use 'is'/'has')", r"\b(serves as|stands as|marks a|represents a|boasts|features a|offers a)\b"),
    ("negative parallelism",              r"(not only\b[^.]{0,60}\bbut\b|it'?s not just|isn'?t just|not merely)"),
    ("signposting",                       r"(let'?s dive|let'?s explore|let'?s break this down|here'?s what you need to know|without further ado)"),
    ("aphorism formula",                  r"(is the language of|is the currency of|the architecture of|becomes a trap)"),
    ("banned phrase",                     r"(at its core|at the end of the day|the bottom line is|here'?s the thing|in a nutshell|in conclusion|this is where|it'?s worth noting|it'?s important to note|move the needle|pain points)"),
]

def blocks(src):
    m = re.search(r"<main.*?</main>", src, re.S)
    if not m:
        return []
    body = re.sub(r"<(script|style|svg|nav)[\s\S]*?</\1>", " ", m.group(0))
    body = re.sub(r'alt="[^"]*"', "", body)
    out = []
    for b in re.finditer(r"<(p|li|h1|h2|h3|blockquote)[^>]*>(.*?)</\1>", body, re.S):
        t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", b.group(2)))).strip()
        if t:
            out.append(t)
    return out

def sentences(t):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", t) if s.strip()]

def check(path):
    try:
        src = open(path, encoding="utf-8").read()
    except Exception:
        return []
    paras = blocks(src)
    if not paras:
        return []
    joined = " ".join(paras)
    found = []

    dash = len(re.findall(r"[—–]", joined))
    if dash:
        found.append(f"{dash} em/en dash(es). Replace with a period, comma, colon or parentheses.")

    hits = sorted({w for w in re.findall(r"[A-Za-z']+", joined.lower()) if w in VOCAB})
    if hits:
        found.append("banned vocabulary: " + ", ".join(hits))

    for label, pat in PATTERNS:
        n = len(re.findall(pat, joined, re.I))
        if n:
            found.append(f"{label} x{n}")

    for p in paras:
        L = [len(s.split()) for s in sentences(p)]
        for i in range(len(L) - 2):
            if max(L[i:i+3]) - min(L[i:i+3]) <= 2 and min(L[i:i+3]) > 3:
                found.append(f"three same-length sentences {L[i:i+3]}: \"{p[:70]}...\"")
                break
        run = 0
        for i, x in enumerate(L):
            run = run + 1 if x < 10 else 0
            if run >= 3:
                found.append(f"three short declaratives in a row: \"{p[:70]}...\"")
                break
    return found

def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return
    ti = payload.get("tool_input") or {}
    path = (payload.get("tool_response") or {}).get("filePath") or ti.get("file_path") or ""
    if not path.endswith(".html"):
        return
    if not os.path.abspath(path).startswith(PROJECT):
        return
    findings = check(path)
    if not findings:
        return
    name = os.path.basename(path)
    msg = (f"writing-without-ai-tells found {len(findings)} Tier 1 issue(s) in {name}. "
           "Fix them before moving on, unless the writer's voice explicitly allows it:\n- "
           + "\n- ".join(findings))
    print(json.dumps({
        "systemMessage": f"Copy check: {len(findings)} issue(s) in {name}",
        "hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": msg},
    }))

if __name__ == "__main__":
    main()
